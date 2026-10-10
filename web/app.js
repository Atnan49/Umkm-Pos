/**
 * BukuKasir UMKM - Web Store Engine
 * Instant Checkout, Client-Side Auto-Fulfillment & License Delivery
 */

const CONFIG = {
  LICENSE_SECRET: 'BK_UMKM_SECURE_SALT_2026_ATNAN49',
  ADMIN_WA: '6281234567890', // Nomor WhatsApp admin resmi
  PACKAGES: {
    retail: {
      name: 'Edisi Retail & Sembako',
      price: 149000,
      oldPrice: 249000,
      desc: 'Lisensi seumur hidup modul barcode laser scanner & stok rak toko.'
    },
    cafe: {
      name: 'Edisi Kafe & Rumah Makan',
      price: 229000,
      oldPrice: 349000,
      desc: 'Lisensi modul nomor meja, dine-in/takeaway, catatan menu & tiket dapur.'
    },
    printing: {
      name: 'Edisi Percetakan & Jasa',
      price: 229000,
      oldPrice: 349000,
      desc: 'Lisensi modul input jasa kilat, uang muka (DP) & sisa pelunasan.'
    },
    ultimate: {
      name: 'Edisi Ultimate Multi-Usaha',
      price: 299000,
      oldPrice: 499000,
      desc: 'Semua modul terbuka penuh (Retail + F&B + Percetakan) + bebas update.'
    }
  }
};

// Algoritma Generator Lisensi Resmi BukuKasir UMKM (Client-Side Instant Engine)
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
  currentPkgKey: 'ultimate',
  activePaymentMethod: 'qris',
  qrisInterval: null,
  qrisSecondsLeft: 900, // 15 menit

  init() {
    this.bindEditionTabs();
    this.bindFAQ();
    this.bindCheckoutModal();
    this.bindPaymentSelector();
  },

  // 1. Tab Edisi Industri
  bindEditionTabs() {
    const tabBtns = document.querySelectorAll('.edition-btn-tab, .edition-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.edition;
        document.querySelectorAll('.edition-panel-display, .edition-card-panel').forEach(panel => {
          panel.classList.toggle('active', panel.id === `edition-panel-${target}`);
        });
      });
    });
  },

  // 2. FAQ Accordion
  bindFAQ() {
    document.querySelectorAll('.faq-trigger-btn, .faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-card-item, .faq-item');
        if (item) item.classList.toggle('active');
      });
    });
  },

  // 3. Checkout Modal
  bindCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('btn-close-checkout');

    // Trigger open from pricing cards or buttons
    document.querySelectorAll('[data-buy-pkg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pkgKey = btn.dataset.buyPkg || 'ultimate';
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

    // Keyboard Accessibility: Close on Escape key (R-32)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        this.closeCheckout();
      }
    });

    // Checkout Form Submit -> Go to Payment Step
    const checkoutForm = document.getElementById('form-checkout-customer');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processToPayment();
      });
    }

    // Simulated / Instant Payment Verification Button
    const btnConfirmPay = document.getElementById('btn-confirm-payment');
    if (btnConfirmPay) {
      btnConfirmPay.addEventListener('click', () => {
        this.executeInstantFulfillment();
      });
    }
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
    if (isError) {
      toast.style.borderLeftColor = 'var(--color-danger)';
    } else {
      toast.style.borderLeftColor = 'var(--color-primary)';
    }
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  openCheckout(pkgKey = 'ultimate') {
    this.currentPkgKey = pkgKey;
    const pkg = CONFIG.PACKAGES[pkgKey] || CONFIG.PACKAGES.ultimate;

    // Reset views
    document.getElementById('checkout-step-form').style.display = 'block';
    document.getElementById('checkout-step-payment').style.display = 'none';
    document.getElementById('checkout-step-success').style.display = 'none';

    // Populate order summary
    document.getElementById('checkout-pkg-name').textContent = pkg.name;
    document.getElementById('checkout-pkg-desc').textContent = pkg.desc;
    document.getElementById('checkout-pkg-price').textContent = formatRupiah(pkg.price);

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
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
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
    const customerName = document.getElementById('input-customer-name').value.trim() || 'Pemilik Toko';
    const waNumber = document.getElementById('input-customer-wa').value.trim();

    if (!storeName) {
      this.showToast('Nama Toko wajib diisi untuk penerbitan lisensi resmi!', true);
      document.getElementById('input-store-name').focus();
      return;
    }

    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.ultimate;
    const invCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    // Update payment display
    document.getElementById('pay-pkg-name').textContent = pkg.name;
    document.getElementById('pay-total-amount').textContent = formatRupiah(pkg.price);
    document.getElementById('pay-store-name-display').textContent = storeName;
    document.getElementById('pay-invoice-code').textContent = invCode;

    document.getElementById('checkout-step-form').style.display = 'none';
    document.getElementById('checkout-step-payment').style.display = 'block';

    // Start 15-Minute Countdown
    this.startQrisTimer();
  },

  startQrisTimer() {
    clearInterval(this.qrisInterval);
    this.qrisSecondsLeft = 900;
    const timerEl = document.getElementById('qris-timer');

    const updateTimer = () => {
      const m = Math.floor(this.qrisSecondsLeft / 60).toString().padStart(2, '0');
      const s = (this.qrisSecondsLeft % 60).toString().padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
      if (this.qrisSecondsLeft <= 0) {
        clearInterval(this.qrisInterval);
        if (timerEl) timerEl.textContent = 'Kedaluwarsa';
      }
      this.qrisSecondsLeft--;
    };
    updateTimer();
    this.qrisInterval = setInterval(updateTimer, 1000);
  },

  // 4. INSTANT AUTO-FULFILLMENT ENGINE
  executeInstantFulfillment() {
    clearInterval(this.qrisInterval);

    const storeName = document.getElementById('input-store-name').value.trim();
    const customerName = document.getElementById('input-customer-name').value.trim() || 'Pemilik Toko';
    const waNumber = document.getElementById('input-customer-wa').value.trim();
    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.ultimate;

    // Generate Kunci Lisensi Resmi secara instan menggunakan algoritma deterministic
    const generatedKey = generateLicenseKey(storeName);

    // Tampilkan Layar Sukses
    document.getElementById('checkout-step-payment').style.display = 'none';
    document.getElementById('checkout-step-success').style.display = 'block';

    document.getElementById('success-store-name').textContent = storeName;
    document.getElementById('success-license-key').textContent = generatedKey;
    document.getElementById('success-pkg-name').textContent = pkg.name;

    // Siapkan Link Notifikasi WhatsApp Pembeli
    const waText = encodeURIComponent(
      `Halo Tim BukuKasir UMKM, saya telah menyelesaikan pembayaran lisensi resmi:\n\n` +
      `🏪 Nama Toko: ${storeName}\n` +
      `👤 Pemilik: ${customerName}\n` +
      `📦 Paket: ${pkg.name}\n` +
      `🔑 Kunci Lisensi Saya: ${generatedKey}\n\n` +
      `Mohon simpan data lisensi resmi saya. Terima kasih!`
    );
    const btnSendWa = document.getElementById('btn-send-wa-confirm');
    if (btnSendWa) {
      btnSendWa.href = `https://wa.me/${CONFIG.ADMIN_WA}?text=${waText}`;
    }
  },

  copyLicenseKey() {
    const keyText = document.getElementById('success-license-key').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyText).then(() => {
        this.showToast(`Kunci lisensi "${keyText}" berhasil disalin.`);
      });
    } else {
      this.showToast(`Kunci lisensi: ${keyText}`);
    }
  },

  printCertificate() {
    const storeName = document.getElementById('input-store-name').value.trim();
    const customerName = document.getElementById('input-customer-name').value.trim() || 'Pemilik Toko';
    const pkg = CONFIG.PACKAGES[this.currentPkgKey] || CONFIG.PACKAGES.ultimate;
    const key = document.getElementById('success-license-key').textContent;
    const inv = document.getElementById('pay-invoice-code').textContent || 'INV-WEB-SUCCESS';
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
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c1518; padding: 24px; text-align: center; }
          .cert { border: 2px solid #6e1127; border-radius: 12px; padding: 36px; max-width: 640px; margin: 0 auto; background: #fff; }
          .logo { font-size: 20px; font-weight: 800; color: #6e1127; margin-bottom: 6px; }
          .title { font-size: 24px; font-weight: 850; color: #540c1d; }
          .sub { font-size: 12px; color: #574b50; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.05em; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; font-size: 14px; }
          .info-table td { padding: 9px; border-bottom: 1px solid #e8e1d7; }
          .serial-box { background: #3b0814; color: #6ee7b7; padding: 16px; border-radius: 8px; font-size: 22px; font-weight: 800; letter-spacing: 0.1em; font-family: monospace; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="logo">BUKUKASIR UMKM</div>
          <div class="title">SERTIFIKAT LISENSI RESMI</div>
          <div class="sub">Hak Penggunaan Software Kasir Permanen Seumur Hidup</div>
          <table class="info-table">
            <tr><td><strong>Nama Toko</strong></td><td>: ${storeName}</td></tr>
            <tr><td><strong>Nama Pemilik</strong></td><td>: ${customerName}</td></tr>
            <tr><td><strong>Paket Edisi</strong></td><td>: ${pkg.name}</td></tr>
            <tr><td><strong>Nomor Invoice</strong></td><td>: ${inv}</td></tr>
            <tr><td><strong>Tanggal Aktivasi</strong></td><td>: ${dateStr}</td></tr>
            <tr><td><strong>Masa Berlaku</strong></td><td>: SEUMUR HIDUP (Bebas Biaya Bulanan)</td></tr>
          </table>
          <div class="serial-box">${key}</div>
          <p style="font-size:12px; color:#85767c;">Terverifikasi resmi oleh sistem BukuKasir UMKM Digital Solutions.</p>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWin.document.close();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  WebStore.init();
});
