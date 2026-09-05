import pytest
import json
import httpx
from app.config import settings
from app.engine.llm_gateway import (
    LLMGateway,
    LLMProvider,
    LLMResponse,
    ResponseSource,
    LLMErrorCode,
    LLMGatewayError,
    BaseOpenAICompatibleProvider,
    OpenAIProvider,
    GeminiProvider,
    GroqProvider,
    OpenRouterProvider
)
from app.schemas.financials import CFOResponseSchema

@pytest.mark.asyncio
async def test_gateway_provider_initialization():
    gateway = LLMGateway()
    assert "openai" in gateway.providers
    assert "gemini" in gateway.providers
    assert "groq" in gateway.providers
    assert "openrouter" in gateway.providers
    assert isinstance(gateway.providers["openai"], OpenAIProvider)
    assert isinstance(gateway.providers["gemini"], GeminiProvider)
    assert isinstance(gateway.providers["groq"], GroqProvider)
    assert isinstance(gateway.providers["openrouter"], OpenRouterProvider)

@pytest.mark.asyncio
async def test_gateway_unsupported_provider():
    gateway = LLMGateway()
    with pytest.raises(LLMGatewayError) as exc_info:
        gateway._get_provider("unsupported_ai")
    assert exc_info.value.code == LLMErrorCode.UNKNOWN_PROVIDER_ERROR
    assert "Unsupported LLM provider requested" in str(exc_info.value)

@pytest.mark.asyncio
async def test_provider_mock_sandbox_fallback():
    provider = BaseOpenAICompatibleProvider(
        provider_id="test_provider",
        api_key="sk-dummy-key",
        base_url="https://mock.api.com",
        default_model="test-model"
    )
    res = await provider.generate(
        system_prompt="system",
        user_prompt="user",
        model="custom-model"
    )
    assert res.provider == "test_provider"
    assert res.model == "custom-model"
    assert res.source == ResponseSource.LLM
    parsed = json.loads(res.content)
    # Validate against CFOResponseSchema
    validated = CFOResponseSchema.model_validate(parsed)
    assert validated.assessment.severity == "medium"
    assert "Mocked response for provider: test_provider" in validated.answer

@pytest.mark.asyncio
async def test_error_normalization_and_secret_redaction():
    provider = BaseOpenAICompatibleProvider(
        provider_id="openai",
        api_key="sk-super-secret-key-12345",
        base_url="https://api.openai.com/v1",
        default_model="gpt-4o"
    )

    # 1. Test 401 Authentication Error Normalization
    req = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
    resp_401 = httpx.Response(401, request=req)
    http_err_401 = httpx.HTTPStatusError("401 Unauthorized", request=req, response=resp_401)
    norm_401 = provider._normalize_http_error(http_err_401)
    assert norm_401.code == LLMErrorCode.AUTHENTICATION_ERROR
    assert norm_401.retryable is False
    assert "sk-super-secret-key-12345" not in str(norm_401)

    # 2. Test 429 Rate Limit Error Normalization
    resp_429 = httpx.Response(429, request=req)
    http_err_429 = httpx.HTTPStatusError("429 Rate Limit", request=req, response=resp_429)
    norm_429 = provider._normalize_http_error(http_err_429)
    assert norm_429.code == LLMErrorCode.RATE_LIMIT
    assert norm_429.retryable is True

    # 3. Test Timeout Error Normalization
    timeout_err = httpx.TimeoutException("Connection timed out")
    norm_timeout = provider._normalize_http_error(timeout_err)
    assert norm_timeout.code == LLMErrorCode.TIMEOUT
    assert norm_timeout.retryable is True

@pytest.mark.asyncio
async def test_schema_validation_and_malformed_response_handling():
    gateway = LLMGateway()

    # 1. Invalid JSON string -> MALFORMED_RESPONSE
    class InvalidJsonProvider(LLMProvider):
        async def generate(self, system_prompt: str, user_prompt: str, model=None, temperature=0.0, max_tokens=2000):
            return LLMResponse(
                content="Not valid JSON at all",
                provider="invalid_json_provider",
                model="test-model"
            )
        async def health_check(self):
            return True

    # 2. Valid JSON but missing required schema fields (invalid schema) -> MALFORMED_RESPONSE
    class InvalidSchemaProvider(LLMProvider):
        async def generate(self, system_prompt: str, user_prompt: str, model=None, temperature=0.0, max_tokens=2000):
            # Valid JSON but missing "assessment", "recommendation", etc.
            return LLMResponse(
                content=json.dumps({"status": "ok", "random_field": 123}),
                provider="invalid_schema_provider",
                model="test-model"
            )
        async def health_check(self):
            return True

    # When primary returns invalid JSON, gateway catches MALFORMED_RESPONSE and routes to fallback
    gateway.providers["gemini"] = InvalidJsonProvider()
    settings.LLM_PROVIDER = "gemini"
    settings.LLM_FALLBACK_PROVIDER = "groq"
    res = await gateway.generate_response("system", "user")
    assert res.provider == "groq"
    assert res.source == ResponseSource.LLM

    # When primary returns invalid schema, gateway catches MALFORMED_RESPONSE and routes to fallback
    gateway.providers["gemini"] = InvalidSchemaProvider()
    res_schema = await gateway.generate_response("system", "user")
    assert res_schema.provider == "groq"
    assert res_schema.source == ResponseSource.LLM

@pytest.mark.asyncio
async def test_response_source_distinction():
    gateway = LLMGateway()

    # Primary succeeds -> source == ResponseSource.LLM
    settings.LLM_PROVIDER = "gemini"
    settings.LLM_FALLBACK_PROVIDER = "groq"
    res_success = await gateway.generate_response("system", "user")
    assert res_success.source == ResponseSource.LLM
    assert res_success.to_dict()["source"] == "llm"

    # Both fail -> source == ResponseSource.DETERMINISTIC_FALLBACK
    class FailingProvider(LLMProvider):
        async def generate(self, system_prompt: str, user_prompt: str, model=None, temperature=0.0, max_tokens=2000):
            raise LLMGatewayError(LLMErrorCode.TIMEOUT, "Timeout", "test")
        async def health_check(self):
            return False

    gateway.providers["gemini"] = FailingProvider()
    gateway.providers["groq"] = FailingProvider()

    res_fallback = await gateway.generate_response("system", "user")
    assert res_fallback.source == ResponseSource.DETERMINISTIC_FALLBACK
    assert res_fallback.to_dict()["source"] == "deterministic_fallback"
    assert res_fallback.provider == "gateway_fallback"

@pytest.mark.asyncio
async def test_token_accounting_integrity():
    # Test that provider usage with explicit numbers is preserved without fabrication
    resp_with_usage = LLMResponse(
        content="{}",
        provider="openai",
        model="gpt-4o",
        source=ResponseSource.LLM,
        input_tokens=150,
        output_tokens=75
    )
    usage_dict = resp_with_usage.to_dict()["usage"]
    assert usage_dict["input_tokens"] == 150
    assert usage_dict["output_tokens"] == 75
    assert usage_dict["total_tokens"] == 225

    # Test that when tokens are None (unavailable), they remain None (not fabricated as 0 or estimated)
    resp_without_usage = LLMResponse(
        content="{}",
        provider="groq",
        model="llama-3.3-70b-versatile",
        source=ResponseSource.LLM,
        input_tokens=None,
        output_tokens=None
    )
    usage_null = resp_without_usage.to_dict()["usage"]
    assert usage_null["input_tokens"] is None
    assert usage_null["output_tokens"] is None
    assert usage_null["total_tokens"] is None
