from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Optional


class CircuitBreakerTripped(Exception):
    """Raised when an automated audit is halted by safety guardrails."""
    def __init__(self, reason: str, details: dict[str, Any]):
        super().__init__(reason)
        self.reason = reason
        self.details = details


@dataclass(frozen=True)
class CircuitBreakerConfig:
    min_vcs_score: Decimal = Decimal("0.95")
    max_budget_usd: Decimal = Decimal("0.20")
    max_injection_risk: float = 0.35
    required_state_fields: tuple[str, ...] = ("run_id", "case_id", "mode")


@dataclass
class CircuitBreakerDecision:
    is_tripped: bool
    trigger_rule: Optional[str] = None
    action: str = "ALLOW"
    requires_human_review: bool = False
    reasons: list[str] = field(default_factory=list)


class AuditCircuitBreaker:
    """
    Evaluates agent swarm execution invariants at node boundaries.
    Enforces deterministic halts on citation deficit, budget creep, or injection indicators.
    """

    def __init__(self, config: Optional[CircuitBreakerConfig] = None):
        self.config = config or CircuitBreakerConfig()

    def evaluate_state(
        self,
        state: dict[str, Any],
        current_cost_usd: float = 0.0,
        current_vcs_score: Optional[Decimal] = None,
        injection_risk_score: float = 0.0,
    ) -> CircuitBreakerDecision:
        reasons: list[str] = []

        # 1. Check schema boundary fence
        for req_field in self.config.required_state_fields:
            if req_field not in state or not state[req_field]:
                reasons.append(f"SCHEMA_FENCE_VIOLATION: missing required state field '{req_field}'")

        # 2. Check prompt injection risk threshold
        if injection_risk_score >= self.config.max_injection_risk:
            reasons.append(
                f"INJECTION_DEFENSE_TRIP: risk score {injection_risk_score:.2f} >= threshold {self.config.max_injection_risk:.2f}"
            )

        # 3. Check Verification Citation Score (VCS) boundary
        if current_vcs_score is not None and current_vcs_score < self.config.min_vcs_score:
            reasons.append(
                f"VCS_GROUNDING_TRIP: citation score {current_vcs_score:.4f} < threshold {self.config.min_vcs_score:.4f}"
            )

        # 4. Check budget cap boundary
        cost_dec = Decimal(str(round(current_cost_usd, 4)))
        if cost_dec > self.config.max_budget_usd:
            reasons.append(
                f"BUDGET_EXCEEDED_TRIP: current cost ${cost_dec} > limit ${self.config.max_budget_usd}"
            )

        if reasons:
            return CircuitBreakerDecision(
                is_tripped=True,
                trigger_rule=reasons[0].split(":")[0],
                action="HALT_AND_ROUTE_TO_HUMAN",
                requires_human_review=True,
                reasons=reasons,
            )

        return CircuitBreakerDecision(
            is_tripped=False,
            action="ALLOW",
            requires_human_review=False,
            reasons=[],
        )

    def enforce_or_raise(
        self,
        state: dict[str, Any],
        current_cost_usd: float = 0.0,
        current_vcs_score: Optional[Decimal] = None,
        injection_risk_score: float = 0.0,
    ) -> None:
        """Evaluates boundary invariants and raises CircuitBreakerTripped if invalid."""
        decision = self.evaluate_state(
            state=state,
            current_cost_usd=current_cost_usd,
            current_vcs_score=current_vcs_score,
            injection_risk_score=injection_risk_score,
        )
        if decision.is_tripped:
            raise CircuitBreakerTripped(
                reason=decision.reasons[0],
                details={
                    "reasons": decision.reasons,
                    "action": decision.action,
                    "case_id": state.get("case_id", "UNKNOWN"),
                },
            )


if __name__ == "__main__":
    print("Executing Deterministic Circuit Breaker test suite...")

    breaker = AuditCircuitBreaker()
    valid_state = {"run_id": "run-001", "case_id": "CASE-PASS-01", "mode": "curated"}

    # 1. Clean nominal pass
    d1 = breaker.evaluate_state(valid_state, current_cost_usd=0.0025, current_vcs_score=Decimal("1.0000"))
    print("\n1. Nominal Pass Check:")
    print(f"   Tripped:        {d1.is_tripped}")
    print(f"   Action:         {d1.action}")

    # 2. Low VCS grounding failure
    d2 = breaker.evaluate_state(valid_state, current_vcs_score=Decimal("0.8500"))
    print("\n2. Low VCS Grounding Trip Check:")
    print(f"   Tripped:        {d2.is_tripped}")
    print(f"   Trigger Rule:   {d2.trigger_rule}")
    print(f"   Action:         {d2.action}")
    print(f"   Reasons:        {d2.reasons}")

    # 3. Adversarial injection trip
    d3 = breaker.evaluate_state(valid_state, injection_risk_score=0.75)
    print("\n3. Injection Risk Trip Check:")
    print(f"   Tripped:        {d3.is_tripped}")
    print(f"   Trigger Rule:   {d3.trigger_rule}")
    print(f"   Review Demanded:{d3.requires_human_review}")

    # 4. Enforce exception raising
    print("\n4. Hard Exception Interception Check:")
    try:
        breaker.enforce_or_raise(valid_state, current_cost_usd=0.25)
    except CircuitBreakerTripped as exc:
        print(f"   Caught Expected Exception: {exc.reason}")
        print(f"   Enforced Action:           {exc.details['action']}")