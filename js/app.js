// --- Navigation Tab System ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// Helper: Format Rupiah
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

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
    alert("Format IP Address salah!");
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

  dataTransaksi.forEach((item, index) => {
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
    alert("Masukkan keterangan dan nominal yang valid!");
    return;
  }

  dataTransaksi.push({ keterangan: ket, nominal: nom, tipe: tipe });
  document.getElementById('keterangan').value = '';
  document.getElementById('nominal').value = '';

  updateTrackerUI();
}

function hapusSemuaTransaksi() {
  if (confirm("Apakah Anda yakin ingin menghapus semua catatan?")) {
    dataTransaksi = [];
    updateTrackerUI();
  }
}

// Inisialisasi awal saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
  hitungInvestasi();
  updateTrackerUI();
});
