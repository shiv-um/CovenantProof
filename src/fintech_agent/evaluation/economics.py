from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP


@dataclass(frozen=True)
class EconomicImpactReport:
    annual_case_volume: int
    analyst_hourly_wage: Decimal
    manual_hours_per_case: Decimal
    auto_human_hours_per_case: Decimal
    per_case_inference_cost: Decimal
    platform_annual_overhead: Decimal

    # Derived calculations
    manual_cost_per_case: Decimal
    total_manual_cost: Decimal
    auto_variable_cost_per_case: Decimal
    total_auto_variable_cost: Decimal
    total_automated_cost: Decimal
    net_annual_benefit: Decimal
    roi_percentage: Decimal
    hours_saved_annually: Decimal


def compute_economic_roi(
    annual_case_volume: int = 3000,
    analyst_hourly_wage: Decimal = Decimal("104.00"),
    manual_hours_per_case: Decimal = Decimal("4.00"),
    auto_human_hours_per_case: Decimal = Decimal("0.25"),  # 15 minutes exception review
    per_case_inference_cost: Decimal = Decimal("0.20"),
    platform_annual_overhead: Decimal = Decimal("55400.00"),  # AWS Bedrock + Supabase DB + Ops
) -> EconomicImpactReport:
    """
    Computes deterministic labor savings and financial ROI anchored against
    U.S. Bureau of Labor Statistics (BLS) financial analyst fully burdened wage rates.
    """
    volume = Decimal(str(annual_case_volume))

    # 1. Baseline Manual Cost Model
    manual_cost_per_case = (manual_hours_per_case * analyst_hourly_wage).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    total_manual_cost = (volume * manual_cost_per_case).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # 2. Automated Multi-Agent Cost Model
    auto_human_cost_per_case = (auto_human_hours_per_case * analyst_hourly_wage).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    auto_variable_cost_per_case = auto_human_cost_per_case + per_case_inference_cost
    total_auto_variable_cost = (volume * auto_variable_cost_per_case).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    total_automated_cost = total_auto_variable_cost + platform_annual_overhead

    # 3. Net Savings & ROI
    net_annual_benefit = total_manual_cost - total_automated_cost
    roi_percentage = (
        (net_annual_benefit / total_automated_cost) * Decimal("100")
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    hours_saved_annually = (
        volume * (manual_hours_per_case - auto_human_hours_per_case)
    ).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    return EconomicImpactReport(
        annual_case_volume=annual_case_volume,
        analyst_hourly_wage=analyst_hourly_wage,
        manual_hours_per_case=manual_hours_per_case,
        auto_human_hours_per_case=auto_human_hours_per_case,
        per_case_inference_cost=per_case_inference_cost,
        platform_annual_overhead=platform_annual_overhead,
        manual_cost_per_case=manual_cost_per_case,
        total_manual_cost=total_manual_cost,
        auto_variable_cost_per_case=auto_variable_cost_per_case,
        total_auto_variable_cost=total_auto_variable_cost,
        total_automated_cost=total_automated_cost,
        net_annual_benefit=net_annual_benefit,
        roi_percentage=roi_percentage,
        hours_saved_annually=hours_saved_annually,
    )


def print_roi_breakdown(rpt: EconomicImpactReport) -> None:
    print("================================================================")
    print("       COVENANTPROOF ENTERPRISE ECONOMIC IMPACT AUDIT           ")
    print("================================================================")
    print(f"Annual Case Volume:          {rpt.annual_case_volume:,} packages")
    print(f"BLS Analyst Wage Anchor:     ${rpt.analyst_hourly_wage}/hr (fully burdened)")
    print(f"Manual Review Time:          {rpt.manual_hours_per_case} hrs/packet")
    print(f"Automated Human Review Time: {rpt.auto_human_hours_per_case} hrs/packet (15 mins)")
    print(f"Variable Inference Cost:     ${rpt.per_case_inference_cost}/packet")
    print("----------------------------------------------------------------")
    print(f"Baseline Manual Annual Cost: ${rpt.total_manual_cost:,.2f}")
    print(f"  - Cost Per Case:           ${rpt.manual_cost_per_case:,.2f}")
    print(f"Automated Annual Cost:       ${rpt.total_automated_cost:,.2f}")
    print(f"  - Variable Cost Per Case:  ${rpt.auto_variable_cost_per_case:,.2f}")
    print(f"  - Platform Overhead:       ${rpt.platform_annual_overhead:,.2f}")
    print("----------------------------------------------------------------")
    print(f"NET ANNUAL ECONOMIC BENEFIT: ${rpt.net_annual_benefit:,.2f}")
    print(f"CAPITAL RETURN ON INVESTMENT: {rpt.roi_percentage}% ROI")
    print(f"UNDERWRITING HOURS SAVED:    {rpt.hours_saved_annually:,.1f} hrs/year")
    print("================================================================")


if __name__ == "__main__":
    report = compute_economic_roi()
    print_roi_breakdown(report)