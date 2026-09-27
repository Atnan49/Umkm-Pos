/**
 * BukuKasir UMKM - Arsitektur Modular Desktop POS
 * 
 * Integrasi & Pemformatan:
 * - Format Otomatis Rupiah: Pemisah ribuan titik (.) real-time & teks terbilang rupiah
 * - Penanganan Error Komprehensif: Validasi uang kurang, stok habis, barcode ganda, dan harga jual rugi
 * - Scanner Laser: Interceptor HID keyboard timing burst (< 80ms) & suara beep
 * - Printer Thermal: Silent direct printing via Electron IPC
 */

const CONFIG = {
  STORAGE_KEYS: {
    PRODUCTS: 'bukukasir_products',
    TRANSACTIONS: 'bukukasir_transactions',
    OUTLET: 'bukukasir_outlet'
  },
  DEFAULT_OUTLET: {
    brandTitle: 'BukuKasir UMKM',
    brandLogo: '',
    name: 'Toko Berkah Bersama',
    address: 'Jl. Usaha Raya No. 12, Pasar Anyar',
    footer: 'Terima kasih atas kunjungan Anda!',
    printerName: '',
    paperWidth: '58mm',
    silentPrint: true,
    soundBeep: true
  },
  DEFAULT_PRODUCTS: [
    { id: 'PRD-1', barcode: '8999999195431', name: 'Beras Ramos 5kg', category: 'Sembako', cost: 62000, price: 74000, stock: 15 },
    { id: 'PRD-2', barcode: '8992775211111', name: 'Minyak Goreng 2L', category: 'Sembako', cost: 29000, price: 34500, stock: 20 },
    { id: 'PRD-3', barcode: '8992775212222', name: 'Telur Ayam Negeri 1kg', category: 'Sembako', cost: 24000, price: 28500, stock: 18 },
    { id: 'PRD-4', barcode: '8992775213333', name: 'Kopi Susu Aren Gula Aren', category: 'Minuman', cost: 6000, price: 15000, stock: 35 },
    { id: 'PRD-5', barcode: '8992775214444', name: 'Es Teh Manis Jumbo', category: 'Minuman', cost: 1500, price: 5000, stock: 50 },
    { id: 'PRD-6', barcode: '8992775215555', name: 'Indomie Goreng + Telur', category: 'Makanan', cost: 5500, price: 12000, stock: 30 },
    { id: 'PRD-7', barcode: '8992775216666', name: 'Sabun Cuci Piring 750ml', category: 'Kebutuhan Rumah', cost: 10500, price: 14000, stock: 12 },
    { id: 'PRD-8', barcode: '8992775217777', name: 'Air Mineral Botol 600ml', category: 'Minuman', cost: 2200, price: 4000, stock: 48 }
  ]
};

const FORMAT = {
  currency(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  number(amount) {
    const n = Number(amount || 0);
    return n === 0 ? '0' : n.toLocaleString('id-ID');
  },
  parseRaw(str) {
    if (typeof str === 'number') return Math.max(0, Math.floor(str));
    const clean = String(str || '').replace(/\D/g, '');
    return clean === '' ? 0 : parseInt(clean, 10);
  },
  dateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ' ' + 
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },
  terbilang(number) {
    const n = Math.abs(parseInt(number, 10) || 0);
    if (n === 0) return 'Nol Rupiah';

    const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

    function toWords(num) {
      if (num < 12) return units[num];
      if (num < 20) return toWords(num - 10) + ' Belas';
      if (num < 100) return toWords(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + toWords(num % 10) : '');
      if (num < 200) return 'Seratus' + (num - 100 !== 0 ? ' ' + toWords(num - 100) : '');
      if (num < 1000) return toWords(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + toWords(num % 100) : '');
      if (num < 2000) return 'Seribu' + (num - 1000 !== 0 ? ' ' + toWords(num - 1000) : '');
      if (num < 1000000) return toWords(Math.floor(num / 1000)) + ' Ribu' + (num % 1000 !== 0 ? ' ' + toWords(num % 1000) : '');
      if (num < 1000000000) return toWords(Math.floor(num / 1000000)) + ' Juta' + (num % 1000000 !== 0 ? ' ' + toWords(num % 1000000) : '');
      if (num < 1000000000000) return toWords(Math.floor(num / 1000000000)) + ' Miliar' + (num % 1000000000 !== 0 ? ' ' + toWords(num % 1000000000) : '');
      return '';
    }

    return toWords(n).trim() + ' Rupiah';
  }
};

const UTILS = {
  debounce(func, wait = 120) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

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

  const indices = [104];
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const charIndex = code >= 32 && code <= 126 ? code - 32 : 0;
    indices.push(charIndex);
  }

  let checksum = indices[0];
  for (let i = 1; i < indices.length; i++) {
    checksum += indices[i] * i;
  }
  indices.push(checksum % 103);
  indices.push(106);

  let modules = '';
  for (const idx of indices) {
    const pattern = CODE128_PATTERNS[idx] || '212222';
    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0;
      modules += (isBar ? '1' : '0').repeat(width);
    }
  }

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
      rects += `<rect x="${startX * barScale}" y="0" width="${(i - startX) * barScale}" height="${height}" fill="#000000" />`;
    }
  }
  if (inBar) {
    rects += `<rect x="${startX * barScale}" y="0" width="${(fullModules.length - startX) * barScale}" height="${height}" fill="#000000" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Barcode ${clean}">${rects}</svg>`;
}

const SoundFeedback = {
  ctx: null,
  init() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn('AudioContext tidak didukung di lingkungan ini', e);
    }
  },
  unlockAudio() {
    try {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {}
  },
  playScan(success = true) {
    if (!Store.outlet.soundBeep) return;
    try {
      if (!this.ctx) this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(350, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.18);
      }
    } catch (e) {}
  }
};

const Store = {
  products: [],
  transactions: [],
  outlet: { ...CONFIG.DEFAULT_OUTLET },
  cart: [],
  activeCategory: 'SEMUA',
  searchQuery: '',

  init() {
    try {
      const p = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS);
      this.products = p ? JSON.parse(p) : [...CONFIG.DEFAULT_PRODUCTS];
      const t = localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS);
      this.transactions = t ? JSON.parse(t) : [];
      const o = localStorage.getItem(CONFIG.STORAGE_KEYS.OUTLET);
      this.outlet = o ? { ...CONFIG.DEFAULT_OUTLET, ...JSON.parse(o) } : { ...CONFIG.DEFAULT_OUTLET };
    } catch (err) {
      console.warn('Gagal membaca LocalStorage, memuat konfigurasi awal:', err);
      this.products = [...CONFIG.DEFAULT_PRODUCTS];
      this.transactions = [];
      this.outlet = { ...CONFIG.DEFAULT_OUTLET };
    }
  },

  saveProducts() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
      if (typeof UI !== 'undefined' && UI.showScannerToast) {
        UI.showScannerToast('Memori lokal penuh, periksa penyimpanan perangkat', true);
      }
    }
  },

  saveTransactions() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    } catch (e) {
      console.warn('Gagal menyimpan riwayat transaksi ke localStorage:', e);
      if (typeof UI !== 'undefined' && UI.showScannerToast) {
        UI.showScannerToast('Memori lokal penuh saat menyimpan transaksi', true);
      }
    }
  },

  saveOutlet() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.OUTLET, JSON.stringify(this.outlet));
    } catch (e) {
      console.warn('Gagal menyimpan profil toko ke localStorage:', e);
      if (typeof UI !== 'undefined' && UI.showScannerToast) {
        UI.showScannerToast('Gagal menyimpan profil toko, memori lokal penuh', true);
      }
    }
  },

  addProduct(productData) {
    const id = 'PRD-' + Date.now().toString(36).toUpperCase();
    const newProduct = { id, ...productData };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  },

  updateProduct(id, productData) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...productData };
      this.saveProducts();
      return this.products[idx];
    }
    return null;
  },

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.cart = this.cart.filter(item => item.productId !== id);
    this.saveProducts();
  },

  addToCart(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return { success: false, message: 'Barang tidak ditemukan dalam sistem.' };
    if (prod.stock <= 0) return { success: false, message: `Stok "${prod.name}" sudah habis (0 item).` };

    const item = this.cart.find(i => i.productId === productId);
    const curQty = item ? item.qty : 0;

    if (curQty + 1 > prod.stock) {
      return { success: false, message: `Stok "${prod.name}" tersisa ${prod.stock} item, tidak dapat menambah lagi.` };
    }

    if (item) {
      item.qty += 1;
    } else {
      this.cart.push({ productId, qty: 1 });
    }
    return { success: true, product: prod };
  },

  findProductByBarcode(code) {
    const cleanCode = String(code).trim().toLowerCase();
    if (!cleanCode) return null;
    return this.products.find(p => 
      (p.barcode && String(p.barcode).trim().toLowerCase() === cleanCode) || 
      (p.id && p.id.toLowerCase() === cleanCode)
    ) || null;
  },

  updateCartQty(productId, delta) {
    const idx = this.cart.findIndex(i => i.productId === productId);
    if (idx === -1) return;

    const prod = this.products.find(p => p.id === productId);
    const newQty = this.cart[idx].qty + delta;

    if (newQty <= 0) {
      this.cart.splice(idx, 1);
    } else {
      if (prod && newQty > prod.stock) {
        if (typeof UI !== 'undefined' && UI.showScannerToast) {
          UI.showScannerToast(`Jumlah melebihi sisa stok (${prod.stock} item)`, true);
        }
        return;
      }
      this.cart[idx].qty = newQty;
    }
  },

  clearCart() {
    this.cart = [];
    if (typeof UI !== 'undefined' && UI.dom && UI.dom.customerNameInput) {
      UI.dom.customerNameInput.value = '';
    }
  },

  getCartCalculations() {
    let subtotal = 0;
    let totalCost = 0;
    let totalCount = 0;

    this.cart.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        subtotal += prod.price * item.qty;
        totalCost += (prod.cost || 0) * item.qty;
        totalCount += item.qty;
      }
    });

    return { subtotal, totalCost, totalCount };
  },

  activeReportPeriod: 'all',

  checkout(cashGiven, customerName = '') {
    const { subtotal, totalCost } = this.getCartCalculations();
    if (this.cart.length === 0 || subtotal <= 0) return { error: 'Keranjang belanja masih kosong.' };

    const cash = parseFloat(cashGiven) || subtotal;
    const change = cash - subtotal;
    if (change < 0) return { error: `Uang pembayaran masih kurang sebesar ${FORMAT.currency(Math.abs(change))}.` };

    // Stock verification check
    for (const item of this.cart) {
      const prod = this.products.find(p => p.id === item.productId);
      if (!prod || prod.stock < item.qty) {
        return { error: `Stok barang "${prod ? prod.name : 'Item'}" tidak mencukupi saat proses checkout.` };
      }
    }

    // Deduct stock
    this.cart.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
      }
    });
    this.saveProducts();

    const transaction = {
      id: 'TRX-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toISOString(),
      customerName: (customerName || '').trim() || 'Umum',
      items: this.cart.map(i => {
        const prod = this.products.find(p => p.id === i.productId);
        return {
          id: i.productId,
          name: prod ? prod.name : 'Barang',
          price: prod ? prod.price : 0,
          cost: prod ? prod.cost : 0,
          qty: i.qty,
          subtotal: (prod ? prod.price : 0) * i.qty
        };
      }),
      total: subtotal,
      cogs: totalCost,
      profit: Math.round(subtotal - totalCost),
      cash,
      change
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();
    this.clearCart();
    return { success: true, transaction };
  },

  getFilteredTransactions(period = this.activeReportPeriod) {
    const now = new Date();
    if (period === 'all') return this.transactions;

    return this.transactions.filter(t => {
      const d = new Date(t.timestamp);
      if (isNaN(d.getTime())) return false;

      if (period === 'daily') {
        return d.getFullYear() === now.getFullYear() &&
               d.getMonth() === now.getMonth() &&
               d.getDate() === now.getDate();
      }

      if (period === 'weekly') {
        const start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return d >= start && d <= now;
      }

      if (period === 'monthly') {
        return d.getFullYear() === now.getFullYear() &&
               d.getMonth() === now.getMonth();
      }

      if (period === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      }

      return true;
    });
  },

  getPeriodDisplayLabel(period = this.activeReportPeriod) {
    const now = new Date();
    if (period === 'daily') {
      return `Hari Ini (${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    }
    if (period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (period === 'monthly') {
      return `Bulan ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    }
    if (period === 'yearly') {
      return `Tahun ${now.getFullYear()}`;
    }
    return 'Semua Riwayat Transaksi';
  },

  getFinancialSummary(period = this.activeReportPeriod) {
    const list = this.getFilteredTransactions(period);
    let revenue = 0;
    let cogs = 0;
    let profit = 0;

    list.forEach(t => {
      revenue += t.total || 0;
      cogs += t.cogs || 0;
      profit += t.profit || 0;
    });

    const marginPct = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { revenue, cogs, profit, marginPct, count: list.length, transactions: list };
  }
};

const UI = {
  dom: {},

  init() {
    this.dom = {
      brandIconDisplay: document.getElementById('brand-icon-display'),
      brandTitleDisplay: document.getElementById('brand-title-display'),
      outletNameDisplay: document.getElementById('outlet-name-display'),
      productGrid: document.getElementById('product-grid'),
      categoryPills: document.getElementById('category-pills'),
      posSearch: document.getElementById('pos-search'),
      cartItems: document.getElementById('cart-items'),
      cartTotal: document.getElementById('cart-total'),
      cartItemCount: document.getElementById('cart-item-count'),
      cashInputWrap: document.getElementById('cash-input-wrap'),
      cashInput: document.getElementById('cash-input'),
      cashTerbilang: document.getElementById('cash-terbilang'),
      cartChange: document.getElementById('cart-change'),
      cashErrorAlert: document.getElementById('cash-error-alert'),
      btnCheckout: document.getElementById('btn-checkout'),
      quickCashChips: document.getElementById('quick-cash-chips'),
      mobileCartBadge: document.getElementById('mobile-cart-badge'),
      posCartPanel: document.getElementById('pos-cart-panel'),
      inventoryTbody: document.getElementById('inventory-tbody'),
      transactionsTbody: document.getElementById('transactions-tbody'),
      statRevenue: document.getElementById('stat-revenue'),
      statCogs: document.getElementById('stat-cogs'),
      statProfit: document.getElementById('stat-profit'),
      statMargin: document.getElementById('stat-profit-margin'),
      statCount: document.getElementById('stat-trans-count'),
      productModal: document.getElementById('product-modal'),
      formProduct: document.getElementById('form-product'),
      prodCost: document.getElementById('prod-cost'),
      prodPrice: document.getElementById('prod-price'),
      prodCostHint: document.getElementById('prod-cost-hint'),
      prodPriceHint: document.getElementById('prod-price-hint'),
      productErrorAlert: document.getElementById('product-error-alert'),
      settingsModal: document.getElementById('settings-modal'),
      formSettings: document.getElementById('form-settings'),
      receiptContainer: document.getElementById('thermal-receipt'),
      scannerToast: document.getElementById('scanner-toast'),
      settingPrinterSelect: document.getElementById('setting-printer'),
      printerDetectHint: document.getElementById('printer-detect-hint'),
      customerNameInput: document.getElementById('customer-name-input'),
      reportPeriodPills: document.getElementById('report-period-pills'),
      periodDateDisplay: document.getElementById('period-date-display'),
      statStockSafe: document.getElementById('stat-stock-safe'),
      statStockWarn: document.getElementById('stat-stock-warn'),
      shelfPreviewShop: document.getElementById('shelf-preview-shop'),
      shelfPreviewName: document.getElementById('shelf-preview-name'),
      shelfPreviewPrice: document.getElementById('shelf-preview-price'),
      shelfPreviewBarcode: document.getElementById('shelf-preview-barcode'),
      shelfPreviewDigits: document.getElementById('shelf-preview-digits'),
      shelfBarcodeStrip: document.getElementById('shelf-barcode-strip'),
      printShelfContainer: document.getElementById('print-shelf-label')
    };

    this.catalogRenderLimit = 48;
    this.updateOutletHeader();
    this.renderCategoryFilter();
    this.setupProductGridDelegation();
    this.renderCatalog();
    this.renderCart();
    this.setupCurrencyMasking();
  },

  setupProductGridDelegation() {
    if (!this.dom.productGrid) return;

    const handleAction = (target) => {
      const loadMoreBtn = target.closest('#btn-load-more-catalog');
      if (loadMoreBtn) {
        this.catalogRenderLimit += 48;
        this.renderCatalog();
        return;
      }

      const card = target.closest('.product-card');
      if (!card || !card.dataset.id) return;

      const res = Store.addToCart(card.dataset.id);
      if (!res.success) {
        this.showScannerToast(res.message, true);
      } else {
        SoundFeedback.playScan(true);
        this.renderCart();
      }
    };

    this.dom.productGrid.addEventListener('click', (e) => {
      handleAction(e.target);
    });

    this.dom.productGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.product-card') || e.target.closest('#btn-load-more-catalog');
        if (card) {
          e.preventDefault();
          handleAction(e.target);
        }
      }
    });
  },

  updateOutletHeader() {
    if (this.dom.brandTitleDisplay) {
      this.dom.brandTitleDisplay.textContent = Store.outlet.brandTitle || 'BukuKasir UMKM';
    }
    if (this.dom.outletNameDisplay) {
      this.dom.outletNameDisplay.textContent = Store.outlet.name || CONFIG.DEFAULT_OUTLET.name;
    }
    if (this.dom.brandIconDisplay) {
      if (Store.outlet.brandLogo) {
        this.dom.brandIconDisplay.innerHTML = `<img src="${Store.outlet.brandLogo}" alt="Logo Brand">`;
      } else {
        this.dom.brandIconDisplay.textContent = '🏪';
      }
    }
  },

  showScannerToast(message, isError = false) {
    if (!this.dom.scannerToast) return;
    this.dom.scannerToast.textContent = message;
    this.dom.scannerToast.className = 'scanner-toast active' + (isError ? ' error' : '');
    
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.dom.scannerToast.classList.remove('active');
    }, 2200);
  },

  setupCurrencyMasking() {
    // 1. Cash Input Realtime Masking
    this.dom.cashInput.addEventListener('input', () => {
      const raw = FORMAT.parseRaw(this.dom.cashInput.value);
      this.dom.cashInput.value = raw > 0 ? FORMAT.number(raw) : '';
      this.updateCashChange();
    });

    // 2. Product Modal Cost Input Realtime Masking
    if (this.dom.prodCost) {
      this.dom.prodCost.addEventListener('input', () => {
        const raw = FORMAT.parseRaw(this.dom.prodCost.value);
        this.dom.prodCost.value = raw > 0 ? FORMAT.number(raw) : '';
        if (this.dom.prodCostHint) {
          this.dom.prodCostHint.textContent = raw > 0 ? 'Terbilang: ' + FORMAT.terbilang(raw) : '';
        }
      });
    }

    // 3. Product Modal Price Input Realtime Masking
    if (this.dom.prodPrice) {
      this.dom.prodPrice.addEventListener('input', () => {
        const raw = FORMAT.parseRaw(this.dom.prodPrice.value);
        this.dom.prodPrice.value = raw > 0 ? FORMAT.number(raw) : '';
        if (this.dom.prodPriceHint) {
          this.dom.prodPriceHint.textContent = raw > 0 ? 'Terbilang: ' + FORMAT.terbilang(raw) : '';
        }
      });
    }
  },

  renderCategoryFilter() {
    const cats = ['SEMUA', ...Array.from(new Set(Store.products.map(p => p.category || 'Umum')))];
    this.dom.categoryPills.innerHTML = cats.map(cat => `
      <button type="button" class="category-pill ${Store.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    this.dom.categoryPills.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.activeCategory = btn.dataset.cat;
        this.catalogRenderLimit = 48;
        this.renderCategoryFilter();
        this.renderCatalog();
      });
    });
  },

  renderCatalog() {
    const q = Store.searchQuery.toLowerCase().trim();
    const filtered = Store.products.filter(p => {
      const matchCat = Store.activeCategory === 'SEMUA' || (p.category || 'Umum') === Store.activeCategory;
      const matchQuery = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      this.dom.productGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.05rem; font-weight: 600;">Barang tidak ditemukan</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Coba kata kunci lain atau scan barcode barang dengan scanner laser.</p>
        </div>
      `;
      return;
    }

    const visibleProducts = filtered.slice(0, this.catalogRenderLimit);
    let cardsHtml = visibleProducts.map(p => {
      const isOut = p.stock <= 0;
      const isLow = p.stock > 0 && p.stock <= 5;
      const barcodeSnippet = p.barcode ? `<span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">[${p.barcode}]</span>` : '';

      return `
        <div class="product-card ${isOut ? 'out-of-stock' : ''}" data-id="${p.id}" tabindex="0" role="button" aria-label="Pilih ${p.name}">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="prod-category-tag">${p.category || 'Umum'}</span>
              ${barcodeSnippet}
            </div>
            <div class="prod-name">${p.name}</div>
          </div>
          <div class="prod-footer">
            <span class="prod-price font-mono">${FORMAT.currency(p.price)}</span>
            <span class="prod-stock-badge ${isLow ? 'low' : ''}">
              ${isOut ? 'Habis' : 'Sisa ' + p.stock}
            </span>
          </div>
        </div>
      `;
    }).join('');

    if (filtered.length > this.catalogRenderLimit) {
      const remaining = filtered.length - this.catalogRenderLimit;
      const nextBatch = Math.min(48, remaining);
      cardsHtml += `
        <div class="catalog-load-more" style="grid-column: 1/-1; text-align: center; padding: 1.25rem 0.5rem;">
          <button type="button" class="btn-secondary" id="btn-load-more-catalog" style="margin: 0 auto; min-height: 44px; padding: 0 1.5rem;">
            Tampilkan ${nextBatch} Produk Lagi (${remaining} tersisa)
          </button>
        </div>
      `;
    }

    this.dom.productGrid.innerHTML = cardsHtml;
  },

  renderCart() {
    const { subtotal, totalCount } = Store.getCartCalculations();

    if (Store.cart.length === 0) {
      this.dom.cartItems.innerHTML = `
        <div class="cart-empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p style="font-weight: 600;">Keranjang Belanja Kosong</p>
          <span style="font-size: 0.8rem;">Gunakan scanner laser atau pilih barang pada katalog untuk memulai transaksi.</span>
        </div>
      `;
      this.dom.cashInput.value = '';
      this.dom.cartChange.textContent = 'Rp 0';
      this.dom.btnCheckout.disabled = true;
      if (this.dom.cashTerbilang) {
        this.dom.cashTerbilang.textContent = '';
        this.dom.cashTerbilang.classList.remove('active');
      }
      if (this.dom.cashErrorAlert) {
        this.dom.cashErrorAlert.style.display = 'none';
      }
      if (this.dom.cashInputWrap) {
        this.dom.cashInputWrap.classList.remove('has-error');
      }
    } else {
      this.dom.cartItems.innerHTML = Store.cart.map(item => {
        const prod = Store.products.find(p => p.id === item.productId);
        if (!prod) return '';
        return `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">${prod.name}</div>
              <div class="cart-item-unit-price font-mono">${FORMAT.currency(prod.price)} per item</div>
            </div>
            <div class="cart-item-controls">
              <button type="button" class="qty-btn" onclick="App.handleCartQty('${item.productId}', -1)" aria-label="Kurang satu">-</button>
              <span class="qty-val font-mono">${item.qty}</span>
              <button type="button" class="qty-btn" onclick="App.handleCartQty('${item.productId}', 1)" aria-label="Tambah satu">+</button>
            </div>
            <div class="cart-item-total font-mono">${FORMAT.currency(prod.price * item.qty)}</div>
          </div>
        `;
      }).join('');
    }

    this.dom.cartTotal.textContent = FORMAT.currency(subtotal);
    this.dom.cartItemCount.textContent = `${totalCount} item`;
    this.dom.mobileCartBadge.textContent = totalCount;

    this.renderQuickCashOptions(subtotal);
    this.updateCashChange();
  },

  renderQuickCashOptions(total) {
    if (total <= 0) {
      this.dom.quickCashChips.innerHTML = '';
      return;
    }

    const rounded10k = Math.ceil(total / 10000) * 10000;
    const rounded50k = Math.ceil(total / 50000) * 50000;
    const candidates = [total, rounded10k, rounded50k, 50000, 100000].filter(c => c >= total);
    const uniqueList = Array.from(new Set(candidates)).sort((a, b) => a - b).slice(0, 4);

    this.dom.quickCashChips.innerHTML = uniqueList.map(nom => `
      <button type="button" class="cash-chip" data-val="${nom}">${FORMAT.currency(nom)}</button>
    `).join('');

    this.dom.quickCashChips.querySelectorAll('.cash-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        this.dom.cashInput.value = FORMAT.number(val);
        this.updateCashChange();
      });
    });
  },

  updateCashChange() {
    const { subtotal } = Store.getCartCalculations();
    const cash = FORMAT.parseRaw(this.dom.cashInput.value);
    const change = cash - subtotal;

    // Update Live Terbilang Text
    if (this.dom.cashTerbilang) {
      if (cash >= 1000) {
        this.dom.cashTerbilang.textContent = 'Terbilang: ' + FORMAT.terbilang(cash);
        this.dom.cashTerbilang.classList.add('active');
      } else {
        this.dom.cashTerbilang.textContent = '';
        this.dom.cashTerbilang.classList.remove('active');
      }
    }

    if (subtotal === 0) {
      this.dom.cartChange.textContent = 'Rp 0';
      this.dom.cartChange.style.color = 'var(--text-main)';
      this.dom.btnCheckout.disabled = true;
      if (this.dom.cashInputWrap) this.dom.cashInputWrap.classList.remove('has-error');
      if (this.dom.cashErrorAlert) this.dom.cashErrorAlert.style.display = 'none';
      return;
    }

    if (cash === 0) {
      this.dom.cartChange.textContent = 'Rp 0';
      this.dom.cartChange.style.color = 'var(--text-main)';
      this.dom.btnCheckout.disabled = true;
      if (this.dom.cashInputWrap) this.dom.cashInputWrap.classList.remove('has-error');
      if (this.dom.cashErrorAlert) this.dom.cashErrorAlert.style.display = 'none';
    } else if (change < 0) {
      const shortage = Math.abs(change);
      this.dom.cartChange.textContent = `Kurang ${FORMAT.currency(shortage)}`;
      this.dom.cartChange.style.color = 'var(--color-danger)';
      this.dom.btnCheckout.disabled = true;

      if (this.dom.cashInputWrap) this.dom.cashInputWrap.classList.add('has-error');
      if (this.dom.cashErrorAlert) {
        this.dom.cashErrorAlert.textContent = `Uang pembayaran masih kurang ${FORMAT.currency(shortage)}. Silakan minta kekurangan kepada pembeli.`;
        this.dom.cashErrorAlert.style.display = 'block';
      }
    } else {
      this.dom.cartChange.textContent = FORMAT.currency(change);
      this.dom.cartChange.style.color = 'var(--color-success)';
      this.dom.btnCheckout.disabled = false;

      if (this.dom.cashInputWrap) this.dom.cashInputWrap.classList.remove('has-error');
      if (this.dom.cashErrorAlert) this.dom.cashErrorAlert.style.display = 'none';
    }
  },

  renderInventory() {
    const totalProducts = Store.products.length;
    const safeCount = Store.products.filter(p => (p.stock || 0) > 5).length;
    const warnCount = Store.products.filter(p => (p.stock || 0) <= 5).length;

    if (this.dom.statStockSafe) this.dom.statStockSafe.textContent = `Stok Aman: ${safeCount}`;
    if (this.dom.statStockWarn) this.dom.statStockWarn.textContent = `Perlu Kulakan: ${warnCount}`;

    if (totalProducts === 0) {
      this.dom.inventoryTbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding:0; border:none;">
            <div class="table-empty-state">
              <div class="table-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h4 class="table-empty-title">Katalog Produk Masih Kosong</h4>
              <p class="table-empty-desc">
                Tambahkan produk barang atau sembako toko Anda untuk mulai mencatat stok dan melayani transaksi kasir.
              </p>
              <button type="button" class="btn-primary" onclick="App.openAddProduct()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Tambah Produk Pertama</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      if (this.dom.shelfBarcodeStrip) this.dom.shelfBarcodeStrip.style.display = 'none';
      return;
    }

    if (this.dom.shelfBarcodeStrip) this.dom.shelfBarcodeStrip.style.display = 'grid';

    this.dom.inventoryTbody.innerHTML = Store.products.map(p => {
      const margin = (p.price || 0) - (p.cost || 0);
      const marginPct = p.price > 0 ? ((margin / p.price) * 100).toFixed(1) : '0';
      const marginSign = margin > 0 ? '+' : '';
      const marginColor = margin > 0 ? 'text-emerald' : (margin < 0 ? 'text-danger' : '');
      const stockBadge = p.stock <= 0
        ? '<span class="badge-stock critical">Habis (0)</span>'
        : (p.stock <= 5 ? `<span class="badge-stock critical">${p.stock} item (Kritis)</span>` : `<span class="badge-stock safe">${p.stock} item</span>`);

      const barcodeVal = p.barcode || p.id;

      return `
        <tr>
          <td>
            <button type="button" onclick="App.openEditProduct('${p.id}')" class="font-bold" style="background:none; border:none; padding:0; color:var(--text-main); font-weight:700; cursor:pointer; text-align:left; font-size:inherit; font-family:inherit;" title="Klik untuk edit ${p.name}">
              ${p.name}
            </button>
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">SKU: ${barcodeVal}</div>
          </td>
          <td><span class="badge-tag badge-gray">${p.category || 'Umum'}</span></td>
          <td class="text-right font-mono">${FORMAT.currency(p.cost)}</td>
          <td class="text-right font-mono font-bold">${FORMAT.currency(p.price)}</td>
          <td class="text-center font-mono font-bold ${marginColor}">${marginSign}${marginPct}% (${FORMAT.currency(margin)})</td>
          <td class="text-center">${stockBadge}</td>
          <td class="text-center">
            <button type="button" class="btn-mini-barcode" onclick="App.previewShelfBarcode('${p.id}')" title="Lihat dan cetak barcode rak">
              Lihat Barcode
            </button>
          </td>
          <td class="text-right">
            <button type="button" class="btn-icon" onclick="App.openEditProduct('${p.id}')" title="Edit produk" aria-label="Edit ${p.name}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button type="button" class="btn-icon danger" onclick="App.handleDeleteProduct('${p.id}')" title="Hapus produk" aria-label="Hapus ${p.name}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const targetProduct = Store.products.find(p => p.id === App.activeShelfProductId) || Store.products[0];
    if (targetProduct) {
      App.previewShelfBarcode(targetProduct.id, false);
    }
  },

  renderReports() {
    const stats = Store.getFinancialSummary(Store.activeReportPeriod);
    this.dom.statRevenue.textContent = FORMAT.currency(stats.revenue);
    this.dom.statCogs.textContent = FORMAT.currency(stats.cogs);
    this.dom.statProfit.textContent = FORMAT.currency(stats.profit);
    this.dom.statMargin.textContent = `Persentase keuntungan: ${stats.marginPct}%`;
    this.dom.statCount.textContent = `${stats.count} transaksi (${Store.getPeriodDisplayLabel(Store.activeReportPeriod)})`;

    if (this.dom.periodDateDisplay) {
      this.dom.periodDateDisplay.textContent = Store.getPeriodDisplayLabel(Store.activeReportPeriod);
    }

    if (this.dom.reportPeriodPills) {
      const pills = this.dom.reportPeriodPills.querySelectorAll('.period-pill');
      pills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.period === Store.activeReportPeriod);
      });
    }

    const filteredTrx = stats.transactions || [];

    if (filteredTrx.length === 0) {
      const isFiltered = Store.activeReportPeriod !== 'all';
      this.dom.transactionsTbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding:0; border:none;">
            <div class="table-empty-state">
              <div class="table-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h4 class="table-empty-title">${isFiltered ? 'Tidak Ada Transaksi pada Periode Ini' : 'Belum Ada Transaksi Penjualan'}</h4>
              <p class="table-empty-desc">
                ${isFiltered ? `Belum ditemukan transaksi pada filter ${Store.getPeriodDisplayLabel(Store.activeReportPeriod)}. Pilih periode lain atau selesaikan transaksi kasir baru.` : 'Data omzet, modal pokok (HPP), dan estimasi keuntungan bersih akan terhitung otomatis setelah Anda menyelesaikan transaksi kasir.'}
              </p>
              <button type="button" class="btn-primary" onclick="App.switchView('pos')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span>Buka Kasir Penjualan</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const maxDisplayTrx = 50;
    const displayedTransactions = filteredTrx.slice(0, maxDisplayTrx);
    const hasMore = filteredTrx.length > maxDisplayTrx;

    let rowsHtml = displayedTransactions.map(t => {
      const itemsText = (t.items || []).map(i => `${i.name} (${i.qty}x)`).join(', ');
      const customerBadge = t.customerName ? `<div style="font-size:0.75rem; color:var(--color-primary); font-weight:600; margin-top:2px;">👤 ${t.customerName}</div>` : `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">👤 Umum</div>`;

      return `
        <tr>
          <td>
            <div class="font-bold">${t.id}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${FORMAT.dateTime(t.timestamp)}</div>
            ${customerBadge}
          </td>
          <td style="max-width: 250px; font-size:0.8rem; line-height: 1.3;">${itemsText}</td>
          <td class="text-right font-mono font-bold">${FORMAT.currency(t.total)}</td>
          <td class="text-right font-mono text-emerald font-bold">${FORMAT.currency(t.profit)}</td>
          <td class="text-center">
            <button type="button" class="btn-icon" onclick="App.reprintReceipt('${t.id}')" title="Cetak ulang struk" aria-label="Cetak ulang struk ${t.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (hasMore) {
      rowsHtml += `
        <tr>
          <td colspan="5" style="text-align:center; padding:1rem; color:var(--text-muted); background:var(--bg-subtle); font-size:0.825rem;">
            Menampilkan 50 transaksi terbaru dari total ${filteredTrx.length} transaksi pada periode ini. Gunakan tombol <strong>"Unduh Berkas CSV"</strong> di atas untuk mengekspor data periode ini.
          </td>
        </tr>
      `;
    }

    this.dom.transactionsTbody.innerHTML = rowsHtml;
  },

  renderThermalReceipt(trx) {
    const is80mm = Store.outlet.paperWidth === '80mm';
    if (this.dom.receiptContainer) {
      this.dom.receiptContainer.className = 'print-receipt-container ' + (is80mm ? 'paper-80mm' : 'paper-58mm');
    }

    const itemsHtml = trx.items.map(it => `
      <tr>
        <td colspan="2" style="font-weight:600; padding-top:2px;">${it.name}</td>
      </tr>
      <tr>
        <td style="color:#222; white-space:nowrap;">${it.qty} x ${FORMAT.currency(it.price)}</td>
        <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(it.subtotal)}</td>
      </tr>
    `).join('');

    const customerDisplay = trx.customerName || 'Umum';

    this.dom.receiptContainer.innerHTML = `
      <div class="receipt-header">
        ${Store.outlet.brandLogo ? `<div style="text-align:center; margin-bottom:4px;"><img src="${Store.outlet.brandLogo}" style="max-height:48px; max-width:120px; object-fit:contain; background-color:#ffffff;" alt="Logo"></div>` : ''}
        <div class="receipt-title">${(Store.outlet.brandTitle || 'BUKUKASIR UMKM').toUpperCase()}</div>
        <div style="font-weight:600; font-size:12px; margin-top:2px;">${Store.outlet.name || ''}</div>
        <div class="receipt-meta">${Store.outlet.address || ''}</div>
        <div class="receipt-meta">No: ${trx.id} | ${FORMAT.dateTime(trx.timestamp)}</div>
        <div class="receipt-meta">Pelanggan: <strong>${customerDisplay.toUpperCase()}</strong></div>
      </div>
      <div class="receipt-divider"></div>
      <table class="receipt-table">
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="receipt-divider"></div>
      <table class="receipt-totals">
        <tr>
          <td><strong>TOTAL</strong></td>
          <td style="text-align:right; white-space:nowrap;"><strong>${FORMAT.currency(trx.total)}</strong></td>
        </tr>
        <tr>
          <td>Tunai</td>
          <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(trx.cash)}</td>
        </tr>
        <tr>
          <td>Kembali</td>
          <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(trx.change)}</td>
        </tr>
      </table>
      <div class="receipt-footer">
        <div>${Store.outlet.footer || 'Terima kasih atas kunjungan Anda!'}</div>
        <div style="margin-top:2px;">Barang yang sudah dibeli tidak dapat ditukar</div>
      </div>
      <div class="receipt-tear-feed"></div>
    `;
  }
};

const AppDialog = {
  overlay: null,
  titleEl: null,
  msgEl: null,
  iconEl: null,
  cancelBtn: null,
  confirmBtn: null,
  resolveFn: null,

  init() {
    this.overlay = document.getElementById('app-dialog-overlay');
    this.titleEl = document.getElementById('app-dialog-title');
    this.msgEl = document.getElementById('app-dialog-message');
    this.iconEl = document.getElementById('app-dialog-icon');
    this.cancelBtn = document.getElementById('app-dialog-cancel');
    this.confirmBtn = document.getElementById('app-dialog-confirm');

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.close(false));
    }
    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => this.close(true));
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close(false);
      });
    }
  },

  confirm({ title = 'Konfirmasi Tindakan', message, confirmText = 'Lanjutkan', cancelText = 'Batal', isDanger = false, icon = '⚠️' }) {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.msgEl) this.msgEl.textContent = message;
      if (this.iconEl) this.iconEl.textContent = icon;
      if (this.confirmBtn) {
        this.confirmBtn.textContent = confirmText;
        this.confirmBtn.className = isDanger ? 'btn-primary btn-danger-action' : 'btn-primary';
      }
      if (this.cancelBtn) {
        this.cancelBtn.textContent = cancelText;
        this.cancelBtn.style.display = 'inline-flex';
      }
      if (this.overlay) this.overlay.classList.add('active');
      if (this.confirmBtn) this.confirmBtn.focus();
    });
  },

  alert({ title = 'Pemberitahuan', message, confirmText = 'Mengerti', icon = 'ℹ️' }) {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.msgEl) this.msgEl.textContent = message;
      if (this.iconEl) this.iconEl.textContent = icon;
      if (this.confirmBtn) {
        this.confirmBtn.textContent = confirmText;
        this.confirmBtn.className = 'btn-primary';
      }
      if (this.cancelBtn) {
        this.cancelBtn.style.display = 'none';
      }
      if (this.overlay) this.overlay.classList.add('active');
      if (this.confirmBtn) this.confirmBtn.focus();
    });
  },

  close(result) {
    if (this.overlay) this.overlay.classList.remove('active');
    if (this.resolveFn) {
      const fn = this.resolveFn;
      this.resolveFn = null;
      fn(result);
    }
  }
};

const CameraScanner = {
  html5QrCode: null,
  activeTarget: 'pos',
  isScanning: false,
  lastScannedCode: '',
  lastScanTime: 0,

  async open(target = 'pos') {
    this.activeTarget = target;
    const modal = document.getElementById('camera-scanner-modal');
    const statusBox = document.getElementById('camera-scanner-status');
    const title = document.getElementById('modal-scanner-title');
    if (statusBox) statusBox.style.display = 'none';
    if (title) {
      title.textContent = target === 'pos' 
        ? 'Scan Barcode Produk ke Keranjang' 
        : 'Scan Barcode Kemasan Barang';
    }
    if (modal) modal.classList.add('active');

    if (typeof Html5Qrcode === 'undefined') {
      AppDialog.alert({
        title: 'Pustaka Kamera',
        message: 'Pustaka scanner kamera belum siap. Muat ulang halaman.',
        icon: '📷'
      });
      return;
    }

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode('camera-scanner-reader');
      }

      this.isScanning = true;
      const config = {
        fps: 15,
        qrbox: { width: 260, height: 180 },
        aspectRatio: 1.333333
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => this.onScanSuccess(decodedText),
        () => {}
      );
    } catch (err) {
      console.warn('Percobaan kamera environment gagal, mencoba kamera alternatif:', err);
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          await this.html5QrCode.start(
            cameraId,
            { fps: 15, qrbox: { width: 260, height: 180 }, aspectRatio: 1.333333 },
            (decodedText) => this.onScanSuccess(decodedText),
            () => {}
          );
        } else {
          AppDialog.alert({
            title: 'Kamera Tidak Ditemukan',
            message: 'Tidak ada kamera aktif yang terdeteksi di perangkat ini.',
            icon: '📷'
          });
          await this.close();
        }
      } catch (cameraErr) {
        AppDialog.alert({
          title: 'Izin Akses Kamera',
          message: 'Tidak dapat mengaktifkan kamera: ' + (cameraErr.message || 'Izin akses kamera ditolak.'),
          icon: '📷'
        });
        await this.close();
      }
    }
  },

  async onScanSuccess(decodedText) {
    if (!decodedText) return;
    const code = decodedText.trim();
    const now = Date.now();

    // Cooldown 1.5 seconds for same code to prevent continuous burst scanning
    if (code === this.lastScannedCode && (now - this.lastScanTime) < 1500) {
      return;
    }
    this.lastScannedCode = code;
    this.lastScanTime = now;

    SoundFeedback.playScan(true);

    if (this.activeTarget === 'pos') {
      App.handleBarcodeScan(code);
      const statusBox = document.getElementById('camera-scanner-status');
      if (statusBox) {
        statusBox.textContent = `✓ Berhasil scan: ${code}`;
        statusBox.className = 'scanner-status-box success';
        statusBox.style.display = 'block';
      }
      setTimeout(() => {
        if (statusBox) statusBox.style.display = 'none';
      }, 1500);
    } else if (this.activeTarget === 'product-form') {
      const barcodeInput = document.getElementById('prod-barcode');
      if (barcodeInput) {
        barcodeInput.value = code;
      }
      UI.showScannerToast(`✓ Barcode ${code} terisi ke form`, false);
      await this.close();
    }
  },

  async close() {
    try {
      if (this.html5QrCode && this.isScanning) {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
      }
    } catch (e) {
      console.warn('Gagal menghentikan scanner kamera:', e);
    }
    this.isScanning = false;
    this.lastScannedCode = '';
    const modal = document.getElementById('camera-scanner-modal');
    if (modal) modal.classList.remove('active');
  }
};

const App = {
  barcodeBuffer: '',
  lastKeyTime: 0,
  barcodeTimer: null,

  dispatchBarcode(rawCode) {
    if (!rawCode) return;
    const code = String(rawCode).trim();
    if (!code || code.length < 3) return;

    if (UI.dom.productModal && UI.dom.productModal.classList.contains('active')) {
      const barcodeInput = document.getElementById('prod-barcode');
      if (barcodeInput) {
        barcodeInput.value = code;
        barcodeInput.focus();
      }
      SoundFeedback.playScan(true);
      UI.showScannerToast(`✓ Barcode ${code} terisi ke form`, false);
      return;
    }

    this.handleBarcodeScan(code);
  },

  async init() {
    AppDialog.init();
    Store.init();
    UI.init();
    SoundFeedback.init();
    this.bindEvents();
    this.initHardwareIntegrations();
    this.runSanityCheck();
  },

  async initHardwareIntegrations() {
    if (window.posBridge && window.posBridge.getPrinters) {
      try {
        const printers = await window.posBridge.getPrinters();
        if (UI.dom.settingPrinterSelect) {
          UI.dom.settingPrinterSelect.innerHTML = '<option value="">Default Sistem Windows</option>';
          printers.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = `${p.displayName || p.name} ${p.isDefault ? '(Default Windows)' : ''}`;
            if (Store.outlet.printerName === p.name) {
              opt.selected = true;
            }
            UI.dom.settingPrinterSelect.appendChild(opt);
          });
          if (UI.dom.printerDetectHint) {
            UI.dom.printerDetectHint.textContent = `✓ Terdeteksi ${printers.length} printer di sistem Desktop Electron.`;
            UI.dom.printerDetectHint.style.color = 'var(--color-success)';
          }
        }
      } catch (err) {
        console.warn('Gagal memuat printer:', err);
      }
    } else if (window.AndroidBridge) {
      if (UI.dom.settingPrinterSelect) {
        UI.dom.settingPrinterSelect.innerHTML = '<option value="">Layanan Cetak Android (Bluetooth / USB / Wi-Fi / PDF)</option>';
      }
      if (UI.dom.printerDetectHint) {
        UI.dom.printerDetectHint.textContent = '✓ Mode Android: Terintegrasi dengan dialog cetak sistem & berbagi struk WhatsApp.';
        UI.dom.printerDetectHint.style.color = 'var(--color-success)';
      }
    } else {
      if (UI.dom.printerDetectHint) {
        UI.dom.printerDetectHint.textContent = 'Mode Web Standar (Menjalankan dialog cetak browser).';
      }
    }
  },

  switchView(viewName) {
    ['pos', 'inventory', 'reports'].forEach(v => {
      document.getElementById(`view-${v}`).classList.toggle('active', v === viewName);
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    document.querySelectorAll('.mobile-nav-btn[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName !== 'pos') {
      UI.dom.posCartPanel.classList.remove('mobile-open');
    }
    if (viewName === 'inventory') UI.renderInventory();
    if (viewName === 'reports') UI.renderReports();
    if (viewName === 'pos') UI.renderCatalog();
  },

  handleCartQty(productId, delta) {
    Store.updateCartQty(productId, delta);
    UI.renderCart();
  },

  handleBarcodeScan(code) {
    const prod = Store.findProductByBarcode(code);
    if (prod) {
      const res = Store.addToCart(prod.id);
      if (res.success) {
        SoundFeedback.playScan(true);
        UI.renderCart();
        UI.showScannerToast(`✓ ${prod.name} masuk ke nota (Scan OK)`, false);
      } else {
        SoundFeedback.playScan(false);
        UI.showScannerToast(res.message, true);
      }
    } else {
      SoundFeedback.playScan(false);
      UI.showScannerToast(`Barcode "${code}" tidak terdaftar`, true);
    }
  },

  async handleDeleteProduct(id) {
    const prod = Store.products.find(p => p.id === id);
    if (!prod) return;
    const ok = await AppDialog.confirm({
      title: 'Hapus Produk',
      message: `Hapus "${prod.name}" dari katalog toko? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Produk',
      cancelText: 'Batal',
      isDanger: true,
      icon: '🗑️'
    });
    if (ok) {
      Store.deleteProduct(id);
      UI.renderInventory();
      UI.renderCategoryFilter();
      UI.renderCatalog();
      UI.renderCart();
      UI.showScannerToast(`✓ Produk "${prod.name}" berhasil dihapus`, false);
    }
  },

  openEditProduct(id) {
    const prod = Store.products.find(p => p.id === id);
    if (!prod) return;

    if (UI.dom.productErrorAlert) UI.dom.productErrorAlert.style.display = 'none';
    document.getElementById('modal-product-title').textContent = 'Edit Data Produk';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-barcode').value = prod.barcode || '';
    document.getElementById('prod-category').value = prod.category || '';
    document.getElementById('prod-stock').value = prod.stock || 0;

    UI.dom.prodCost.value = FORMAT.number(prod.cost || 0);
    UI.dom.prodPrice.value = FORMAT.number(prod.price || 0);

    if (UI.dom.prodCostHint) UI.dom.prodCostHint.textContent = prod.cost ? 'Terbilang: ' + FORMAT.terbilang(prod.cost) : '';
    if (UI.dom.prodPriceHint) UI.dom.prodPriceHint.textContent = prod.price ? 'Terbilang: ' + FORMAT.terbilang(prod.price) : '';

    UI.dom.productModal.classList.add('active');
    document.getElementById('prod-name').focus();
  },

  openAddProduct() {
    UI.dom.formProduct.reset();
    if (UI.dom.productErrorAlert) UI.dom.productErrorAlert.style.display = 'none';
    document.getElementById('modal-product-title').textContent = 'Tambah Produk Baru';
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-barcode').value = '';
    document.getElementById('prod-stock').value = 10;

    UI.dom.prodCost.value = '';
    UI.dom.prodPrice.value = '';
    if (UI.dom.prodCostHint) UI.dom.prodCostHint.textContent = '';
    if (UI.dom.prodPriceHint) UI.dom.prodPriceHint.textContent = '';

    UI.dom.productModal.classList.add('active');
    document.getElementById('prod-name').focus();
  },

  closeProductModal() {
    UI.dom.productModal.classList.remove('active');
  },

  activeShelfProductId: null,

  previewShelfBarcode(productId, shouldHighlight = true) {
    const prod = Store.products.find(p => p.id === productId);
    if (!prod) return;

    this.activeShelfProductId = prod.id;
    const code = prod.barcode || prod.id;

    if (UI.dom.shelfPreviewShop) {
      UI.dom.shelfPreviewShop.textContent = (Store.outlet.name || 'TOKO BERKAH BERSAMA').toUpperCase();
    }
    if (UI.dom.shelfPreviewName) {
      UI.dom.shelfPreviewName.textContent = prod.name;
    }
    if (UI.dom.shelfPreviewPrice) {
      UI.dom.shelfPreviewPrice.textContent = FORMAT.currency(prod.price);
    }
    if (UI.dom.shelfPreviewBarcode) {
      UI.dom.shelfPreviewBarcode.innerHTML = generateCode128Svg(code, 48, 2);
    }
    if (UI.dom.shelfPreviewDigits) {
      UI.dom.shelfPreviewDigits.textContent = code;
    }

    if (shouldHighlight && UI.dom.shelfBarcodeStrip) {
      UI.dom.shelfBarcodeStrip.classList.add('highlighted');
      setTimeout(() => {
        if (UI.dom.shelfBarcodeStrip) UI.dom.shelfBarcodeStrip.classList.remove('highlighted');
      }, 1200);

      UI.dom.shelfBarcodeStrip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  async printShelfLabel() {
    const prod = Store.products.find(p => p.id === this.activeShelfProductId) || Store.products[0];
    if (!prod) {
      AppDialog.alert({
        title: 'Produk Kosong',
        message: 'Belum ada produk untuk dicetak label raknya.',
        icon: '🏷️'
      });
      return;
    }

    const code = prod.barcode || prod.id;
    const shopName = (Store.outlet.name || 'TOKO BERKAH BERSAMA').toUpperCase();
    const barcodeSvgHtml = generateCode128Svg(code, 44, 2);

    const labelHtml = `
      <div class="print-shelf-shop">${shopName}</div>
      <div class="print-shelf-name">${prod.name}</div>
      <div class="print-shelf-price">${FORMAT.currency(prod.price)}</div>
      <div class="print-shelf-barcode">${barcodeSvgHtml}</div>
      <div class="print-shelf-digits">${code}</div>
    `;

    if (UI.dom.printShelfContainer) {
      UI.dom.printShelfContainer.innerHTML = labelHtml;
    }

    const fullLabelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: auto; margin: 0; }
          body {
            margin: 0;
            padding: 4px;
            font-family: system-ui, -apple-system, sans-serif;
            width: 56mm;
            text-align: center;
          }
          .print-shelf-shop { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
          .print-shelf-name { font-size: 13px; font-weight: 800; line-height: 1.2; margin-bottom: 3px; }
          .print-shelf-price { font-family: monospace; font-size: 16px; font-weight: 800; margin-bottom: 4px; }
          .print-shelf-barcode svg { max-width: 100%; height: 44px; margin: 0 auto; display: block; }
          .print-shelf-digits { font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; margin-top: 2px; }
        </style>
      </head>
      <body>
        ${labelHtml}
      </body>
      </html>
    `;

    if (window.posBridge) {
      try {
        const isSilent = Store.outlet.silentPrint !== false;
        await window.posBridge.printReceipt({
          receiptHtml: labelHtml,
          deviceName: Store.outlet.printerName || undefined,
          paperWidth: '58mm',
          silent: isSilent
        });
        UI.showScannerToast(`🏷️ Label rak "${prod.name}" terkirim ke printer thermal`, false);
      } catch (err) {
        document.body.classList.add('printing-shelf-label');
        window.print();
        setTimeout(() => document.body.classList.remove('printing-shelf-label'), 600);
      }
    } else if (window.AndroidBridge && window.AndroidBridge.printReceiptHtml) {
      try {
        window.AndroidBridge.printReceiptHtml(`Label_${prod.name}`, fullLabelHtml);
        UI.showScannerToast(`🏷️ Label rak dikirim ke layanan cetak`, false);
      } catch (e) {
        document.body.classList.add('printing-shelf-label');
        window.print();
        setTimeout(() => document.body.classList.remove('printing-shelf-label'), 600);
      }
    } else {
      document.body.classList.add('printing-shelf-label');
      window.print();
      setTimeout(() => document.body.classList.remove('printing-shelf-label'), 600);
    }

    setTimeout(() => {
      if (UI.dom.printShelfContainer) {
        UI.dom.printShelfContainer.innerHTML = '';
      }
    }, 1200);
  },

  async copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      return false;
    }
  },

  async copyShelfBarcode() {
    const prod = Store.products.find(p => p.id === this.activeShelfProductId) || Store.products[0];
    if (!prod) return;
    const code = prod.barcode || prod.id;

    const ok = await this.copyText(code);
    if (ok) {
      UI.showScannerToast(`📋 Angka barcode "${code}" berhasil disalin`, false);
    } else {
      UI.showScannerToast(`Barcode: ${code}`, false);
    }
  },

  openSettings() {
    this.tempLogo = Store.outlet.brandLogo || '';
    const brandInput = document.getElementById('setting-brand-title');
    if (brandInput) {
      brandInput.value = Store.outlet.brandTitle || 'BukuKasir UMKM';
    }
    document.getElementById('setting-outlet-name').value = Store.outlet.name || '';
    document.getElementById('setting-outlet-address').value = Store.outlet.address || '';
    document.getElementById('setting-outlet-footer').value = Store.outlet.footer || '';
    document.getElementById('setting-silent-print').checked = Store.outlet.silentPrint !== false;
    document.getElementById('setting-sound-beep').checked = Store.outlet.soundBeep !== false;

    const preview = document.getElementById('setting-logo-preview');
    if (preview) {
      if (this.tempLogo) {
        preview.innerHTML = `<img src="${this.tempLogo}" alt="Preview Logo">`;
      } else {
        preview.textContent = '🏪';
      }
    }

    if (document.getElementById('setting-paper-width')) {
      document.getElementById('setting-paper-width').value = Store.outlet.paperWidth || '58mm';
    }

    this.initHardwareIntegrations();
    UI.dom.settingsModal.classList.add('active');
    document.getElementById('setting-outlet-name').focus();
  },

  closeSettings() {
    UI.dom.settingsModal.classList.remove('active');
  },

  async executeCheckout() {
    const { subtotal } = Store.getCartCalculations();
    if (Store.cart.length === 0 || subtotal <= 0) {
      AppDialog.alert({
        title: 'Keranjang Masih Kosong',
        message: 'Pilih produk dari katalog atau scan barcode terlebih dahulu.',
        icon: '🛒'
      });
      return;
    }

    const cashVal = FORMAT.parseRaw(UI.dom.cashInput.value);
    if (cashVal === 0) {
      AppDialog.alert({
        title: 'Nominal Pembayaran',
        message: 'Silakan masukkan nominal uang yang diterima dari pembeli atau klik tombol "Uang Pas".',
        icon: '💵'
      });
      UI.dom.cashInput.focus();
      return;
    }

    if (cashVal < subtotal) {
      AppDialog.alert({
        title: 'Uang Pembayaran Kurang',
        message: `Uang pembayaran masih kurang sebesar ${FORMAT.currency(subtotal - cashVal)}!`,
        icon: '⚠️'
      });
      UI.dom.cashInput.focus();
      return;
    }

    const customerName = (UI.dom.customerNameInput ? UI.dom.customerNameInput.value : '').trim() || 'Umum';
    const result = Store.checkout(cashVal, customerName);
    if (result.error) {
      AppDialog.alert({
        title: 'Gagal Transaksi',
        message: `Gagal menyelesaikan transaksi: ${result.error}`,
        icon: '❌'
      });
      return;
    }

    const trx = result.transaction;
    UI.renderThermalReceipt(trx);

    // Prompt user for printing or digital receipt
    await this.promptPrintReceipt(trx);

    if (UI.dom.customerNameInput) {
      UI.dom.customerNameInput.value = '';
    }
    UI.renderCart();
    UI.renderCatalog();
    UI.dom.posCartPanel.classList.remove('mobile-open');
  },

  async promptPrintReceipt(trx) {
    const wantPrint = await AppDialog.confirm({
      title: 'Transaksi Berhasil',
      message: `Pelanggan: ${trx.customerName || 'Umum'}\nTotal Belanja: ${FORMAT.currency(trx.total)}\nUang Tunai: ${FORMAT.currency(trx.cash)}\nKembalian: ${FORMAT.currency(trx.change)}\n\nCetak struk belanja sekarang?`,
      confirmText: 'Cetak Struk',
      cancelText: 'Selesai (Tanpa Cetak)',
      icon: '🧾'
    });
    if (wantPrint) {
      await this.executePrintReceipt(trx);
    }
  },

  generateReceiptHtml(trx) {
    const is80mm = Store.outlet.paperWidth === '80mm';
    const width = is80mm ? '74mm' : '56mm';
    const fontSize = is80mm ? '13px' : '11px';

    const itemsRows = (trx.items || []).map(it => `
      <tr>
        <td colspan="2" style="font-weight:bold; padding-top:2px;">${it.name}</td>
      </tr>
      <tr>
        <td style="color:#222; white-space:nowrap;">${it.qty} x ${FORMAT.currency(it.price)}</td>
        <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(it.subtotal)}</td>
      </tr>
    `).join('');

    const customerDisplay = (trx.customerName || 'Umum').toUpperCase();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk_${trx.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @page { size: auto; margin: 0; }
          body {
            margin: 0;
            padding: 6mm 4mm 6mm 8mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: ${fontSize};
            line-height: 1.25;
            color: #000;
            width: ${width};
            max-width: 100%;
            word-break: break-word;
          }
          .receipt-header { text-align: center; margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
          .receipt-header img { max-height: 48px; max-width: 120px; object-fit: contain; background-color: #ffffff; }
          .receipt-title { font-size: ${is80mm ? '15px' : '13px'}; font-weight: bold; text-transform: uppercase; }
          .receipt-meta { font-size: ${is80mm ? '11px' : '10px'}; margin-top: 2px; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .receipt-table td { padding: 2px 0; vertical-align: top; }
          .receipt-divider { border-bottom: 1px dashed #000; margin: 4px 0; }
          .receipt-totals { width: 100%; margin-top: 4px; border-collapse: collapse; }
          .receipt-totals td { padding: 2px 0; }
          .receipt-footer { text-align: center; margin-top: 8px; font-size: ${is80mm ? '11px' : '10px'}; border-top: 1px dashed #000; padding-top: 6px; }
          .receipt-tear-feed { height: 10mm; }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          ${Store.outlet.brandLogo ? `<div style="text-align:center; margin-bottom:4px;"><img src="${Store.outlet.brandLogo}" style="max-height:48px; max-width:120px; object-fit:contain; background-color:#ffffff;" alt="Logo"></div>` : ''}
          <div class="receipt-title">${(Store.outlet.brandTitle || 'BUKUKASIR UMKM').toUpperCase()}</div>
          <div style="font-weight:bold; font-size:${is80mm ? '13px' : '11px'}; margin-top:2px;">${Store.outlet.name || ''}</div>
          <div class="receipt-meta">${Store.outlet.address || ''}</div>
          <div class="receipt-meta">No: ${trx.id} | ${FORMAT.dateTime(trx.timestamp)}</div>
          <div class="receipt-meta">Pelanggan: <strong>${customerDisplay}</strong></div>
        </div>
        <div class="receipt-divider"></div>
        <table class="receipt-table">
          <tbody>${itemsRows}</tbody>
        </table>
        <div class="receipt-divider"></div>
        <table class="receipt-totals">
          <tr>
            <td><strong>TOTAL</strong></td>
            <td style="text-align:right; white-space:nowrap;"><strong>${FORMAT.currency(trx.total)}</strong></td>
          </tr>
          <tr>
            <td>Tunai</td>
            <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(trx.cash)}</td>
          </tr>
          <tr>
            <td>Kembali</td>
            <td style="text-align:right; white-space:nowrap;">${FORMAT.currency(trx.change)}</td>
          </tr>
        </table>
        <div class="receipt-footer">
          <div>${Store.outlet.footer || 'Terima kasih atas kunjungan Anda!'}</div>
          <div style="margin-top:2px;">Barang yang sudah dibeli tidak dapat ditukar</div>
        </div>
        <div class="receipt-tear-feed"></div>
      </body>
      </html>
    `;
  },

  formatReceiptText(trx) {
    const itemsList = (trx.items || []).map(it => `• ${it.name}\n  ${it.qty}x @ ${FORMAT.currency(it.price)} = ${FORMAT.currency(it.subtotal)}`).join('\n');
    return `🧾 *${(Store.outlet.brandTitle || 'BUKUKASIR UMKM').toUpperCase()}*\n` +
           `*${Store.outlet.name || 'Toko'}*\n` +
           `${Store.outlet.address ? Store.outlet.address + '\n' : ''}` +
           `--------------------------------\n` +
           `No: ${trx.id}\n` +
           `Waktu: ${FORMAT.dateTime(trx.timestamp)}\n` +
           `Pelanggan: ${(trx.customerName || 'Umum').toUpperCase()}\n` +
           `--------------------------------\n` +
           `${itemsList}\n` +
           `--------------------------------\n` +
           `*TOTAL: ${FORMAT.currency(trx.total)}*\n` +
           `Tunai: ${FORMAT.currency(trx.cash)}\n` +
           `Kembali: ${FORMAT.currency(trx.change)}\n` +
           `--------------------------------\n` +
           `${Store.outlet.footer || 'Terima kasih atas kunjungan Anda!'}\n` +
           `Barang yang sudah dibeli tidak dapat ditukar.`;
  },

  async executePrintReceipt(trx) {
    UI.renderThermalReceipt(trx);
    const receiptHtml = this.generateReceiptHtml(trx);

    // 1. Electron Desktop Hardware Printing
    if (window.posBridge) {
      try {
        const isSilent = Store.outlet.silentPrint !== false;
        const res = await window.posBridge.printReceipt({
          receiptHtml: UI.dom.receiptContainer.innerHTML,
          deviceName: Store.outlet.printerName || undefined,
          paperWidth: Store.outlet.paperWidth || '58mm',
          silent: isSilent
        });
        if (res && res.success) {
          UI.showScannerToast(isSilent ? '✓ Transaksi Selesai & Struk Tercetak' : '✓ Dialog Cetak Dibuka', false);
          return true;
        } else {
          console.warn('Printer hardware error:', res && res.error);
          return await this.handlePrinterError(trx, res ? res.error : 'Perangkat tidak merespon');
        }
      } catch (err) {
        console.warn('Printer error:', err);
        return await this.handlePrinterError(trx, err.message);
      }
    }

    // 2. Android Native Print Integration
    if (window.AndroidBridge && window.AndroidBridge.printReceiptHtml) {
      try {
        const success = window.AndroidBridge.printReceiptHtml(`Struk_${trx.id}`, receiptHtml);
        if (success) {
          UI.showScannerToast('✓ Membuka dialog pencetakan struk...', false);
          return true;
        } else {
          return await this.handlePrinterError(trx, 'Layanan pencetakan tidak tersedia');
        }
      } catch (err) {
        console.warn('AndroidBridge print error:', err);
        return await this.handlePrinterError(trx, err.message);
      }
    }

    // 3. Web Standard Dialog Print
    try {
      window.print();
      return true;
    } catch (err) {
      return await this.handlePrinterError(trx, err.message);
    }
  },

  async handlePrinterError(trx, errorMsg) {
    const wantShare = await AppDialog.confirm({
      title: 'Perangkat Printer Belum Terhubung',
      message: `Tidak dapat mencetak ke printer fisik (${errorMsg || 'Perangkat tidak terdeteksi'}).\n\nPetunjuk:\n1. Pastikan printer thermal (Bluetooth/USB) dalam keadaan MENYALA (ON).\n2. Hubungkan/pairing printer di menu Bluetooth HP Anda.\n3. Anda juga dapat menggunakan aplikasi driver seperti 'RawBT Print Service' dari Play Store.\n\nKirim struk digital sekarang via WhatsApp?`,
      confirmText: 'Kirim via WhatsApp',
      cancelText: 'Tutup',
      icon: '🖨️'
    });

    if (wantShare) {
      await this.shareReceiptWhatsApp(trx);
    }
    return false;
  },

  async shareReceiptWhatsApp(trx) {
    const text = this.formatReceiptText(trx);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk Belanja ${trx.id}`,
          text: text
        });
        UI.showScannerToast('✓ Struk berhasil dibagikan', false);
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (window.AndroidBridge && window.AndroidBridge.openUrl) {
      window.AndroidBridge.openUrl(waUrl);
    } else {
      window.open(waUrl, '_blank');
    }
  },

  handleHardwareBack() {
    if (CameraScanner.isScanning || (document.getElementById('camera-scanner-modal') && document.getElementById('camera-scanner-modal').classList.contains('active'))) {
      CameraScanner.close();
      return true;
    }
    if (AppDialog.overlay && AppDialog.overlay.classList.contains('active')) {
      AppDialog.close(false);
      return true;
    }
    if (UI.dom.productModal && UI.dom.productModal.classList.contains('active')) {
      this.closeProductModal();
      return true;
    }
    if (UI.dom.settingsModal && UI.dom.settingsModal.classList.contains('active')) {
      this.closeSettings();
      return true;
    }
    if (UI.dom.posCartPanel && UI.dom.posCartPanel.classList.contains('mobile-open')) {
      UI.dom.posCartPanel.classList.remove('mobile-open');
      return true;
    }
    const activeView = document.querySelector('.app-view.active');
    if (activeView && activeView.id !== 'view-pos') {
      this.switchView('pos');
      return true;
    }
    return false;
  },

  async reprintReceipt(transId) {
    const trx = Store.transactions.find(t => t.id === transId);
    if (!trx) {
      AppDialog.alert({
        title: 'Transaksi Tidak Ditemukan',
        message: 'Data struk untuk transaksi ini tidak tersedia.',
        icon: '⚠️'
      });
      return;
    }
    await this.executePrintReceipt(trx);
  },

  async saveOrShareFile(filename, content, mimeType, title) {
    // 1. Android Bridge Native Save to Downloads & Share
    if (window.AndroidBridge) {
      try {
        const saved = window.AndroidBridge.saveFileToDownloads(filename, content, mimeType);
        window.AndroidBridge.shareFile(filename, content, mimeType, title);
        if (saved) {
          UI.showScannerToast(`✓ Berkas tersimpan di folder Download/BukuKasir`, false);
        }
        return true;
      } catch (err) {
        console.warn('AndroidBridge file handling error:', err);
      }
    }

    // 2. Web Share API with File
    const blob = new Blob([content], { type: mimeType });
    if (navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title || filename,
            text: `Berkas ${filename} dari BukuKasir UMKM`
          });
          UI.showScannerToast(`✓ Berkas ${filename} berhasil dibagikan`, false);
          return true;
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return true;
        }
        console.warn('Web Share failed, fallback to anchor download:', err);
      }
    }

    // 3. Desktop Electron & Standard Web Anchor Download
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);
      UI.showScannerToast(`✓ Berkas ${filename} siap diunduh`, false);
      return true;
    } catch (err) {
      console.error('Download failed:', err);
      AppDialog.alert({
        title: 'Gagal Mengunduh Berkas',
        message: 'Tidak dapat menyimpan atau membagikan berkas: ' + err.message,
        icon: '⚠️'
      });
      return false;
    }
  },

  async exportCSV() {
    const period = Store.activeReportPeriod || 'all';
    const list = Store.getFilteredTransactions(period);

    if (list.length === 0) {
      AppDialog.alert({
        title: 'Data Masih Kosong',
        message: `Belum ada transaksi pada periode ${Store.getPeriodDisplayLabel(period)} untuk diekspor ke CSV.`,
        icon: '📊'
      });
      return;
    }

    try {
      let csv = '\uFEFFID_Transaksi,Waktu,Nama_Pelanggan,Total_Penjualan,Modal_HPP,Laba_Bersih,Daftar_Barang\n';
      list.forEach(t => {
        const itemsText = (t.items || []).map(i => `${i.name} (${i.qty}x)`).join('; ').replace(/"/g, '""');
        const custName = (t.customerName || 'Umum').replace(/"/g, '""');
        csv += `"${t.id}","${t.timestamp}","${custName}",${Math.round(t.total || 0)},${Math.round(t.cogs || 0)},${Math.round(t.profit || 0)},"${itemsText}"\n`;
      });

      const filename = `Laporan_BukuKasir_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
      await this.saveOrShareFile(filename, csv, 'text/csv;charset=utf-8;', `Laporan Transaksi BukuKasir (${period})`);
    } catch (err) {
      AppDialog.alert({
        title: 'Gagal Ekspor CSV',
        message: 'Terjadi kesalahan saat memproses laporan CSV: ' + err.message,
        icon: '⚠️'
      });
    }
  },

  async exportJSON() {
    try {
      const data = {
        outlet: Store.outlet,
        products: Store.products,
        transactions: Store.transactions,
        exportDate: new Date().toISOString(),
        schemaVersion: 2
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const filename = `Cadangan_BukuKasir_${new Date().toISOString().slice(0, 10)}.json`;
      await this.saveOrShareFile(filename, jsonStr, 'application/json', 'Cadangan Data Toko BukuKasir');
    } catch (err) {
      AppDialog.alert({
        title: 'Gagal Cadangkan Data',
        message: 'Terjadi kesalahan saat membuat berkas cadangan: ' + err.message,
        icon: '⚠️'
      });
    }
  },

  importJSON(file) {
    if (!file) {
      AppDialog.alert({
        title: 'Tidak Ada Berkas',
        message: 'Silakan pilih berkas cadangan .json untuk dipulihkan.',
        icon: 'ℹ️'
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      AppDialog.alert({
        title: 'Ukuran Berkas Terlalu Besar',
        message: 'Ukuran berkas cadangan melebihi batas 25 MB.',
        icon: '⚠️'
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      AppDialog.alert({
        title: 'Gagal Membaca Berkas',
        message: 'Sistem tidak dapat membaca berkas yang dipilih.',
        icon: '❌'
      });
    };
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const data = JSON.parse(text);
        if (data && (Array.isArray(data.products) || Array.isArray(data.transactions))) {
          const prodCount = (data.products && data.products.length) || 0;
          const trCount = (data.transactions && data.transactions.length) || 0;

          const ok = await AppDialog.confirm({
            title: 'Pulihkan Data Toko',
            message: `Ditemukan berkas cadangan:\n• Produk: ${prodCount} barang\n• Transaksi: ${trCount} riwayat\n\nPulihkan data toko sekarang? Data aktif saat ini akan diperbarui.`,
            confirmText: 'Pulihkan Sekarang',
            cancelText: 'Batal',
            isDanger: true,
            icon: '⚠️'
          });
          if (ok) {
            if (Array.isArray(data.products)) Store.products = data.products;
            if (Array.isArray(data.transactions)) Store.transactions = data.transactions;
            if (data.outlet) Store.outlet = { ...CONFIG.DEFAULT_OUTLET, ...data.outlet };
            Store.saveProducts();
            Store.saveTransactions();
            Store.saveOutlet();

            UI.updateOutletHeader();
            UI.renderCategoryFilter();
            UI.renderCatalog();
            UI.renderCart();
            UI.renderInventory();
            UI.renderReports();
            UI.showScannerToast('✓ Data toko berhasil dipulihkan', false);
          }
        } else {
          AppDialog.alert({
            title: 'Format Berkas Tidak Sesuai',
            message: 'Berkas JSON yang dipilih bukan cadangan resmi BukuKasir UMKM. Pastikan berkas memiliki data produk atau transaksi.',
            icon: '❌'
          });
        }
      } catch (err) {
        AppDialog.alert({
          title: 'Berkas Rusak / Tidak Valid',
          message: 'Gagal memproses berkas cadangan: ' + err.message + '\nPastikan format JSON tidak rusak.',
          icon: '❌'
        });
      }
    };
    reader.readAsText(file);
  },

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });
    document.querySelectorAll('.mobile-nav-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });

    const mobileCartToggle = document.getElementById('mobile-cart-toggle');
    if (mobileCartToggle) {
      mobileCartToggle.addEventListener('click', () => {
        this.switchView('pos');
        UI.dom.posCartPanel.classList.toggle('mobile-open');
      });
    }

    const btnCloseCart = document.getElementById('btn-close-mobile-cart');
    if (btnCloseCart) {
      btnCloseCart.addEventListener('click', () => {
        UI.dom.posCartPanel.classList.remove('mobile-open');
      });
    }

    const debouncedCatalogSearch = UTILS.debounce((val) => {
      Store.searchQuery = val;
      UI.catalogRenderLimit = 48;
      UI.renderCatalog();
    }, 120);

    UI.dom.posSearch.addEventListener('input', (e) => {
      debouncedCatalogSearch(e.target.value);
    });

    document.getElementById('btn-clear-cart').addEventListener('click', async () => {
      if (Store.cart.length > 0) {
        const ok = await AppDialog.confirm({
          title: 'Kosongkan Keranjang',
          message: 'Kosongkan semua pesanan dalam keranjang?',
          confirmText: 'Kosongkan',
          cancelText: 'Batal',
          isDanger: true,
          icon: '🗑️'
        });
        if (ok) {
          Store.clearCart();
          if (UI.dom.customerNameInput) UI.dom.customerNameInput.value = '';
          UI.renderCart();
          UI.showScannerToast('Keranjang telah dikosongkan', false);
        }
      }
    });

    // Uang Pas button sets exact subtotal with dots
    document.getElementById('btn-exact-cash').addEventListener('click', () => {
      const { subtotal } = Store.getCartCalculations();
      if (subtotal > 0) {
        UI.dom.cashInput.value = FORMAT.number(subtotal);
        UI.updateCashChange();
      } else {
        UI.showScannerToast('Keranjang masih kosong, belum ada total tagihan.', true);
      }
    });

    UI.dom.btnCheckout.addEventListener('click', () => this.executeCheckout());

    document.getElementById('btn-add-product').addEventListener('click', () => this.openAddProduct());
    document.getElementById('modal-product-close').addEventListener('click', () => this.closeProductModal());
    document.getElementById('modal-product-cancel').addEventListener('click', () => this.closeProductModal());

    // Product Modal Validation & Submission Handler
    UI.dom.formProduct.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value;
      const name = document.getElementById('prod-name').value.trim();
      const barcode = document.getElementById('prod-barcode').value.trim();
      const category = document.getElementById('prod-category').value.trim() || 'Umum';
      const cost = FORMAT.parseRaw(UI.dom.prodCost.value);
      const price = FORMAT.parseRaw(UI.dom.prodPrice.value);
      const stock = Math.max(0, parseInt(document.getElementById('prod-stock').value, 10) || 0);

      // Validation 1: Product name required
      if (!name) {
        if (UI.dom.productErrorAlert) {
          UI.dom.productErrorAlert.textContent = 'Nama produk wajib diisi.';
          UI.dom.productErrorAlert.style.display = 'block';
        }
        document.getElementById('prod-name').focus();
        return;
      }

      // Validation 2: Price must be positive
      if (price <= 0) {
        if (UI.dom.productErrorAlert) {
          UI.dom.productErrorAlert.textContent = 'Harga jual konsumen harus lebih besar dari Rp 0.';
          UI.dom.productErrorAlert.style.display = 'block';
        }
        UI.dom.prodPrice.focus();
        return;
      }

      // Validation 3: Duplicate barcode check
      if (barcode) {
        const duplicate = Store.products.find(p => p.id !== id && p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase());
        if (duplicate) {
          if (UI.dom.productErrorAlert) {
            UI.dom.productErrorAlert.textContent = `Kode barcode "${barcode}" sudah terdaftar pada produk "${duplicate.name}". Harap gunakan barcode unik.`;
            UI.dom.productErrorAlert.style.display = 'block';
          }
          document.getElementById('prod-barcode').focus();
          return;
        }
      }

      // Validation 4: Selling below cost warning
      if (cost > 0 && price < cost) {
        const diff = cost - price;
        const ok = await AppDialog.confirm({
          title: 'Peringatan Harga Jual Rugi',
          message: `Harga jual (${FORMAT.currency(price)}) lebih rendah dari harga modal (${FORMAT.currency(cost)}).\nAnda akan mengalami potensi kerugian ${FORMAT.currency(diff)} per unit.\n\nTetap ingin menyimpan produk ini?`,
          confirmText: 'Tetap Simpan',
          cancelText: 'Perbaiki Harga',
          isDanger: true,
          icon: '⚠️'
        });
        if (!ok) return;
      }

      const productPayload = { name, barcode, category, cost, price, stock };

      if (id) {
        Store.updateProduct(id, productPayload);
      } else {
        Store.addProduct(productPayload);
      }

      this.closeProductModal();
      UI.renderInventory();
      UI.renderCategoryFilter();
      UI.renderCatalog();
    });

    document.getElementById('btn-open-settings').addEventListener('click', () => this.openSettings());
    document.getElementById('modal-settings-close').addEventListener('click', () => this.closeSettings());
    document.getElementById('modal-settings-cancel').addEventListener('click', () => this.closeSettings());

    const logoInput = document.getElementById('setting-logo-input');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Compress image using offscreen canvas to prevent QuotaExceededError in LocalStorage
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 240;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            // Isi latar belakang dengan warna putih bersih agar gambar PNG transparan tidak menjadi hitam pekat
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            this.tempLogo = canvas.toDataURL('image/png');

            const preview = document.getElementById('setting-logo-preview');
            if (preview) {
              preview.innerHTML = `<img src="${this.tempLogo}" alt="Preview Logo">`;
            }
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    const btnResetLogo = document.getElementById('btn-reset-logo');
    if (btnResetLogo) {
      btnResetLogo.addEventListener('click', () => {
        this.tempLogo = '';
        const preview = document.getElementById('setting-logo-preview');
        if (preview) preview.textContent = '🏪';
        if (logoInput) logoInput.value = '';
      });
    }

    const btnTestPrint = document.getElementById('btn-test-print');
    if (btnTestPrint) {
      btnTestPrint.addEventListener('click', async () => {
        const sampleTrx = {
          id: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString(),
          customerName: 'Uji Coba Printer',
          items: [
            { name: 'Indomie Goreng + Telur', qty: 2, price: 12000, subtotal: 24000 },
            { name: 'Es Teh Manis', qty: 1, price: 5000, subtotal: 5000 }
          ],
          total: 29000,
          cash: 50000,
          change: 21000
        };
        await App.executePrintReceipt(sampleTrx);
      });
    }

    UI.dom.formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      const brandInput = document.getElementById('setting-brand-title');
      Store.outlet.brandTitle = brandInput ? brandInput.value.trim() || 'BukuKasir UMKM' : 'BukuKasir UMKM';
      Store.outlet.name = document.getElementById('setting-outlet-name').value.trim() || CONFIG.DEFAULT_OUTLET.name;
      if (this.tempLogo !== undefined) {
        Store.outlet.brandLogo = this.tempLogo;
      }
      const paperInput = document.getElementById('setting-paper-width');
      Store.outlet.paperWidth = paperInput ? paperInput.value : '58mm';
      Store.outlet.address = document.getElementById('setting-outlet-address').value.trim();
      Store.outlet.footer = document.getElementById('setting-outlet-footer').value.trim();
      Store.outlet.printerName = document.getElementById('setting-printer').value;
      Store.outlet.silentPrint = document.getElementById('setting-silent-print').checked;
      Store.outlet.soundBeep = document.getElementById('setting-sound-beep').checked;

      Store.saveOutlet();
      UI.updateOutletHeader();
      this.closeSettings();
    });

    // Camera Barcode Scanner Listeners
    const btnPosCamera = document.getElementById('btn-pos-camera-scan');
    if (btnPosCamera) {
      btnPosCamera.addEventListener('click', () => CameraScanner.open('pos'));
    }
    const btnProdCamera = document.getElementById('btn-scan-product-barcode');
    if (btnProdCamera) {
      btnProdCamera.addEventListener('click', () => CameraScanner.open('product-form'));
    }
    const btnScannerClose = document.getElementById('modal-scanner-close');
    if (btnScannerClose) {
      btnScannerClose.addEventListener('click', () => CameraScanner.close());
    }
    const btnScannerCancel = document.getElementById('modal-scanner-cancel');
    if (btnScannerCancel) {
      btnScannerCancel.addEventListener('click', () => CameraScanner.close());
    }
    const modalScanner = document.getElementById('camera-scanner-modal');
    if (modalScanner) {
      modalScanner.addEventListener('click', (e) => {
        if (e.target === modalScanner) CameraScanner.close();
      });
    }

    if (UI.dom.productModal) {
      UI.dom.productModal.addEventListener('click', (e) => {
        if (e.target === UI.dom.productModal) this.closeProductModal();
      });
    }

    if (UI.dom.settingsModal) {
      UI.dom.settingsModal.addEventListener('click', (e) => {
        if (e.target === UI.dom.settingsModal) this.closeSettings();
      });
    }

    // Audio unlock listener for mobile WebViews
    const unlockAudioOnce = () => SoundFeedback.unlockAudio();
    window.addEventListener('click', unlockAudioOnce, { once: true });
    window.addEventListener('touchstart', unlockAudioOnce, { once: true });

    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.exportCSV());
    }

    const btnExportData = document.getElementById('btn-export-data');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => this.exportJSON());
    }

    const inputImportData = document.getElementById('input-import-data');
    if (inputImportData) {
      inputImportData.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.importJSON(e.target.files[0]);
        }
        e.target.value = '';
      });
    }

    const reportPeriodPills = document.getElementById('report-period-pills');
    if (reportPeriodPills) {
      reportPeriodPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.period-pill');
        if (!btn) return;
        const period = btn.dataset.period;
        if (period) {
          Store.activeReportPeriod = period;
          UI.renderReports();
        }
      });
    }

    // Global Key Listener for F-keys and Hardware Laser Scanner
    window.addEventListener('keydown', (e) => {
      const now = Date.now();
      const interval = now - this.lastKeyTime;
      this.lastKeyTime = now;

      if (e.key === 'Escape') {
        if (AppDialog.overlay && AppDialog.overlay.classList.contains('active')) {
          AppDialog.close(false);
          return;
        }
        const scannerModal = document.getElementById('camera-scanner-modal');
        if (CameraScanner.isScanning || (scannerModal && scannerModal.classList.contains('active'))) {
          CameraScanner.close();
          return;
        }
        this.closeProductModal();
        this.closeSettings();
        UI.dom.posCartPanel.classList.remove('mobile-open');
        return;
      }

      if (e.key === 'Enter') {
        if (AppDialog.overlay && AppDialog.overlay.classList.contains('active')) {
          e.preventDefault();
          AppDialog.close(true);
          return;
        }
      }

      const isModalActive = (UI.dom.productModal && UI.dom.productModal.classList.contains('active')) ||
                            (UI.dom.settingsModal && UI.dom.settingsModal.classList.contains('active')) ||
                            (AppDialog.overlay && AppDialog.overlay.classList.contains('active')) ||
                            (CameraScanner.isScanning);

      if (e.key === 'F2') {
        if (isModalActive) return;
        e.preventDefault();
        this.switchView('pos');
        UI.dom.posSearch.focus();
        return;
      }
      if (e.key === 'F4') {
        if (isModalActive) return;
        e.preventDefault();
        this.switchView('pos');
        if (!UI.dom.btnCheckout.disabled) {
          this.executeCheckout();
        } else {
          UI.dom.cashInput.focus();
        }
        return;
      }

      // Scanner terminator check (Enter or Tab)
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (this.barcodeBuffer.length >= 3 && interval < 85) {
          e.preventDefault();
          clearTimeout(this.barcodeTimer);
          const code = this.barcodeBuffer;
          this.barcodeBuffer = '';
          this.dispatchBarcode(code);
          return;
        }

        // Standard Enter on search input
        if (e.key === 'Enter' && document.activeElement === UI.dom.posSearch) {
          const q = Store.searchQuery.toLowerCase().trim();
          const matched = Store.products.filter(p =>
            (p.id && p.id.toLowerCase() === q) || 
            (p.barcode && p.barcode.toLowerCase() === q) ||
            p.name.toLowerCase().includes(q)
          );
          if (matched.length === 1 && matched[0].stock > 0) {
            Store.addToCart(matched[0].id);
            SoundFeedback.playScan(true);
            UI.dom.posSearch.value = '';
            Store.searchQuery = '';
            UI.renderCatalog();
            UI.renderCart();
          }
        }
        this.barcodeBuffer = '';
        return;
      }

      // Collect characters into scanner buffer (protect normal form inputs from accidental burst triggers)
      const activeEl = document.activeElement;
      const isFormInput = activeEl && (
        activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA'
      ) && activeEl !== UI.dom.posSearch;

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (interval > 85) {
          this.barcodeBuffer = e.key;
        } else {
          this.barcodeBuffer += e.key;
        }

        // Auto-detect idle timeout for scanners without Enter/Tab terminator
        // Only run auto-detect if NOT actively typing in a normal form input
        clearTimeout(this.barcodeTimer);
        if (!isFormInput && this.barcodeBuffer.length >= 4) {
          this.barcodeTimer = setTimeout(() => {
            if (this.barcodeBuffer.length >= 4) {
              const code = this.barcodeBuffer;
              this.barcodeBuffer = '';
              this.dispatchBarcode(code);
            }
          }, 110);
        }
      }
    });
  },

  runSanityCheck() {
    console.assert(FORMAT.number(10000000) === '10.000.000', 'Sanity failed: FORMAT.number');
    console.assert(FORMAT.parseRaw('10.000.000') === 10000000, 'Sanity failed: FORMAT.parseRaw');
    console.assert(FORMAT.terbilang(10000000) === 'Sepuluh Juta Rupiah', 'Sanity failed: FORMAT.terbilang 10jt');
    console.assert(FORMAT.terbilang(100000) === 'Seratus Ribu Rupiah', 'Sanity failed: FORMAT.terbilang 100rb');
    console.assert(FORMAT.terbilang(1500000) === 'Satu Juta Lima Ratus Ribu Rupiah', 'Sanity failed: FORMAT.terbilang 1.5jt');
    console.assert(Array.isArray(Store.getFilteredTransactions('all')), 'Sanity failed: Store.getFilteredTransactions');
    console.assert(typeof Store.getPeriodDisplayLabel('daily') === 'string', 'Sanity failed: Store.getPeriodDisplayLabel');
    console.assert(generateCode128Svg('TEST-123').includes('<svg'), 'Sanity failed: generateCode128Svg');
  }
};

if (typeof window !== 'undefined') {
  window.App = App;
  window.CameraScanner = CameraScanner;
  window.AppDialog = AppDialog;
  window.generateCode128Svg = generateCode128Svg;
  document.addEventListener('DOMContentLoaded', () => App.init());
}
if (typeof module !== 'undefined') {
  module.exports = { CONFIG, FORMAT, Store, SoundFeedback, UI, App, CameraScanner, AppDialog, generateCode128Svg };
}
