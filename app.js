/**
 * BukuKasir UMKM - Arsitektur Modular Desktop POS
 * 
 * Integrasi Perangkat Keras:
 * - Scanner Laser: HID Keyboard timing interceptor (< 60ms keystroke buffer) & audio synth feedback
 * - Printer Thermal: Integrasi Electron IPC untuk silent printing langsung ke printer POS kasir
 */

const CONFIG = {
  STORAGE_KEYS: {
    PRODUCTS: 'bukukasir_products',
    TRANSACTIONS: 'bukukasir_transactions',
    OUTLET: 'bukukasir_outlet'
  },
  DEFAULT_OUTLET: {
    name: 'Toko Berkah Bersama',
    address: 'Jl. Usaha Raya No. 12, Pasar Anyar',
    footer: 'Terima kasih atas kunjungan Anda!',
    printerName: '',
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
  dateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ' ' + 
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
};

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
        // High-pitch 1760Hz POS scanner beep
        osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.08);
      } else {
        // Low double buzz for scan error
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
    localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
  },

  saveTransactions() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
  },

  saveOutlet() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.OUTLET, JSON.stringify(this.outlet));
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
    if (!prod || prod.stock <= 0) return { success: false, message: 'Barang tidak tersedia atau stok habis.' };

    const item = this.cart.find(i => i.productId === productId);
    const curQty = item ? item.qty : 0;

    if (curQty + 1 > prod.stock) {
      return { success: false, message: `Stok hanya tersisa ${prod.stock} item.` };
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
      if (prod && newQty > prod.stock) return;
      this.cart[idx].qty = newQty;
    }
  },

  clearCart() {
    this.cart = [];
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

  checkout(cashGiven) {
    const { subtotal, totalCost } = this.getCartCalculations();
    if (this.cart.length === 0 || subtotal <= 0) return null;

    const cash = parseFloat(cashGiven) || subtotal;
    const change = cash - subtotal;
    if (change < 0) return null;

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
      profit: subtotal - totalCost,
      cash,
      change
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();
    this.clearCart();
    return transaction;
  },

  getFinancialSummary() {
    let revenue = 0;
    let cogs = 0;
    let profit = 0;

    this.transactions.forEach(t => {
      revenue += t.total || 0;
      cogs += t.cogs || 0;
      profit += t.profit || 0;
    });

    const marginPct = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { revenue, cogs, profit, marginPct, count: this.transactions.length };
  }
};

const UI = {
  dom: {},

  init() {
    this.dom = {
      outletNameDisplay: document.getElementById('outlet-name-display'),
      productGrid: document.getElementById('product-grid'),
      categoryPills: document.getElementById('category-pills'),
      posSearch: document.getElementById('pos-search'),
      cartItems: document.getElementById('cart-items'),
      cartTotal: document.getElementById('cart-total'),
      cartItemCount: document.getElementById('cart-item-count'),
      cashInput: document.getElementById('cash-input'),
      cartChange: document.getElementById('cart-change'),
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
      settingsModal: document.getElementById('settings-modal'),
      formSettings: document.getElementById('form-settings'),
      receiptContainer: document.getElementById('thermal-receipt'),
      scannerToast: document.getElementById('scanner-toast'),
      settingPrinterSelect: document.getElementById('setting-printer'),
      printerDetectHint: document.getElementById('printer-detect-hint')
    };

    this.updateOutletHeader();
    this.renderCategoryFilter();
    this.renderCatalog();
    this.renderCart();
  },

  updateOutletHeader() {
    if (this.dom.outletNameDisplay) {
      this.dom.outletNameDisplay.textContent = Store.outlet.name || CONFIG.DEFAULT_OUTLET.name;
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

    this.dom.productGrid.innerHTML = filtered.map(p => {
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

    this.dom.productGrid.querySelectorAll('.product-card').forEach(card => {
      const selectItem = () => {
        const res = Store.addToCart(card.dataset.id);
        if (!res.success) {
          alert(res.message);
        } else {
          SoundFeedback.playScan(true);
          this.renderCart();
        }
      };
      card.addEventListener('click', selectItem);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectItem();
        }
      });
    });
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
      this.dom.btnCheckout.disabled = false;
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
        this.dom.cashInput.value = btn.dataset.val;
        this.updateCashChange();
      });
    });
  },

  updateCashChange() {
    const { subtotal } = Store.getCartCalculations();
    const cash = parseFloat(this.dom.cashInput.value) || 0;
    const change = cash - subtotal;

    if (cash === 0 || subtotal === 0) {
      this.dom.cartChange.textContent = 'Rp 0';
      this.dom.cartChange.style.color = 'var(--text-main)';
      this.dom.btnCheckout.disabled = subtotal === 0;
    } else if (change < 0) {
      this.dom.cartChange.textContent = `Kurang ${FORMAT.currency(Math.abs(change))}`;
      this.dom.cartChange.style.color = 'var(--color-danger)';
      this.dom.btnCheckout.disabled = true;
    } else {
      this.dom.cartChange.textContent = FORMAT.currency(change);
      this.dom.cartChange.style.color = 'var(--color-success)';
      this.dom.btnCheckout.disabled = false;
    }
  },

  renderInventory() {
    if (Store.products.length === 0) {
      this.dom.inventoryTbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem;">Belum ada data barang.</td></tr>`;
      return;
    }

    this.dom.inventoryTbody.innerHTML = Store.products.map(p => {
      const margin = (p.price || 0) - (p.cost || 0);
      const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
      const stockBadge = p.stock <= 0
        ? '<span class="badge-tag badge-red">Habis (0)</span>'
        : (p.stock <= 5 ? `<span class="badge-tag badge-red">Kritis (${p.stock})</span>` : `<span class="badge-tag badge-green">${p.stock} item</span>`);

      const barcodeLabel = p.barcode ? `<div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">Barcode: ${p.barcode}</div>` : '';

      return `
        <tr>
          <td>
            <div class="font-bold">${p.name}</div>
            ${barcodeLabel}
          </td>
          <td><span class="badge-tag badge-gray">${p.category || 'Umum'}</span></td>
          <td class="text-right font-mono">${FORMAT.currency(p.cost)}</td>
          <td class="text-right font-mono font-bold">${FORMAT.currency(p.price)}</td>
          <td class="text-center font-mono" title="Laba kotor: ${FORMAT.currency(margin)}">${marginPct}%</td>
          <td class="text-center">${stockBadge}</td>
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
  },

  renderReports() {
    const stats = Store.getFinancialSummary();
    this.dom.statRevenue.textContent = FORMAT.currency(stats.revenue);
    this.dom.statCogs.textContent = FORMAT.currency(stats.cogs);
    this.dom.statProfit.textContent = FORMAT.currency(stats.profit);
    this.dom.statMargin.textContent = `Persentase keuntungan: ${stats.marginPct}%`;
    this.dom.statCount.textContent = `${stats.count} transaksi selesai`;

    if (Store.transactions.length === 0) {
      this.dom.transactionsTbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:2rem;">Belum ada riwayat transaksi penjualan.</td></tr>`;
      return;
    }

    this.dom.transactionsTbody.innerHTML = Store.transactions.map(t => {
      const itemsText = (t.items || []).map(i => `${i.name} (${i.qty}x)`).join(', ');
      return `
        <tr>
          <td>
            <div class="font-bold">${t.id}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${FORMAT.dateTime(t.timestamp)}</div>
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
  },

  renderThermalReceipt(trx) {
    const itemsHtml = trx.items.map(it => `
      <tr>
        <td colspan="2" style="font-weight:600;">${it.name}</td>
      </tr>
      <tr>
        <td style="color:#222;">${it.qty} x ${FORMAT.currency(it.price)}</td>
        <td style="text-align:right;">${FORMAT.currency(it.subtotal)}</td>
      </tr>
    `).join('');

    this.dom.receiptContainer.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-title">${Store.outlet.name || 'BUKUKASIR UMKM'}</div>
        <div class="receipt-meta">${Store.outlet.address || ''}</div>
        <div class="receipt-meta">No: ${trx.id} | ${FORMAT.dateTime(trx.timestamp)}</div>
      </div>
      <div class="receipt-divider"></div>
      <table class="receipt-table">
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="receipt-divider"></div>
      <table class="receipt-totals">
        <tr>
          <td><strong>TOTAL</strong></td>
          <td style="text-align:right;"><strong>${FORMAT.currency(trx.total)}</strong></td>
        </tr>
        <tr>
          <td>Tunai</td>
          <td style="text-align:right;">${FORMAT.currency(trx.cash)}</td>
        </tr>
        <tr>
          <td>Kembali</td>
          <td style="text-align:right;">${FORMAT.currency(trx.change)}</td>
        </tr>
      </table>
      <div class="receipt-footer">
        <div>${Store.outlet.footer || 'Terima kasih atas kunjungan Anda!'}</div>
        <div style="margin-top:2px;">Barang yang sudah dibeli tidak dapat ditukar</div>
      </div>
    `;
  }
};

const App = {
  barcodeBuffer: '',
  lastKeyTime: 0,

  async init() {
    Store.init();
    UI.init();
    SoundFeedback.init();
    this.bindEvents();
    this.initHardwareIntegrations();
    this.runSanityCheck();
  },

  async initHardwareIntegrations() {
    // Detect system printers via Electron Bridge
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

  handleDeleteProduct(id) {
    const prod = Store.products.find(p => p.id === id);
    if (!prod) return;
    if (confirm(`Hapus produk "${prod.name}" dari katalog toko?`)) {
      Store.deleteProduct(id);
      UI.renderInventory();
      UI.renderCategoryFilter();
      UI.renderCatalog();
      UI.renderCart();
    }
  },

  openEditProduct(id) {
    const prod = Store.products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('modal-product-title').textContent = 'Edit Data Produk';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-barcode').value = prod.barcode || '';
    document.getElementById('prod-category').value = prod.category || '';
    document.getElementById('prod-cost').value = prod.cost || 0;
    document.getElementById('prod-price').value = prod.price || 0;
    document.getElementById('prod-stock').value = prod.stock || 0;

    UI.dom.productModal.classList.add('active');
    document.getElementById('prod-name').focus();
  },

  openAddProduct() {
    UI.dom.formProduct.reset();
    document.getElementById('modal-product-title').textContent = 'Tambah Produk Baru';
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-barcode').value = '';
    document.getElementById('prod-stock').value = 10;

    UI.dom.productModal.classList.add('active');
    document.getElementById('prod-name').focus();
  },

  closeProductModal() {
    UI.dom.productModal.classList.remove('active');
  },

  openSettings() {
    document.getElementById('setting-outlet-name').value = Store.outlet.name || '';
    document.getElementById('setting-outlet-address').value = Store.outlet.address || '';
    document.getElementById('setting-outlet-footer').value = Store.outlet.footer || '';
    document.getElementById('setting-silent-print').checked = Store.outlet.silentPrint !== false;
    document.getElementById('setting-sound-beep').checked = Store.outlet.soundBeep !== false;

    this.initHardwareIntegrations();
    UI.dom.settingsModal.classList.add('active');
    document.getElementById('setting-outlet-name').focus();
  },

  closeSettings() {
    UI.dom.settingsModal.classList.remove('active');
  },

  async executeCheckout() {
    const cashVal = parseFloat(UI.dom.cashInput.value);
    const trx = Store.checkout(cashVal);
    if (!trx) {
      alert('Pembayaran gagal: Keranjang kosong atau nominal uang belum mencukupi.');
      return;
    }

    UI.renderThermalReceipt(trx);

    // Hardware Printing: If running in Electron and Silent Print enabled
    if (window.posBridge && Store.outlet.silentPrint) {
      try {
        const res = await window.posBridge.printReceipt({
          receiptHtml: UI.dom.receiptContainer.innerHTML,
          deviceName: Store.outlet.printerName || undefined,
          silent: true
        });
        if (res && res.success) {
          UI.showScannerToast('✓ Transaksi Selesai & Struk Tercetak Otomatis', false);
        } else {
          window.print();
        }
      } catch (err) {
        window.print();
      }
    } else {
      if (confirm(`Transaksi Berhasil Disimpan!\nTotal: ${FORMAT.currency(trx.total)}\nKembalian: ${FORMAT.currency(trx.change)}\n\nCetak struk belanja sekarang?`)) {
        window.print();
      }
    }

    UI.renderCart();
    UI.renderCatalog();
    UI.dom.posCartPanel.classList.remove('mobile-open');
  },

  async reprintReceipt(transId) {
    const trx = Store.transactions.find(t => t.id === transId);
    if (!trx) return;
    UI.renderThermalReceipt(trx);

    if (window.posBridge && Store.outlet.silentPrint) {
      await window.posBridge.printReceipt({
        receiptHtml: UI.dom.receiptContainer.innerHTML,
        deviceName: Store.outlet.printerName || undefined,
        silent: true
      });
      UI.showScannerToast('✓ Cetak Ulang Struk Terkirim ke Printer', false);
    } else {
      window.print();
    }
  },

  exportCSV() {
    if (Store.transactions.length === 0) {
      alert('Belum ada transaksi untuk diekspor.');
      return;
    }

    let csv = 'ID_Transaksi,Waktu,Total_Penjualan,Modal_HPP,Laba_Bersih,Daftar_Barang\n';
    Store.transactions.forEach(t => {
      const itemsText = (t.items || []).map(i => `${i.name} (${i.qty}x)`).join('; ');
      csv += `"${t.id}","${t.timestamp}",${t.total},${t.cogs},${t.profit},"${itemsText}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_BukuKasir_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  },

  exportJSON() {
    const data = {
      outlet: Store.outlet,
      products: Store.products,
      transactions: Store.transactions,
      exportDate: new Date().toISOString(),
      schemaVersion: 2
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cadangan_BukuKasir_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  },

  importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.products) && Array.isArray(data.transactions)) {
          if (confirm('Pulihkan data dari cadangan ini? Data toko saat ini akan diperbarui.')) {
            Store.products = data.products;
            Store.transactions = data.transactions;
            if (data.outlet) Store.outlet = { ...CONFIG.DEFAULT_OUTLET, ...data.outlet };
            Store.saveProducts();
            Store.saveTransactions();
            Store.saveOutlet();

            UI.updateOutletHeader();
            UI.renderCategoryFilter();
            UI.renderCatalog();
            UI.renderCart();
            alert('Data toko berhasil dipulihkan.');
          }
        } else {
          alert('Format berkas cadangan tidak dikenali.');
        }
      } catch (err) {
        alert('Gagal membaca berkas: ' + err.message);
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

    UI.dom.posSearch.addEventListener('input', (e) => {
      Store.searchQuery = e.target.value;
      UI.renderCatalog();
    });

    document.getElementById('btn-clear-cart').addEventListener('click', () => {
      if (Store.cart.length > 0 && confirm('Kosongkan semua pesanan dalam keranjang?')) {
        Store.clearCart();
        UI.renderCart();
      }
    });

    UI.dom.cashInput.addEventListener('input', () => UI.updateCashChange());

    document.getElementById('btn-exact-cash').addEventListener('click', () => {
      const { subtotal } = Store.getCartCalculations();
      UI.dom.cashInput.value = subtotal;
      UI.updateCashChange();
    });

    UI.dom.btnCheckout.addEventListener('click', () => this.executeCheckout());

    document.getElementById('btn-add-product').addEventListener('click', () => this.openAddProduct());
    document.getElementById('modal-product-close').addEventListener('click', () => this.closeProductModal());
    document.getElementById('modal-product-cancel').addEventListener('click', () => this.closeProductModal());

    UI.dom.formProduct.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value;
      const data = {
        name: document.getElementById('prod-name').value.trim(),
        barcode: document.getElementById('prod-barcode').value.trim(),
        category: document.getElementById('prod-category').value.trim() || 'Umum',
        cost: parseFloat(document.getElementById('prod-cost').value) || 0,
        price: parseFloat(document.getElementById('prod-price').value) || 0,
        stock: parseInt(document.getElementById('prod-stock').value, 10) || 0
      };

      if (id) {
        Store.updateProduct(id, data);
      } else {
        Store.addProduct(data);
      }

      this.closeProductModal();
      UI.renderInventory();
      UI.renderCategoryFilter();
      UI.renderCatalog();
    });

    document.getElementById('btn-open-settings').addEventListener('click', () => this.openSettings());
    document.getElementById('modal-settings-close').addEventListener('click', () => this.closeSettings());
    document.getElementById('modal-settings-cancel').addEventListener('click', () => this.closeSettings());

    UI.dom.formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.outlet.name = document.getElementById('setting-outlet-name').value.trim() || CONFIG.DEFAULT_OUTLET.name;
      Store.outlet.address = document.getElementById('setting-outlet-address').value.trim();
      Store.outlet.footer = document.getElementById('setting-outlet-footer').value.trim();
      Store.outlet.printerName = document.getElementById('setting-printer').value;
      Store.outlet.silentPrint = document.getElementById('setting-silent-print').checked;
      Store.outlet.soundBeep = document.getElementById('setting-sound-beep').checked;

      Store.saveOutlet();
      UI.updateOutletHeader();
      this.closeSettings();
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => this.exportCSV());
    document.getElementById('btn-export-data').addEventListener('click', () => this.exportJSON());
    document.getElementById('input-import-data').addEventListener('change', (e) => {
      this.importJSON(e.target.files[0]);
      e.target.value = '';
    });

    // Hardware Laser Barcode Scanner Interceptor (< 60ms latency burst)
    window.addEventListener('keydown', (e) => {
      const now = Date.now();
      const interval = now - this.lastKeyTime;
      this.lastKeyTime = now;

      // Escape key modal handling
      if (e.key === 'Escape') {
        this.closeProductModal();
        this.closeSettings();
        UI.dom.posCartPanel.classList.remove('mobile-open');
        return;
      }

      // POS Cashier F-keys
      if (e.key === 'F2') {
        e.preventDefault();
        this.switchView('pos');
        UI.dom.posSearch.focus();
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        this.switchView('pos');
        if (!UI.dom.btnCheckout.disabled) {
          this.executeCheckout();
        }
        return;
      }

      const isModalOpen = UI.dom.productModal.classList.contains('active') || UI.dom.settingsModal.classList.contains('active');

      if (e.key === 'Enter') {
        // If rapid keystrokes were captured from a laser scanner
        if (this.barcodeBuffer.length >= 3 && interval < 80) {
          e.preventDefault();
          this.handleBarcodeScan(this.barcodeBuffer.trim());
          this.barcodeBuffer = '';
          return;
        }

        // If user pressed enter in the search input
        if (document.activeElement === UI.dom.posSearch) {
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

      // Collect single character keys into scanner buffer
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (interval > 80) {
          this.barcodeBuffer = e.key;
        } else {
          this.barcodeBuffer += e.key;
        }
      }
    });
  },

  runSanityCheck() {
    const calc = Store.getFinancialSummary();
    console.assert(typeof calc.revenue === 'number', 'Sanity failed: revenue must be number');
    console.assert(FORMAT.currency(1000) === 'Rp 1.000', 'Sanity failed: currency formatting');
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
