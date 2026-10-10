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

  init() {
    this.bindInteractiveDemo();
    this.bindFAQ();
    this.bindCheckoutModal();
    this.bindPaymentSelector();
    this.bindVoucherInputs();
    this.updatePricingDisplays();
  },

  // 1. Interactive Live POS Window in Hero
  bindInteractiveDemo() {
    // Mode switcher buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.switchDemoMode(mode);
      });
    });

    // Item quick-add buttons
    const itemCards = document.querySelectorAll('.catalog-item-card');
    itemCards.forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price, 10);
        this.addDemoItem(name, price);
      });
    });

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

    // Print receipt simulator
    const btnPrintSim = document.getElementById('btn-print-pos-sim');
    if (btnPrintSim) {
      btnPrintSim.addEventListener('click', () => {
        this.showToast('Struk thermal dicetak! Laci kasir RJ11 terbuka otomatis.');
      });
    }
  },

  switchDemoMode(mode) {
    const titleEl = document.getElementById('pos-window-mode-title');
    if (mode === 'retail') {
      if (titleEl) titleEl.textContent = 'Mode Retail & Minimarket (Barcode Scanner Aktif)';
      this.demoCart = [
        { name: 'Beras Ramos Super 5kg', price: 74000, qty: 1 },
        { name: 'Minyak Goreng Sawit 2L', price: 34000, qty: 1 }
      ];
    } else if (mode === 'cafe') {
      if (titleEl) titleEl.textContent = 'Mode Kafe & F&B (Meja 04 • Tiket Dapur Aktif)';
      this.demoCart = [
        { name: 'Kopi Susu Gula Aren', price: 18000, qty: 2 },
        { name: 'Roti Bakar Cokelat Keju', price: 22000, qty: 1 }
      ];
    } else if (mode === 'service') {
      if (titleEl) titleEl.textContent = 'Mode Percetakan & Jasa (Sistem DP & Estimasi Selesai)';
      this.demoCart = [
        { name: 'Banner Flexi 3x1 Meter (DP 50%)', price: 45000, qty: 1 },
        { name: 'Cetak Brosur A5 1 Rim', price: 85000, qty: 1 }
      ];
    }
    this.renderDemoCart();
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

  renderDemoCart() {
    const container = document.getElementById('ticket-cart-rows');
    if (!container) return;

    container.innerHTML = '';
    let subtotal = 0;

    this.demoCart.forEach(item => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;

      const row = document.createElement('div');
      row.className = 'ticket-row-item';
      row.innerHTML = `
        <span class="item-title">${item.qty}x ${item.name}</span>
        <span class="item-val">${formatRupiah(lineTotal)}</span>
      `;
      container.appendChild(row);
    });

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
      el.addEventListener('click', () => {
        const vCode = el.dataset.voucherFill || 'HEMAT15';
        this.currentVoucherCode = vCode;
        if (inputVoucher) inputVoucher.value = vCode;
        this.applyVoucher(vCode);
        this.openCheckout('single');
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
