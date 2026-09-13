import asyncio
import json
import os
from typing import Any, Optional
import redis.asyncio as aioredis


class RedisStore:
    """
    Manages distributed state persistence, atomic locks, and event streaming
    for the CovenantProof multi-agent swarm. Falls back to an in-memory
    store when a live Redis instance is not reachable in local development.
    """

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._client: Optional[aioredis.Redis] = None
        self._is_connected = False
        self._memory_store: dict[str, str] = {}
        self._memory_locks: set[str] = set()

    async def connect(self) -> bool:
        """Attempts connection to Redis. Enables in-memory fallback if unreachable."""
        try:
            client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
            await client.ping()
            self._client = client
            self._is_connected = True
            return True
        except Exception:
            self._is_connected = False
            self._client = None
            return False

    async def disconnect(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._is_connected = False

    async def set_state(self, key: str, state: dict[str, Any], ttl_seconds: int = 3600) -> None:
        payload = json.dumps(state)
        if self._is_connected and self._client is not None:
            try:
                await self._client.set(f"audit:state:{key}", payload, ex=ttl_seconds)
                return
            except Exception:
                pass
        self._memory_store[key] = payload

    async def get_state(self, key: str) -> Optional[dict[str, Any]]:
        if self._is_connected and self._client is not None:
            try:
                data = await self._client.get(f"audit:state:{key}")
                if data:
                    return json.loads(data)
            except Exception:
                pass
        raw = self._memory_store.get(key)
        return json.loads(raw) if raw else None

    async def acquire_lock(self, lock_key: str, ttl_seconds: int = 30) -> bool:
        if self._is_connected and self._client is not None:
            try:
                acquired = await self._client.set(
                    f"lock:{lock_key}",
                    "1",
                    ex=ttl_seconds,
                    nx=True,
                )
                return bool(acquired)
            except Exception:
                pass
        if lock_key in self._memory_locks:
            return False
        self._memory_locks.add(lock_key)
        return True

    async def release_lock(self, lock_key: str) -> None:
        if self._is_connected and self._client is not None:
            try:
                await self._client.delete(f"lock:{lock_key}")
                return
            except Exception:
                pass
        self._memory_locks.discard(lock_key)

    async def publish_event(self, channel: str, event: dict[str, Any]) -> None:
        payload = json.dumps(event)
        if self._is_connected and self._client is not None:
            try:
                await self._client.publish(channel, payload)
                return
            except Exception:
                pass


async def _verify_redis():
    store = RedisStore()
    connected = await store.connect()
    mode = "Live Redis Cluster" if connected else "Resilient In-Memory Fallback"
    print(f"Redis Storage Driver: Active ({mode})")

    # 1. State persistence
    sample_state = {"case_id": "CASE-COBALT-2026", "stage": "QUANTITATIVE_COMPLETE"}
    await store.set_state("case-001", sample_state)
    retrieved = await store.get_state("case-001")
    print(f"State Checkpoint Persisted: case_id={retrieved.get('case_id')} | stage={retrieved.get('stage')}")

    # 2. Distributed lock verification
    lock1 = await store.acquire_lock("audit:CASE-COBALT-2026")
    lock2 = await store.acquire_lock("audit:CASE-COBALT-2026")
    print(f"Distributed Lock Test: Worker 1 Acquired={lock1} | Worker 2 Blocked={not lock2}")

    await store.release_lock("audit:CASE-COBALT-2026")
    lock3 = await store.acquire_lock("audit:CASE-COBALT-2026")
    print(f"Post-Release Re-acquisition: Worker 3 Acquired={lock3}")

    await store.disconnect()


if __name__ == "__main__":
    asyncio.run(_verify_redis())