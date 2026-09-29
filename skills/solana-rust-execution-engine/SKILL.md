---
name: solana-rust-execution-engine
description: Building Rust bots or services that send Solana swaps or arbitrage bundles. Choosing between legacy vs VersionedTransaction and when to add ALTs. Tuning compute unit limits and micro-lamport priority fees. Designing retry, blockhash refresh, and idempotency. LegioX truth lens skill.
---

# Solana Rust Execution Engine (Atomic Multi-Swap Delivery)

## Summary

Execution is delivery, not pricing: swap math belongs in solana-dex-swap-math; this lens covers transaction assembly, runtime split (async I/O vs CPU-bound sim), simulation-first submission, and MEV-aware send paths (Jito bundle with RPC fallback).

## When to use

- Building Rust bots or services that send Solana swaps or arbitrage bundles
- Choosing between legacy vs VersionedTransaction and when to add ALTs
- Tuning compute unit limits and micro-lamport priority fees
- Designing retry, blockhash refresh, and idempotency
- Integrating Jito bundles with RPC fallback
- Debugging TransactionError or Anchor/custom program errors from logs
- Structuring tokio + rayon for quote/sim vs submit pipelines

## Instructions

1. Async runtime: use tokio for RpcClient async methods, channels, and concurrent status polling; keep CPU-bound work (DEX sim from solana-dex-swap-math) in rayon or blocking pool.
2. Types: solana_sdk::transaction::VersionedTransaction, solana_sdk::message::{v0::Message, VersionedMessage}; legacy Transaction only when size and account list are provably small.
3. ComputeBudgetInstruction::set_compute_unit_limit(units) and set_compute_unit_price(micro_lamports_per_cu) from solana_compute_budget_interface (program id ComputeBudget111111111111111111111111111111); clamp limit per network max (commonly up to 1_400_000 CU).
4. Build atomic 3-swap: ix_order = [cu_limit_ix, cu_price_ix (optional), swap1_ix, swap2_ix, swap3_ix]; compile VersionedMessage with recent_blockhash + full account metas; collect Signer references for every writable signer; VersionedTransaction::try_new(message, signers).
5. Dynamic CU: simulate_transaction with same bytes you intend to send; read units_consumed from RpcResponse::value.units_consumed or meta; set limit to ceil(consumed * headroom_pct) + fixed buffer.
6. Blockhash lifecycle: get_latest_blockhash_with_commitment(CommitmentConfig::confirmed()); if build/sign took > ~400ms or one slot policy, refetch; each retry: new blockhash + resign.
7. Preflight loop: simulate_transaction → on err parse logs for Anchor Program log:.*error.* and custom program u32 codes; map InsufficientFundsForFee / InsufficientFunds; abort retry on deterministic program failure.
8. Retry: max_attempts = 3; backoff_ms = [50, 100, 200]; each attempt fresh blockhash and optional priority fee bump; exponential cap to avoid hammering RPC.
9. Fallback send path: submit bundle to Jito Block Engine when MEV/ordering guarantees required; if client wait exceeds 80ms (configurable), cancel wait and send same signed VersionedTransaction via standard RPC (document race: bundle may still land).
10. Size budget: serialized transaction ≤ 1232 bytes; count accounts and ix data; if over, shard route or use loaded ALT addresses in v0 message.
11. Signing: Keypair in-memory only; production load via std::env::var("SECRET_KEY") JSON array parse to bytes then Keypair::from_bytes; local dev may use read_keypair_file on a gitignored path—never ship keypair files to production hosts.
12. Atomic rollback guarantee: single transaction = all-or-nothing chain effect; multi-tx routes are NOT atomic unless combined via Jito bundle (up to protocol bundle limits) or custom program.
13. CU over-allocation anti-pattern: setting limit to max CU without simulation burns priority fee on unused CU allocation—always anchor to simulated consumption.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://solana_rust_execution_engine`).
