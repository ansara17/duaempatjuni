(() => {
  const CONFIG = window.SCRAPBOOK_CONFIG;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const state = {
    started: false,
    opened: new Set(),
    currentTrack: 0,
    secretsFound: new Set(),
    letterTimer: null
  };

  const els = {
    introScreen: $('#introScreen'),
    deskScreen: $('#deskScreen'),
    startBtn: $('#startBtn'),
    introTitle: $('#introTitle'),
    introSubtitle: $('#introSubtitle'),
    deskTitle: $('#deskTitle'),
    progressText: $('#progressText'),
    stampRail: $('#stampRail'),
    modal: $('#modal'),
    modalCard: $('#modalCard'),
    modalContent: $('#modalContent'),
    themeBtn: $('#themeBtn'),
    helpBtn: $('#helpBtn'),
    musicPlayer: $('#musicPlayer'),
    clickSound: $('#clickSound'),
    lightbox: $('#lightbox'),
    lightboxImg: $('#lightboxImg'),
    closeLightbox: $('#closeLightbox'),
    giftLock: $('#giftLock')
  };

  const CACHE_BUSTER = Date.now();

  const itemNames = {
    polaroid: 'Polaroid',
    letter: 'Letter',
    jar: 'Wish Jar',
    cassette: 'Cassette',
    passport: 'Passport'
  };

  function init() {
    document.title = `${CONFIG.recipient} — Birthday Scrapbook`;
    els.introTitle.textContent = CONFIG.introTitle;
    els.introSubtitle.textContent = CONFIG.introSubtitle;
    els.deskTitle.textContent = CONFIG.deskTitle;

    if (CONFIG.clickSound) els.clickSound.src = withCache(CONFIG.clickSound);

    bindEvents();
    updateProgress();
    makeFloatingHeartLoop();
  }

  function bindEvents() {
    els.startBtn.addEventListener('click', () => {
      tap();
      state.started = true;
      els.introScreen.classList.add('hidden');
      els.deskScreen.classList.remove('hidden');
      confetti(18);
    });

    $$('.desk-item').forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        openItem(button.dataset.item);
      });
    });

    $$('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        closeLightbox();
      }
    });

    els.themeBtn.addEventListener('click', () => {
      tap();
      document.body.classList.toggle('night');
      els.themeBtn.textContent = document.body.classList.contains('night') ? 'Mode terang' : 'Mode malam';
    });

    els.helpBtn.addEventListener('click', () => {
      tap();
      openHelp();
    });

    $$('.secret-heart').forEach((heart) => {
      heart.addEventListener('click', () => {
        tap();
        const id = heart.dataset.secret;
        state.secretsFound.add(id);
        heart.classList.add('found');
        if (state.secretsFound.size >= CONFIG.secret.unlockedAfter) {
          openSecretMessage();
          confetti(30);
        }
      });
    });

    els.closeLightbox.addEventListener('click', closeLightbox);
    els.lightbox.addEventListener('click', (event) => {
      if (event.target === els.lightbox) closeLightbox();
    });

    els.musicPlayer.addEventListener('timeupdate', updateMusicProgress);
    els.musicPlayer.addEventListener('play', updateCassetteMotion);
    els.musicPlayer.addEventListener('pause', updateCassetteMotion);
    els.musicPlayer.addEventListener('ended', updateCassetteMotion);
    els.musicPlayer.addEventListener('error', () => {
      const status = $('#musicStatus');
      if (status) {
        status.textContent = 'File lagu belum ditemukan. Masukkan file mp3 ke folder assets/music lalu samakan namanya di js/config.js.';
      }
    });
  }

  function openItem(item) {
    if (item === 'gift') {
      openGift();
      return;
    }

    markOpened(item);

    const renderers = {
      polaroid: renderPolaroid,
      letter: renderLetter,
      jar: renderWishJar,
      cassette: renderCassette,
      passport: renderPassport
    };

    renderers[item]?.();
  }

  function markOpened(item) {
    if (!state.opened.has(item)) {
      state.opened.add(item);
      const button = $(`[data-item="${item}"]`);
      if (button) button.classList.add('is-opened');
      updateProgress();
      if (state.opened.size === CONFIG.requiredToUnlockGift) {
        unlockGift();
      }
    }
  }

  function updateProgress() {
    const total = CONFIG.requiredToUnlockGift;
    els.progressText.textContent = `${state.opened.size}/${total} benda dibuka`;
    els.stampRail.innerHTML = '';

    Object.keys(itemNames).forEach((key) => {
      if (!state.opened.has(key)) return;
      const stamp = document.createElement('span');
      stamp.className = 'stamp';
      stamp.textContent = CONFIG.stamps[key] || itemNames[key];
      els.stampRail.appendChild(stamp);
    });

    if (state.opened.size === 0) {
      const hint = document.createElement('span');
      hint.className = 'status-text';
      hint.textContent = 'Belum ada stempel. Coba klik salah satu benda.';
      els.stampRail.appendChild(hint);
    }
  }

  function unlockGift() {
    const gift = $('[data-item="gift"]');
    gift.classList.remove('locked');
    gift.classList.add('unlocked');
    els.giftLock.textContent = '✨';
    confetti(26);
  }

  function openModal(html) {
    els.modalContent.innerHTML = html;
    els.modal.classList.add('show');
    els.modal.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => els.modalCard.focus(), 30);
  }

  function closeModal() {
    clearTimeout(state.letterTimer);
    els.modal.classList.remove('show');
    els.modal.setAttribute('aria-hidden', 'true');
  }

  function renderPolaroid() {
    const cards = CONFIG.memories.map((memory, index) => `
      <figure class="polaroid-card" style="--r:${[-3, 2, -1, 4, -4][index % 5]}deg">
        <img src="${memory.src}" alt="Kenangan ${index + 1}" data-lightbox-src="${memory.src}" />
        <p>${escapeHtml(memory.caption)}</p>
      </figure>
    `).join('');

    openModal(`
      <p class="eyebrow">polaroid memories</p>
      <h2 class="modal-title">Potongan kecil yang tersimpan</h2>
      <p class="modal-subtitle">Beberapa foto bisa diganti dari folder <strong>assets/images</strong>. Klik foto untuk melihat lebih dekat.</p>
      <div class="polaroid-grid">${cards}</div>
    `);

    $$('[data-lightbox-src]', els.modalContent).forEach((img) => {
      img.addEventListener('click', () => openLightbox(img.dataset.lightboxSrc, img.alt));
    });
  }

  function renderLetter() {
    openModal(`
      <p class="eyebrow">folded birthday letter</p>
      <h2 class="modal-title">Surat kecil untuk ${escapeHtml(CONFIG.recipient)}</h2>
      <p class="modal-subtitle">Kertas ini terbuka pelan-pelan, seperti ucapan yang sengaja disimpan sebentar sebelum dibaca.</p>
      <div class="letter-sheet" id="letterSheet"></div>
      <div class="wish-controls">
        <button class="mini-btn" id="skipLetterBtn">Tampilkan semua</button>
      </div>
    `);

    const fullText = CONFIG.letterParagraphs.join('\n\n');
    const sheet = $('#letterSheet');
    const skip = $('#skipLetterBtn');
    typeWriter(fullText, sheet, 22);
    skip.addEventListener('click', () => {
      tap();
      clearTimeout(state.letterTimer);
      sheet.textContent = fullText;
    });
  }

  function renderWishJar() {
    openModal(`
      <p class="eyebrow">birthday wish jar</p>
      <h2 class="modal-title">Toples kecil berisi doa</h2>
      <p class="modal-subtitle">Klik tombolnya untuk mengambil satu kertas doa secara acak.</p>
      <div class="wish-area">
        <div class="big-jar" aria-hidden="true"></div>
        <div>
          <div class="wish-paper" id="wishPaper">Ambil satu doa kecil dari toples ini.</div>
          <div class="wish-controls">
            <button class="primary-btn" id="takeWishBtn">Ambil doa ✨</button>
            <button class="mini-btn" id="allWishesBtn">Lihat semua</button>
          </div>
        </div>
      </div>
    `);

    $('#takeWishBtn').addEventListener('click', () => {
      tap();
      const wish = CONFIG.wishes[Math.floor(Math.random() * CONFIG.wishes.length)];
      const paper = $('#wishPaper');
      paper.textContent = wish;
      paper.style.transform = `rotate(${randomBetween(-3, 3)}deg)`;
      confetti(10);
    });

    $('#allWishesBtn').addEventListener('click', () => {
      tap();
      $('#wishPaper').innerHTML = CONFIG.wishes.map((wish) => `• ${escapeHtml(wish)}`).join('<br>');
    });
  }

  function renderCassette() {
    const tracks = CONFIG.tracks.map((track, index) => `
      <button class="track-button ${index === state.currentTrack ? 'active' : ''}" data-track="${index}">
        <span>${escapeHtml(track.title)}<br><small>${escapeHtml(track.note || '')}</small></span>
        <span>${index === state.currentTrack ? '♪' : 'play'}</span>
      </button>
    `).join('');

    openModal(`
      <p class="eyebrow">cassette player</p>
      <h2 class="modal-title">Birthday mixtape</h2>
      <p class="modal-subtitle">Bagian ini tetap untuk lagu. Masukkan file MP3 ke <strong>assets/music</strong>, lalu cocokkan namanya di <strong>js/config.js</strong>.</p>
      <div class="cassette-panel">
        <div>
          <div class="cassette-big" id="cassetteVisual">
            <span class="wheel left"></span>
            <span class="wheel right"></span>
          </div>
          <div class="player-row">
            <button class="primary-btn" id="musicToggleBtn">▶ Putar</button>
            <div class="progress-line"><div class="progress-fill" id="musicProgress"></div></div>
          </div>
          <p class="music-status" id="musicStatus">Pilih lagu, lalu tekan putar. Di iPhone, audio harus dimulai dari tap pengguna.</p>
        </div>
        <div class="track-list">${tracks}</div>
      </div>
    `);

    loadTrack(state.currentTrack, false);
    updateCassetteMotion();

    $$('.track-button', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        state.currentTrack = Number(button.dataset.track);
        $$('.track-button', els.modalContent).forEach((trackButton) => {
          const isActive = Number(trackButton.dataset.track) === state.currentTrack;
          trackButton.classList.toggle('active', isActive);
          const label = trackButton.querySelector('span:last-child');
          if (label) label.textContent = isActive ? '♪' : 'play';
        });
        loadTrack(state.currentTrack, true);
        updateCassetteMotion();
      });
    });

    $('#musicToggleBtn').addEventListener('click', () => {
      tap();
      if (els.musicPlayer.paused) {
        els.musicPlayer.play().catch(() => {
          const status = $('#musicStatus');
          if (status) status.textContent = 'Browser menolak autoplay. Coba tekan tombol putar sekali lagi.';
        });
      } else {
        els.musicPlayer.pause();
      }
      updateCassetteMotion();
    });
  }

  function loadTrack(index, autoplay) {
    const track = CONFIG.tracks[index];
    if (!track) return;

    const expectedSrc = new URL(withCache(track.file), window.location.href).href;
    if (els.musicPlayer.src !== expectedSrc) {
      els.musicPlayer.src = withCache(track.file);
    }

    if (autoplay) {
      els.musicPlayer.play().catch(() => {
        const status = $('#musicStatus');
        if (status) status.textContent = 'Tekan tombol putar untuk memulai lagu.';
      });
    }
  }

  function updateMusicProgress() {
    const progress = $('#musicProgress');
    if (!progress) return;
    const percent = els.musicPlayer.duration ? (els.musicPlayer.currentTime / els.musicPlayer.duration) * 100 : 0;
    progress.style.width = `${percent}%`;
  }

  function updateCassetteMotion() {
    const visual = $('#cassetteVisual');
    const button = $('#musicToggleBtn');
    const status = $('#musicStatus');
    if (!visual || !button) return;

    const playing = !els.musicPlayer.paused;
    visual.classList.toggle('playing', playing);
    button.textContent = playing ? '❚❚ Jeda' : '▶ Putar';

    if (status) {
      const track = CONFIG.tracks[state.currentTrack];
      status.textContent = playing ? `Sedang memutar: ${track.title}` : `Lagu terpilih: ${track.title}`;
    }
  }

  function renderPassport() {
    const passport = CONFIG.passport;
    const stamps = passport.stamps.map((stamp, index) => `
      <div class="passport-stamp" style="--r:${[-2, 3, -3, 2, -1, 3][index % 6]}deg">
        ${escapeHtml(stamp.title)}
        <span>${escapeHtml(stamp.text)}</span>
      </div>
    `).join('');

    openModal(`
      <p class="eyebrow">birthday passport</p>
      <h2 class="modal-title">${escapeHtml(passport.title)}</h2>
      <p class="modal-subtitle">Pengganti kalender: bukan hanya tanggal ulang tahun, tapi seperti paspor kecil menuju umur baru.</p>
      <div class="passport-card">
        <section class="passport-cover">
          <div>
            <p>Birthday Passport</p>
            <div class="crest">✦</div>
            <h3>${escapeHtml(CONFIG.recipient)}</h3>
          </div>
          <p>new age entry permit</p>
        </section>
        <section class="passport-detail">
          <div class="passport-field"><strong>${escapeHtml(passport.nameLabel)}</strong>${escapeHtml(passport.name)}</div>
          <div class="passport-field"><strong>${escapeHtml(passport.destinationLabel)}</strong>${escapeHtml(passport.destination)}</div>
          <div class="passport-field"><strong>${escapeHtml(passport.statusLabel)}</strong>${escapeHtml(passport.status)}</div>
          <div class="passport-field"><strong>${escapeHtml(passport.validLabel)}</strong>${escapeHtml(passport.valid)}</div>
          <div class="passport-stamps">${stamps}</div>
        </section>
      </div>
    `);
  }

  function openGift() {
    if (state.opened.size < CONFIG.requiredToUnlockGift) {
      openModal(`
        <p class="eyebrow">final gift</p>
        <h2 class="modal-title">${escapeHtml(CONFIG.finalGift.lockedTitle)}</h2>
        <p class="modal-subtitle">${escapeHtml(CONFIG.finalGift.lockedMessage)}</p>
        <div class="locked-note">Progress sekarang: ${state.opened.size}/${CONFIG.requiredToUnlockGift} stempel.</div>
      `);
      return;
    }

    openModal(`
      <div class="gift-content">
        <p class="eyebrow">final gift</p>
        <h2 class="modal-title">${escapeHtml(CONFIG.finalGift.title)}</h2>
        <p class="modal-subtitle">${escapeHtml(CONFIG.finalGift.beforeBlow)}</p>
        <div class="cake" id="cake">
          <div class="candle"><span class="flame"></span></div>
          <div class="cake-body"></div>
        </div>
        <button class="primary-btn" id="blowCandleBtn">${escapeHtml(CONFIG.finalGift.blowButton)}</button>
        <div id="finalMessageBox"></div>
      </div>
    `);

    $('#blowCandleBtn').addEventListener('click', () => {
      tap();
      $('#cake').classList.add('blown');
      $('#blowCandleBtn').classList.add('hidden');
      $('#finalMessageBox').innerHTML = `
        <h2 class="modal-title">${escapeHtml(CONFIG.finalGift.afterBlowTitle)}</h2>
        <p class="final-message">${escapeHtml(CONFIG.finalGift.message)}</p>
      `;
      confetti(60);
    });
  }

  function openHelp() {
    openModal(`
      <p class="eyebrow">cara pakai</p>
      <h2 class="modal-title">Cara membuka scrapbook ini</h2>
      <ul class="help-list">
        <li>Klik setiap benda di atas meja untuk membuka isi yang berbeda.</li>
        <li>Setiap benda yang dibuka akan memberi satu stempel.</li>
        <li>Kotak hadiah final baru terbuka setelah semua stempel terkumpul.</li>
        <li>Untuk mengganti nama, teks, foto, dan musik, edit file <strong>js/config.js</strong>.</li>
      </ul>
    `);
  }

  function openSecretMessage() {
    openModal(`
      <p class="eyebrow">hidden heart unlocked</p>
      <h2 class="modal-title">Pesan rahasia</h2>
      <div class="secret-box">${escapeHtml(CONFIG.secret.message)}</div>
    `);
  }

  function openLightbox(src, alt) {
    els.lightboxImg.src = src;
    els.lightboxImg.alt = alt;
    els.lightbox.classList.add('show');
    els.lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    els.lightbox.classList.remove('show');
    els.lightbox.setAttribute('aria-hidden', 'true');
    els.lightboxImg.src = '';
  }

  function typeWriter(text, element, speed = 24) {
    clearTimeout(state.letterTimer);
    element.textContent = '';
    let index = 0;

    function type() {
      if (index >= text.length) return;
      element.textContent += text[index];
      index += 1;
      state.letterTimer = window.setTimeout(type, speed);
    }

    type();
  }

  function tap() {
    if (!els.clickSound.src) return;
    els.clickSound.currentTime = 0;
    els.clickSound.play().catch(() => {});
  }

  function confetti(count = 28) {
    const colors = ['#d98695', '#f2b6bd', '#c9964f', '#9aac8a', '#fff8ed', '#809ab0'];
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4700);
    }
  }

  function makeFloatingHeartLoop() {
    window.setInterval(() => {
      if (document.hidden) return;
      const heart = document.createElement('span');
      heart.className = 'float-heart';
      heart.textContent = ['♥', '♡', '✦'][Math.floor(Math.random() * 3)];
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${15 + Math.random() * 17}px`;
      heart.style.animationDuration = `${6 + Math.random() * 4}s`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 11000);
    }, 1200);
  }

  function withCache(path) {
    if (!path) return '';
    return `${path}${path.includes('?') ? '&' : '?'}v=${CACHE_BUSTER}`;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  init();
})();
