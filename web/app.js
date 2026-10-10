/**
 * BukuKasir UMKM - Web Engine & Live Interactive POS Showcase
 * Pricing: Rp 100.000 (Rp 85.000 dengan voucher HEMAT15)
 */

const CONFIG = {
  LICENSE_SECRET: 'BK_UMKM_SECURE_SALT_2026_ATNAN49',
  ADMIN_WA: '6281234567890',

  PACKAGES: {
    single: {
      name: 'Lisensi Toko Tunggal (Semua Modul)',
      basePrice: 100000,
      oldPrice: 250000,
      desc: 'Lisensi seumur hidup untuk 1 komputer/HP kasir utama toko. Tanpa biaya bulanan.'
    },
    multi: {
      name: 'Lisensi Multi-Toko (3 Perangkat)',
      basePrice: 175000,
      oldPrice: 350000,
      desc: 'Untuk 3 komputer/HP kasir berbeda, fitur backup & ekspor laporan Excel.'
    }
  },

  VOUCHERS: {
    'HEMAT15': { discount: 15000, desc: 'Diskon Rp 15.000 (Harga jadi Rp 85.000)' },
    'KASIR85': { discount: 15000, desc: 'Diskon Rp 15.000 (Harga jadi Rp 85.000)' },
    'UMKM85':  { discount: 15000, desc: 'Diskon Rp 15.000 (Harga jadi Rp 85.000)' }
  }
};

// Algoritma Generator Lisensi Resmi BukuKasir UMKM
function generateLicenseKey(storeName) {
  const cleanName = String(storeName || '').trim().toUpperCase();
  if (!cleanName) return '';

  let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
  const combined = cleanName + CONFIG.LICENSE_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const fullHex = hex1 + hex2;

  return `BKPOS-${fullHex.substring(0, 4)}-${fullHex.substring(4, 8)}-${fullHex.substring(8, 12)}-${fullHex.substring(12, 16)}`;
}

function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

const WebStore = {
  currentPkgKey: 'single',
  currentVoucherCode: 'HEMAT15', // Auto-applied default
  activePaymentMethod: 'qris',
  qrisInterval: null,
  qrisSecondsLeft: 900,

  // Demo POS state
  demoCart: [
    { name: 'Beras Ramos Super 5kg', price: 74000, qty: 1 },
    { name: 'Minyak Goreng Sawit 2L', price: 34000, qty: 1 }
  ],

  demoCatalogs: {
    retail: [
      { name: 'Beras Ramos Super 5kg', sku: 'SKU: 8999901 &bull; Sembako', price: 74000 },
      { name: 'Minyak Goreng Sawit 2L', sku: 'SKU: 8999902 &bull; Kebutuhan Pokok', price: 34000 },
      { name: 'Telur Ayam Negeri 1kg', sku: 'SKU: 8999903 &bull; Sembako', price: 28000 },
      { name: 'Gula Pasir Kristal 1kg', sku: 'SKU: 8999904 &bull; Sembako', price: 17500 }
    ],
    cafe: [
      { name: 'Kopi Susu Gula Aren', sku: 'SKU: 8999904 &bull; F&B Minuman', price: 18000 },
      { name: 'Croissant Butter Paris', sku: 'SKU: 8999905 &bull; Bakery & Pastry', price: 25000 },
      { name: 'Matcha Oat Latte Ice', sku: 'SKU: 8999906 &bull; Minuman Artisan', price: 24000 },
      { name: 'Roti Bakar Cokelat Keju', sku: 'SKU: 8999907 &bull; Makanan Ringan', price: 22000 }
    ],
    service: [
      { name: 'Banner Flexi 3x1 Meter (DP)', sku: 'SKU: 8999908 &bull; Digital Printing', price: 45000 },
      { name: 'Jilid Hardcover Skripsi', sku: 'SKU: 8999909 &bull; Jilid Dokumen', price: 35000 },
      { name: 'Stempel Otomatis Flash', sku: 'SKU: 8999910 &bull; Aksesoris Toko', price: 50000 },
      { name: 'Cetak Brosur A5 1 Rim', sku: 'SKU: 8999911 &bull; Percetakan', price: 85000 }
    ]
  },

  currentIndustryIndex: 1,

  init() {
    this.bindInteractiveDemo();
    this.bindIndustryCarousel();
    this.bindBentoActions();
    this.bindReceiptModal();
    this.bindFAQ();
    this.bindCheckoutModal();
    this.bindPaymentSelector();
    this.bindVoucherInputs();
    this.bindSmoothScroll();
    this.bindDownloadToasts();
    this.updatePricingDisplays();
  },

  bindDownloadToasts() {
    document.querySelectorAll('a[href$=".exe"]').forEach(a => {
      a.addEventListener('click', () => {
        this.showToast('🚀 Mengunduh BukuKasir UMKM Installer Windows (.exe)...');
      });
    });
    document.querySelectorAll('a[href$=".apk"]').forEach(a => {
      a.addEventListener('click', () => {
        this.showToast('📱 Mengunduh BukuKasir UMKM Paket Android (.apk)...');
      });
    });
  },

  // 1. Interactive Live POS Window in Hero
  bindInteractiveDemo() {
    // Mode switcher buttons
    const modeBtns = document.querySelectorAll('.mode-btn, .mode-pill-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.switchDemoMode(mode);
      });
    });

    // Item quick-add buttons
    this.bindItemCardClicks();

    // Barcode simulate button
    const btnScan = document.getElementById('btn-simulate-scan');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        const randomItems = [
          { name: 'Gula Pasir 1kg', price: 17500 },
          { name: 'Kopi Kapal Api 165g', price: 14000 },
          { name: 'Teh Celup Sariwangi', price: 8500 }
        ];
        const picked = randomItems[Math.floor(Math.random() * randomItems.length)];
        this.addDemoItem(picked.name, picked.price);
        this.showToast(`[SCANNER BEEP] ${picked.name} ditambahkan otomatis!`);
      });
    }

    // Reset keranjang demo button
    const btnClear = document.getElementById('btn-clear-pos-sim');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.demoCart = [];
        this.renderDemoCart();
        this.showToast('Keranjang kasir telah dikosongkan.');
      });
    }

    // Print receipt simulator
    const btnPrintSim = document.getElementById('btn-print-pos-sim');
    if (btnPrintSim) {
      btnPrintSim.addEventListener('click', () => {
        this.openReceiptModal();
      });
    }
  },

  bindItemCardClicks() {
    const itemCards = document.querySelectorAll('.catalog-item-card');
    itemCards.forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price, 10);
        this.addDemoItem(name, price);
      });
    });
  },

  switchDemoMode(mode) {
    const catalogContainer = document.querySelector('.catalog-tiles-grid');
    const items = this.demoCatalogs[mode] || this.demoCatalogs.retail;
    if (catalogContainer && items) {
      catalogContainer.innerHTML = items.map(it => `
        <div class="catalog-item-card" data-name="${it.name}" data-price="${it.price}">
          <strong>${it.name}</strong>
          <span class="sku">${it.sku}</span>
          <span class="price">+ ${formatRupiah(it.price)}</span>
        </div>
      `).join('');
      this.bindItemCardClicks();
    }

    const titleEl = document.getElementById('ticket-store-name');
    const metaEl = document.getElementById('ticket-meta-mode');

    if (mode === 'retail') {
      if (titleEl) titleEl.textContent = 'TOKO BERKAH MANDIRI';
      if (metaEl) metaEl.textContent = 'STRUK TRANSAKSI THERMAL ESC/POS';
      this.demoCart = [
        { name: 'Beras Ramos Super 5kg', price: 74000, qty: 1 },
        { name: 'Minyak Goreng Sawit 2L', price: 34000, qty: 1 }
      ];
    } else if (mode === 'cafe') {
      if (titleEl) titleEl.textContent = 'KAFE SENJA COFFEE & EATERY';
      if (metaEl) metaEl.textContent = 'TIKET PESANAN DAPUR (KOT) & MEJA 04';
      this.demoCart = [
        { name: 'Kopi Susu Gula Aren', price: 18000, qty: 2 },
        { name: 'Roti Bakar Cokelat Keju', price: 22000, qty: 1 }
      ];
    } else if (mode === 'service') {
      if (titleEl) titleEl.textContent = 'JAYA DIGITAL PRINT & OFFSET';
      if (metaEl) metaEl.textContent = 'SURAT PERINTAH KERJA & NOTA DP';
      this.demoCart = [
        { name: 'Banner Flexi 3x1 Meter (DP)', price: 45000, qty: 1 },
        { name: 'Cetak Brosur A5 1 Rim', price: 85000, qty: 1 }
      ];
    }
    this.renderDemoCart();
  },

  bindIndustryCarousel() {
    const btnPrev = document.getElementById('btn-prev-industry');
    const btnNext = document.getElementById('btn-next-industry');
    const cards = document.querySelectorAll('.cards-carousel-row .industry-card');
    const thumb = document.getElementById('carousel-track-thumb');

    if (!cards.length) return;

    const updateIndustryCard = (idx, scrollHero = false) => {
      this.currentIndustryIndex = (idx + cards.length) % cards.length;
      cards.forEach((c, i) => {
        if (i === this.currentIndustryIndex) {
          c.classList.add('active-dark');
        } else {
          c.classList.remove('active-dark');
        }
      });
      if (thumb) {
        const offset = (this.currentIndustryIndex / (cards.length - 1)) * 45;
        thumb.style.transform = `translateX(${offset}px)`;
      }

      const activeCard = cards[this.currentIndustryIndex];
      const mode = activeCard.dataset.industryMode || 'retail';
      this.switchDemoMode(mode);

      document.querySelectorAll('.mode-pill-btn').forEach(b => {
        if (b.dataset.mode === mode) b.classList.add('active');
        else b.classList.remove('active');
      });

      const title = activeCard.querySelector('.industry-title')?.textContent || 'Modul Usaha';
      this.showToast(`Modul Usaha: ${title} diaktifkan!`);

      if (scrollHero) {
        const heroTerm = document.querySelector('.hero-visual-card');
        if (heroTerm) heroTerm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        updateIndustryCard(this.currentIndustryIndex - 1);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        updateIndustryCard(this.currentIndustryIndex + 1);
      });
    }

    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        updateIndustryCard(idx, true);
      });
    });
  },

  bindBentoActions() {
    // 1. Scan test
    const btnScan = document.getElementById('btn-test-scan-bento');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        const simBtn = document.getElementById('btn-simulate-scan');
        if (simBtn) simBtn.click();
        const term = document.querySelector('.hero-visual-card');
        if (term) term.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // 2. Print test
    const btnPrint = document.getElementById('btn-test-print-bento');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.openReceiptModal();
      });
    }

    // 3. Offline test
    const btnOffline = document.getElementById('btn-test-offline-bento');
    if (btnOffline) {
      btnOffline.addEventListener('click', () => {
        this.showToast('✓ Status SQLite: Mode Offline 100% Aktif, Database Lokal Siap.');
      });
    }

    // 4. Stock alert test
    const btnStock = document.getElementById('btn-test-stock-bento');
    if (btnStock) {
      btnStock.addEventListener('click', () => {
        this.showToast('⚠️ Peringatan Stok: Minyak Goreng Sawit 2L tersisa 2 pcs! Segera pesan.');
      });
    }

    // 5. Download Sample Excel
    const btnExcel = document.getElementById('btn-download-sample-excel');
    if (btnExcel) {
      btnExcel.addEventListener('click', () => {
        const csvData = 
          "No,Tanggal,Waktu,No Faktur,Nama Produk,Kategori,Qty,Harga Beli,Harga Jual,Subtotal,Laba Bersih,Metode\n" +
          "1,2026-10-10,08:15:20,INV-100291,Beras Ramos Super 5kg,Sembako,1,62000,74000,74000,12000,TUNAI\n" +
          "2,2026-10-10,09:42:11,INV-100292,Minyak Goreng Sawit 2L,Kebutuhan Pokok,2,25000,34000,68000,18000,QRIS\n" +
          "3,2026-10-10,11:05:44,INV-100293,Kopi Susu Gula Aren,F&B Minuman,3,11000,18000,54000,21000,QRIS\n" +
          "4,2026-10-10,14:22:05,INV-100294,Telur Ayam Negeri 1kg,Sembako,2,24000,28000,56000,8000,TUNAI\n";
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Laporan_Keuangan_BukuKasir_UMKM.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('✓ Berkas contoh rekap laba rugi Excel (.csv) berhasil diunduh!');
      });
    }

    // Tech feature buttons
    const btnFeatOffline = document.getElementById('btn-feature-test-offline');
    if (btnFeatOffline) {
      btnFeatOffline.addEventListener('click', () => {
        const card = document.querySelector('.bento-card-small');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.showToast('BukuKasir 100% Offline: Data tersimpan aman di SQLite komputer toko.');
      });
    }

    const btnFeatPrinter = document.getElementById('btn-feature-test-printer');
    if (btnFeatPrinter) {
      btnFeatPrinter.addEventListener('click', () => {
        this.openReceiptModal();
      });
    }
  },

  bindReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    const closeTop = document.getElementById('btn-close-receipt-modal');
    const closeBottom = document.getElementById('btn-close-receipt-bottom');
    const btnPrint = document.getElementById('btn-print-actual-receipt');

    [closeTop, closeBottom].forEach(b => {
      if (b) b.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
      });
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  },

  openReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    const content = document.getElementById('receipt-paper-content');
    if (!modal || !content) return;

    const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    let subtotal = 0;
    let itemsList = '';

    if (this.demoCart.length === 0) {
      itemsList = '  (Keranjang transaksi kosong)\n';
    } else {
      this.demoCart.forEach(item => {
        const t = item.price * item.qty;
        subtotal += t;
        itemsList += `  ${item.qty}x ${item.name.padEnd(24, ' ')} ${formatRupiah(t)}\n`;
      });
    }

    const storeTitle = document.getElementById('ticket-store-name')?.textContent || 'TOKO BERKAH MANDIRI';

    content.textContent = 
`========================================
           ${storeTitle}
       Jl. Ahmad Yani No. 49, Jakarta
             Telp: 0812-3456-7890
========================================
Waktu  : ${dateStr}
Kasir  : Administrator (Kasir 01)
No. Trx: TRK-${Math.floor(100000 + Math.random() * 900000)}
Metode : TUNAI / QRIS
----------------------------------------
ITEM TRANSAKSI:
${itemsList}----------------------------------------
TOTAL ITEM : ${this.demoCart.reduce((acc, c) => acc + c.qty, 0)} Pcs
SUBTOTAL   : ${formatRupiah(subtotal)}
DISKON     : Rp 0
TOTAL BAYAR: ${formatRupiah(subtotal)}
========================================
    Terima Kasih Atas Kunjungan Anda
    Simpan Struk Sebagai Bukti Belanja
  Software Kasir: BukuKasir UMKM v1.1.0
========================================`;

    modal.classList.add('active');
  },

  bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#' || anchor.hasAttribute('data-buy-pkg')) return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  },

  addDemoItem(name, price) {
    const existing = this.demoCart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      this.demoCart.push({ name, price, qty: 1 });
    }
    this.renderDemoCart();
  },

  removeDemoItem(name) {
    const idx = this.demoCart.findIndex(i => i.name === name);
    if (idx !== -1) {
      if (this.demoCart[idx].qty > 1) {
        this.demoCart[idx].qty--;
      } else {
        this.demoCart.splice(idx, 1);
      }
      this.renderDemoCart();
      this.showToast(`Item ${name} dikurangi.`);
    }
  },

  renderDemoCart() {
    const container = document.getElementById('ticket-cart-rows');
    if (!container) return;

    container.innerHTML = '';
    let subtotal = 0;

    if (this.demoCart.length === 0) {
      container.innerHTML = '<div style="font-size:12px; color:var(--text-subtle); text-align:center; padding:18px 0;">Keranjang kosong. Klik item atau scan barcode di samping.</div>';
    } else {
      this.demoCart.forEach(item => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;

        const row = document.createElement('div');
        row.className = 'ticket-row-item';
        row.innerHTML = `
          <span class="item-title">${item.qty}x ${item.name}</span>
          <span class="item-val">${formatRupiah(lineTotal)}</span>
          <button type="button" class="btn-remove-cart-item" data-item-name="${item.name}" title="Hapus item">&times;</button>
        `;
        container.appendChild(row);
      });

      container.querySelectorAll('.btn-remove-cart-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = btn.dataset.itemName;
          this.removeDemoItem(name);
        });
      });
    }

    const subtotalEl = document.getElementById('demo-subtotal-val');
    const totalEl = document.getElementById('demo-total-val');
    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (totalEl) totalEl.textContent = formatRupiah(subtotal);
  },

  // 2. Voucher System
  bindVoucherInputs() {
    const btnApply = document.getElementById('btn-apply-voucher');
    const inputVoucher = document.getElementById('input-voucher-code');

    if (btnApply && inputVoucher) {
      btnApply.addEventListener('click', () => {
        const code = inputVoucher.value.trim().toUpperCase();
        this.applyVoucher(code);
      });
      inputVoucher.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.applyVoucher(inputVoucher.value.trim().toUpperCase());
        }
      });
    }

    // Clickable voucher badge in promo strip
    document.querySelectorAll('[data-voucher-fill]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const vCode = el.dataset.voucherFill || 'HEMAT15';
        const pkgKey = el.dataset.buyPkg || 'single';
        this.currentVoucherCode = vCode;
        if (inputVoucher) inputVoucher.value = vCode;
        this.applyVoucher(vCode);
        this.openCheckout(pkgKey);
      });
    });
  },

  applyVoucher(code) {
    const msgEl = document.getElementById('voucher-message');
    const voucher = CONFIG.VOUCHERS[code];

    if (voucher) {
      this.currentVoucherCode = code;
      if (msgEl) {
        msgEl.className = 'voucher-message';
        msgEl.textContent = `✓ Voucher ${code} aktif: ${voucher.desc}`;
      }
      this.showToast(`Voucher ${code} berhasil dipasang! Diskon Rp 15.000.`);
    } else if (!code) {
      this.currentVoucherCode = '';
      if (msgEl) {
        msgEl.className = 'voucher-message';
        msgEl.textContent = 'Tanpa kode voucher.';
      }
    } else {
      this.currentVoucherCode = '';
      if (msgEl) {
        msgEl.className = 'voucher-message error';
        msgEl.textContent = 'Kode voucher tidak valid atau telah kedaluwarsa.';
      }
      this.showToast('Kode voucher tidak ditemukan.', true);
    }
    this.updateModalPricing();
  },

  getFinalPrice(pkgKey) {
    const pkg = CONFIG.PACKAGES[pkgKey] || CONFIG.PACKAGES.single;
    const discount = (this.currentVoucherCode && CONFIG.VOUCHERS[this.currentVoucherCode])
      ? CONFIG.VOUCHERS[this.currentVoucherCode].discount
      : 0;
    return Math.max(0, pkg.basePrice - discount);
  },

  updatePricingDisplays() {
    const finalPrice = this.getFinalPrice('single');
    document.querySelectorAll('.display-current-price').forEach(el => {
      el.textContent = formatRupiah(finalPrice);
    });
  },

  updateModalPricing() {
    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.single;
    const discount = (this.currentVoucherCode && CONFIG.VOUCHERS[this.currentVoucherCode])
      ? CONFIG.VOUCHERS[this.currentVoucherCode].discount
      : 0;
    const finalAmount = Math.max(0, pkg.basePrice - discount);

    const priceEl = document.getElementById('checkout-pkg-price');
    const discountRow = document.getElementById('checkout-discount-row');
    const discountVal = document.getElementById('checkout-discount-val');
    const finalRow = document.getElementById('checkout-final-row');
    const finalVal = document.getElementById('checkout-final-val');

    if (priceEl) priceEl.textContent = formatRupiah(pkg.basePrice);

    if (discount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (discountVal) discountVal.textContent = '- ' + formatRupiah(discount);
      if (finalRow) finalRow.style.display = 'flex';
      if (finalVal) finalVal.textContent = formatRupiah(finalAmount);
    } else {
      if (discountRow) discountRow.style.display = 'none';
      if (finalRow) finalRow.style.display = 'none';
    }

    // Payment step update
    const payTotal = document.getElementById('pay-total-amount');
    if (payTotal) payTotal.textContent = formatRupiah(finalAmount);
  },

  // 3. Checkout Modal
  bindCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('btn-close-checkout');

    document.querySelectorAll('[data-buy-pkg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pkgKey = btn.dataset.buyPkg || 'single';
        this.openCheckout(pkgKey);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCheckout());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeCheckout();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        this.closeCheckout();
      }
    });

    const checkoutForm = document.getElementById('form-checkout-customer');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processToPayment();
      });
    }

    const btnConfirmPay = document.getElementById('btn-confirm-payment');
    if (btnConfirmPay) {
      btnConfirmPay.addEventListener('click', () => {
        this.executeInstantFulfillment();
      });
    }

    const btnCopy = document.getElementById('btn-copy-license');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => this.copyLicenseKey());
    }

    const btnPrint = document.getElementById('btn-print-certificate');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.printCertificate());
    }
  },

  openCheckout(pkgKey = 'single') {
    this.currentPkgKey = pkgKey;
    const pkg = CONFIG.PACKAGES[pkgKey] || CONFIG.PACKAGES.single;

    document.getElementById('checkout-step-form').style.display = 'block';
    document.getElementById('checkout-step-payment').style.display = 'none';
    document.getElementById('checkout-step-success').style.display = 'none';

    document.getElementById('checkout-pkg-name').textContent = pkg.name;
    document.getElementById('checkout-pkg-desc').textContent = pkg.desc;

    // Prefill voucher if active
    const inputVoucher = document.getElementById('input-voucher-code');
    if (inputVoucher && this.currentVoucherCode) {
      inputVoucher.value = this.currentVoucherCode;
      this.applyVoucher(this.currentVoucherCode);
    } else {
      this.updateModalPricing();
    }

    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('active');
      const inputStore = document.getElementById('input-store-name');
      if (inputStore) setTimeout(() => inputStore.focus(), 150);
    }
  },

  closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
    clearInterval(this.qrisInterval);
  },

  bindPaymentSelector() {
    const paymentBtns = document.querySelectorAll('.payment-method-card');
    paymentBtns.forEach(card => {
      card.addEventListener('click', () => {
        paymentBtns.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.activePaymentMethod = card.dataset.method || 'qris';

        const qrisBox = document.getElementById('qris-container');
        const transferBox = document.getElementById('transfer-container');

        if (this.activePaymentMethod === 'qris') {
          if (qrisBox) qrisBox.style.display = 'block';
          if (transferBox) transferBox.style.display = 'none';
        } else {
          if (qrisBox) qrisBox.style.display = 'none';
          if (transferBox) transferBox.style.display = 'block';
        }
      });
    });
  },

  processToPayment() {
    const storeName = document.getElementById('input-store-name').value.trim();
    if (!storeName) {
      this.showToast('Nama Toko wajib diisi untuk penerbitan lisensi resmi!', true);
      document.getElementById('input-store-name').focus();
      return;
    }

    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.single;
    const finalAmount = this.getFinalPrice(this.currentPkgKey);
    const invCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    document.getElementById('pay-pkg-name').textContent = pkg.name;
    document.getElementById('pay-total-amount').textContent = formatRupiah(finalAmount);
    document.getElementById('pay-store-name-display').textContent = storeName;
    document.getElementById('pay-invoice-code').textContent = invCode;

    document.getElementById('checkout-step-form').style.display = 'none';
    document.getElementById('checkout-step-payment').style.display = 'block';

    this.startQrisTimer();
  },

  startQrisTimer() {
    clearInterval(this.qrisInterval);
    this.qrisSecondsLeft = 900;
    const timerEl = document.getElementById('qris-countdown-timer');

    const update = () => {
      const m = Math.floor(this.qrisSecondsLeft / 60).toString().padStart(2, '0');
      const s = (this.qrisSecondsLeft % 60).toString().padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
      if (this.qrisSecondsLeft <= 0) {
        clearInterval(this.qrisInterval);
        if (timerEl) timerEl.textContent = 'Kedaluwarsa';
      }
      this.qrisSecondsLeft--;
    };
    update();
    this.qrisInterval = setInterval(update, 1000);
  },

  executeInstantFulfillment() {
    clearInterval(this.qrisInterval);

    const storeName = document.getElementById('input-store-name').value.trim();
    const customerName = document.getElementById('input-customer-name').value.trim() || 'Pemilik Toko';
    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.single;
    const finalAmount = this.getFinalPrice(this.currentPkgKey);

    const generatedKey = generateLicenseKey(storeName);

    document.getElementById('checkout-step-payment').style.display = 'none';
    document.getElementById('checkout-step-success').style.display = 'block';

    document.getElementById('success-store-name').textContent = storeName;
    document.getElementById('success-license-key').textContent = generatedKey;

    const waText = encodeURIComponent(
      `Halo Admin BukuKasir UMKM, saya telah menyelesaikan pembayaran lisensi resmi:\n\n` +
      `🏪 Nama Toko: ${storeName}\n` +
      `👤 Pemilik: ${customerName}\n` +
      `📦 Paket: ${pkg.name}\n` +
      `💰 Total: ${formatRupiah(finalAmount)}\n` +
      `🔑 Kunci Lisensi: ${generatedKey}\n\n` +
      `Mohon dicatat dalam basis data resmi. Terima kasih!`
    );
    const btnSendWa = document.getElementById('btn-wa-confirm-order');
    if (btnSendWa) {
      btnSendWa.href = `https://wa.me/${CONFIG.ADMIN_WA}?text=${waText}`;
    }
  },

  copyLicenseKey() {
    const key = document.getElementById('success-license-key').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(key).then(() => {
        this.showToast(`Kunci lisensi "${key}" berhasil disalin!`);
      });
    } else {
      this.showToast(`Kunci lisensi: ${key}`);
    }
  },

  printCertificate() {
    const storeName = document.getElementById('input-store-name').value.trim();
    const customerName = document.getElementById('input-customer-name').value.trim() || 'Pemilik Toko';
    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.single;
    const key = document.getElementById('success-license-key').textContent;
    const inv = document.getElementById('pay-invoice-code').textContent || 'INV-SUCCESS';
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Sertifikat_Lisensi_${storeName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; text-align: center; }
          .cert { border: 3px solid #650c1b; border-radius: 8px; padding: 32px; max-width: 600px; margin: 0 auto; }
          .logo { font-size: 20px; font-weight: 800; color: #650c1b; margin-bottom: 4px; }
          .title { font-size: 22px; font-weight: 850; color: #38050e; margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; text-align: left; margin: 16px 0; font-size: 13px; }
          .table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .serial { background: #38050e; color: #4ade80; padding: 14px; border-radius: 6px; font-size: 18px; font-weight: 800; letter-spacing: 0.08em; font-family: monospace; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="logo">BUKUKASIR UMKM</div>
          <div class="title">SERTIFIKAT LISENSI RESMI</div>
          <table class="table">
            <tr><td><strong>Nama Toko</strong></td><td>: ${storeName}</td></tr>
            <tr><td><strong>Pemilik</strong></td><td>: ${customerName}</td></tr>
            <tr><td><strong>Paket</strong></td><td>: ${pkg.name}</td></tr>
            <tr><td><strong>Invoice</strong></td><td>: ${inv}</td></tr>
            <tr><td><strong>Tanggal Aktivasi</strong></td><td>: ${dateStr}</td></tr>
            <tr><td><strong>Masa Berlaku</strong></td><td>: SEUMUR HIDUP (Bebas Biaya Bulanan)</td></tr>
          </table>
          <div class="serial">${key}</div>
          <p style="font-size:11px; color:#64748b;">Terverifikasi resmi oleh sistem BukuKasir UMKM Offline Solutions.</p>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  // 4. FAQ
  bindFAQ() {
    document.querySelectorAll('.faq-header-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-block-item');
        if (item) item.classList.toggle('active');
      });
    });
  },

  showToast(message, isError = false) {
    let toast = document.getElementById('web-toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'web-toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.borderLeftColor = isError ? '#dc2626' : 'var(--green-primary)';
    toast.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => toast.classList.remove('show'), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WebStore.init();
});
