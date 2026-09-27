# Graph Report - Aplikasi Umkm  (2026-09-26)

## Corpus Check
- 25 files · ~38,810 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .xml 10, (none) 5, .bat 3)

## Summary
- 1363 nodes · 3441 edges · 86 communities (24 shown, 62 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62bcbfb8`
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
- .toString
- .decode
- N
- fr
- gr
- .parseInformation
- ht
- profile.js
- w
- .decodeRow
- sr
- .decode
- .get
- me
- et
- .append
- je
- m
- T
- .getCount
- .encode
- p
- at
- x
- ze
- ve
- build
- e
- ot
- app.js
- lt
- ie
- r
- package.json
- cr
- _
- .decode
- manifest.json
- nsis
- ae
- I
- Nr
- .decodeRow
- BukuKasir Cashier POS UI
- .charAt
- s
- main.js
- generate-icons.js
- .substring
- ExampleInstrumentedTest.java
- jt
- devDependencies
- scripts
- Graphify Knowledge Graph Rules
- sw.js
- ce
- ar
- .decode
- nt
- ge
- O
- .decode
- le
- dependencies
- prepare-www.js
- gradlew
- wt
- MainActivity.java

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

## Communities (86 total, 62 thin omitted)

### Community 0 - ".getX"
Cohesion: 0.06
Nodes (7): be, de, dt, fe, ft, it, re

### Community 1 - "ee"
Cohesion: 0.07
Nodes (4): bt, ee, ne, rt

### Community 2 - "c"
Cohesion: 0.06
Nodes (7): c, dr, Q, rr(), tt, xe, Z

### Community 3 - "f"
Cohesion: 0.07
Nodes (3): a, decodeBitmap(), f

### Community 9 - ".decode"
Cohesion: 0.18
Nodes (3): he, te, ue

### Community 12 - "gr"
Cohesion: 0.15
Nodes (3): br(), gr, Vr

### Community 13 - ".parseInformation"
Cohesion: 0.19
Nodes (3): Qt, vt, xt

### Community 15 - "profile.js"
Cohesion: 0.13
Nodes (17): calculateGrandTotal(), CODE128_PATTERNS, DEMO_PRODUCTS, FORMAT, generateCode128Svg(), initBarcodeModule(), initCheckoutPortal(), openModal() (+9 more)

### Community 35 - "build"
Cohesion: 0.13
Nodes (15): build, appId, copyright, files, linux, mac, productName, win (+7 more)

### Community 38 - "app.js"
Cohesion: 0.17
Nodes (10): App, AppDialog, CameraScanner, CODE128_PATTERNS, CONFIG, FORMAT, SoundFeedback, Store (+2 more)

### Community 42 - "package.json"
Cohesion: 0.13
Nodes (13): config, author, description, keywords, license, main, name, version (+5 more)

### Community 43 - "cr"
Cohesion: 0.18
Nodes (3): cr, mr, Xr

### Community 46 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 47 - "nsis"
Cohesion: 0.20
Nodes (10): nsis, allowToChangeInstallationDirectory, createDesktopShortcut, createStartMenuShortcut, installerHeaderIcon, installerIcon, oneClick, perMachine (+2 more)

### Community 52 - "BukuKasir Cashier POS UI"
Cohesion: 0.25
Nodes (8): BukuKasir App Branding Assets, POS Design System & Tokens, Financial Reports View & Period Filter, BukuKasir Cashier POS UI, Code 128 Shelf Barcode Module, POS Maintenance & Architecture Guide, License Checkout & Payment Gateway Modal, Product Profile Landing Portal

### Community 55 - "main.js"
Cohesion: 0.25
Nodes (5): { app, BrowserWindow, ipcMain }, path, { contextBridge, ipcRenderer }, electron, ref_path

### Community 56 - "generate-icons.js"
Cohesion: 0.33
Nodes (6): buildIco(), { createCanvas }, fs, main(), ref_fs, sharp

### Community 58 - "ExampleInstrumentedTest.java"
Cohesion: 0.24
Nodes (8): androidx.test.ext.junit.runners.AndroidJUnit4, ExampleInstrumentedTest, ExampleUnitTest, assert, context, instrumentationregistry, org.junit.runner.RunWith, org.junit.Test

### Community 60 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, electron, electron-builder, sharp

### Community 61 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build:apk, dist, pack, prepare:android, start

### Community 69 - "ge"
Cohesion: 0.19
Nodes (3): constructor(), ge, lr

### Community 75 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, html5-qrcode

### Community 76 - "prepare-www.js"
Cohesion: 0.40
Nodes (4): filesToCopy, fs, path, wwwDir

### Community 77 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

## Knowledge Gaps
- **85 isolated node(s):** `CONFIG`, `FORMAT`, `UTILS`, `CODE128_PATTERNS`, `SoundFeedback` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 354 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.getX`, `ee`, `c`, `f`, `.encode`, `b`, `ke`, `j`, `.toString`, `.decode`, `N`, `fr`, `gr`, `.parseInformation`, `ht`, `w`, `.decodeRow`, `sr`, `.decode`, `.get`, `.createDecoderResult`, `me`, `et`, `.append`, `je`, `m`, `T`, `.getCount`, `.encode`, `p`, `at`, `x`, `ze`, `ve`, `e`, `ot`, `lt`, `ie`, `r`, `cr`, `.decode`, `ae`, `I`, `Nr`, `.decodeRow`, `.charAt`, `s`, `.substring`, `jt`, `ce`, `ar`, `.decode`, `nt`, `ge`, `O`, `.decode`, `le`, `wt`?**
  _High betweenness centrality (0.554) - this node is a cross-community bridge._
- **Why does `Q` connect `c` to `_`, `s`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `f` connect `f` to `.toString`, `w`, `_`, `s`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `CONFIG`, `FORMAT`, `UTILS` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.getX` be split into smaller, more focused modules?**
  _Cohesion score 0.05742393045069778 - nodes in this community are weakly interconnected._
- **Should `ee` be split into smaller, more focused modules?**
  _Cohesion score 0.06542443064182195 - nodes in this community are weakly interconnected._
- **Should `c` be split into smaller, more focused modules?**
  _Cohesion score 0.062206572769953054 - nodes in this community are weakly interconnected._