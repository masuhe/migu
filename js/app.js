// --- Navigation & Mobile Toggle ---
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  element.classList.add('active');

  document.getElementById('navMenu').classList.remove('active');
}

function toggleMobileNav() {
  document.getElementById('navMenu').classList.toggle('active');
}

// --- 1. JOB SCHEDULE SYSTEM ---
let dataJadwal = JSON.parse(localStorage.getItem('migu_schedules')) || [];

function simpanJadwalKeStorage() {
  localStorage.setItem('migu_schedules', JSON.stringify(dataJadwal));
  renderJadwal();
}

function tambahJadwal(e) {
  e.preventDefault();
  const judul = document.getElementById('judulJadwal').value.trim();
  const kategori = document.getElementById('kategoriJadwal').value;
  const tgl = document.getElementById('tglJadwal').value;
  const jam = document.getElementById('jamJadwal').value;
  const prioritas = document.getElementById('prioritasJadwal').value;
  const catatan = document.getElementById('catatanJadwal').value.trim();

  const itemBaru = {
    id: Date.now(),
    judul,
    kategori,
    tgl,
    jam,
    prioritas,
    catatan
  };

  dataJadwal.push(itemBaru);
  simpanJadwalKeStorage();
  document.getElementById('formSchedule').reset();
}

function hapusJadwal(id) {
  dataJadwal = dataJadwal.filter(item => item.id !== id);
  simpanJadwalKeStorage();
}

function renderJadwal() {
  const container = document.getElementById('listJadwal');
  const countEl = document.getElementById('countJadwal');
  container.innerHTML = '';

  countEl.innerText = `${dataJadwal.length} Agenda`;

  if (dataJadwal.length === 0) {
    container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Belum ada agenda kerja yang dicatat.</p>';
    return;
  }

  // Urutkan jadwal berdasarkan tanggal & jam terdekat
  dataJadwal.sort((a, b) => new Date(`${a.tgl}T${a.jam}`) - new Date(`${b.tgl}T${b.jam}`));

  dataJadwal.forEach(item => {
    const card = document.createElement('div');
    card.className = `schedule-card priority-${item.prioritas}`;
    
    // Format Tanggal Indonesia
    const tglFormatted = new Date(item.tgl).toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

    card.innerHTML = `
      <div class="schedule-info">
        <h4>${item.judul}</h4>
        <div class="schedule-meta">
          <span class="tag">${item.kategori}</span>
          <span>📅 ${tglFormatted}</span>
          <span>⏰ ${item.jam} WIB</span>
          <span style="font-weight:700;">• ${item.prioritas}</span>
        </div>
        ${item.catatan ? `<div class="schedule-note">📝 ${item.catatan}</div>` : ''}
      </div>
      <button class="btn-delete" onclick="hapusJadwal(${item.id})" title="Hapus Agenda">&times;</button>
    `;
    container.appendChild(card);
  });
}

// --- 2. TASK LIST SYSTEM ---
let dataTugas = JSON.parse(localStorage.getItem('migu_tasks')) || [];

function simpanTugasKeStorage() {
  localStorage.setItem('migu_tasks', JSON.stringify(dataTugas));
  renderTugas();
}

function tambahTugas(e) {
  e.preventDefault();
  const teks = document.getElementById('teksTugas').value.trim();
  if (!teks) return;

  dataTugas.push({
    id: Date.now(),
    teks,
    selesai: false
  });

  simpanTugasKeStorage();
  document.getElementById('formTask').reset();
}

function toggleStatusTugas(id) {
  dataTugas = dataTugas.map(item => {
    if (item.id === id) item.selesai = !item.selesai;
    return item;
  });
  simpanTugasKeStorage();
}

function hapusTugas(id) {
  dataTugas = dataTugas.filter(item => item.id !== id);
  simpanTugasKeStorage();
}

function bersihkanTugasSelesai() {
  dataTugas = dataTugas.filter(item => !item.selesai);
  simpanTugasKeStorage();
}

function renderTugas() {
  const container = document.getElementById('listTugas');
  container.innerHTML = '';

  const doneCount = dataTugas.filter(t => t.selesai).length;
  const pendingCount = dataTugas.length - doneCount;

  document.getElementById('taskDoneCount').innerText = doneCount;
  document.getElementById('taskPendingCount').innerText = pendingCount;

  if (dataTugas.length === 0) {
    container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Belum ada tugas di daftar To-Do.</p>';
    return;
  }

  dataTugas.forEach(item => {
    const li = document.createElement('li');
    li.className = `task-item ${item.selesai ? 'done' : ''}`;
    li.innerHTML = `
      <input type="checkbox" ${item.selesai ? 'checked' : ''} onchange="toggleStatusTugas(${item.id})">
      <span>${item.teks}</span>
      <button class="btn-delete" onclick="hapusTugas(${item.id})">&times;</button>
    `;
    container.appendChild(li);
  });
}

// --- 3. SUBNET CALCULATOR TOOL ---
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

// Inisialisasi Aplikasi saat Load
document.addEventListener('DOMContentLoaded', () => {
  renderJadwal();
  renderTugas();
  hitungSubnet();
  
  // Set default tanggal hari ini pada form jadwal
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tglJadwal').value = today;
});
