import asyncio
import time
from dataclasses import dataclass, field


class BudgetExceeded(RuntimeError):
    """Raised when an agent run breaches token, cost, tool, or runtime limits."""
    pass


@dataclass
class ExecutionBudget:
    """
    Thread-safe outer execution budget controller.
    Enforces $0.20 per-case cost cap, 6,000 token cap, and runtime deadlines.
    """
    max_llm_calls: int = 8
    max_tool_calls: int = 20
    max_runtime_seconds: float = 90.0
    max_cost_usd: float = 0.20
    max_generated_tokens: int = 6000

    started: float = field(default_factory=time.monotonic)
    llm_calls: int = 0
    tool_calls: int = 0
    generated_tokens: int = 0
    cost_usd: float = 0.0

    _lock: asyncio.Lock = field(
        default_factory=asyncio.Lock,
        repr=False,
    )

    def _deadline_check(self) -> None:
        if time.monotonic() - self.started > self.max_runtime_seconds:
            raise BudgetExceeded("Runtime deadline exceeded")

    async def charge_llm(
        self,
        *,
        generated_tokens: int,
        cost_usd: float,
    ) -> None:
        async with self._lock:
            self._deadline_check()

            if self.llm_calls + 1 > self.max_llm_calls:
                raise BudgetExceeded(f"LLM-call budget exceeded (max: {self.max_llm_calls})")

            if self.generated_tokens + generated_tokens > self.max_generated_tokens:
                raise BudgetExceeded(
                    f"Token budget exceeded ({self.generated_tokens + generated_tokens} > {self.max_generated_tokens})"
                )

            if self.cost_usd + cost_usd > self.max_cost_usd:
                raise BudgetExceeded(
                    f"Cost budget exceeded (${self.cost_usd + cost_usd:.4f} > ${self.max_cost_usd:.2f})"
                )

            self.llm_calls += 1
            self.generated_tokens += generated_tokens
            self.cost_usd += cost_usd

    async def charge_tool(self) -> None:
        async with self._lock:
            self._deadline_check()
            if self.tool_calls + 1 > self.max_tool_calls:
                raise BudgetExceeded(f"Tool-call budget exceeded (max: {self.max_tool_calls})")
            self.tool_calls += 1


async def _verify_budget():
    budget = ExecutionBudget(max_cost_usd=0.20, max_generated_tokens=6000)

    # 1. Normal charge within allowance
    await budget.charge_llm(generated_tokens=1500, cost_usd=0.05)
    await budget.charge_tool()
    print(f"Normal Charge: LLM Calls={budget.llm_calls} | Tokens={budget.generated_tokens} | Cost=${budget.cost_usd:.4f}")

    # 2. Trigger breach on cost cap ($0.20 cap)
    try:
        await budget.charge_llm(generated_tokens=500, cost_usd=0.18)
        print("Error: Budget failed to catch cost breach")
    except BudgetExceeded as e:
        print(f"Verified Protection: Caught breach -> {e}")


if __name__ == "__main__":
    asyncio.run(_verify_budget())