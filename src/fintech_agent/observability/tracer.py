import contextlib
from dataclasses import dataclass, field
import time
from typing import Any, Iterator, Optional
import uuid


@dataclass
class AuditSpan:
    span_id: str
    trace_id: str
    name: str
    start_time: float
    end_time: Optional[float] = None
    duration_ms: float = 0.0
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    status: str = "OK"
    attributes: dict[str, Any] = field(default_factory=dict)
    events: list[dict[str, Any]] = field(default_factory=list)

    def record_event(self, event_name: str, payload: Optional[dict[str, Any]] = None) -> None:
        self.events.append({
            "timestamp": time.time(),
            "event": event_name,
            "payload": payload or {},
        })

    def close(self, status: str = "OK") -> None:
        self.end_time = time.monotonic()
        self.duration_ms = round((self.end_time - self.start_time) * 1000.0, 3)
        self.status = status


@dataclass
class TraceSummary:
    trace_id: str
    total_spans: int
    total_duration_ms: float
    total_tokens: int
    total_cost_usd: float
    span_breakdown: list[dict[str, Any]]


class AuditTracer:
    """
    OpenTelemetry-compatible distributed tracer for agent DAG execution.
    Provides span context managers, token attribution, and latency profiling.
    """

    def __init__(self, trace_id: Optional[str] = None):
        self.trace_id = trace_id or f"tr-{uuid.uuid4().hex[:12]}"
        self.spans: list[AuditSpan] = []
        self._active_span: Optional[AuditSpan] = None

    @contextlib.contextmanager
    def span(
        self,
        name: str,
        attributes: Optional[dict[str, Any]] = None,
        tokens_in: int = 0,
        tokens_out: int = 0,
        cost_usd: float = 0.0,
    ) -> Iterator[AuditSpan]:
        span_id = f"sp-{uuid.uuid4().hex[:8]}"
        s = AuditSpan(
            span_id=span_id,
            trace_id=self.trace_id,
            name=name,
            start_time=time.monotonic(),
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            attributes=attributes or {},
        )
        prev_span = self._active_span
        self._active_span = s
        self.spans.append(s)

        try:
            yield s
            s.close(status="OK")
        except Exception as exc:
            s.record_event("exception", {"error": str(exc), "type": type(exc).__name__})
            s.close(status="ERROR")
            raise
        finally:
            self._active_span = prev_span

    def record_event(self, event_name: str, payload: Optional[dict[str, Any]] = None) -> None:
        """Records an event onto the currently active span or creates an unattached event record."""
        if self._active_span:
            self._active_span.record_event(event_name, payload)

    def summarize(self) -> TraceSummary:
        total_duration = sum(s.duration_ms for s in self.spans)
        total_tokens = sum(s.tokens_in + s.tokens_out for s in self.spans)
        total_cost = sum(s.cost_usd for s in self.spans)

        breakdown = [
            {
                "span_id": s.span_id,
                "name": s.name,
                "status": s.status,
                "duration_ms": s.duration_ms,
                "tokens": s.tokens_in + s.tokens_out,
                "cost_usd": s.cost_usd,
                "events_count": len(s.events),
            }
            for s in self.spans
        ]

        return TraceSummary(
            trace_id=self.trace_id,
            total_spans=len(self.spans),
            total_duration_ms=round(total_duration, 3),
            total_tokens=total_tokens,
            total_cost_usd=round(total_cost, 6),
            span_breakdown=breakdown,
        )


if __name__ == "__main__":
    print("Executing Distributed Agent Tracer validation...")

    tracer = AuditTracer(trace_id="tr-covenant-proof-demo")

    # Simulate LangGraph agent swarm execution lifecycle
    with tracer.span("node:document_ingestion", {"documents_count": 3}) as s1:
        s1.record_event("extract_spans", {"extracted": 14})
        time.sleep(0.01)  # Simulate parsing

    with tracer.span("node:quantitative_audit", tokens_in=250, tokens_out=80, cost_usd=0.0012) as s2:
        s2.record_event("math_reconciliation", {"dscr": "1.00", "variance": "0.31"})
        time.sleep(0.015)

    with tracer.span("node:compliance_verification", tokens_in=180, tokens_out=40, cost_usd=0.0008) as s3:
        s3.record_event("vcs_eval", {"vcs_score": "1.0000"})
        time.sleep(0.008)

    with tracer.span("node:report_composer", tokens_in=300, tokens_out=150, cost_usd=0.0015) as s4:
        s4.record_event("audit_memo_generated", {"claims": 2})
        time.sleep(0.012)

    summary = tracer.summarize()

    print(f"\nTrace ID:             {summary.trace_id}")
    print(f"Total Spans:          {summary.total_spans}")
    print(f"Total Latency:        {summary.total_duration_ms:.2f} ms")
    print(f"Total Tokens Tracked: {summary.total_tokens}")
    print(f"Total Cost Tracked:   ${summary.total_cost_usd:.4f}")

    print("\nSpan Breakdown:")
    for span in summary.span_breakdown:
        print(
            f"  - [{span['status']}] {span['name']:<32} "
            f"| {span['duration_ms']:>6.2f} ms "
            f"| Tokens: {span['tokens']:>4} "
            f"| Cost: ${span['cost_usd']:.4f} "
            f"| Events: {span['events_count']}"
        )