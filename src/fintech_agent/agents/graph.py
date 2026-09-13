from typing import Any
from langgraph.graph import StateGraph, START, END

from src.fintech_agent.agents.state import AgentState
from src.fintech_agent.agents.nodes import (
    ingestion_node,
    quantitative_node,
    compliance_node,
    composer_node,
)


def build_credit_audit_graph(checkpointer: Any = None):
    """
    Constructs and compiles the bounded LangGraph state machine
    governing the CovenantProof multi-agent auditor swarm.
    """
    workflow = StateGraph(AgentState)

    # 1. Register specialized swarm nodes
    workflow.add_node("ingestion", ingestion_node)
    workflow.add_node("quantitative", quantitative_node)
    workflow.add_node("compliance", compliance_node)
    workflow.add_node("composer", composer_node)

    # 2. Define deterministic sequential transitions
    workflow.add_edge(START, "ingestion")
    workflow.add_edge("ingestion", "quantitative")
    workflow.add_edge("quantitative", "compliance")
    workflow.add_edge("compliance", "composer")
    workflow.add_edge("composer", END)

    # 3. Compile executable graph with optional persistent checkpointer
    return workflow.compile(checkpointer=checkpointer)


if __name__ == "__main__":
    # Test end-to-end graph invocation using the canonical Cobalt Equipment credit packet
    app = build_credit_audit_graph()

    test_input: AgentState = {
        "run_id": "graph-run-001",
        "input_documents": [
            {
                "document_type": "purchase_order",
                "total_amount": "125000.00",
                "sha256": "hash-po-001",
            },
            {
                "document_type": "invoice",
                "total_amount": "125000.00",
                "sha256": "hash-inv-001",
            },
            {
                "document_type": "bank_payment",
                "total_amount": "152000.00",
                "sha256": "hash-bank-001",
            },
            {
                "document_type": "covenant_certificate",
                "ebitda": "1500000.00",
                "cash_taxes": "100000.00",
                "interest_expense": "700000.00",
                "current_maturities": "500000.00",
                "reported_dscr": "1.31",
            },
        ],
    }

    final_state = app.invoke(test_input)

    print("LangGraph StateGraph compiled and invoked successfully.")
    print(f"Registered Document Hashes: {len(final_state.get('document_hashes', []))}")
    print(f"Calculations Performed:     {len(final_state.get('calculations', []))}")
    print(f"Audit Findings Generated:   {len(final_state.get('findings', []))}")
    print(f"Report Claims Grounded:     {len(final_state.get('report_claims', []))}")
    print(f"Human Review Required:      {final_state.get('review_required')}")