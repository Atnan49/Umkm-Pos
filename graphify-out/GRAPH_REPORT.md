# Graph Report - Aplikasi Umkm  (2026-10-23)

## Corpus Check
- 12 files · ~16,216 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 40 nodes · 30 edges · 12 communities (2 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `116dea32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- vercel.json
- Profile Produk/package.json
- Profile Produk/api/create-transaction.js
- Profile Produk/app.js
- Profile Produk/api/check-status.js
- Profile Produk/vercel.json
- package.json
- check-status.js
- create-transaction.js

## God Nodes (most connected - your core abstractions)
1. `generateLicenseKey()` - 2 edges
2. `handler()` - 2 edges
3. `generateLicenseKey()` - 2 edges
4. `handler()` - 2 edges
5. `PACKAGES` - 1 edges
6. `VOUCHERS` - 1 edges
7. `CONFIG` - 1 edges
8. `WebStore` - 1 edges
9. `private` - 1 edges
10. `cleanUrls` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (12 total, 10 thin omitted)

### Community 43 - "Profile Produk/package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 70 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._