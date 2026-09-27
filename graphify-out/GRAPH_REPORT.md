# Graph Report - Aplikasi Umkm  (2026-09-27)

## Corpus Check
- 26 files · ~57,785 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .xml 10, (none) 5, .bat 3)

## Summary
- 1402 nodes · 3492 edges · 79 communities (25 shown, 54 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.89)
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
- .append
- at
- ke
- .toString
- .decode
- .get
- fr
- gr
- ht
- j
- profile.js
- w
- .decodeRow
- sr
- ye
- pr
- we
- me
- et
- y
- je
- m
- T
- .getCount
- .getSize
- p
- d
- x
- ze
- .decode
- build
- _
- app.js
- ie
- b
- package.json
- .encode
- oe
- manifest.json
- nsis
- ae
- Nr
- .charAt
- BukuKasir Cashier POS UI
- O
- main.js
- prepare-www.js
- .substring
- Qe
- l
- devDependencies
- scripts
- Graphify Knowledge Graph Rules
- sw.js
- ce
- ar
- nt
- ge
- r
- .setHints
- generate-android-icons.js
- or
- dependencies
- gradlew
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

## Communities (79 total, 54 thin omitted)

### Community 0 - ".getX"
Cohesion: 0.05
Nodes (7): be, de, dt, fe, ft, it, re

### Community 1 - "ee"
Cohesion: 0.06
Nodes (5): bt, ee, ne, rt, wt

### Community 2 - "c"
Cohesion: 0.07
Nodes (7): c, dr, K, Q, tt, xe, Z

### Community 3 - "f"
Cohesion: 0.06
Nodes (5): a, decodeBitmap(), e(), f, s

### Community 12 - "gr"
Cohesion: 0.15
Nodes (3): br(), gr, Vr

### Community 13 - "ht"
Cohesion: 0.05
Nodes (9): ht, jt, kt, lt, Qt, vt, xt, yt (+1 more)

### Community 15 - "profile.js"
Cohesion: 0.13
Nodes (17): calculateGrandTotal(), CODE128_PATTERNS, DEMO_PRODUCTS, FORMAT, generateCode128Svg(), initBarcodeModule(), initCheckoutPortal(), openModal() (+9 more)

### Community 17 - ".decodeRow"
Cohesion: 0.14
Nodes (3): ct, h, mt

### Community 35 - "build"
Cohesion: 0.13
Nodes (15): build, appId, copyright, files, linux, mac, productName, win (+7 more)

### Community 37 - "_"
Cohesion: 0.05
Nodes (8): _, g, I, le, ot, rr(), st, tr

### Community 38 - "app.js"
Cohesion: 0.17
Nodes (10): App, AppDialog, CameraScanner, CODE128_PATTERNS, CONFIG, FORMAT, SoundFeedback, Store (+2 more)

### Community 42 - "package.json"
Cohesion: 0.13
Nodes (13): config, author, description, keywords, license, main, name, version (+5 more)

### Community 43 - ".encode"
Cohesion: 0.09
Nodes (3): cr, mr, wr

### Community 46 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 47 - "nsis"
Cohesion: 0.20
Nodes (10): nsis, allowToChangeInstallationDirectory, createDesktopShortcut, createStartMenuShortcut, installerHeaderIcon, installerIcon, oneClick, perMachine (+2 more)

### Community 52 - "BukuKasir Cashier POS UI"
Cohesion: 0.33
Nodes (6): BukuKasir App Branding Assets, POS Design System & Tokens, Financial Reports View & Period Filter, BukuKasir Cashier POS UI, Code 128 Shelf Barcode Module, POS Maintenance & Architecture Guide

### Community 55 - "main.js"
Cohesion: 0.25
Nodes (5): { app, BrowserWindow, ipcMain }, path, { contextBridge, ipcRenderer }, electron, ref_path

### Community 56 - "prepare-www.js"
Cohesion: 0.20
Nodes (9): buildIco(), { createCanvas }, fs, main(), filesToCopy, fs, path, wwwDir (+1 more)

### Community 60 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, electron, electron-builder, sharp

### Community 61 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build:apk, dist, pack, prepare:android, start

### Community 71 - ".setHints"
Cohesion: 0.31
Nodes (3): constructor(), gt, lr

### Community 72 - "generate-android-icons.js"
Cohesion: 0.40
Nodes (5): fs, generateAndroidIcons(), path, sharp, sharp

### Community 75 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, html5-qrcode

### Community 77 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 79 - "MainActivity.java"
Cohesion: 0.05
Nodes (39): android.os.Bundle, android.webkit.JavascriptInterface, androidx.test.ext.junit.runners.AndroidJUnit4, ExampleInstrumentedTest, AndroidBridge, MainActivity, ExampleUnitTest, assert (+31 more)

## Knowledge Gaps
- **86 isolated node(s):** `CONFIG`, `FORMAT`, `UTILS`, `CODE128_PATTERNS`, `SoundFeedback` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 380 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.getX`, `ee`, `c`, `f`, `.append`, `at`, `ke`, `.toString`, `.decode`, `.get`, `fr`, `gr`, `ht`, `j`, `w`, `.decodeRow`, `sr`, `ye`, `pr`, `we`, `me`, `et`, `y`, `je`, `m`, `T`, `.getCount`, `.getSize`, `p`, `d`, `x`, `ze`, `.decode`, `ie`, `b`, `.encode`, `oe`, `ae`, `Nr`, `.charAt`, `O`, `.substring`, `Qe`, `l`, `ce`, `ar`, `nt`, `ge`, `r`, `.setHints`, `or`, `.createDecoderResult`?**
  _High betweenness centrality (0.535) - this node is a cross-community bridge._
- **Why does `f` connect `f` to `.toString`, `_`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `N` connect `.get` to `ce`, `_`, `.getHeight`, `ie`, `.decode`, `ht`, `.substring`, `m`, `.getCount`, `.getSize`, `p`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `CONFIG`, `FORMAT`, `UTILS` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.getX` be split into smaller, more focused modules?**
  _Cohesion score 0.054491899852724596 - nodes in this community are weakly interconnected._
- **Should `ee` be split into smaller, more focused modules?**
  _Cohesion score 0.05945945945945946 - nodes in this community are weakly interconnected._
- **Should `c` be split into smaller, more focused modules?**
  _Cohesion score 0.07327001356852103 - nodes in this community are weakly interconnected._