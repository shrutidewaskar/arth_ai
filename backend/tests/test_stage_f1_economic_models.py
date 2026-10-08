import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uuid
from datetime import datetime, timezone
from decimal import Decimal
import pytest
from pydantic import ValidationError

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
    ExternalSource,
    EconomicObservation,
    InflationObservation,
    CostIndexObservation,
    GDPObservation,
    InterestRateObservation,
    TaxRuleVersion,
)
from app.schemas.economic import (
    ExternalSourceCreate,
    ExternalSourceResponse,
    EconomicObservationCreate,
    InflationObservationCreate,
    CostIndexObservationCreate,
    GDPObservationCreate,
    InterestRateObservationCreate,
    TaxRuleVersionCreate,
)


class TestStageF1EconomicDataModel:
    """
    Validation test suite for Stage F1: Economic Intelligence Data Model.
    Verifies that models, schemas, enums, temporal distinctions, revisions,
    and provenance foreign keys are strictly structured according to the specification.
    """

    # ------------------------------------------------------------------------
    # 1. External Source Model & Schema Tests
    # ------------------------------------------------------------------------
    def test_external_source_model_instantiation(self):
        source_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        source = ExternalSource(
            id=source_id,
            name="Reserve Bank of India Database on Indian Economy (DBIE)",
            organization="Reserve Bank of India",
            source_type=SourceType.REGULATOR.value,
            url="https://dbie.rbi.org.in",
            country="IND",
            reliability_tier=ReliabilityTier.TIER_1_OFFICIAL.value,
            metadata_info={"api_available": True, "frequency": "DAILY"},
            created_at=now,
            updated_at=now,
        )

        assert source.id == source_id
        assert source.name == "Reserve Bank of India Database on Indian Economy (DBIE)"
        assert source.source_type == "REGULATOR"
        assert source.reliability_tier == "TIER_1_OFFICIAL"
        assert source.country == "IND"

    def test_external_source_schema_validation(self):
        source_payload = {
            "name": "Ministry of Statistics and Programme Implementation (MoSPI)",
            "organization": "Government of India",
            "source_type": SourceType.OFFICIAL_GOVERNMENT,
            "url": "https://mospi.gov.in",
            "country": "IND",
            "reliability_tier": ReliabilityTier.TIER_1_OFFICIAL,
            "metadata_info": {"release_cadence": "MONTHLY_12TH"},
        }
        validated = ExternalSourceCreate(**source_payload)
        assert validated.name == "Ministry of Statistics and Programme Implementation (MoSPI)"
        assert validated.reliability_tier == ReliabilityTier.TIER_1_OFFICIAL

    def test_external_source_invalid_reliability_tier(self):
        with pytest.raises(ValidationError):
            ExternalSourceCreate(
                name="Test",
                organization="Test Org",
                source_type=SourceType.NEWS,
                reliability_tier="INVALID_TIER_100",  # Invalid enum value
            )

    # ------------------------------------------------------------------------
    # 2. Generic Economic Observation Tests
    # ------------------------------------------------------------------------
    def test_economic_observation_temporal_and_revision_fields(self):
        source_id = uuid.uuid4()
        pub_date = datetime(2025, 2, 12, 10, 0, 0, tzinfo=timezone.utc)
        ret_date = datetime(2025, 2, 12, 10, 5, 0, tzinfo=timezone.utc)
        eff_start = datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        eff_end = datetime(2025, 1, 31, 23, 59, 59, tzinfo=timezone.utc)

        obs = EconomicObservation(
            id=uuid.uuid4(),
            source_id=source_id,
            indicator="UNEMPLOYMENT_RATE",
            value=Decimal("7.200000"),
            unit="PERCENTAGE",
            geography="IN",
            frequency="MONTHLY",
            observation_period="2025-01",
            published_at=pub_date,
            retrieved_at=ret_date,
            status=ObservationStatus.PROVISIONAL.value,
            revision_number=0,
            effective_from=eff_start,
            effective_to=eff_end,
            methodology="Periodic Labour Force Survey (PLFS) Monthly Bulletin",
            source_reference="MoSPI PLFS Release Table 2",
        )

        assert obs.indicator == "UNEMPLOYMENT_RATE"
        assert obs.value == Decimal("7.200000")
        assert obs.status == "PROVISIONAL"
        assert obs.revision_number == 0
        # Ensure temporal timestamps are distinct
        assert obs.observation_period != obs.published_at.isoformat()
        assert obs.published_at < obs.retrieved_at
        assert obs.effective_from == eff_start
        assert obs.effective_to == eff_end

    def test_economic_observation_schema_pydantic(self):
        source_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        payload = {
            "source_id": source_id,
            "indicator": "FOREX_RESERVES",
            "value": Decimal("648000.50"),
            "unit": "USD_MILLION",
            "geography": "IN",
            "frequency": "WEEKLY",
            "observation_period": "2025-W06",
            "published_at": now,
            "status": ObservationStatus.FINAL,
            "revision_number": 1,
            "methodology": "RBI Weekly Statistical Supplement",
            "source_reference": "Table 1, WSS Vol 40 No 6",
        }
        obs = EconomicObservationCreate(**payload)
        assert obs.indicator == "FOREX_RESERVES"
        assert obs.revision_number == 1
        assert obs.status == ObservationStatus.FINAL

    # ------------------------------------------------------------------------
    # 3. Inflation Observation Tests (Category Taxonomy & Provisional Flag)
    # ------------------------------------------------------------------------
    def test_inflation_observation_taxonomy_and_provisional(self):
        source_id = uuid.uuid4()
        pub_date = datetime(2025, 2, 12, 17, 30, 0, tzinfo=timezone.utc)

        inf_obs = InflationObservation(
            id=uuid.uuid4(),
            source_id=source_id,
            category=InflationCategory.EDUCATION.value,
            subcategory="Primary and Secondary School Tuition",
            inflation_rate=Decimal("6.8500"),
            index_value=Decimal("194.2000"),
            base_year="2012=100",
            basket_version="CPI-Combined-2012",
            geography="IN-URBAN",
            sector=InflationSector.URBAN.value,
            period="2025-01",
            is_provisional=True,
            published_at=pub_date,
            retrieved_at=pub_date,
            data_quality="OFFICIAL_PROVISIONAL",
            source_reference="MoSPI CPI Statement 3, Jan 2025",
        )

        assert inf_obs.category == "EDUCATION"
        assert inf_obs.inflation_rate == Decimal("6.8500")
        assert inf_obs.sector == "URBAN"
        assert inf_obs.is_provisional is True
        assert inf_obs.base_year == "2012=100"

    def test_inflation_taxonomy_enum_values(self):
        expected_categories = [
            "GENERAL",
            "FOOD",
            "HOUSING",
            "HEALTHCARE",
            "EDUCATION",
            "TRANSPORT",
            "FUEL",
            "CLOTHING",
            "HOUSEHOLD_GOODS",
            "PERSONAL_CARE",
            "RECREATION",
            "OTHER",
        ]
        for cat in expected_categories:
            assert InflationCategory(cat) is not None

    # ------------------------------------------------------------------------
    # 4. Cost Index Observation Tests (Specific Item vs CPI)
    # ------------------------------------------------------------------------
    def test_cost_index_observation(self):
        source_id = uuid.uuid4()
        pub_date = datetime(2025, 1, 15, tzinfo=timezone.utc)

        cost_obs = CostIndexObservation(
            id=uuid.uuid4(),
            source_id=source_id,
            category="EDUCATION",
            item="Tier-1 Private Engineering Degree Annual Tuition",
            geography="IN-NATIONAL",
            value=Decimal("450000.0000"),
            unit="INR_PER_YEAR",
            period="2024-25",
            frequency="ANNUAL",
            methodology="Aggregated institutional survey across top 50 private institutions",
            data_quality="VERIFIED",
            published_at=pub_date,
            source_reference="All India Higher Education Cost Benchmark Report 2025",
        )

        assert cost_obs.category == "EDUCATION"
        assert cost_obs.item == "Tier-1 Private Engineering Degree Annual Tuition"
        assert cost_obs.value == Decimal("450000.0000")
        assert cost_obs.unit == "INR_PER_YEAR"

    # ------------------------------------------------------------------------
    # 5. GDP Observation Tests (Real vs Nominal & Estimate Stages)
    # ------------------------------------------------------------------------
    def test_gdp_observation_real_and_nominal(self):
        source_id = uuid.uuid4()
        pub_date = datetime(2025, 2, 28, tzinfo=timezone.utc)

        gdp_obs = GDPObservation(
            id=uuid.uuid4(),
            source_id=source_id,
            metric=GDPMetric.REAL_GDP_GROWTH.value,
            value=Decimal("6.8000"),
            unit="PERCENTAGE_YOY",
            real_or_nominal="REAL",
            seasonally_adjusted=False,
            geography="IN",
            period="2024-Q3",
            frequency="QUARTERLY",
            estimate_stage=GDPEstimateStage.SECOND_ADVANCE_ESTIMATE.value,
            published_at=pub_date,
            revision_number=1,
            data_quality="OFFICIAL",
            source_reference="National Statistical Office Press Release on Q3 GDP",
        )

        assert gdp_obs.metric == "REAL_GDP_GROWTH"
        assert gdp_obs.real_or_nominal == "REAL"
        assert gdp_obs.estimate_stage == "SECOND_ADVANCE_ESTIMATE"
        assert gdp_obs.value == Decimal("6.8000")

    # ------------------------------------------------------------------------
    # 6. Interest Rate Observation Tests (Policy vs Market Rates)
    # ------------------------------------------------------------------------
    def test_interest_rate_observation(self):
        source_id = uuid.uuid4()
        ann_date = datetime(2025, 2, 7, 10, 0, 0, tzinfo=timezone.utc)
        eff_date = datetime(2025, 2, 7, 12, 0, 0, tzinfo=timezone.utc)

        rate_obs = InterestRateObservation(
            id=uuid.uuid4(),
            source_id=source_id,
            rate_type=RateType.RBI_REPO.value,
            rate=Decimal("6.2500"),
            unit="PERCENTAGE_PER_ANNUM",
            institution="Reserve Bank of India",
            instrument="Policy Repo Rate under Liquidity Adjustment Facility",
            effective_from=eff_date,
            effective_to=None,
            announcement_date=ann_date,
            published_at=ann_date,
            source_reference="Monetary Policy Committee Statement, Feb 2025",
        )

        assert rate_obs.rate_type == "RBI_REPO"
        assert rate_obs.rate == Decimal("6.2500")
        assert rate_obs.institution == "Reserve Bank of India"
        assert rate_obs.announcement_date == ann_date
        assert rate_obs.effective_from == eff_date

    # ------------------------------------------------------------------------
    # 7. Tax Rule Version Tests (Versioned Structured Statutory Rules)
    # ------------------------------------------------------------------------
    def test_tax_rule_version_structured_payload(self):
        source_id = uuid.uuid4()
        eff_date = datetime(2025, 4, 1, 0, 0, 0, tzinfo=timezone.utc)

        tax_slabs_payload = [
            {"limit": 400000, "rate": 0.0},
            {"limit": 800000, "rate": 0.05},
            {"limit": 1200000, "rate": 0.10},
            {"limit": 1600000, "rate": 0.15},
            {"limit": 2000000, "rate": 0.20},
            {"limit": 99999999, "rate": 0.30},
        ]

        tax_rule = TaxRuleVersion(
            id=uuid.uuid4(),
            tax_year="FY 2025-26",
            assessment_year="AY 2026-27",
            regime=TaxRegime.NEW.value,
            section="115BAC",
            subsection="1A",
            rule_type=TaxRuleType.TAX_SLABS.value,
            parameter="SLAB_RATES",
            value=tax_slabs_payload,
            unit="SLAB_SCHEDULE",
            conditions={"applicable_to": "INDIVIDUAL_RESIDENT"},
            effective_from=eff_date,
            effective_to=None,
            source_id=source_id,
            source_reference="Finance Act 2025, Section 115BAC",
            version="1.0",
            status=TaxRuleStatus.ACTIVE.value,
        )

        assert tax_rule.tax_year == "FY 2025-26"
        assert tax_rule.assessment_year == "AY 2026-27"
        assert tax_rule.regime == "NEW"
        assert tax_rule.section == "115BAC"
        assert tax_rule.rule_type == "TAX_SLABS"
        assert len(tax_rule.value) == 6
        assert tax_rule.value[0]["limit"] == 400000
        assert tax_rule.status == "ACTIVE"

    def test_tax_rule_version_schema_validation(self):
        source_id = uuid.uuid4()
        eff_date = datetime(2025, 4, 1, 0, 0, 0, tzinfo=timezone.utc)

        schema_payload = {
            "tax_year": "FY 2025-26",
            "assessment_year": "AY 2026-27",
            "regime": TaxRegime.NEW,
            "section": "STANDARD_DEDUCTION",
            "rule_type": TaxRuleType.DEDUCTION_LIMIT,
            "parameter": "SALARY_STANDARD_DEDUCTION",
            "value": {"limit": 75000},
            "unit": "INR",
            "conditions": {"salaried_only": True},
            "effective_from": eff_date,
            "source_id": source_id,
            "source_reference": "Finance Act 2025",
            "version": "1.0",
            "status": TaxRuleStatus.ACTIVE,
        }

        validated = TaxRuleVersionCreate(**schema_payload)
        assert validated.section == "STANDARD_DEDUCTION"
        assert validated.value == {"limit": 75000}
        assert validated.regime == TaxRegime.NEW
        assert validated.status == TaxRuleStatus.ACTIVE

    # ------------------------------------------------------------------------
    # 8. Architecture & Non-Tenant Isolation Guarantee Test
    # ------------------------------------------------------------------------
    def test_economic_models_are_non_tenant_and_provenance_aware(self):
        """
        Verify that none of the economic models contain personal user_id fields,
        confirming that economic reference data is global public data rather than
        tenant-scoped, and that every model requires a source_id foreign key.
        """
        economic_model_classes = [
            EconomicObservation,
            InflationObservation,
            CostIndexObservation,
            GDPObservation,
            InterestRateObservation,
            TaxRuleVersion,
        ]

        for model_cls in economic_model_classes:
            columns = [c.name for c in model_cls.__table__.columns]
            assert "user_id" not in columns, f"{model_cls.__name__} must not have user_id (public reference data)"
            assert "source_id" in columns, f"{model_cls.__name__} must have source_id (provenance tracking)"
            assert "published_at" in columns or "effective_from" in columns, f"{model_cls.__name__} must have temporal validity"
