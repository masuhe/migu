async function muatBerita() {
  const container = document.getElementById('news-container');
  const loading = document.getElementById('loading');

  try {
    // Mengambil data dari API berita Indonesia open-source (CNN Indonesia)
    const response = await fetch('https://api-berita-indonesia.vercel.app/cnn/terbaru/');
    const result = await response.json();

    loading.style.display = 'none';

    // Menampilkan 6 berita terbaru
    result.data.posts.slice(0, 6).forEach(item => {
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <img src="${item.thumbnail}" alt="Gambar Berita">
        <div class="news-card-body">
          <h3>${item.title}</h3>
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;">
            ${new Date(item.pubDate).toLocaleDateString('id-ID')}
          </p>
          <a href="${item.link}" target="_blank" rel="noopener">Baca Selengkapnya &rarr;</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    loading.innerText = 'Gagal memuat berita. Silakan coba lagi nanti.';
    console.error(error);
  }
}

// Jalankan fungsi saat halaman dibuka
document.addEventListener('DOMContentLoaded', muatBerita);
