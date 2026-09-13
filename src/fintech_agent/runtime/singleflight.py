import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable


@dataclass
class _FlightCall:
    event: asyncio.Event = field(default_factory=asyncio.Event)
    result: Any = None
    error: BaseException | None = None


class SingleFlight:
    """
    Suppresses duplicate concurrent executions for identical case or document keys.
    If multiple callers request processing for the same key simultaneously, the
    workload executes exactly once, multiplexing the result to all callers.
    """

    def __init__(self) -> None:
        self._calls: dict[str, _FlightCall] = {}
        self._lock: asyncio.Lock = asyncio.Lock()

    async def execute(
        self,
        key: str,
        fn: Callable[[], Awaitable[Any]],
    ) -> tuple[Any, bool]:
        """
        Executes `fn` for the given key or joins an existing in-flight execution.
        Returns a tuple of `(result, is_leader)`.
        `is_leader` is True for the primary execution and False for joined callers.
        """
        async with self._lock:
            if key in self._calls:
                call = self._calls[key]
                is_leader = False
            else:
                call = _FlightCall()
                self._calls[key] = call
                is_leader = True

        if not is_leader:
            await call.event.wait()
            if call.error is not None:
                raise call.error
            return call.result, False

        try:
            result = await fn()
            call.result = result
            return result, True
        except BaseException as exc:
            call.error = exc
            raise
        finally:
            async with self._lock:
                self._calls.pop(key, None)
            call.event.set()


async def _verify_singleflight():
    coordinator = SingleFlight()
    execution_counter = 0

    async def run_heavy_credit_audit():
        nonlocal execution_counter
        execution_counter += 1
        await asyncio.sleep(0.05)  # Simulate parser and node latency
        return {"case_id": "CASE-COBALT-2026", "status": "VERIFIED"}

    # Launch 5 concurrent calls requesting analysis of the identical case key
    tasks = [
        coordinator.execute("CASE-COBALT-2026", run_heavy_credit_audit)
        for _ in range(5)
    ]
    results = await asyncio.gather(*tasks)

    leaders = [r for r in results if r[1]]
    followers = [r for r in results if not r[1]]

    print(f"Total Concurrent Callers: {len(results)}")
    print(f"Underlying Invocations:   {execution_counter}")
    print(f"Leader Executions:        {len(leaders)}")
    print(f"Followers Coalesced:      {len(followers)}")
    print(f"Sample Payload Received:  {results[0][0]}")


if __name__ == "__main__":
    asyncio.run(_verify_singleflight())