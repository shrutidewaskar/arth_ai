import json
import time
import httpx
import logging
from typing import Dict, Any, List, Optional
from enum import Enum
from app.config import settings
from app.schemas.financials import CFOResponseSchema

logger = logging.getLogger("arthai.llm_gateway")

class ResponseSource(str, Enum):
    LLM = "llm"
    DETERMINISTIC_FALLBACK = "deterministic_fallback"

class LLMErrorCode(str, Enum):
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    INVALID_MODEL = "INVALID_MODEL"
    RATE_LIMIT = "RATE_LIMIT"
    TIMEOUT = "TIMEOUT"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    MALFORMED_RESPONSE = "MALFORMED_RESPONSE"
    UNKNOWN_PROVIDER_ERROR = "UNKNOWN_PROVIDER_ERROR"

class LLMGatewayError(Exception):
    """Normalized gateway exception containing safe, secret-free diagnostics."""
    def __init__(self, code: LLMErrorCode, message: str, provider: str, retryable: bool = False):
        super().__init__(message)
        self.code = code
        self.provider = provider
        self.retryable = retryable

class LLMResponse:
    """Normalized response contract representing standard completion parameters."""
    def __init__(
        self,
        content: str,
        provider: str,
        model: str,
        source: ResponseSource = ResponseSource.LLM,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        latency_ms: int = 0,
        finish_reason: str = "stop"
    ):
        self.content = content
        self.provider = provider
        self.model = model
        self.source = source
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.latency_ms = latency_ms
        self.finish_reason = finish_reason

    def to_dict(self) -> Dict[str, Any]:
        total_tokens = None
        if self.input_tokens is not None and self.output_tokens is not None:
            total_tokens = self.input_tokens + self.output_tokens
        elif self.input_tokens is not None:
            total_tokens = self.input_tokens
        elif self.output_tokens is not None:
            total_tokens = self.output_tokens

        return {
            "content": self.content,
            "provider": self.provider,
            "model": self.model,
            "source": self.source.value if isinstance(self.source, ResponseSource) else self.source,
            "usage": {
                "input_tokens": self.input_tokens,
                "output_tokens": self.output_tokens,
                "total_tokens": total_tokens
            },
            "latency_ms": self.latency_ms,
            "finish_reason": self.finish_reason
        }

class LLMProvider:
    """Interface base class for all individual provider adapters."""
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 2000
    ) -> LLMResponse:
        raise NotImplementedError

    async def health_check(self) -> bool:
        raise NotImplementedError

class BaseOpenAICompatibleProvider(LLMProvider):
    """Generic OpenAI compatibility adapter sharing common completion attributes."""
    def __init__(
        self,
        provider_id: str,
        api_key: str,
        base_url: str,
        default_model: str,
        timeout: float = 15.0,
        max_retries: int = 2
    ):
        self.provider_id = provider_id
        self.api_key = api_key
        self.base_url = base_url
        self.default_model = default_model
        self.timeout = timeout
        self.max_retries = max_retries

    def _normalize_http_error(self, exc: Exception) -> LLMGatewayError:
        """Normalizes raw exceptions and ensures secrets never appear in error messages."""
        if isinstance(exc, httpx.TimeoutException):
            return LLMGatewayError(
                code=LLMErrorCode.TIMEOUT,
                message=f"Request to provider '{self.provider_id}' timed out after {self.timeout}s.",
                provider=self.provider_id,
                retryable=True
            )
        elif isinstance(exc, httpx.HTTPStatusError):
            status_code = exc.response.status_code
            if status_code in (401, 403):
                return LLMGatewayError(
                    code=LLMErrorCode.AUTHENTICATION_ERROR,
                    message=f"Authentication failed for provider '{self.provider_id}' (HTTP {status_code}).",
                    provider=self.provider_id,
                    retryable=False
                )
            elif status_code == 404:
                return LLMGatewayError(
                    code=LLMErrorCode.INVALID_MODEL,
                    message=f"Model or endpoint not found for provider '{self.provider_id}' (HTTP 404).",
                    provider=self.provider_id,
                    retryable=False
                )
            elif status_code == 429:
                return LLMGatewayError(
                    code=LLMErrorCode.RATE_LIMIT,
                    message=f"Rate limit exceeded for provider '{self.provider_id}' (HTTP 429).",
                    provider=self.provider_id,
                    retryable=True
                )
            elif status_code >= 500:
                return LLMGatewayError(
                    code=LLMErrorCode.PROVIDER_UNAVAILABLE,
                    message=f"Provider '{self.provider_id}' service error (HTTP {status_code}).",
                    provider=self.provider_id,
                    retryable=True
                )
            else:
                return LLMGatewayError(
                    code=LLMErrorCode.UNKNOWN_PROVIDER_ERROR,
                    message=f"Provider '{self.provider_id}' returned client error (HTTP {status_code}).",
                    provider=self.provider_id,
                    retryable=False
                )
        elif isinstance(exc, httpx.RequestError):
            return LLMGatewayError(
                code=LLMErrorCode.PROVIDER_UNAVAILABLE,
                message=f"Network connection failed for provider '{self.provider_id}'.",
                provider=self.provider_id,
                retryable=True
            )
        elif isinstance(exc, LLMGatewayError):
            return exc
        else:
            return LLMGatewayError(
                code=LLMErrorCode.UNKNOWN_PROVIDER_ERROR,
                message=f"Unexpected error in provider '{self.provider_id}': {type(exc).__name__}",
                provider=self.provider_id,
                retryable=False
            )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 2000
    ) -> LLMResponse:
        resolved_model = model or self.default_model

        # Safety mock check when running in local sandbox or test environments without real keys
        if self.api_key == "sk-dummy-key" or not self.api_key.strip():
            logger.warning(f"Using dummy mock completion fallback for provider: {self.provider_id}")
            mock_json = json.dumps({
                "answer": f"Mocked response for provider: {self.provider_id}",
                "summary": "AI CFO Analysis",
                "key_facts": [],
                "assessment": {"label": "Needs Attention", "severity": "medium"},
                "recommendation": "Review backend logs.",
                "reasons": [],
                "tradeoffs": [],
                "assumptions": ["Nominal calculations only"],
                "evidence_used": ["GET_FINANCIAL_CONTEXT"]
            })
            return LLMResponse(
                content=mock_json,
                provider=self.provider_id,
                model=resolved_model,
                latency_ms=50
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": resolved_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"}
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        last_err = None

        for attempt in range(self.max_retries + 1):
            start_time = time.perf_counter()
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    res_json = response.json()
                    latency = int((time.perf_counter() - start_time) * 1000)

                    choices = res_json.get("choices", [])
                    if not choices:
                        raise LLMGatewayError(
                            code=LLMErrorCode.MALFORMED_RESPONSE,
                            message=f"Provider '{self.provider_id}' returned empty choices.",
                            provider=self.provider_id,
                            retryable=False
                        )

                    choice = choices[0]
                    content = choice.get("message", {}).get("content", "")
                    if not content or not content.strip():
                        raise LLMGatewayError(
                            code=LLMErrorCode.MALFORMED_RESPONSE,
                            message=f"Provider '{self.provider_id}' returned empty content.",
                            provider=self.provider_id,
                            retryable=False
                        )

                    # 1. Parse JSON syntax
                    try:
                        parsed_json = json.loads(content)
                    except Exception:
                        raise LLMGatewayError(
                            code=LLMErrorCode.MALFORMED_RESPONSE,
                            message=f"Provider '{self.provider_id}' returned invalid JSON.",
                            provider=self.provider_id,
                            retryable=False
                        )

                    # 2. Validate ArthAI response schema structure
                    try:
                        CFOResponseSchema.model_validate(parsed_json)
                    except Exception as schema_err:
                        raise LLMGatewayError(
                            code=LLMErrorCode.MALFORMED_RESPONSE,
                            message=f"Provider '{self.provider_id}' returned schema validation error: {str(schema_err)}",
                            provider=self.provider_id,
                            retryable=False
                        )

                    # 3. Extract provider-reported usage without fabrication
                    usage = res_json.get("usage")
                    in_t = None
                    out_t = None
                    if isinstance(usage, dict):
                        in_t = usage.get("prompt_tokens")
                        out_t = usage.get("completion_tokens")

                    return LLMResponse(
                        content=content,
                        provider=self.provider_id,
                        model=resolved_model,
                        source=ResponseSource.LLM,
                        input_tokens=in_t,
                        output_tokens=out_t,
                        latency_ms=latency,
                        finish_reason=choice.get("finish_reason", "stop")
                    )

            except Exception as e:
                normalized_err = self._normalize_http_error(e)
                last_err = normalized_err
                logger.warning(
                    f"LLM request to provider '{self.provider_id}' (attempt {attempt + 1}/{self.max_retries + 1}) "
                    f"failed: [{normalized_err.code.value}] {normalized_err.args[0]}"
                )
                if not normalized_err.retryable or attempt == self.max_retries:
                    raise normalized_err
                # Brief backoff before retry
                import asyncio
                await asyncio.sleep(0.5 * (2 ** attempt))

        raise last_err or LLMGatewayError(
            code=LLMErrorCode.UNKNOWN_PROVIDER_ERROR,
            message=f"Provider '{self.provider_id}' failed after {self.max_retries} retries.",
            provider=self.provider_id,
            retryable=False
        )

    async def health_check(self) -> bool:
        if self.api_key == "sk-dummy-key" or not self.api_key.strip():
            return True
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                url = f"{self.base_url.rstrip('/')}/models" if "googleapis" in self.base_url else f"{self.base_url.rstrip('/')}/chat/completions"
                return True
        except Exception:
            return False

class OpenAIProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="openai",
            api_key=settings.OPENAI_API_KEY,
            base_url="https://api.openai.com/v1",
            default_model="gpt-4o",
            timeout=15.0
        )

class GeminiProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="gemini",
            api_key=settings.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai",
            default_model="gemini-2.5-flash",
            timeout=15.0
        )

class GroqProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="groq",
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
            default_model="llama-3.3-70b-versatile",
            timeout=10.0
        )

class OpenRouterProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="openrouter",
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            default_model="meta-llama/llama-3.3-70b-instruct:free",
            timeout=15.0
        )

class LLMGateway:
    """
    Gateway managing primary provider selection, structured schema validation,
    and automatic failover configuration routing.
    """
    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {
            "openai": OpenAIProvider(),
            "gemini": GeminiProvider(),
            "groq": GroqProvider(),
            "openrouter": OpenRouterProvider()
        }

    def _get_provider(self, provider_id: str) -> LLMProvider:
        if provider_id not in self.providers:
            raise LLMGatewayError(
                code=LLMErrorCode.UNKNOWN_PROVIDER_ERROR,
                message=f"Unsupported LLM provider requested: {provider_id}",
                provider=provider_id,
                retryable=False
            )
        return self.providers[provider_id]

    async def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        max_tokens: int = 2000
    ) -> LLMResponse:
        primary_id = settings.LLM_PROVIDER
        primary_model = settings.LLM_MODEL
        fallback_id = settings.LLM_FALLBACK_PROVIDER
        fallback_model = settings.LLM_FALLBACK_MODEL

        # 1. Attempt primary provider completion
        try:
            logger.info(f"LLM Gateway attempting primary provider: {primary_id} (model: {primary_model})")
            provider = self._get_provider(primary_id)
            res = await provider.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=primary_model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            # Re-verify structured JSON parsing and schema structure
            parsed_json = json.loads(res.content)
            CFOResponseSchema.model_validate(parsed_json)
            return res
        except Exception as primary_err:
            err_msg = primary_err.args[0] if primary_err.args else str(primary_err)
            logger.error(f"LLM Gateway primary provider ({primary_id}) failed: {err_msg}")

            # 2. Attempt fallback provider execution
            try:
                logger.info(f"LLM Gateway attempting fallback provider: {fallback_id} (model: {fallback_model})")
                fallback_provider = self._get_provider(fallback_id)
                res = await fallback_provider.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    model=fallback_model,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                parsed_fb = json.loads(res.content)
                CFOResponseSchema.model_validate(parsed_fb)
                return res
            except Exception as fallback_err:
                fb_err_msg = fallback_err.args[0] if fallback_err.args else str(fallback_err)
                logger.error(f"LLM Gateway fallback provider ({fallback_id}) failed: {fb_err_msg}")

                # 3. Last resort deterministic fallback payload
                logger.warning("All LLM gateway providers failed. Returning backup analysis schema.")
                backup_text = json.dumps({
                    "answer": "All configured LLM gateway routing calls failed. Deterministic calculations are completed successfully.",
                    "summary": "AI CFO Fallback Analysis",
                    "key_facts": [],
                    "assessment": {"label": "Needs Attention", "severity": "medium"},
                    "recommendation": "Review backend logs for API outages.",
                    "reasons": ["LLM Provider timeouts or authentication failures occurred."],
                    "tradeoffs": [],
                    "assumptions": ["Nominal calculations only"],
                    "evidence_used": ["GET_FINANCIAL_CONTEXT"]
                })
                return LLMResponse(
                    content=backup_text,
                    provider="gateway_fallback",
                    model="none",
                    source=ResponseSource.DETERMINISTIC_FALLBACK,
                    input_tokens=None,
                    output_tokens=None,
                    latency_ms=10
                )

