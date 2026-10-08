from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from app.models.economic import (
    SourceType,
    ReliabilityTier,
    ObservationStatus,
    InflationCategory,
    InflationSector,
    GDPMetric,
    GDPEstimateStage,
    RateType,
    TaxRegime,
    TaxRuleType,
    TaxRuleStatus,
)

# ============================================================================
# 1. EXTERNAL SOURCE SCHEMAS
# ============================================================================

class ExternalSourceBase(BaseModel):
    name: str = Field(..., max_length=255, description="Unique human-readable source name")
    organization: str = Field(..., max_length=255, description="Publishing organization or agency")
    source_type: SourceType = Field(..., description="Official government, regulator, research body, etc.")
    url: Optional[str] = Field(None, description="Canonical URL or documentation endpoint")
    country: str = Field("IND", max_length=10, description="ISO-3166 alpha-3 or custom country identifier")
    reliability_tier: ReliabilityTier = Field(..., description="TIER_1_OFFICIAL, TIER_2_INSTITUTIONAL, etc.")
    metadata_info: Optional[Dict[str, Any]] = Field(None, description="Additional source metadata or API parameters")

class ExternalSourceCreate(ExternalSourceBase):
    pass

class ExternalSourceUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    source_type: Optional[SourceType] = None
    url: Optional[str] = None
    country: Optional[str] = None
    reliability_tier: Optional[ReliabilityTier] = None
    metadata_info: Optional[Dict[str, Any]] = None

class ExternalSourceResponse(ExternalSourceBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 2. GENERIC ECONOMIC OBSERVATION SCHEMAS
# ============================================================================

class EconomicObservationBase(BaseModel):
    source_id: UUID
    indicator: str = Field(..., max_length=100, description="Macroeconomic indicator name")
    value: Decimal = Field(..., description="Observed numerical value with exact decimal precision")
    unit: str = Field(..., max_length=50, description="Measurement unit (PERCENTAGE, INR_CRORE, etc.)")
    geography: str = Field("IN", max_length=100, description="Geographic jurisdiction")
    frequency: str = Field(..., max_length=50, description="MONTHLY, QUARTERLY, ANNUAL, DAILY")
    observation_period: str = Field(..., max_length=50, description="Time series period (e.g. 2025-01, 2024-Q3)")
    published_at: datetime = Field(..., description="Official publication timestamp by issuing authority")
    retrieved_at: Optional[datetime] = Field(None, description="System retrieval / ingestion timestamp")
    status: ObservationStatus = Field(ObservationStatus.FINAL, description="PROVISIONAL, FINAL, REVISED, ESTIMATE")
    revision_number: int = Field(0, ge=0, description="Incremented revision sequence number")
    effective_from: Optional[datetime] = Field(None, description="Start date from which this metric applies")
    effective_to: Optional[datetime] = Field(None, description="End date or expiration of observation validity")
    methodology: Optional[str] = Field(None, description="Statistical methodology or survey technique")
    source_reference: Optional[str] = Field(None, max_length=512, description="Specific table, bulletin, or report citation")

class EconomicObservationCreate(EconomicObservationBase):
    pass

class EconomicObservationResponse(EconomicObservationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 3. INFLATION OBSERVATION SCHEMAS
# ============================================================================

class InflationObservationBase(BaseModel):
    source_id: UUID
    category: InflationCategory = Field(..., description="Macro category (GENERAL, FOOD, EDUCATION, etc.)")
    subcategory: Optional[str] = Field(None, max_length=150, description="Granular basket item")
    inflation_rate: Decimal = Field(..., description="Year-on-Year inflation percentage change")
    index_value: Optional[Decimal] = Field(None, description="Absolute CPI index points")
    base_year: Optional[str] = Field("2012=100", max_length=20, description="Index base year series")
    basket_version: Optional[str] = Field(None, max_length=50, description="Basket revision version")
    geography: str = Field("IN", max_length=100, description="Geographic scope (e.g. IN, IN-URBAN)")
    sector: InflationSector = Field(InflationSector.COMBINED, description="COMBINED, RURAL, or URBAN")
    period: str = Field(..., max_length=50, description="Monthly period (e.g. 2025-01)")
    is_provisional: bool = Field(False, description="True if marked provisional by MoSPI / statistical body")
    published_at: datetime = Field(..., description="Official release timestamp")
    retrieved_at: Optional[datetime] = Field(None, description="System retrieval timestamp")
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    data_quality: str = Field("OFFICIAL_FINAL", max_length=50)
    source_reference: Optional[str] = Field(None, max_length=512)

class InflationObservationCreate(InflationObservationBase):
    pass

class InflationObservationResponse(InflationObservationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 4. COST INDEX OBSERVATION SCHEMAS
# ============================================================================

class CostIndexObservationBase(BaseModel):
    source_id: UUID
    category: str = Field(..., max_length=100, description="EDUCATION, HEALTHCARE, HOUSING_RENT, etc.")
    item: str = Field(..., max_length=255, description="Specific life cost item observed")
    geography: str = Field("IN", max_length=100, description="City / Regional / National scope")
    value: Decimal = Field(..., description="Observed cost value or index score")
    unit: str = Field(..., max_length=50, description="INR_PER_YEAR, INR_PER_MONTH, INDEX_POINTS")
    period: str = Field(..., max_length=50, description="Observation period (e.g. 2024-25, 2025-Q1)")
    frequency: str = Field("ANNUAL", max_length=50)
    methodology: Optional[str] = None
    data_quality: str = Field("VERIFIED", max_length=50)
    published_at: datetime
    retrieved_at: Optional[datetime] = None
    source_reference: Optional[str] = Field(None, max_length=512)

class CostIndexObservationCreate(CostIndexObservationBase):
    pass

class CostIndexObservationResponse(CostIndexObservationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 5. GDP OBSERVATION SCHEMAS
# ============================================================================

class GDPObservationBase(BaseModel):
    source_id: UUID
    metric: GDPMetric = Field(..., description="REAL_GDP_GROWTH, NOMINAL_GDP_GROWTH, GDP, GVA, PFCE, etc.")
    value: Decimal = Field(..., description="Growth rate (%) or absolute nominal/real expenditure level")
    unit: str = Field(..., max_length=50, description="PERCENTAGE_YOY, INR_CRORE, USD_BILLION")
    real_or_nominal: str = Field("REAL", max_length=20, description="REAL or NOMINAL")
    seasonally_adjusted: bool = Field(False)
    geography: str = Field("IN", max_length=100)
    period: str = Field(..., max_length=50, description="Quarter or FY (e.g. 2024-Q3, FY2024-25)")
    frequency: str = Field("QUARTERLY", max_length=50)
    estimate_stage: GDPEstimateStage = Field(GDPEstimateStage.FIRST_ADVANCE_ESTIMATE)
    published_at: datetime
    retrieved_at: Optional[datetime] = None
    revision_number: int = Field(0, ge=0)
    data_quality: str = Field("OFFICIAL", max_length=50)
    source_reference: Optional[str] = Field(None, max_length=512)

class GDPObservationCreate(GDPObservationBase):
    pass

class GDPObservationResponse(GDPObservationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 6. INTEREST RATE OBSERVATION SCHEMAS
# ============================================================================

class InterestRateObservationBase(BaseModel):
    source_id: UUID
    rate_type: RateType = Field(..., description="RBI_REPO, RBI_SDF, GOI_10Y_BOND_YIELD, PPF_RATE, etc.")
    rate: Decimal = Field(..., description="Annualized percentage rate (e.g. 6.5000)")
    unit: str = Field("PERCENTAGE_PER_ANNUM", max_length=50)
    institution: str = Field("Reserve Bank of India", max_length=255)
    instrument: Optional[str] = Field(None, max_length=255)
    effective_from: datetime = Field(..., description="Effective start timestamp of the rate")
    effective_to: Optional[datetime] = Field(None, description="Date when rate was superseded")
    announcement_date: Optional[datetime] = None
    published_at: datetime
    retrieved_at: Optional[datetime] = None
    source_reference: Optional[str] = Field(None, max_length=512)

class InterestRateObservationCreate(InterestRateObservationBase):
    pass

class InterestRateObservationResponse(InterestRateObservationBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 7. TAX RULE VERSION SCHEMAS
# ============================================================================

class TaxRuleVersionBase(BaseModel):
    tax_year: str = Field(..., max_length=20, description="Financial Year (e.g. FY 2024-25, FY 2025-26)")
    assessment_year: str = Field(..., max_length=20, description="Assessment Year (e.g. AY 2025-26, AY 2026-27)")
    regime: TaxRegime = Field(..., description="NEW (115BAC), OLD, or UNIVERSAL")
    section: str = Field(..., max_length=100, description="Income Tax Section code (e.g. 115BAC, 80C, 24b)")
    subsection: Optional[str] = Field(None, max_length=100)
    rule_type: TaxRuleType = Field(..., description="TAX_SLABS, DEDUCTION_LIMIT, TAX_REBATE, etc.")
    parameter: str = Field(..., max_length=100, description="SLAB_RATES, MAX_LIMIT, REBATE_CAP, etc.")
    value: Any = Field(..., description="Structured JSON payload of slabs, limits, or formula constants")
    unit: str = Field(..., max_length=50, description="INR, PERCENTAGE, SLAB_SCHEDULE")
    conditions: Optional[Dict[str, Any]] = Field(None, description="Eligibility conditions, resident flags, salary constraints")
    effective_from: datetime = Field(..., description="Date from which statutory rule applies")
    effective_to: Optional[datetime] = Field(None, description="Date statutory rule expires or is repealed")
    source_id: UUID = Field(..., description="ExternalSource reference (e.g. CBDT, Ministry of Finance)")
    source_reference: Optional[str] = Field(None, max_length=512, description="Finance Act citation, notification number")
    version: str = Field("1.0", max_length=50)
    status: TaxRuleStatus = Field(TaxRuleStatus.ACTIVE, description="ACTIVE, SUPERSEDED, DRAFT, REPEALED")

class TaxRuleVersionCreate(TaxRuleVersionBase):
    pass

class TaxRuleVersionResponse(TaxRuleVersionBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
