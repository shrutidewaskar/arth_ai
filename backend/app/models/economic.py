import uuid
import enum
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# ============================================================================
# ENUMS FOR ECONOMIC INTELLIGENCE & REFERENCE DATA
# ============================================================================

class SourceType(str, enum.Enum):
    OFFICIAL_GOVERNMENT = "OFFICIAL_GOVERNMENT"             # Central/State govt ministries (e.g. MoSPI, MoF)
    REGULATOR = "REGULATOR"                                 # Central banks & statutory regulators (e.g. RBI, SEBI, IRDAI, PFRDA, CBDT)
    INTERNATIONAL_ORGANIZATION = "INTERNATIONAL_ORGANIZATION" # Multilateral bodies (e.g. World Bank, IMF, ADB, OECD)
    INSTITUTIONAL_RESEARCH = "INSTITUTIONAL_RESEARCH"       # Reputed credit rating/research agencies (e.g. CRISIL, ICRA, RBI Occasional Papers)
    MARKET_DATA = "MARKET_DATA"                             # Regulated exchanges & clearing corps (e.g. NSE, BSE, CCIL, MCX)
    NEWS = "NEWS"                                           # Mainstream financial press (e.g. LiveMint, Business Standard)
    SECONDARY_RESEARCH = "SECONDARY_RESEARCH"               # Academic papers, industry whitepapers
    OTHER = "OTHER"

class ReliabilityTier(str, enum.Enum):
    TIER_1_OFFICIAL = "TIER_1_OFFICIAL"                     # Primary statutory authorities & central banks (Highest authority)
    TIER_2_INSTITUTIONAL = "TIER_2_INSTITUTIONAL"           # Multilateral & tier-1 statutory research institutions
    TIER_3_SECONDARY = "TIER_3_SECONDARY"                   # Regulated market data aggregators & tier-1 financial press
    TIER_4_UNVERIFIED = "TIER_4_UNVERIFIED"                 # Secondary estimates or unverified preliminary observations

class ObservationStatus(str, enum.Enum):
    PROVISIONAL = "PROVISIONAL"
    FINAL = "FINAL"
    REVISED = "REVISED"
    ESTIMATE = "ESTIMATE"

class InflationCategory(str, enum.Enum):
    GENERAL = "GENERAL"                                     # Overall Headline Index (e.g. General CPI)
    FOOD = "FOOD"                                           # Food & Beverages
    HOUSING = "HOUSING"                                     # Housing & Rentals
    HEALTHCARE = "HEALTHCARE"                               # Health & Medical Services
    EDUCATION = "EDUCATION"                                 # Education & Tuition Costs
    TRANSPORT = "TRANSPORT"                                 # Transport & Commute
    FUEL = "FUEL"                                           # Fuel & Light
    CLOTHING = "CLOTHING"                                   # Clothing & Footwear
    HOUSEHOLD_GOODS = "HOUSEHOLD_GOODS"                     # Household appliances & goods
    PERSONAL_CARE = "PERSONAL_CARE"                         # Personal care & personal effects
    RECREATION = "RECREATION"                               # Recreation & Amusement
    OTHER = "OTHER"

class InflationSector(str, enum.Enum):
    COMBINED = "COMBINED"                                   # All India Combined
    RURAL = "RURAL"                                         # Rural CPI
    URBAN = "URBAN"                                         # Urban CPI

class GDPMetric(str, enum.Enum):
    REAL_GDP_GROWTH = "REAL_GDP_GROWTH"                     # Real GDP YoY growth rate (%)
    NOMINAL_GDP_GROWTH = "NOMINAL_GDP_GROWTH"               # Nominal GDP YoY growth rate (%)
    GDP = "GDP"                                             # Gross Domestic Product level
    GVA = "GVA"                                             # Gross Value Added level
    PFCE = "PFCE"                                           # Private Final Consumption Expenditure
    GFCE = "GFCE"                                           # Government Final Consumption Expenditure
    GFCF = "GFCF"                                           # Gross Fixed Capital Formation
    OTHER = "OTHER"

class GDPEstimateStage(str, enum.Enum):
    FIRST_ADVANCE_ESTIMATE = "FIRST_ADVANCE_ESTIMATE"
    SECOND_ADVANCE_ESTIMATE = "SECOND_ADVANCE_ESTIMATE"
    PROVISIONAL_ESTIMATE = "PROVISIONAL_ESTIMATE"
    FIRST_REVISED_ESTIMATE = "FIRST_REVISED_ESTIMATE"
    SECOND_REVISED_ESTIMATE = "SECOND_REVISED_ESTIMATE"
    THIRD_REVISED_ESTIMATE = "THIRD_REVISED_ESTIMATE"
    FINAL = "FINAL"

class RateType(str, enum.Enum):
    RBI_REPO = "RBI_REPO"                                   # Policy Repo Rate
    RBI_SDF = "RBI_SDF"                                     # Standing Deposit Facility Rate
    RBI_MSFR = "RBI_MSFR"                                   # Marginal Standing Facility Rate
    RBI_CRR = "RBI_CRR"                                     # Cash Reserve Ratio
    RBI_SLR = "RBI_SLR"                                     # Statutory Liquidity Ratio
    MCLR_1Y = "MCLR_1Y"                                     # Marginal Cost of Funds Based Lending Rate (1 Year)
    TREPS_OVERNIGHT = "TREPS_OVERNIGHT"                     # Triparty Repo Overnight Rate
    GOI_10Y_BOND_YIELD = "GOI_10Y_BOND_YIELD"               # 10-Year Government of India Sovereign Benchmark Yield
    PPF_RATE = "PPF_RATE"                                   # Public Provident Fund statutory interest rate
    EPF_RATE = "EPF_RATE"                                   # Employees' Provident Fund declared interest rate
    SUKANYA_SAMRIDDHI_RATE = "SUKANYA_SAMRIDDHI_RATE"       # Sukanya Samriddhi Yojana statutory rate
    MARKET_INTEREST_RATE = "MARKET_INTEREST_RATE"           # Commercial/Product lending or deposit benchmark
    OTHER = "OTHER"

class TaxRegime(str, enum.Enum):
    NEW = "NEW"                                             # Section 115BAC New Tax Regime
    OLD = "OLD"                                             # Old Tax Regime with chapter VI-A deductions
    UNIVERSAL = "UNIVERSAL"                                 # Applicable across all regimes

class TaxRuleType(str, enum.Enum):
    TAX_SLABS = "TAX_SLABS"                                 # Income tax slab boundaries and marginal rates
    DEDUCTION_LIMIT = "DEDUCTION_LIMIT"                     # Permissible deduction ceilings (e.g. 80C, 80D, 24b)
    TAX_REBATE = "TAX_REBATE"                               # Tax rebates (e.g. Section 87A rebate)
    SURCHARGE_SLABS = "SURCHARGE_SLABS"                     # Surcharge rates on high income brackets
    EXEMPTION_LIMIT = "EXEMPTION_LIMIT"                     # Standard deduction or exemption limits
    CESS_RATE = "CESS_RATE"                                 # Health and Education Cess percentage
    OTHER = "OTHER"

class TaxRuleStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"                                       # Currently in force for the stated assessment year
    SUPERSEDED = "SUPERSEDED"                               # Replaced by subsequent statutory amendment or finance act
    DRAFT = "DRAFT"                                         # Proposed in Finance Bill before enactment
    REPEALED = "REPEALED"                                   # Formally omitted or struck down


# ============================================================================
# PART 2: EXTERNAL SOURCE MODEL
# ============================================================================

class ExternalSource(Base):
    """
    Registry of external institutional, regulatory, and governmental data sources
    providing macroeconomic series, benchmarks, inflation rates, and statutory rules.
    """
    __tablename__ = "external_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    organization = Column(String(255), nullable=False, index=True)
    source_type = Column(String(50), nullable=False) # SourceType enum
    url = Column(String(1024), nullable=True)
    country = Column(String(10), default="IND", nullable=False)
    reliability_tier = Column(String(50), nullable=False) # ReliabilityTier enum
    metadata_info = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    economic_observations = relationship("EconomicObservation", back_populates="source")
    inflation_observations = relationship("InflationObservation", back_populates="source")
    cost_index_observations = relationship("CostIndexObservation", back_populates="source")
    gdp_observations = relationship("GDPObservation", back_populates="source")
    interest_rate_observations = relationship("InterestRateObservation", back_populates="source")
    tax_rule_versions = relationship("TaxRuleVersion", back_populates="source")


# ============================================================================
# PART 3: GENERIC ECONOMIC OBSERVATION MODEL
# ============================================================================

class EconomicObservation(Base):
    """
    Durable, provenance-aware time-series store for general macroeconomic indicators
    (e.g., Unemployment Rate, Forex Reserves, Trade Balance, Core Inflation).
    """
    __tablename__ = "economic_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    indicator = Column(String(100), nullable=False, index=True)
    value = Column(Numeric(18, 6), nullable=False)
    unit = Column(String(50), nullable=False) # e.g. PERCENTAGE, INR_CRORE, USD_BILLION, INDEX_POINTS
    geography = Column(String(100), default="IN", nullable=False, index=True)
    frequency = Column(String(50), nullable=False) # MONTHLY, QUARTERLY, ANNUAL, DAILY
    observation_period = Column(String(50), nullable=False, index=True) # e.g. 2025-01, 2024-Q3, FY2024-25
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    retrieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    status = Column(String(50), default="FINAL", nullable=False) # ObservationStatus enum
    revision_number = Column(Integer, default=0, nullable=False)
    effective_from = Column(DateTime(timezone=True), nullable=True, index=True)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    methodology = Column(Text, nullable=True)
    source_reference = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="economic_observations")


# ============================================================================
# PART 4: INFLATION OBSERVATION MODEL
# ============================================================================

class InflationObservation(Base):
    """
    Category-level and headline consumer price index and inflation rate observations.
    Supports taxonomy-level classification, rural/urban sectors, and base-year revisions.
    """
    __tablename__ = "inflation_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # InflationCategory enum
    subcategory = Column(String(150), nullable=True) # Specific basket item e.g. "Primary Education"
    inflation_rate = Column(Numeric(8, 4), nullable=False) # YoY % change e.g. 5.4200
    index_value = Column(Numeric(12, 4), nullable=True) # CPI Index points e.g. 189.4000
    base_year = Column(String(20), default="2012=100", nullable=True) # Base year reference
    basket_version = Column(String(50), nullable=True) # Index basket release series
    geography = Column(String(100), default="IN", nullable=False, index=True)
    sector = Column(String(50), default="COMBINED", nullable=False, index=True) # COMBINED, RURAL, URBAN
    period = Column(String(50), nullable=False, index=True) # e.g. 2025-01
    is_provisional = Column(Boolean, default=False, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    retrieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    data_quality = Column(String(50), default="OFFICIAL_FINAL", nullable=False)
    source_reference = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="inflation_observations")


# ============================================================================
# PART 5: COST INDEX OBSERVATION MODEL
# ============================================================================

class CostIndexObservation(Base):
    """
    Direct item and sector-level cost index observations distinct from general CPI
    (e.g., Tier-1 Engineering Tuition, Metropolitan Rent Index, Medical Procedures).
    """
    __tablename__ = "cost_index_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # EDUCATION, HEALTHCARE, HOUSING_RENT, etc.
    item = Column(String(255), nullable=False, index=True)
    geography = Column(String(100), default="IN", nullable=False, index=True)
    value = Column(Numeric(18, 4), nullable=False)
    unit = Column(String(50), nullable=False) # INR_PER_YEAR, INR_PER_MONTH, INDEX_POINTS
    period = Column(String(50), nullable=False, index=True) # e.g. 2024-25, 2025-Q1
    frequency = Column(String(50), default="ANNUAL", nullable=False)
    methodology = Column(Text, nullable=True)
    data_quality = Column(String(50), default="VERIFIED", nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    retrieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    source_reference = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="cost_index_observations")


# ============================================================================
# PART 6: GDP OBSERVATION MODEL
# ============================================================================

class GDPObservation(Base):
    """
    National output, growth, and consumption expenditures (GDP, GVA, PFCE, GFCF)
    with real vs. nominal classification and official advance/revised estimate stages.
    """
    __tablename__ = "gdp_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    metric = Column(String(100), nullable=False, index=True) # GDPMetric enum
    value = Column(Numeric(18, 4), nullable=False)
    unit = Column(String(50), nullable=False) # PERCENTAGE_YOY, INR_CRORE, USD_BILLION
    real_or_nominal = Column(String(20), default="REAL", nullable=False, index=True) # REAL, NOMINAL
    seasonally_adjusted = Column(Boolean, default=False, nullable=False)
    geography = Column(String(100), default="IN", nullable=False, index=True)
    period = Column(String(50), nullable=False, index=True) # 2024-Q3, FY2024-25
    frequency = Column(String(50), default="QUARTERLY", nullable=False)
    estimate_stage = Column(String(50), default="FIRST_ADVANCE_ESTIMATE", nullable=False) # GDPEstimateStage enum
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    retrieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    revision_number = Column(Integer, default=0, nullable=False)
    data_quality = Column(String(50), default="OFFICIAL", nullable=False)
    source_reference = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="gdp_observations")


# ============================================================================
# PART 7: INTEREST RATE OBSERVATION MODEL
# ============================================================================

class InterestRateObservation(Base):
    """
    Central bank policy interest rates, statutory liquidity rates, sovereign yields,
    and statutory small savings rates (e.g. RBI Repo, SDF, 10Y G-Sec, PPF, EPF).
    """
    __tablename__ = "interest_rate_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    rate_type = Column(String(100), nullable=False, index=True) # RateType enum
    rate = Column(Numeric(8, 4), nullable=False) # e.g. 6.5000 %
    unit = Column(String(50), default="PERCENTAGE_PER_ANNUM", nullable=False)
    institution = Column(String(255), default="Reserve Bank of India", nullable=False)
    instrument = Column(String(255), nullable=True) # e.g. "Policy Repo Rate", "10-Year Benchmark G-Sec"
    effective_from = Column(DateTime(timezone=True), nullable=False, index=True)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    announcement_date = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False)
    retrieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    source_reference = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="interest_rate_observations")


# ============================================================================
# PART 8: VERSIONED TAX RULE MODEL
# ============================================================================

class TaxRuleVersion(Base):
    """
    Structured, versioned Indian statutory tax rules, slab schedules, and deduction limits
    organized by Tax Year (FY), Assessment Year (AY), Regime, Section, and Parameter.
    """
    __tablename__ = "tax_rule_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tax_year = Column(String(20), nullable=False, index=True) # e.g. "FY 2024-25", "FY 2025-26"
    assessment_year = Column(String(20), nullable=False, index=True) # e.g. "AY 2025-26", "AY 2026-27"
    regime = Column(String(50), nullable=False, index=True) # TaxRegime enum: NEW, OLD, UNIVERSAL
    section = Column(String(100), nullable=False, index=True) # e.g. "115BAC", "80C", "STANDARD_DEDUCTION"
    subsection = Column(String(100), nullable=True)
    rule_type = Column(String(100), nullable=False, index=True) # TaxRuleType enum
    parameter = Column(String(100), nullable=False, index=True) # e.g. "SLAB_RATES", "MAX_LIMIT"
    value = Column(JSONB, nullable=False) # Structured payload e.g. [{"limit": 400000, "rate": 0.0}, ...]
    unit = Column(String(50), nullable=False) # INR, PERCENTAGE, SLAB_SCHEDULE
    conditions = Column(JSONB, nullable=True) # Applicable conditions
    effective_from = Column(DateTime(timezone=True), nullable=False, index=True)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("external_sources.id", ondelete="RESTRICT"), nullable=False, index=True)
    source_reference = Column(String(512), nullable=True) # e.g. "Finance Act 2025"
    version = Column(String(50), default="1.0", nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True) # TaxRuleStatus enum
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    source = relationship("ExternalSource", back_populates="tax_rule_versions")
