---
name: onchain-market-observability-engineer
description: Designing protocol health dashboards for RING or Ringdom apps. Choosing Dune vs Flipside vs hybrid warehouse models. Token Terminal vs DefiLlama for fee and revenue reconciliation. Nansen-style labeling for treasury, MM, and team wallets. LegioX truth lens skill.
---

# Onchain Market Observability Engineer (Attribution, Liquidity, MEV, Treasury)

## Summary

Treat every headline metric as a hypothesis: TVL is stock, not quality; depth and churn of the same TVL can imply opposite health. Observability wins when you index authoritative events (transfers, swaps, mints/burns, governance executions, bridge messages), then layer attribution labels (EOA vs contract, known MM/bot clusters, protocol treasury tags, incentive distributor contracts) before aggregating. Treasury actions create step-functions in onchain series; organic adoption tends to co-move with cohort retention and product funnels, not with single-day volume spikes. MEV and extraction show up as systematic ordering advantages, abnormal slippage distributions, and profit flows to builder/searcher addresses correlated with user trades. Beneficiary transparency maps fee recipients, grant streams, and OTC counterparties where labels exist. LP concentration uses ownership of liquidity shares and tick liquidity Herfindahl-style measures rather than anonymous TVL alone. Anomalies are multi-signal: volume z-scores without depth context are weak; pair with unique meaningful counterparties, pool invariant drift, and bridge netflows. Shadow markets appear as off-protocol OTC, credit-migration, or stablecoin flight not visible in a single DEX dashboard—track CEX netflows only as noisy proxies with clear false-positive rates.

## When to use

- Designing protocol health dashboards for RING or Ringdom apps
- Choosing Dune vs Flipside vs hybrid warehouse models
- Token Terminal vs DefiLlama for fee and revenue reconciliation
- Nansen-style labeling for treasury, MM, and team wallets
- Wash-trading and sybil suspicion on incentive pools
- MEV extraction indicators around launches and migrations
- LP concentration and governance risk from concentrated liquidity
- Treasury runway and recycling observability
- Attributing growth to product KPIs vs incentive budgets
- Anomaly detection on swaps, mints, and bridge events
- Beneficiary transparency for fee splits and grants
- Shadow-market indicators: stablecoin stress, CEX netflows, OTC rumors vs onchain proofs
- Alerting thresholds for liquidity crises and oracle lag
- Event indexing patterns for subgraph/SQL parity checks

## Instructions

1. Pattern: EVENT_FIRST — derive metrics from decoded logs and traces; wallet counts without contract context are vanity-prone.
2. Pattern: DEPTH_NOT_TVL — report executable size at fixed slippage bands (e.g., 25/50/100 bps) per pool and chain.
3. Pattern: TREASURY_STEP_FUNCTION — tag governance/time-lock sends; sudden TVL jumps without user growth are treasury, not adoption.
4. Pattern: WASH_GUARD — round-trip within short windows among related addresses inflates volume; require economic loss tests and counterparty diversity.
5. Pattern: MEV_SIDECHANNEL — compare user slippage distribution vs baseline; spikes co-moving with builder tips suggest extraction pressure.
6. Pattern: LP_HHI — concentration of liquidity ownership and tick mass predicts governance and rug-sensitivity more than headline TVL.
7. Pattern: SHADOW_MARKET_PROXY — track stablecoin net issuance/bridged supply and large OTC-style transfers separately from DEX volume.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://onchain_market_observability_engineer`).
