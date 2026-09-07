async function muatBerita() {
  const container = document.getElementById('news-container');
  const loading = document.getElementById('loading');

  if (!container) return; // Mencegah error jika elemen tidak ada di halaman

  // Menggunakan CORS Proxy gratis untuk menembus batasan browser
  const targetApi = 'https://api-berita-indonesia.vercel.app/cnn/terbaru/';
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetApi)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Jaringan bermasalah');
    
    const wrapperData = await response.json();
    const result = JSON.parse(wrapperData.contents);

    if (!result.data || !result.data.posts) {
      throw new Error('Format data berita tidak sesuai');
    }

    loading.style.display = 'none';
    container.innerHTML = ''; // Bersihkan container

    // Tampilkan 6 berita terbaru
    result.data.posts.slice(0, 6).forEach(item => {
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        <img src="${item.thumbnail}" alt="Gambar Berita" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
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
    console.error('Error muat berita:', error);
    loading.innerText = 'Gagal memuat berita. Silakan muat ulang halaman.';
  }
}
