# Contract: Stripe Metered Billing for Flex Plan

## Purpose

Define how storage usage is reported to Stripe for the Flex plan's pay-as-you-go billing model.

## Stripe Configuration

### Product
- **Name**: Flex Storage
- **Description**: Pay-as-you-go storage at $0.20/GB/month

### Meter
- **Display Name**: Storage Usage (GB)
- **Event Name**: `storage_usage_gb`
- **Aggregation**: `last` (uses the last reported value in the billing period)
- **Customer Mapping**: `by_id` with `event_payload_key: "stripe_customer_id"`
- **Value Settings**: `event_payload_key: "value"`

### Prices

| Interval | Unit Amount | Meter | Notes |
|----------|-------------|-------|-------|
| Monthly | $0.20 (unit_amount: 20) | `storage_usage_gb` | Standard |
| Yearly | $2.00/GB/year (unit_amount: 200, div by 12) | `storage_usage_gb` | Discounted, same meter |

## Reporting Cadence: Daily Cron

A daily cron job snapshots current storage for all FLEX-plan organizations and sends a meter event to Stripe.

### Cron Job: `report-storage-usage`

**Schedule**: Runs daily at 02:00 UTC (off-peak)

**Logic**:
1. Query all organizations where `plan = "FLEX"` and `stripeCustomerId IS NOT NULL`
2. For each org: convert `storageUsedBytes` to GB (divide by 1,000,000,000)
3. Call `stripe.billing.meterEvents.create()` with idempotency key

**Idempotency key pattern**: `{orgId}-{periodId}` where `periodId` = current billing period's subscription item ID or a date-based period hash. This ensures the same cron cycle doesn't create duplicate meter events.

```typescript
// Pseudocode
const orgs = await db.organization.findMany({
  where: { plan: "FLEX", stripeCustomerId: { not: null } },
});

for (const org of orgs) {
  const storageGB = Number(org.storageUsedBytes) / 1_000_000_000;

  await stripe.billing.meterEvents.create({
    event_name: "storage_usage_gb",
    payload: {
      stripe_customer_id: org.stripeCustomerId,
      value: storageGB.toFixed(4),
    },
    identifier: `${org.id}-${today.toISOString().slice(0, 10)}`,
  });
}
```

### Webhook: Error Monitoring

Extend the existing Stripe webhook handler to listen for:

```typescript
case "v1.billing.meter.error_report_triggered": {
  // Log and alert — meter events failed
  logger.error({ event }, "Meter event error");
  break;
}
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Storage decreases (deletions) | `last` aggregation uses most recent value — correct |
| Mid-cycle subscription | Cron picks up org on next run; events before subscription are ignored |
| No events in period | Quantity defaults to 0 — no charge |
| Orphaned org (no stripeCustomerId) | Skipped by cron; backfill via migration |
| Invoice finalization race | Daily cron within 24h of invoice finalization is sufficient; optional final sync on `invoice.finalized` webhook |
| Yearly billing | Same meter, separate price with `interval: "year"`; `last` aggregation on yearly periods |
| Meter event permanently fails | Stripe fires `v1.billing.meter.error_report_triggered` — alert ops |

## Impacted Files

| File | Change |
|------|--------|
| `packages/payments/provider/stripe/index.ts` | Add `v1.billing.meter.error_report_triggered` webhook handler |
| `packages/payments/provider/stripe/index.ts` | Add Flex product/price creation utility |
| `apps/web/modules/saas/payments/jobs/report-storage-usage.ts` | New daily cron job |
| `packages/payments/types.ts` | Optionally extend `PaymentProvider` interface |
