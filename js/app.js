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
    kit: 'Survival Kit',
    seed: 'Seed Packet',
    recipe: 'Recipe Card'
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
      kit: renderSurvivalKit,
      seed: renderSeedPacket,
      recipe: renderRecipeCard
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

  function renderSurvivalKit() {
    const kit = CONFIG.survivalKit;
    const items = kit.items.map((item, index) => `
      <button class="kit-card" data-kit-item="${index}" type="button">
        <span class="kit-icon">${escapeHtml(item.icon)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>Buka pesan</small>
      </button>
    `).join('');

    openModal(`
      <p class="eyebrow">little survival kit</p>
      <h2 class="modal-title">${escapeHtml(kit.title)}</h2>
      <p class="modal-subtitle">${escapeHtml(kit.subtitle)}<br><strong>${escapeHtml(kit.note)}</strong></p>
      <div class="kit-layout">
        <section class="kit-visual" aria-hidden="true">
          <div class="kit-box">
            <span class="kit-cross">✚</span>
            <span class="kit-label">for heavy days</span>
          </div>
        </section>
        <section>
          <div class="kit-grid">${items}</div>
          <div class="kit-message" id="kitMessage">Pilih salah satu item kecil di atas.</div>
        </section>
      </div>
    `);

    $$('[data-kit-item]', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        const item = kit.items[Number(button.dataset.kitItem)];
        $$('.kit-card', els.modalContent).forEach((card) => card.classList.remove('active'));
        button.classList.add('active');
        $('#kitMessage').innerHTML = `<strong>${escapeHtml(item.icon)} ${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}`;
        confetti(8);
      });
    });
  }

  function renderSeedPacket() {
    const packet = CONFIG.seedPacket;
    const seeds = packet.seeds.map((seed, index) => `
      <button class="seed-card" data-seed="${index}" type="button" style="--r:${[-2, 3, -3, 2, -1, 3][index % 6]}deg">
        <span class="seed-dot"></span>
        <strong>Benih ${escapeHtml(seed.title)}</strong>
      </button>
    `).join('');

    openModal(`
      <p class="eyebrow">seed packet</p>
      <h2 class="modal-title">${escapeHtml(packet.title)}</h2>
      <p class="modal-subtitle">${escapeHtml(packet.subtitle)}<br><strong>${escapeHtml(packet.instruction)}</strong></p>
      <div class="seed-layout">
        <section class="seed-envelope" aria-hidden="true">
          <span class="seed-envelope-title">birthday seeds</span>
          <span class="seed-envelope-line"></span>
          <span class="seed-flower">✿</span>
        </section>
        <section>
          <div class="seed-grid">${seeds}</div>
          <div class="seed-message" id="seedMessage">Belum ada benih yang ditanam.</div>
        </section>
      </div>
    `);

    $$('[data-seed]', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        const seed = packet.seeds[Number(button.dataset.seed)];
        button.classList.add('planted');
        $('#seedMessage').innerHTML = `<span class="grown-flower">✿</span><strong>Benih ${escapeHtml(seed.title)} tumbuh.</strong><br>${escapeHtml(seed.text)}`;
        confetti(12);
      });
    });
  }

  function renderRecipeCard() {
    const recipe = CONFIG.recipeCard;
    const ingredients = recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join('');
    const steps = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');

    openModal(`
      <p class="eyebrow">recipe card</p>
      <h2 class="modal-title">${escapeHtml(recipe.title)}</h2>
      <p class="modal-subtitle">${escapeHtml(recipe.subtitle)}</p>
      <div class="recipe-layout">
        <section class="recipe-card-main">
          <span class="recipe-tape"></span>
          <h3>${escapeHtml(recipe.ingredientsTitle)}</h3>
          <ul class="recipe-list">${ingredients}</ul>
        </section>
        <section class="recipe-card-steps">
          <h3>${escapeHtml(recipe.stepsTitle)}</h3>
          <ol class="recipe-steps">${steps}</ol>
          <div class="recipe-closing">${escapeHtml(recipe.closing)}</div>
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
        <li>Untuk mengganti nama, teks, foto, dan isi scrapbook, edit file <strong>js/config.js</strong>.</li>
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
