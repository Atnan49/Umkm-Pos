# Graph Report - Aplikasi Umkm  (2026-10-10)

## Corpus Check
- 30 files · ~69,946 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 28 file(s) not represented in the graph (top: .xml 10, (none) 5, .bat 4)

## Summary
- 1468 nodes · 3556 edges · 101 communities (23 shown, 78 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e632c5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .getX
- rt
- c
- f
- ht
- at
- ke
- be
- .toString
- te
- N
- fr
- gr
- .append
- ne
- profile.js
- w
- x
- sr
- ye
- .get
- Arahan Desain: BukuKasir UMKM
- me
- j
- y
- je
- m
- T
- pe
- .getSize
- p
- e
- ee
- .getValue
- .decode
- nsis
- .encode
- _
- App/app.js
- ie
- b
- package.json
- cr
- I
- oe
- manifest.json
- et
- ae
- lt
- Nr
- ct
- BukuKasir Cashier POS UI
- bt
- O
- main.js
- generate-android-icons.js
- .substring
- fe
- r
- devDependencies
- scripts
- we
- sw.js
- ot
- ce
- ExampleInstrumentedTest.java
- .decodeRow
- le
- rr
- xt
- jt
- buat-lisensi.js
- it
- .decode
- dependencies
- .charAt
- s
- Strategi Penjualan Produk Modular: BukuKasir UMKM
- .encode
- AndroidBridge
- .onCreate
- Materi Listing Marketplace (Shopee & Tokopedia)
- generate-icons.js
- prepare-www.js
- .decode
- web/app.js
- generate-license.js

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

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **BukuKasir POS Core Subsystem** — app_index_pos_cashier_ui, app_index_shelf_barcode_module, app_index_financial_reports_view [INFERRED 0.95]

## Communities (101 total, 78 thin omitted)

### Community 2 - "c"
Cohesion: 0.08
Nodes (7): c, he, K, Q, tt, xe, Z

### Community 4 - "ht"
Cohesion: 0.15
Nodes (3): ht, kt, vt

### Community 6 - "ke"
Cohesion: 0.06
Nodes (3): ke, or, Qe

### Community 12 - "gr"
Cohesion: 0.15
Nodes (3): br(), gr, Vr

### Community 15 - "profile.js"
Cohesion: 0.12
Nodes (19): calculateGrandTotal(), CODE128_PATTERNS, DEMO_PRODUCTS, FORMAT, generateCode128Svg(), generateLicenseKey(), initBarcodeModule(), initCheckoutPortal() (+11 more)

### Community 21 - "Arahan Desain: BukuKasir UMKM"
Cohesion: 0.10
Nodes (18): 1. Dials (Tingkat Energi, Ritme, & Gerak), 2. Palet Warna & Kontras (WCAG AA Teruji), 3. Tipografi, 4. Aksesibilitas & Responsivitas Manusia, Arahan Desain: BukuKasir UMKM, 1. Menjalankan Aplikasi, 2. Struktur Berkas Desktop & Hardware, 3. Cara Kerja Integrasi Perangkat Keras (+10 more)

### Community 35 - "nsis"
Cohesion: 0.08
Nodes (25): build, appId, copyright, files, linux, mac, nsis, productName (+17 more)

### Community 38 - "App/app.js"
Cohesion: 0.15
Nodes (11): App, AppDialog, CameraScanner, CODE128_PATTERNS, CONFIG, FORMAT, LicenseManager, SoundFeedback (+3 more)

### Community 42 - "package.json"
Cohesion: 0.13
Nodes (13): config, author, description, keywords, license, main, name, version (+5 more)

### Community 46 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 52 - "BukuKasir Cashier POS UI"
Cohesion: 0.50
Nodes (4): BukuKasir App Branding Assets, Financial Reports View & Period Filter, BukuKasir Cashier POS UI, Code 128 Shelf Barcode Module

### Community 55 - "main.js"
Cohesion: 0.25
Nodes (4): { app, BrowserWindow, ipcMain }, path, { contextBridge, ipcRenderer }, electron

### Community 56 - "generate-android-icons.js"
Cohesion: 0.33
Nodes (6): fs, generateAndroidIcons(), path, rootDir, sharp, sharp

### Community 60 - "devDependencies"
Cohesion: 0.50
Nodes (4): devDependencies, electron, electron-builder, sharp

### Community 61 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build:apk, dist, generate:android-icons, generate:icons, license:generate, pack, prepare:android (+1 more)

### Community 72 - "buat-lisensi.js"
Cohesion: 0.17
Nodes (10): args, certificateFilePath, currentDate, EDITIONS, fs, licenseKey, outputDir, path (+2 more)

### Community 74 - ".decode"
Cohesion: 0.31
Nodes (3): constructor(), gt, lr

### Community 75 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, html5-qrcode

### Community 78 - "s"
Cohesion: 0.15
Nodes (3): ar, d, s

### Community 86 - "Strategi Penjualan Produk Modular: BukuKasir UMKM"
Cohesion: 0.20
Nodes (9): 1. Latar Belakang & Nilai Tambah, 2. Rincian Fitur Per Modul, 3. Strategi Harga & Paket Penjualan, 4. Struktur Data Teknis (Implementation Spec), A. Modul 1: Kafe & Rumah Makan (F&B / Resto Edition), B. Modul 2: Percetakan, Fotokopi & Jasa (Printing & Services Edition), C. Modul 3: Toko Retail & Sembako (Retail Edition - Standar), Edisi Khusus Industri: Kafe/Resto, Percetakan/Fotokopi, dan Retail (+1 more)

### Community 92 - "Materi Listing Marketplace (Shopee & Tokopedia)"
Cohesion: 0.29
Nodes (6): 1. Pilihan Judul Produk (SEO-Friendly), 2. Pilihan Varian Produk & Rekomendasi Harga, 3. Deskripsi Produk (Tinggal Salin & Tempel), 4. Pertanyaan yang Sering Diajukan (FAQ untuk Balas Chat Cepat), Aplikasi BukuKasir UMKM - Multi Platform (Windows & Android), Materi Listing Marketplace (Shopee & Tokopedia)

### Community 93 - "generate-icons.js"
Cohesion: 0.33
Nodes (6): buildIco(), { createCanvas }, fs, main(), path, rootDir

### Community 94 - "prepare-www.js"
Cohesion: 0.29
Nodes (5): filesToCopy, fs, path, rootDir, wwwDir

## Knowledge Gaps
- **7 isolated node(s):** `electron-builder`, `@capacitor/android`, `@capacitor/core`, `html5-qrcode`, `Financial Reports View & Period Filter` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 420 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **78 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.getX`, `rt`, `c`, `f`, `ht`, `at`, `ke`, `be`, `.toString`, `te`, `N`, `fr`, `gr`, `.append`, `ne`, `w`, `x`, `sr`, `ye`, `.get`, `me`, `j`, `y`, `je`, `m`, `T`, `pe`, `.getSize`, `p`, `e`, `ee`, `.getValue`, `.decode`, `.encode`, `ie`, `b`, `cr`, `I`, `oe`, `et`, `ae`, `lt`, `Nr`, `ct`, `bt`, `O`, `.substring`, `fe`, `r`, `we`, `ot`, `ce`, `.decodeRow`, `le`, `rr`, `xt`, `jt`, `it`, `.decode`, `.charAt`, `s`, `.encode`, `.decode`, `.reset`?**
  _High betweenness centrality (0.479) - this node is a cross-community bridge._
- **What connects `electron-builder`, `@capacitor/android`, `@capacitor/core` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `c` be split into smaller, more focused modules?**
  _Cohesion score 0.07596153846153846 - nodes in this community are weakly interconnected._
- **Why does `f` connect `f` to `_`, `.toString`, `s`, `w`, `e`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `f` be split into smaller, more focused modules?**
  _Cohesion score 0.07759562841530054 - nodes in this community are weakly interconnected._
- **Why does `ce` connect `ce` to `.encode`, `_`, `.getHeight`, `me`, `pe`, `.decode`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `ke` be split into smaller, more focused modules?**
  _Cohesion score 0.061979648473635525 - nodes in this community are weakly interconnected._