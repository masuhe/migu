// --- Navigation Tab System & Mobile Toggle ---
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  element.classList.add('active');

  // Tutup menu mobile jika terbuka
  document.getElementById('navMenu').classList.remove('active');

  // Panggil muat berita jika tab berita dipilih
  if (tabId === 'berita') {
    muatBerita();
  }
}

function toggleMobileNav() {
  document.getElementById('navMenu').classList.toggle('active');
}

// Format IDR Helper
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// --- 1. Kalkulator Finansial ---
function hitungInvestasi() {
  const modalAwal = parseFloat(document.getElementById('modalAwal').value) || 0;
  const setoranBulanan = parseFloat(document.getElementById('setoranBulanan').value) || 0;
  const returnTahunan = (parseFloat(document.getElementById('returnTahunan').value) || 0) / 100;
  const durasiTahun = parseInt(document.getElementById('durasiTahun').value) || 0;

  const totalBulan = durasiTahun * 12;
  const returnBulanan = returnTahunan / 12;

  let totalModal = modalAwal + (setoranBulanan * totalBulan);
  let nilaiAkhir = modalAwal;

  for (let i = 0; i < totalBulan; i++) {
    nilaiAkhir = (nilaiAkhir + setoranBulanan) * (1 + returnBulanan);
  }

  const profit = nilaiAkhir - totalModal;

  document.getElementById('outTotalModal').innerText = formatRupiah(totalModal);
  document.getElementById('outProfit').innerText = formatRupiah(profit);
  document.getElementById('outTotalAkhir').innerText = formatRupiah(nilaiAkhir);
}

// --- 2. Subnet Calculator ---
function hitungSubnet() {
  const ip = document.getElementById('ipAddress').value.trim();
  const cidr = parseInt(document.getElementById('cidr').value);

  if (!ip || cidr < 8 || cidr > 30) {
    alert("Masukkan IP Address dan CIDR (8-30) yang valid!");
    return;
  }

  const maskInt = (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const netmask = [(maskInt >>> 24) & 255, (maskInt >>> 16) & 255, (maskInt >>> 8) & 255, maskInt & 255].join('.');

  const ipOctets = ip.split('.').map(Number);
  if (ipOctets.length !== 4 || ipOctets.some(o => isNaN(o) || o < 0 || o > 255)) {
    alert("Format IP Address tidak valid!");
    return;
  }

  const ipInt = ((ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3]) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const broadInt = (netInt | (~maskInt >>> 0)) >>> 0;

  const netAddr = [(netInt >>> 24) & 255, (netInt >>> 16) & 255, (netInt >>> 8) & 255, netInt & 255].join('.');
  const broadAddr = [(broadInt >>> 24) & 255, (broadInt >>> 16) & 255, (broadInt >>> 8) & 255, broadInt & 255].join('.');
  const usableHosts = Math.pow(2, 32 - cidr) - 2;

  document.getElementById('outNetmask').innerText = netmask;
  document.getElementById('outNetAddr').innerText = netAddr;
  document.getElementById('outBroadAddr').innerText = broadAddr;
  document.getElementById('outUsableHost').innerText = usableHosts.toLocaleString('id-ID');
}

// --- 3. Cash Tracker (LocalStorage) ---
let dataTransaksi = JSON.parse(localStorage.getItem('migu_transaksi')) || [];

function updateTrackerUI() {
  const listEl = document.getElementById('listTransaksi');
  listEl.innerHTML = '';
  let totalSaldo = 0;

  dataTransaksi.forEach((item) => {
    const li = document.createElement('li');
    li.className = item.tipe;
    const tanda = item.tipe === 'masuk' ? '+' : '-';
    li.innerHTML = `<span>${item.keterangan}</span> <strong>${tanda} ${formatRupiah(item.nominal)}</strong>`;
    listEl.appendChild(li);

    if (item.tipe === 'masuk') totalSaldo += item.nominal;
    else totalSaldo -= item.nominal;
  });

  document.getElementById('outSaldo').innerText = formatRupiah(totalSaldo);
  localStorage.setItem('migu_transaksi', JSON.stringify(dataTransaksi));
}

function tambahTransaksi() {
  const ket = document.getElementById('keterangan').value.trim();
  const nom = parseFloat(document.getElementById('nominal').value);
  const tipe = document.getElementById('tipe').value;

  if (!ket || isNaN(nom) || nom <= 0) {
    alert("Keterangan dan nominal harus diisi dengan benar!");
    return;
  }

  dataTransaksi.push({ keterangan: ket, nominal: nom, tipe: tipe });
  document.getElementById('keterangan').value = '';
  document.getElementById('nominal').value = '';

  updateTrackerUI();
}

function hapusSemuaTransaksi() {
  if (confirm("Hapus seluruh daftar transaksi?")) {
    dataTransaksi = [];
    updateTrackerUI();
  }
}

// --- 4. Berita API (Menggunakan CORS Proxy Safe) ---
async function muatBerita() {
  const container = document.getElementById('news-container');
  const loading = document.getElementById('loading');

  if (!container || container.children.length > 0) return;

  const targetApi = 'https://api-berita-indonesia.vercel.app/cnn/terbaru/';
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetApi)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Jaringan bermasalah');
    
    const wrapperData = await response.json();
    const result = JSON.parse(wrapperData.contents);

    loading.style.display = 'none';

    result.data.posts.slice(0, 6).forEach(item => {
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <img src="${item.thumbnail}" alt="Gambar Berita" onerror="this.src='https://via.placeholder.com/320x190?text=Berita+Migu'">
        <div class="news-card-body">
          <h3>${item.title}</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.75rem;">
            ${new Date(item.pubDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <a href="${item.link}" target="_blank" rel="noopener">Baca Selengkapnya &rarr;</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error berita:', error);
    loading.innerText = 'Gagal memuat berita terkini. Silakan segarkan halaman.';
  }
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
  hitungInvestasi();
  hitungSubnet();
  updateTrackerUI();
});
