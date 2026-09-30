import os
from typing import Any, Optional
from openinference.instrumentation.langchain import LangChainInstrumentor
from opentelemetry import trace as trace_api
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk import trace as trace_sdk
from opentelemetry.sdk.trace.export import SimpleSpanProcessor


class PhoenixObservability:
    """
    Configures distributed Arize Phoenix tracing and OpenInference instrumentation
    for the CovenantProof multi-agent swarm. Sends spans synchronously to the
    persistent Phoenix collector.
    """

    _instance: Optional["PhoenixObservability"] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(
        self,
        project_name: str = "covenant-proof-auditor",
        endpoint: Optional[str] = None,
        **kwargs: Any,
    ):
        if hasattr(self, "_initialized") and self._initialized:
            return

        self.project_name = project_name
        self.endpoint = (
            endpoint
            or os.getenv("PHOENIX_COLLECTOR_ENDPOINT")
            or "http://localhost:6006/v1/traces"
        )

        # Route traces to the project in Phoenix UI
        resource = Resource.create({"openinference.project.name": self.project_name})

        # Configure OpenTelemetry tracer provider with synchronous span export
        self.tracer_provider = trace_sdk.TracerProvider(resource=resource)
        otlp_exporter = OTLPSpanExporter(endpoint=self.endpoint)
        self.tracer_provider.add_span_processor(SimpleSpanProcessor(otlp_exporter))
        trace_api.set_tracer_provider(self.tracer_provider)

        # Automatically instrument all LangChain and LangGraph nodes
        LangChainInstrumentor().instrument(tracer_provider=self.tracer_provider)
        print(f"[Arize Phoenix] Auto-instrumented LangGraph routing to: {self.endpoint}")

        self._initialized = True

    def record_audit_evaluation(
        self,
        case_id: str,
        run_id: str,
        vcs_score: float,
        review_required: bool,
        cost_usd: float,
        findings_count: int,
    ) -> None:
        """Logs deterministic financial evaluation metrics onto the active trace."""
        tracer = trace_api.get_tracer("covenantproof.evaluation")
        with tracer.start_as_current_span("evaluation:audit_invariants") as span:
            span.set_attribute("case_id", case_id)
            span.set_attribute("run_id", run_id)
            span.set_attribute("eval.vcs_score", vcs_score)
            span.set_attribute("eval.review_required", review_required)
            span.set_attribute("eval.cost_usd", cost_usd)
            span.set_attribute("eval.findings_count", findings_count)
            span.set_attribute("eval.status", "FLAGGED" if review_required else "PASSED")

    def flush(self) -> None:
        """Flushes any remaining in-flight spans."""
        if hasattr(self, "tracer_provider"):
            self.tracer_provider.force_flush()
