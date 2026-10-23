# Graph Report - Aplikasi Umkm  (2026-10-23)

## Corpus Check
- 6 files · ~8,108 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 20 nodes · 15 edges · 6 communities (1 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7376e45e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- vercel.json
- app.js
- package.json
- check-status.js
- create-transaction.js

## God Nodes (most connected - your core abstractions)
1. `generateLicenseKey()` - 2 edges
2. `handler()` - 2 edges
3. `PACKAGES` - 1 edges
4. `VOUCHERS` - 1 edges
5. `CONFIG` - 1 edges
6. `WebStore` - 1 edges
7. `private` - 1 edges
8. `cleanUrls` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (6 total, 5 thin omitted)

### Community 70 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._