/**
 * BukuKasir UMKM - Modul Halaman Profil Produk
 * Mengatur data detail spesifikasi produk, analisis margin, mutasi stok fisik, 
 * riwayat penjualan per barang, dan cetak label barcode rak.
 */

const CONFIG = {
  STORAGE_KEYS: {
    PRODUCTS: 'bukukasir_products',
    TRANSACTIONS: 'bukukasir_transactions',
    OUTLET: 'bukukasir_outlet',
    STOCK_LOGS: 'bukukasir_stock_logs'
  },
  DEFAULT_OUTLET: {
    brandTitle: 'BukuKasir UMKM',
    name: 'Toko Berkah Bersama',
    address: 'Jl. Usaha Raya No. 12, Pasar Anyar',
    footer: 'Terima kasih atas kunjungan Anda!',
    paperWidth: '58mm'
  }
};

const FORMAT = {
  currency(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  number(amount) {
    const n = Number(amount || 0);
    return n === 0 ? '0' : n.toLocaleString('id-ID');
  },
  dateTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ' ' + 
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },
  parseRaw(str) {
    if (typeof str === 'number') return Math.max(0, Math.floor(str));
    const clean = String(str || '').replace(/\D/g, '');
    return clean === '' ? 0 : parseInt(clean, 10);
  }
};

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

function generateCode128Svg(inputText, height = 55, barScale = 2) {
  const str = String(inputText || '').trim();
  if (!str) return '';

  const startB = 104;
  const codes = [startB];
  let checkSum = startB;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      codes.push(code);
      checkSum += code * (i + 1);
    }
  }

  const checkDigit = checkSum % 103;
  codes.push(checkDigit);
  codes.push(106); // Stop symbol

  let patternSequence = '';
  codes.forEach(c => {
    patternSequence += (CODE128_PATTERNS[c] || '');
  });

  let x = 12; // quiet zone kiri
  let rects = [];
  for (let i = 0; i < patternSequence.length; i++) {
    const w = parseInt(patternSequence[i], 10) * barScale;
    if (i % 2 === 0) {
      rects.push(`<rect x="${x}" y="0" width="${w}" height="${height}" fill="#0f172a" />`);
    }
    x += w;
  }
  const totalWidth = x + 12; // quiet zone kanan

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="Barcode ${str}">${rects.join('')}</svg>`;
}

const ProfileApp = {
  products: [],
  transactions: [],
  outlet: { ...CONFIG.DEFAULT_OUTLET },
  stockLogs: [],
  currentProduct: null,

  init() {
    this.loadData();
    this.setupUrlProduct();
    this.renderHeader();
    this.renderProductSelector();
    this.renderCurrentProduct();
    this.setupEventListeners();
  },

  loadData() {
    try {
      const p = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS);
      this.products = p ? JSON.parse(p) : [];

      const t = localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS);
      this.transactions = t ? JSON.parse(t) : [];

      const o = localStorage.getItem(CONFIG.STORAGE_KEYS.OUTLET);
      this.outlet = o ? { ...CONFIG.DEFAULT_OUTLET, ...JSON.parse(o) } : { ...CONFIG.DEFAULT_OUTLET };

      const sl = localStorage.getItem(CONFIG.STORAGE_KEYS.STOCK_LOGS);
      this.stockLogs = sl ? JSON.parse(sl) : [];
    } catch (e) {
      console.warn('Gagal membaca data dari LocalStorage:', e);
      this.products = [];
      this.transactions = [];
      this.stockLogs = [];
    }
  },

  saveProducts() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error('Gagal menyimpan produk:', e);
    }
  },

  saveStockLogs() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.STOCK_LOGS, JSON.stringify(this.stockLogs));
    } catch (e) {
      console.error('Gagal menyimpan log mutasi stok:', e);
    }
  },

  setupUrlProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      this.currentProduct = this.products.find(p => p.id === id);
    }

    if (!this.currentProduct && this.products.length > 0) {
      this.currentProduct = this.products[0];
    }
  },

  renderHeader() {
    const outletNameEl = document.getElementById('topbar-outlet-name');
    if (outletNameEl) {
      outletNameEl.textContent = this.outlet.name || CONFIG.DEFAULT_OUTLET.name;
    }
  },

  renderProductSelector() {
    const select = document.getElementById('product-select-dropdown');
    if (!select) return;

    if (this.products.length === 0) {
      select.innerHTML = '<option value="">Tidak ada produk</option>';
      select.disabled = true;
      return;
    }

    select.disabled = false;
    select.innerHTML = this.products.map(p => `
      <option value="${p.id}" ${this.currentProduct && this.currentProduct.id === p.id ? 'selected' : ''}>
        ${p.name} (Sisa ${p.stock})
      </option>
    `).join('');

    select.onchange = (e) => {
      const selectedId = e.target.value;
      const target = this.products.find(p => p.id === selectedId);
      if (target) {
        this.currentProduct = target;
        // Update URL tanpa reload halaman
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', target.id);
        window.history.pushState({}, '', newUrl);
        this.renderCurrentProduct();
      }
    };
  },

  renderCurrentProduct() {
    const prod = this.currentProduct;
    const contentContainer = document.getElementById('profile-main-content');
    const emptyContainer = document.getElementById('profile-empty-content');

    if (!prod) {
      if (contentContainer) contentContainer.style.display = 'none';
      if (emptyContainer) emptyContainer.style.display = 'block';
      return;
    }

    if (contentContainer) contentContainer.style.display = 'block';
    if (emptyContainer) emptyContainer.style.display = 'none';

    // 1. Identitas Produk
    document.getElementById('prod-title').textContent = prod.name;
    document.getElementById('prod-category-tag').textContent = prod.category || 'Umum';
    document.getElementById('prod-id-badge').textContent = 'ID: ' + prod.id;
    document.getElementById('prod-barcode-badge').textContent = prod.barcode ? 'Barcode: ' + prod.barcode : 'Belum ada barcode fisik';

    // Status Stok Badge
    const statusPill = document.getElementById('prod-stock-status-pill');
    if (prod.stock <= 0) {
      statusPill.className = 'stock-status-pill out';
      statusPill.textContent = 'Stok Habis (0)';
    } else if (prod.stock <= 5) {
      statusPill.className = 'stock-status-pill low';
      statusPill.textContent = 'Stok Kritis (' + prod.stock + ' item)';
    } else {
      statusPill.className = 'stock-status-pill safe';
      statusPill.textContent = 'Stok Aman (' + prod.stock + ' item)';
    }

    // 2. Metrik Keuangan
    const cost = Number(prod.cost || 0);
    const price = Number(prod.price || 0);
    const stock = Number(prod.stock || 0);
    const unitMargin = price - cost;
    const marginPct = price > 0 ? Math.round((unitMargin / price) * 100) : 0;
    const totalAssetCost = cost * stock;
    const potentialRevenue = price * stock;

    document.getElementById('kpi-cost').textContent = FORMAT.currency(cost);
    document.getElementById('kpi-price').textContent = FORMAT.currency(price);
    document.getElementById('kpi-margin').textContent = FORMAT.currency(unitMargin);
    document.getElementById('kpi-margin-pct').textContent = `Margin kotor: ${marginPct}% dari harga jual`;
    document.getElementById('kpi-stock-asset').textContent = FORMAT.currency(totalAssetCost);
    document.getElementById('kpi-stock-revenue').textContent = `Potensi omzet sisa stok: ${FORMAT.currency(potentialRevenue)}`;

    // 3. Barcode SVG Render
    const barcodeCode = prod.barcode || prod.id;
    const barcodeSvg = generateCode128Svg(barcodeCode, 60, 2);
    document.getElementById('barcode-render-box').innerHTML = barcodeSvg || '<p style="color:var(--text-muted);font-size:0.8rem;">Gagal membuat barcode</p>';
    document.getElementById('barcode-text-display').textContent = barcodeCode;

    // Siapkan Label Print Area
    this.preparePrintLabel(prod, barcodeCode);

    // 4. Riwayat Mutasi Stok
    this.renderStockHistory(prod.id);

    // 5. Riwayat Penjualan Produk Ini
    this.renderSalesPerformance(prod.id);
  },

  preparePrintLabel(prod, barcodeCode) {
    const printArea = document.getElementById('print-label-area');
    if (!printArea) return;

    const barcodeSvgPrint = generateCode128Svg(barcodeCode, 45, 1.6);
    printArea.innerHTML = `
      <div class="label-outlet-name">${this.outlet.name || 'BukuKasir UMKM'}</div>
      <div class="label-prod-name">${prod.name}</div>
      <div class="label-barcode-svg">${barcodeSvgPrint}</div>
      <div class="label-barcode-text">${barcodeCode}</div>
      <div class="label-price-box">
        <span class="label-price-caption">Harga Jual:</span>
        <div class="label-price-val">${FORMAT.currency(prod.price)}</div>
      </div>
    `;
  },

  renderStockHistory(prodId) {
    const tbody = document.getElementById('stock-history-tbody');
    if (!tbody) return;

    const logs = this.stockLogs
      .filter(l => l.productId === prodId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem 0.5rem; font-size: 0.85rem;">
            Belum ada catatan mutasi stok untuk produk ini.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const isAdd = l.type === 'IN';
      const badge = isAdd 
        ? `<span class="badge-in">+${l.delta} Masuk</span>` 
        : `<span class="badge-out">-${l.delta} Keluar</span>`;
      return `
        <tr>
          <td style="font-size: 0.8rem;">${FORMAT.dateTime(l.timestamp)}</td>
          <td>${badge}</td>
          <td>${l.note || '-'}</td>
          <td class="text-right font-mono font-bold">${l.resultingStock} item</td>
        </tr>
      `;
    }).join('');
  },

  renderSalesPerformance(prodId) {
    const tbody = document.getElementById('sales-history-tbody');
    const totalSoldQtyEl = document.getElementById('sales-stat-qty');
    const totalRevenueEl = document.getElementById('sales-stat-revenue');
    const totalProfitEl = document.getElementById('sales-stat-profit');

    const relevantSales = [];
    let totalQty = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    this.transactions.forEach(trx => {
      if (!trx.items || !Array.isArray(trx.items)) return;
      const item = trx.items.find(i => i.id === prodId);
      if (item) {
        const itemQty = Number(item.qty || 0);
        const itemPrice = Number(item.price || 0);
        const itemCost = Number(item.cost || 0);
        const subtotal = itemQty * itemPrice;
        const profit = subtotal - (itemQty * itemCost);

        totalQty += itemQty;
        totalRevenue += subtotal;
        totalProfit += profit;

        relevantSales.push({
          trxId: trx.id,
          timestamp: trx.timestamp,
          qty: itemQty,
          subtotal,
          profit
        });
      }
    });

    if (totalSoldQtyEl) totalSoldQtyEl.textContent = `${totalQty} item`;
    if (totalRevenueEl) totalRevenueEl.textContent = FORMAT.currency(totalRevenue);
    if (totalProfitEl) totalProfitEl.textContent = FORMAT.currency(totalProfit);

    if (!tbody) return;

    if (relevantSales.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem 0.5rem; font-size: 0.85rem;">
            Belum ada transaksi penjualan yang memuat produk ini di kasir.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = relevantSales.map(sale => `
      <tr>
        <td class="font-mono" style="font-size: 0.8rem; font-weight: 600;">${sale.trxId}</td>
        <td style="font-size: 0.8rem;">${FORMAT.dateTime(sale.timestamp)}</td>
        <td class="text-center font-mono font-bold">${sale.qty}</td>
        <td class="text-right font-mono">${FORMAT.currency(sale.subtotal)}</td>
        <td class="text-right font-mono text-emerald font-bold">+${FORMAT.currency(sale.profit)}</td>
      </tr>
    `).join('');
  },

  handleStockAdjustment(type, delta, note) {
    if (!this.currentProduct) return;
    const qty = parseInt(delta, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Masukkan jumlah unit stok yang valid (minimal 1).');
      return;
    }

    const prod = this.currentProduct;
    let newStock = Number(prod.stock || 0);

    if (type === 'IN') {
      newStock += qty;
    } else {
      if (qty > newStock) {
        alert(`Jumlah pengurangan (${qty}) melebihi sisa stok saat ini (${newStock}).`);
        return;
      }
      newStock -= qty;
    }

    prod.stock = newStock;

    // Catat log mutasi
    const log = {
      id: 'MUT-' + Date.now().toString(36).toUpperCase(),
      productId: prod.id,
      productName: prod.name,
      timestamp: new Date().toISOString(),
      type, // 'IN' atau 'OUT'
      delta: qty,
      note: note.trim() || (type === 'IN' ? 'Kulakan / Penambahan Stok' : 'Pengurangan / Koreksi Stok'),
      resultingStock: newStock
    };

    this.stockLogs.unshift(log);

    // Simpan ke storage
    this.saveProducts();
    this.saveStockLogs();

    // Re-render
    this.renderProductSelector();
    this.renderCurrentProduct();

    alert(`Stok "${prod.name}" berhasil disesuaikan! Stok sekarang: ${newStock} item.`);
  },

  setupEventListeners() {
    // Form Mutasi Stok
    const formAdjust = document.getElementById('form-adjust-stock');
    if (formAdjust) {
      formAdjust.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="adjust-type"]:checked')?.value || 'IN';
        const qty = document.getElementById('adjust-qty').value;
        const note = document.getElementById('adjust-note').value;

        this.handleStockAdjustment(type, qty, note);
        document.getElementById('adjust-qty').value = '';
        document.getElementById('adjust-note').value = '';
      });
    }

    // Toggle Tampilan Tombol Radio Penyesuaian
    const radios = document.querySelectorAll('input[name="adjust-type"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const labels = document.querySelectorAll('.adjust-radio-btn');
        labels.forEach(l => l.classList.remove('active-in', 'active-out'));
        if (radio.checked) {
          const parent = radio.closest('.adjust-radio-btn');
          if (parent) {
            parent.classList.add(radio.value === 'IN' ? 'active-in' : 'active-out');
          }
        }
      });
    });

    // Tombol Cetak Label Barcode Rak
    const btnPrintBarcode = document.getElementById('btn-print-barcode');
    if (btnPrintBarcode) {
      btnPrintBarcode.addEventListener('click', () => {
        window.print();
      });
    }

    // Modal Edit Produk Cepat
    const btnEditModal = document.getElementById('btn-open-edit-modal');
    const modalEdit = document.getElementById('modal-edit-product');
    const btnCloseModal = document.getElementById('modal-edit-close');
    const btnCancelModal = document.getElementById('modal-edit-cancel');
    const formEdit = document.getElementById('form-edit-product');

    if (btnEditModal && modalEdit) {
      btnEditModal.addEventListener('click', () => {
        if (!this.currentProduct) return;
        document.getElementById('edit-prod-name').value = this.currentProduct.name;
        document.getElementById('edit-prod-barcode').value = this.currentProduct.barcode || '';
        document.getElementById('edit-prod-category').value = this.currentProduct.category || '';
        document.getElementById('edit-prod-cost').value = FORMAT.number(this.currentProduct.cost);
        document.getElementById('edit-prod-price').value = FORMAT.number(this.currentProduct.price);
        document.getElementById('edit-prod-stock').value = this.currentProduct.stock;
        modalEdit.classList.add('active');
      });
    }

    const closeModal = () => {
      if (modalEdit) modalEdit.classList.remove('active');
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    if (formEdit) {
      // Currency input formatting
      ['edit-prod-cost', 'edit-prod-price'].forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
          el.addEventListener('input', () => {
            const raw = FORMAT.parseRaw(el.value);
            el.value = raw > 0 ? FORMAT.number(raw) : '';
          });
        }
      });

      formEdit.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.currentProduct) return;

        const name = document.getElementById('edit-prod-name').value.trim();
        const barcode = document.getElementById('edit-prod-barcode').value.trim();
        const category = document.getElementById('edit-prod-category').value.trim();
        const cost = FORMAT.parseRaw(document.getElementById('edit-prod-cost').value);
        const price = FORMAT.parseRaw(document.getElementById('edit-prod-price').value);
        const stock = parseInt(document.getElementById('edit-prod-stock').value, 10) || 0;

        if (!name) {
          alert('Nama produk tidak boleh kosong.');
          return;
        }

        this.currentProduct.name = name;
        this.currentProduct.barcode = barcode;
        this.currentProduct.category = category || 'Umum';
        this.currentProduct.cost = cost;
        this.currentProduct.price = price;
        this.currentProduct.stock = stock;

        this.saveProducts();
        closeModal();
        this.renderProductSelector();
        this.renderCurrentProduct();
        alert('Data produk berhasil diperbarui!');
      });
    }

    // Keyboard Shortcuts (Esc untuk tutup modal atau kembali, Ctrl+P untuk cetak label)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalEdit && modalEdit.classList.contains('active')) {
          closeModal();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProfileApp.init();
});
