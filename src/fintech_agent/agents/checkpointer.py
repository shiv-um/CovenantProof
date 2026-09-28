import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

DEFAULT_POSTGRES_URI = os.getenv(
    "POSTGRES_URI",
    "postgresql://postgres:postgrespassword@localhost:5432/covenantproof?sslmode=disable",
)


@asynccontextmanager
async def postgres_checkpointer(
        database_url: str = DEFAULT_POSTGRES_URI,
) -> AsyncIterator[AsyncPostgresSaver]:
    """
    Asynchronous context manager managing an AsyncPostgresSaver connection.
    Initializes checkpoint tables via .setup() and yields the active checkpointer.
    """
    async with AsyncPostgresSaver.from_conn_string(database_url) as saver:
        await saver.setup()
        yield saver


def thread_config(
        *,
        run_id: str,
        checkpoint_ns: str = "credit_audit",
) -> dict:
    """Standardizes thread routing parameters for LangGraph checkpoint retrieval."""
    return {
        "configurable": {
            "thread_id": run_id,
            "checkpoint_ns": checkpoint_ns,
        }
    }


if __name__ == "__main__":
    import asyncio


    async def _test_checkpointer_connection():
        print("Testing PostgreSQL LangGraph Checkpointer...")
        async with postgres_checkpointer() as checkpointer:
            config = thread_config(run_id="test-run-001")
            state = {"run_id": "test-run-001", "stage": "INITIALIZED"}

            # Put and read back a sample checkpoint state
            checkpoint = {
                "v": 1,
                "ts": "2026-09-28T00:00:00Z",
                "id": "chk-001",
                "channel_values": state,
                "channel_versions": {"stage": 1},
                "versions_seen": {},
            }
            await checkpointer.aput(config, checkpoint, {}, {})
            retrieved = await checkpointer.aget(config)

            assert retrieved is not None, "Failed to retrieve saved checkpoint"
            print("PostgreSQL connection confirmed.")
            print(f"Checkpoint retrieved for thread: {config['configurable']['thread_id']}")
            print(f"Stored Channel Values: {retrieved['channel_values']}")


    asyncio.run(_test_checkpointer_connection())
