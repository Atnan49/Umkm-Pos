/**
 * BukuKasir UMKM - Modul Sales Showcase & Interaktivitas
 * Menampilkan simulator layar kasir, generator barcode rak Code 128,
 * preview struk thermal, dan pemesanan lisensi.
 */

// Format Rupiah & Angka
const FORMAT = {
  currency(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  number(amount) {
    return Number(amount || 0).toLocaleString('id-ID');
  }
};

// Data Contoh Produk untuk Simulator Kasir
const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Minyak Goreng Sawit 2L', category: 'sembako', price: 34000, stock: 18, barcode: '899100123451' },
  { id: 'p2', name: 'Beras Rojolele Super 5kg', category: 'sembako', price: 72000, stock: 12, barcode: '899100123452' },
  { id: 'p3', name: 'Telur Ayam Ras (1 Kg)', category: 'sembako', price: 28000, stock: 2, barcode: '899100123453' },
  { id: 'p4', name: 'Kopi Tubruk Robusta 100g', category: 'minuman', price: 12000, stock: 25, barcode: '899100123454' },
  { id: 'p5', name: 'Teh Celup Melati (25 sachet)', category: 'minuman', price: 6500, stock: 40, barcode: '899100123455' },
  { id: 'p6', name: 'Mie Instan Goreng Spesial', category: 'makanan', price: 3500, stock: 85, barcode: '899100123456' },
  { id: 'p7', name: 'Gula Pasir Kristal Putih 1kg', category: 'sembako', price: 17500, stock: 30, barcode: '899100123457' },
  { id: 'p8', name: 'Biskuit Gandum Cokelat Kaleng', category: 'makanan', price: 38000, stock: 14, barcode: '899100123458' }
];

// Tabel Pola Standar Code 128 (107 Pola Simbol)
const CODE128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112'
];

function generateCode128Svg(inputText, height = 45, barScale = 2) {
  const clean = String(inputText || '').trim();
  if (!clean) return '<svg width="100" height="40"></svg>';

  // Start Code B = 104
  const indices = [104];
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const charIndex = code >= 32 && code <= 126 ? code - 32 : 0;
    indices.push(charIndex);
  }

  // Checksum Modulo 103
  let checksum = indices[0];
  for (let i = 1; i < indices.length; i++) {
    checksum += indices[i] * i;
  }
  indices.push(checksum % 103);
  indices.push(106); // Stop symbol

  let modules = '';
  for (const idx of indices) {
    const pattern = CODE128_PATTERNS[idx] || '212222';
    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0;
      modules += (isBar ? '1' : '0').repeat(width);
    }
  }

  // Quiet zones
  const fullModules = '0000000000' + modules + '0000000000';
  const svgWidth = fullModules.length * barScale;

  let rects = '';
  let inBar = false;
  let startX = 0;

  for (let i = 0; i < fullModules.length; i++) {
    const bit = fullModules[i];
    if (bit === '1' && !inBar) {
      inBar = true;
      startX = i;
    } else if (bit === '0' && inBar) {
      inBar = false;
      rects += `<rect x="${startX * barScale}" y="0" width="${(i - startX) * barScale}" height="${height}" fill="#0f172a" />`;
    }
  }
  if (inBar) {
    rects += `<rect x="${startX * barScale}" y="0" width="${(fullModules.length - startX) * barScale}" height="${height}" fill="#0f172a" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Barcode ${clean}">${rects}</svg>`;
}

// State Simulator Kasir
const SimState = {
  currentCategory: 'all',
  searchQuery: '',
  cart: [
    { id: 'p1', name: 'Minyak Goreng Sawit 2L', price: 34000, qty: 1 },
    { id: 'p2', name: 'Beras Rojolele Super 5kg', price: 72000, qty: 1 }
  ],
  cashReceived: 120000
};

// Inisialisasi Aplikasi Saat DOM Siap
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initShowcaseTabs();
  initPosSimulator();
  initBarcodeModule();
  initReceiptModule();
  initDownloadSection();
  initCheckoutPortal();
});

// 1. Navigasi Mobile Drawer
function initMobileNav() {
  const btn = document.getElementById('btn-mobile-nav');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    drawer.hidden = isOpen;
  });

  drawer.querySelectorAll('.mobile-nav-item').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      drawer.hidden = true;
    });
  });
}

// 2. Showcase Tabs Controller
function initShowcaseTabs() {
  const tabs = document.querySelectorAll('.tab-pill[role="tab"]');
  const panels = document.querySelectorAll('.mockup-content-panel[role="tabpanel"]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetId = tab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.hidden = false;
      }
    });
  });
}

// 3. Modul 1: Simulator POS Interaktif
function initPosSimulator() {
  renderDemoProducts();
  renderDemoCart();

  // Filter Kategori
  const catPills = document.querySelectorAll('#demo-category-pills .cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      SimState.currentCategory = pill.dataset.cat || 'all';
      renderDemoProducts();
    });
  });

  // Pencarian Produk
  const searchInput = document.getElementById('demo-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      SimState.searchQuery = e.target.value.toLowerCase().trim();
      renderDemoProducts();
    });
  }

  // Input Uang Diterima
  const cashInput = document.getElementById('demo-cash-input');
  if (cashInput) {
    cashInput.value = SimState.cashReceived;
    cashInput.addEventListener('input', (e) => {
      SimState.cashReceived = Math.max(0, parseInt(e.target.value || '0', 10));
      updateCartSummary();
    });
  }

  // Quick Chips Nominal Uang
  const chips = document.querySelectorAll('.quick-chips-row .chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.val;
      const total = calculateGrandTotal();
      if (val === 'exact') {
        SimState.cashReceived = total;
      } else {
        SimState.cashReceived = parseInt(val, 10);
      }
      if (cashInput) cashInput.value = SimState.cashReceived;
      updateCartSummary();
    });
  });

  // Tombol Bayar & Reset
  const btnPay = document.getElementById('demo-btn-pay');
  const btnReset = document.getElementById('demo-btn-reset');

  if (btnPay) {
    btnPay.addEventListener('click', () => {
      const total = calculateGrandTotal();
      if (total === 0) {
        alert('Keranjang belanja masih kosong! Silakan klik produk terlebih dahulu.');
        return;
      }
      if (SimState.cashReceived < total) {
        alert(`Uang pembayaran kurang Rp ${FORMAT.number(total - SimState.cashReceived)}. Masukkan nominal yang cukup.`);
        return;
      }

      alert(`Transaksi Berhasil Disimpan!\nTotal: ${FORMAT.currency(total)}\nUang Tunai: ${FORMAT.currency(SimState.cashReceived)}\nKembalian: ${FORMAT.currency(SimState.cashReceived - total)}\n\nStruk otomatis tercetak ke printer thermal kasir.`);
      SimState.cart = [];
      SimState.cashReceived = 0;
      if (cashInput) cashInput.value = 0;
      renderDemoCart();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      SimState.cart = [];
      SimState.cashReceived = 0;
      if (cashInput) cashInput.value = 0;
      renderDemoCart();
    });
  }
}

function calculateGrandTotal() {
  return SimState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function renderDemoProducts() {
  const container = document.getElementById('demo-products-grid');
  if (!container) return;

  const filtered = DEMO_PRODUCTS.filter(p => {
    const matchCat = SimState.currentCategory === 'all' || p.category === SimState.currentCategory;
    const matchQuery = !SimState.searchQuery || 
                       p.name.toLowerCase().includes(SimState.searchQuery) || 
                       p.barcode.includes(SimState.searchQuery);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">Tidak ada produk yang cocok dengan pencarian.</div>';
    return;
  }

  container.innerHTML = filtered.map(p => `
    <button type="button" class="sim-prod-card" onclick="addToDemoCart('${p.id}')" aria-label="Tambah ${p.name} ke keranjang">
      <span class="prod-name">${p.name}</span>
      <div class="prod-meta">
        <span>Stok: ${p.stock}</span>
        <span class="prod-price font-mono">${FORMAT.currency(p.price)}</span>
      </div>
    </button>
  `).join('');
}

window.addToDemoCart = function(productId) {
  const prod = DEMO_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const existing = SimState.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    SimState.cart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      qty: 1
    });
  }

  renderDemoCart();
};

function renderDemoCart() {
  const listEl = document.getElementById('demo-cart-items');
  if (!listEl) return;

  if (SimState.cart.length === 0) {
    listEl.innerHTML = '<div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.75rem;">Keranjang kosong. Klik produk di sebelah kiri untuk menambah.</div>';
  } else {
    listEl.innerHTML = SimState.cart.map(item => `
      <div class="cart-item-row">
        <div>
          <strong>${item.name}</strong>
          <div class="font-mono text-muted text-xs">${item.qty} x ${FORMAT.currency(item.price)}</div>
        </div>
        <div class="font-mono font-bold">${FORMAT.currency(item.qty * item.price)}</div>
      </div>
    `).join('');
  }

  updateCartSummary();
}

function updateCartSummary() {
  const totalQty = SimState.cart.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = calculateGrandTotal();
  const change = Math.max(0, SimState.cashReceived - grandTotal);

  const qtyEl = document.getElementById('demo-total-qty');
  const totalEl = document.getElementById('demo-grand-total');
  const changeEl = document.getElementById('demo-change-amount');

  if (qtyEl) qtyEl.textContent = `${totalQty} barang`;
  if (totalEl) totalEl.textContent = FORMAT.currency(grandTotal);
  if (changeEl) {
    changeEl.textContent = FORMAT.currency(change);
    if (SimState.cashReceived < grandTotal && grandTotal > 0) {
      changeEl.textContent = `Kurang Rp ${FORMAT.number(grandTotal - SimState.cashReceived)}`;
      changeEl.style.color = 'var(--color-warn)';
    } else {
      changeEl.style.color = 'var(--color-brand)';
    }
  }
}

// 4. Modul 2: Barcode Code 128 Rak Toko
function initBarcodeModule() {
  const container = document.getElementById('shelf-barcode-container');
  if (container) {
    container.innerHTML = generateCode128Svg('899100123451');
  }

  const buttons = document.querySelectorAll('.btn-mini-barcode');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code || '899100123451';
      const name = btn.dataset.name || 'Produk';
      const row = btn.closest('tr');
      const priceText = row ? row.querySelectorAll('td')[3].textContent.trim() : 'Rp 0';

      const shelfName = document.getElementById('shelf-demo-name');
      const shelfPrice = document.getElementById('shelf-demo-price');
      const shelfDigits = document.getElementById('shelf-demo-digits');
      const barcodeBox = document.getElementById('shelf-barcode-container');

      if (shelfName) shelfName.textContent = name;
      if (shelfPrice) shelfPrice.textContent = priceText;
      if (shelfDigits) shelfDigits.textContent = code;
      if (barcodeBox) barcodeBox.innerHTML = generateCode128Svg(code);
    });
  });
}

// 5. Modul 4: Pengaturan Struk Kasir
function initReceiptModule() {
  const nameInput = document.getElementById('cfg-shop-name');
  const addrInput = document.getElementById('cfg-shop-addr');
  const footerInput = document.getElementById('cfg-footer-note');
  const paperSelect = document.getElementById('cfg-paper-size');

  const receiptName = document.getElementById('receipt-demo-store-name');
  const receiptAddr = document.getElementById('receipt-demo-store-addr');
  const receiptFooter = document.getElementById('receipt-demo-footer');
  const receiptPaper = document.getElementById('thermal-receipt-sample');

  if (nameInput && receiptName) {
    nameInput.addEventListener('input', (e) => {
      receiptName.textContent = e.target.value.toUpperCase() || 'NAMA TOKO';
    });
  }

  if (addrInput && receiptAddr) {
    addrInput.addEventListener('input', (e) => {
      receiptAddr.textContent = e.target.value || '-';
    });
  }

  if (footerInput && receiptFooter) {
    footerInput.addEventListener('input', (e) => {
      receiptFooter.textContent = e.target.value || '-';
    });
  }

  if (paperSelect && receiptPaper) {
    paperSelect.addEventListener('change', (e) => {
      if (e.target.value === '80mm') {
        receiptPaper.style.width = '360px';
      } else {
        receiptPaper.style.width = '280px';
      }
    });
  }

  const btnPrint = document.getElementById('btn-print-sample-receipt');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

// 6. Pusat Unduhan & Panduan Instalasi
function initDownloadSection() {
  const guideBtns = document.querySelectorAll('.btn-guide-toggle');
  guideBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.hidden = !targetEl.hidden;
      }
    });
  });
}

// 7. Portal Checkout & Payment Gateway Interaktif
function initCheckoutPortal() {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  const btnClose = document.getElementById('btn-close-checkout');
  const btnCancel = document.getElementById('btn-cancel-checkout');
  const btnFinish = document.getElementById('btn-finish-checkout');
  const triggers = document.querySelectorAll('.open-checkout-trigger');

  const planSelect = document.getElementById('order-plan-select');
  const totalDisplay = document.getElementById('order-total-display');
  const qrisAmount = document.getElementById('qris-amount-val');

  const step1 = document.getElementById('step-panel-1');
  const step2 = document.getElementById('step-panel-2');
  const step3 = document.getElementById('step-panel-3');

  const nav1 = document.getElementById('step-nav-1');
  const nav2 = document.getElementById('step-nav-2');
  const nav3 = document.getElementById('step-nav-3');

  let countdownInterval = null;

  function closeModal() {
    modal.hidden = true;
    if (countdownInterval) clearInterval(countdownInterval);
  }

  function openModal(planKey = 'resmi') {
    modal.hidden = false;
    setStep(1);
    updatePrice();
  }

  function setStep(stepNum) {
    [step1, step2, step3].forEach((panel, idx) => {
      if (panel) panel.hidden = (idx + 1 !== stepNum);
    });
    [nav1, nav2, nav3].forEach((nav, idx) => {
      if (nav) nav.classList.toggle('active', idx + 1 <= stepNum);
    });

    if (stepNum === 2) {
      startQrisTimer();
      renderQrisSvg();
    }
  }

  function updatePrice() {
    const price = 90000;
    const formatted = FORMAT.currency(price);
    if (totalDisplay) totalDisplay.textContent = formatted;
    if (qrisAmount) qrisAmount.textContent = formatted;
  }

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('resmi');
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (btnFinish) btnFinish.addEventListener('click', closeModal);

  // Form Step 1 Submit -> to Step 2
  const formStep1 = document.getElementById('form-checkout-step1');
  if (formStep1) {
    formStep1.addEventListener('submit', (e) => {
      e.preventDefault();
      setStep(2);
    });
  }

  // Back from Step 2 to Step 1
  const btnBack = document.getElementById('btn-back-to-step1');
  if (btnBack) {
    btnBack.addEventListener('click', () => setStep(1));
  }

  // Payment Tabs Switcher
  const payTabs = document.querySelectorAll('.pay-tab-btn');
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const method = tab.dataset.method;
      ['qris', 'va', 'wa'].forEach(m => {
        const block = document.getElementById(`pay-method-${m}`);
        if (block) block.hidden = (m !== method);
      });
    });
  });

  // Copy number in VA
  document.querySelectorAll('.btn-copy-num').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = 'Tersalin!';
        setTimeout(() => btn.textContent = orig, 1500);
      }
    });
  });

  // Render SVG QRIS Code
  function renderQrisSvg() {
    const container = document.getElementById('qris-qr-image');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#ffffff" />
        <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
        <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
        <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="2" />
        <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
        <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
        <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="2" />
        <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
        <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
        <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="2" />
        <rect x="37" y="10" width="5" height="5" fill="#0f172a" />
        <rect x="47" y="10" width="5" height="5" fill="#0f172a" />
        <rect x="57" y="10" width="5" height="5" fill="#0f172a" />
        <rect x="37" y="20" width="5" height="5" fill="#0f172a" />
        <rect x="47" y="25" width="5" height="5" fill="#0f172a" />
        <rect x="57" y="20" width="5" height="5" fill="#0f172a" />
        <rect x="40" y="40" width="20" height="20" fill="#c90000" rx="3" />
        <text x="50" y="54" font-family="sans-serif" font-weight="900" font-size="8" fill="#ffffff" text-anchor="middle">QRIS</text>
        <rect x="10" y="37" width="5" height="5" fill="#0f172a" />
        <rect x="20" y="37" width="5" height="5" fill="#0f172a" />
        <rect x="25" y="47" width="5" height="5" fill="#0f172a" />
        <rect x="70" y="37" width="5" height="5" fill="#0f172a" />
        <rect x="80" y="47" width="5" height="5" fill="#0f172a" />
        <rect x="75" y="57" width="5" height="5" fill="#0f172a" />
        <rect x="85" y="67" width="5" height="5" fill="#0f172a" />
        <rect x="40" y="65" width="5" height="5" fill="#0f172a" />
        <rect x="50" y="70" width="5" height="5" fill="#0f172a" />
        <rect x="60" y="65" width="5" height="5" fill="#0f172a" />
        <rect x="45" y="80" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="85" width="5" height="5" fill="#0f172a" />
        <rect x="65" y="80" width="5" height="5" fill="#0f172a" />
        <rect x="75" y="85" width="5" height="5" fill="#0f172a" />
      </svg>
    `;
  }

  function startQrisTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    let secondsLeft = 15 * 60;
    const timerEl = document.getElementById('qris-countdown');
    countdownInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        if (timerEl) timerEl.textContent = 'Kadaluarsa - Segarkan';
        return;
      }
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      if (timerEl) {
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);
  }

  // Verify payment -> Step 3
  const btnVerify = document.getElementById('btn-verify-payment');
  if (btnVerify) {
    btnVerify.addEventListener('click', () => {
      const storeName = document.getElementById('order-store-name').value || 'Toko Berkah Bersama';
      const ownerName = document.getElementById('order-owner-name').value || 'Pelanggan UMKM';
      const waNumber = document.getElementById('order-whatsapp').value || '-';
      const planName = 'Lisensi Resmi BukuKasir UMKM (Rp 90.000)';

      // Generate unique serial license key
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const serialKey = `BKUMKM-2026-${randomPart}`;

      const serialEl = document.getElementById('issued-serial-code');
      const storeInfoEl = document.getElementById('issued-store-info');

      if (serialEl) serialEl.textContent = serialKey;
      if (storeInfoEl) {
        storeInfoEl.textContent = `Terdaftar untuk: ${storeName} (${ownerName}) - Lisensi Aktif Seumur Hidup`;
      }

      // WhatsApp summary link
      const waLink = document.getElementById('btn-send-wa-summary');
      if (waLink) {
        const msg = encodeURIComponent(
          `Halo Admin BukuKasir UMKM, saya telah menyelesaikan pembayaran lisensi:\n\n` +
          `- Nama Pemilik: ${ownerName}\n` +
          `- Nama Toko: ${storeName}\n` +
          `- WhatsApp: ${waNumber}\n` +
          `- Paket: ${planName}\n` +
          `- Lisensi Terbit: ${serialKey}\n\n` +
          `Mohon dicatat pada database pusat dan kirimkan tautan pendampingan instalasi. Terima kasih!`
        );
        waLink.href = `https://wa.me/6281234567890?text=${msg}`;
      }

      setStep(3);
    });
  }

  // Copy Serial License Button
  const btnCopySerial = document.getElementById('btn-copy-serial');
  if (btnCopySerial) {
    btnCopySerial.addEventListener('click', () => {
      const code = document.getElementById('issued-serial-code').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
        const orig = btnCopySerial.textContent;
        btnCopySerial.textContent = 'Tersalin!';
        setTimeout(() => btnCopySerial.textContent = orig, 1500);
      }
    });
  }
}
