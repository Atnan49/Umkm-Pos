# Graph Report - Aplikasi Umkm  (2026-09-26)

## Corpus Check
- 13 files · ~28,602 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ico 2, .css 2)

## Summary
- 1323 nodes · 3401 edges · 71 communities (24 shown, 47 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3c74326f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .getX
- ee
- c
- f
- .encode
- b
- ke
- j
- er
- .append
- N
- fr
- gr
- .parseInformation
- ht
- profile.js
- w
- .decodeRow
- sr
- ye
- .get
- me
- et
- y
- je
- m
- T
- .getCount
- .getSize
- p
- at
- x
- ze
- .decode
- build
- e
- ot
- app.js
- lt
- ie
- we
- package.json
- cr
- _
- .decode
- manifest.json
- nsis
- ae
- I
- Nr
- .charAt
- BukuKasir Cashier POS UI
- ct
- s
- main.js
- generate-icons.js
- .substring
- oe
- jt
- devDependencies
- scripts
- Graphify Knowledge Graph Rules
- sw.js
- ce
- .write
- .encode
- win

## God Nodes (most connected - your core abstractions)
1. `_` - 128 edges
2. `f` - 64 edges
3. `c` - 50 edges
4. `p` - 41 edges
5. `sr` - 37 edges
6. `N` - 36 edges
7. `it` - 35 edges
8. `ke` - 33 edges
9. `y` - 32 edges
10. `T` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Product Profile Landing Portal` --semantically_similar_to--> `BukuKasir Cashier POS UI`  [INFERRED] [semantically similar]
  Profile Produk'/index.html → App/index.html
- `BukuKasir App Branding Assets` --references--> `BukuKasir Cashier POS UI`  [EXTRACTED]
  App/icon.svg → App/index.html
- `BukuKasir Cashier POS UI` --conceptually_related_to--> `POS Maintenance & Architecture Guide`  [INFERRED]
  App/index.html → App/MAINTENANCE.md
- `BukuKasir Cashier POS UI` --implements--> `POS Design System & Tokens`  [EXTRACTED]
  App/index.html → App/DESIGN.md
- `Graphify Workflow Command` --references--> `Graphify Knowledge Graph Rules`  [EXTRACTED]
  .agents/workflows/graphify.md → .agents/rules/graphify.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **BukuKasir POS Core Subsystem** — app_index_pos_cashier_ui, app_index_shelf_barcode_module, app_index_financial_reports_view [INFERRED 0.95]

## Communities (71 total, 47 thin omitted)

### Community 0 - ".getX"
Cohesion: 0.06
Nodes (7): be, de, dt, fe, ft, it, re

### Community 1 - "ee"
Cohesion: 0.05
Nodes (5): bt, ee, ne, rt, wt

### Community 2 - "c"
Cohesion: 0.06
Nodes (6): c, Q, r(), tt, xe, Z

### Community 3 - "f"
Cohesion: 0.07
Nodes (3): a, decodeBitmap(), f

### Community 5 - "b"
Cohesion: 0.06
Nodes (3): b, l, O

### Community 6 - "ke"
Cohesion: 0.06
Nodes (3): ke, or, Qe

### Community 7 - "j"
Cohesion: 0.08
Nodes (6): ar, constructor(), ge, gt, j, lr

### Community 9 - ".append"
Cohesion: 0.18
Nodes (3): he, te, ue

### Community 12 - "gr"
Cohesion: 0.15
Nodes (3): br(), gr, Vr

### Community 13 - ".parseInformation"
Cohesion: 0.15
Nodes (4): Qt, vt, xt, zt

### Community 15 - "profile.js"
Cohesion: 0.13
Nodes (17): calculateGrandTotal(), CODE128_PATTERNS, DEMO_PRODUCTS, FORMAT, generateCode128Svg(), initBarcodeModule(), initCheckoutPortal(), openModal() (+9 more)

### Community 16 - "w"
Cohesion: 0.10
Nodes (3): g, w, yt

### Community 35 - "build"
Cohesion: 0.18
Nodes (11): build, appId, copyright, files, linux, mac, productName, icon (+3 more)

### Community 38 - "app.js"
Cohesion: 0.17
Nodes (10): App, AppDialog, CameraScanner, CODE128_PATTERNS, CONFIG, FORMAT, SoundFeedback, Store (+2 more)

### Community 42 - "package.json"
Cohesion: 0.17
Nodes (11): author, dependencies, html5-qrcode, description, keywords, license, main, name (+3 more)

### Community 46 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 47 - "nsis"
Cohesion: 0.20
Nodes (10): nsis, allowToChangeInstallationDirectory, createDesktopShortcut, createStartMenuShortcut, installerHeaderIcon, installerIcon, oneClick, perMachine (+2 more)

### Community 52 - "BukuKasir Cashier POS UI"
Cohesion: 0.25
Nodes (8): BukuKasir App Branding Assets, POS Design System & Tokens, Financial Reports View & Period Filter, BukuKasir Cashier POS UI, Code 128 Shelf Barcode Module, POS Maintenance & Architecture Guide, License Checkout & Payment Gateway Modal, Product Profile Landing Portal

### Community 54 - "s"
Cohesion: 0.25
Nodes (3): d, K, s

### Community 55 - "main.js"
Cohesion: 0.25
Nodes (5): { app, BrowserWindow, ipcMain }, path, { contextBridge, ipcRenderer }, electron, ref_path

### Community 56 - "generate-icons.js"
Cohesion: 0.33
Nodes (6): buildIco(), { createCanvas }, fs, main(), ref_fs, sharp

### Community 60 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, electron, electron-builder, sharp

### Community 61 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dist, pack, start

### Community 70 - "win"
Cohesion: 0.50
Nodes (4): win, icon, publisherName, target

## Knowledge Gaps
- **73 isolated node(s):** `CONFIG`, `FORMAT`, `UTILS`, `CODE128_PATTERNS`, `SoundFeedback` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 336 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.getX`, `ee`, `c`, `f`, `.encode`, `b`, `ke`, `j`, `er`, `.append`, `N`, `fr`, `gr`, `.parseInformation`, `ht`, `w`, `.decodeRow`, `sr`, `ye`, `.get`, `.getValue`, `me`, `et`, `y`, `je`, `m`, `T`, `.getCount`, `.getSize`, `p`, `at`, `x`, `ze`, `.decode`, `e`, `ot`, `lt`, `ie`, `we`, `cr`, `.decode`, `ae`, `I`, `Nr`, `.charAt`, `ct`, `s`, `.substring`, `oe`, `jt`, `ce`, `.write`, `.encode`, `.toString`?**
  _High betweenness centrality (0.598) - this node is a cross-community bridge._
- **Why does `f` connect `f` to `.write`, `er`, `_`, `w`, `s`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `ht` connect `ht` to `lt`, `_`, `.parseInformation`, `ct`, `y`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `CONFIG`, `FORMAT`, `UTILS` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.getX` be split into smaller, more focused modules?**
  _Cohesion score 0.05554386703134862 - nodes in this community are weakly interconnected._
- **Should `ee` be split into smaller, more focused modules?**
  _Cohesion score 0.05258033106134372 - nodes in this community are weakly interconnected._
- **Should `c` be split into smaller, more focused modules?**
  _Cohesion score 0.057942057942057944 - nodes in this community are weakly interconnected._