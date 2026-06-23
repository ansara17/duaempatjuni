(() => {
  const CONFIG = window.SCRAPBOOK_CONFIG;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const state = {
    started: false,
    opened: new Set(),
    secretsFound: new Set(),
    letterTimer: null,
    currentTrack: 0
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
    clickSound: $('#clickSound'),
    musicPlayer: $('#musicPlayer'),
    musicDock: $('#musicDock'),
    musicToggle: $('#musicToggle'),
    musicNext: $('#musicNext'),
    musicTitle: $('#musicTitle'),
    musicStatus: $('#musicStatus'),
    musicProgress: $('#musicProgress'),
    musicProgressFill: $('#musicProgressFill'),
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
    initMusicPlayer();

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
      if (Array.isArray(CONFIG.tracks) && CONFIG.tracks.length) {
        els.musicDock.classList.remove('hidden');
      }
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

    els.musicToggle?.addEventListener('click', toggleMusic);
    els.musicNext?.addEventListener('click', nextTrack);
    els.musicPlayer?.addEventListener('play', updateMusicUI);
    els.musicPlayer?.addEventListener('pause', updateMusicUI);
    els.musicPlayer?.addEventListener('timeupdate', updateMusicUI);
    els.musicPlayer?.addEventListener('ended', nextTrack);
    els.musicProgress?.addEventListener('click', seekMusic);

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
  }

  function initMusicPlayer() {
    if (!Array.isArray(CONFIG.tracks) || CONFIG.tracks.length === 0) {
      els.musicDock?.classList.add('hidden');
      return;
    }
    loadTrack(0, false);
    updateMusicUI();
  }

  function loadTrack(index, autoplay = false) {
    const tracks = CONFIG.tracks || [];
    if (!tracks.length) return;
    state.currentTrack = (index + tracks.length) % tracks.length;
    const track = tracks[state.currentTrack];
    els.musicPlayer.src = withCache(track.file);
    els.musicTitle.textContent = track.title || `Lagu ${state.currentTrack + 1}`;
    els.musicStatus.textContent = 'Tekan play untuk memulai lagu';
    els.musicProgressFill.style.width = '0%';
    if (autoplay) {
      els.musicPlayer.play().catch(() => {
        els.musicStatus.textContent = 'Tekan play untuk memutar lagu';
      });
    }
  }

  function toggleMusic() {
    tap();
    if (!Array.isArray(CONFIG.tracks) || !CONFIG.tracks.length) {
      els.musicStatus.textContent = 'Belum ada lagu di config.js';
      return;
    }
    if (!els.musicPlayer.src) loadTrack(state.currentTrack, false);
    if (els.musicPlayer.paused) {
      els.musicPlayer.play().catch(() => {
        els.musicStatus.textContent = 'Browser meminta kamu menekan play sekali lagi';
      });
    } else {
      els.musicPlayer.pause();
    }
  }

  function nextTrack() {
    tap();
    const wasPlaying = els.musicPlayer && !els.musicPlayer.paused;
    loadTrack(state.currentTrack + 1, wasPlaying);
  }

  function seekMusic(event) {
    if (!els.musicPlayer.duration) return;
    const rect = els.musicProgress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    els.musicPlayer.currentTime = ratio * els.musicPlayer.duration;
  }

  function updateMusicUI() {
    if (!els.musicPlayer || !els.musicToggle) return;
    const tracks = CONFIG.tracks || [];
    const track = tracks[state.currentTrack];
    if (track) els.musicTitle.textContent = track.title || `Lagu ${state.currentTrack + 1}`;
    els.musicToggle.textContent = els.musicPlayer.paused ? '▶' : '❚❚';
    els.musicToggle.setAttribute('aria-label', els.musicPlayer.paused ? 'Putar musik' : 'Jeda musik');
    els.musicStatus.textContent = els.musicPlayer.paused ? 'Musik dijeda / belum diputar' : 'Musik sedang diputar';
    const progress = els.musicPlayer.duration ? (els.musicPlayer.currentTime / els.musicPlayer.duration) * 100 : 0;
    els.musicProgressFill.style.width = `${progress}%`;
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
      if (state.opened.size === CONFIG.requiredToUnlockGift) unlockGift();
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
        <img src="${escapeAttribute(memory.src)}" alt="Kenangan ${index + 1}" data-lightbox-src="${escapeAttribute(memory.src)}" />
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
      <div class="letter-sheet letter-sheet-open" id="letterSheet"></div>
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
      <div class="survival-v36-layout">
        <section class="survival-v36-visual" aria-label="Ilustrasi mood yang berubah">
          <div class="survival-v36-scene" id="kitMoodScene" data-mood="0">
            <div class="svk-bg svk-bg-sun"></div>
            <div class="svk-bg svk-bg-cloud one"></div>
            <div class="svk-bg svk-bg-cloud two"></div>
            <svg class="svk-character" id="kitMoodCharacter" viewBox="0 0 320 300" role="img" aria-label="Ilustrasi perempuan kartun yang perlahan lebih bahagia">
              <defs>
                <linearGradient id="v36Skin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#ffe2d4" />
                  <stop offset="1" stop-color="#f0b69e" />
                </linearGradient>
                <linearGradient id="v36Sweater" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#fff0df" />
                  <stop offset="1" stop-color="#e8a1a9" />
                </linearGradient>
                <linearGradient id="v36Hair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#1e1717" />
                  <stop offset="1" stop-color="#47302d" />
                </linearGradient>
              </defs>
              <ellipse cx="160" cy="268" rx="76" ry="14" fill="rgba(80,59,47,.16)" />
              <g class="svk-person">
                <path class="svk-hair-back" d="M88 141c0-52 32-86 72-86s72 34 72 86c0 54-26 93-72 93s-72-39-72-93Z" fill="url(#v36Hair)" />
                <path d="M91 148c-14 21-15 58-1 78 20-18 26-49 22-83Z" fill="#2b1f1e" opacity=".95" />
                <path d="M229 148c14 21 15 58 1 78-20-18-26-49-22-83Z" fill="#2b1f1e" opacity=".95" />
                <path class="svk-sweater" d="M90 246c7-49 35-76 70-76s63 27 70 76c2 14-9 25-25 25h-90c-16 0-27-11-25-25Z" fill="url(#v36Sweater)" />
                <path class="svk-arm left" d="M111 205c-28 18-38 34-30 44 8 10 26 1 47-20" fill="none" stroke="#f1b89f" stroke-width="18" stroke-linecap="round" />
                <path class="svk-arm right" d="M209 205c28 18 38 34 30 44-8 10-26 1-47-20" fill="none" stroke="#f1b89f" stroke-width="18" stroke-linecap="round" />
                <ellipse class="svk-face" cx="160" cy="137" rx="50" ry="55" fill="url(#v36Skin)" />
                <path class="svk-bang" d="M113 112c24-41 77-47 97-4-30-8-55-6-97 4Z" fill="#171212" />
                <path class="svk-hair-strand" d="M125 102c-7 18-4 35 7 45" fill="none" stroke="#2b1f1e" stroke-width="9" stroke-linecap="round" />
                <path class="svk-hair-strand" d="M194 104c6 18 2 34-8 44" fill="none" stroke="#2b1f1e" stroke-width="9" stroke-linecap="round" />
                <path class="svk-headband" d="M112 101c27-20 73-20 96 1" fill="none" stroke="#e69aa4" stroke-width="8" stroke-linecap="round" />
                <path class="svk-brow brow-left" d="M132 135q10-8 21 0" fill="none" stroke="#70483f" stroke-width="4" stroke-linecap="round" />
                <path class="svk-brow brow-right" d="M167 135q11-8 22 0" fill="none" stroke="#70483f" stroke-width="4" stroke-linecap="round" />
                <ellipse class="svk-eye eye-left" cx="142" cy="149" rx="5.5" ry="7" fill="#4e332f" />
                <ellipse class="svk-eye eye-right" cx="178" cy="149" rx="5.5" ry="7" fill="#4e332f" />
                <ellipse class="svk-blush blush-left" cx="132" cy="166" rx="12" ry="6" fill="#d98695" opacity=".18" />
                <ellipse class="svk-blush blush-right" cx="188" cy="166" rx="12" ry="6" fill="#d98695" opacity=".18" />
                <path class="svk-mouth mouth-sad" d="M143 181q17-14 34 0" fill="none" stroke="#70483f" stroke-width="5" stroke-linecap="round" />
                <path class="svk-mouth mouth-flat" d="M144 178q16 2 32 0" fill="none" stroke="#70483f" stroke-width="5" stroke-linecap="round" />
                <path class="svk-mouth mouth-soft" d="M145 176q15 12 30 0" fill="none" stroke="#70483f" stroke-width="5" stroke-linecap="round" />
                <path class="svk-mouth mouth-happy" d="M141 173q19 20 38 0" fill="none" stroke="#70483f" stroke-width="5" stroke-linecap="round" />
                <text class="svk-heart" x="160" y="231" text-anchor="middle">♡</text>
              </g>
              <g class="svk-sparkles">
                <text x="90" y="84">✦</text>
                <text x="238" y="106">♡</text>
                <text x="72" y="186">✧</text>
              </g>
            </svg>
            <div class="mood-meter v36" aria-hidden="true"><span id="moodFill"></span></div>
            <p class="mood-text v36" id="moodText">Mood: ${escapeHtml(kit.moodLabels?.[0] || 'masih mendung')}</p>
          </div>
        </section>
        <section class="survival-v36-items">
          <div class="kit-grid">${items}</div>
          <div class="kit-message" id="kitMessage">Pilih satu item kecil di atas. Setiap item akan membuat murungnya berkurang sedikit.</div>
        </section>
      </div>
    `);

    const usedItems = new Set();
    const total = kit.items.length;

    $$('[data-kit-item]', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        const index = Number(button.dataset.kitItem);
        const item = kit.items[index];
        usedItems.add(index);
        button.classList.add('active', 'used');
        $('#kitMessage').innerHTML = `<strong>${escapeHtml(item.icon)} ${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}`;
        updateKitMood(usedItems.size, total, kit);
        confetti(usedItems.size === total ? 36 : 8);
      });
    });
  }

  function updateKitMood(count, total, kit) {
    const scene = $('#kitMoodScene');
    const fill = $('#moodFill');
    const text = $('#moodText');
    const moodIndex = Math.min(5, Math.ceil((count / total) * 5));
    if (scene) scene.dataset.mood = String(moodIndex);
    if (fill) fill.style.width = `${Math.round((count / total) * 100)}%`;
    if (text) text.textContent = `Mood: ${kit.moodLabels?.[moodIndex] || (count === total ? 'bahagia' : 'membaik')}`;

    if (count === total) {
      scene?.classList.add('complete');
      $('#kitMessage').innerHTML = `<strong>Semua item sudah dipakai.</strong><br>${escapeHtml(kit.complete || 'Semoga hari-harimu terasa lebih ringan.')}`;
    }
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
      <div class="seed-layout animated-seed-layout">
        <section class="garden-scene" id="gardenScene" aria-label="Taman bunga kecil">
          <div class="garden-sky">
            <span class="garden-sun"></span>
            <span class="garden-cloud one"></span>
            <span class="garden-cloud two"></span>
          </div>
          <div class="garden-flowers" id="gardenFlowers"></div>
          <div class="garden-soil"></div>
          <div class="garden-complete-note" id="gardenCompleteNote">Tanam benihnya satu per satu.</div>
        </section>
        <section>
          <div class="seed-grid">${seeds}</div>
          <div class="seed-message" id="seedMessage">Belum ada benih yang ditanam.</div>
        </section>
      </div>
    `);

    const planted = new Set();
    const positions = [
      { left: 12, size: 1.00, color: 'rose' },
      { left: 28, size: 1.18, color: 'gold' },
      { left: 44, size: .92, color: 'sage' },
      { left: 59, size: 1.24, color: 'blue' },
      { left: 73, size: 1.04, color: 'rose' },
      { left: 86, size: .96, color: 'gold' }
    ];

    $$('[data-seed]', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        const index = Number(button.dataset.seed);
        const seed = packet.seeds[index];
        if (planted.has(index)) {
          $('#seedMessage').innerHTML = `<span class="grown-flower">✿</span><strong>Benih ${escapeHtml(seed.title)} sudah tumbuh.</strong><br>${escapeHtml(seed.text)}`;
          return;
        }

        planted.add(index);
        button.classList.add('planted');
        growFlower(index, positions[index % positions.length]);
        $('#seedMessage').innerHTML = `<span class="grown-flower">✿</span><strong>Benih ${escapeHtml(seed.title)} tumbuh.</strong><br>${escapeHtml(seed.text)}`;
        confetti(planted.size === packet.seeds.length ? 46 : 12);

        if (planted.size === packet.seeds.length) {
          $('#gardenScene').classList.add('complete');
          $('#gardenCompleteNote').textContent = packet.complete || 'Tamannya sudah tumbuh.';
          addButterflies();
        }
      });
    });
  }

  function growFlower(index, position) {
    const flower = document.createElement('span');
    flower.className = `garden-flower flower-${position.color}`;
    flower.style.left = `${position.left}%`;
    flower.style.setProperty('--flower-scale', position.size);
    flower.style.animationDelay = `${index * 40}ms`;
    flower.innerHTML = `
      <i class="flower-stem"></i>
      <b class="flower-head">✿</b>
      <i class="flower-leaf leaf-a"></i>
      <i class="flower-leaf leaf-b"></i>
    `;
    $('#gardenFlowers').appendChild(flower);
  }

  function addButterflies() {
    const garden = $('#gardenScene');
    ['🦋', '✦', '🦋'].forEach((symbol, index) => {
      const butterfly = document.createElement('span');
      butterfly.className = `butterfly butterfly-${index + 1}`;
      butterfly.textContent = symbol;
      garden.appendChild(butterfly);
    });
  }

  function renderRecipeCard() {
    const recipe = CONFIG.recipeCard;
    const icons = ['🍰', '🍓', '☁️', '✨', '🫶', '🌙'];
    const ingredientButtons = recipe.ingredients.map((ingredient, index) => `
      <button class="ingredient-chip" data-ingredient="${index}" type="button">
        <span>${icons[index % icons.length]}</span>
        ${escapeHtml(ingredient)}
      </button>
    `).join('');
    const steps = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');

    openModal(`
      <p class="eyebrow">recipe card</p>
      <h2 class="modal-title">${escapeHtml(recipe.title)}</h2>
      <p class="modal-subtitle">${escapeHtml(recipe.subtitle)}<br><strong>Klik bahan-bahannya. Kue tart kecilnya akan tersusun pelan-pelan.</strong></p>
      <div class="recipe-layout animated-recipe-layout cake-recipe-layout">
        <section class="recipe-card-main interactive-recipe-card">
          <span class="recipe-tape"></span>
          <h3>${escapeHtml(recipe.ingredientsTitle)}</h3>
          <div class="ingredient-list">${ingredientButtons}</div>
        </section>
        <section class="cake-building-area">
          <div class="cake-builder" id="cakeBuilder" aria-label="Animasi merangkai kue tart ulang tahun">
            <div class="cake-sparkle sparkle-one">✦</div>
            <div class="cake-sparkle sparkle-two">♡</div>
            <div class="cake-sparkle sparkle-three">✧</div>
            <div class="cake-stand"></div>
            <div class="cake-layer layer-bottom"></div>
            <div class="cake-cream cream-bottom"></div>
            <div class="cake-layer layer-top"></div>
            <div class="cake-cream cream-top"></div>
            <div class="cake-drip drip-a"></div>
            <div class="cake-drip drip-b"></div>
            <div class="cake-drip drip-c"></div>
            <div class="cake-topping topping-a"></div>
            <div class="cake-topping topping-b"></div>
            <div class="cake-topping topping-c"></div>
            <div class="cake-candle-small candle-a"><span></span></div>
            <div class="cake-candle-small candle-b"><span></span></div>
            <div class="cake-plate-small"></div>
          </div>
          <div class="recipe-message" id="recipeMessage">Kuenya belum dirangkai. Pilih bahan satu per satu.</div>
          <section class="recipe-card-steps hidden" id="recipeStepsBox">
            <h3>${escapeHtml(recipe.stepsTitle)}</h3>
            <ol class="recipe-steps">${steps}</ol>
            <div class="recipe-closing">${escapeHtml(recipe.complete || recipe.closing)}</div>
          </section>
        </section>
      </div>
    `);

    const mixed = new Set();
    const total = recipe.ingredients.length;

    $$('[data-ingredient]', els.modalContent).forEach((button) => {
      button.addEventListener('click', () => {
        tap();
        const index = Number(button.dataset.ingredient);
        if (mixed.has(index)) return;
        mixed.add(index);
        button.classList.add('used');
        addIngredientToCake(index);
        updateRecipeCake(mixed.size, total);

        if (mixed.size === total) {
          $('#cakeBuilder').classList.add('complete');
          $('#recipeStepsBox').classList.remove('hidden');
          $('#recipeMessage').textContent = recipe.closing;
          confetti(42);
        } else {
          $('#recipeMessage').textContent = `${mixed.size}/${total} bahan sudah dipakai. Kue tartnya mulai terbentuk.`;
          confetti(8);
        }
      });
    });
  }

  function updateRecipeCake(count, total) {
    const cake = $('#cakeBuilder');
    if (!cake) return;
    cake.dataset.step = String(count);
    cake.style.setProperty('--cake-progress', (count / total).toFixed(2));
  }

  function addIngredientToCake(index) {
    const cake = $('#cakeBuilder');
    if (!cake) return;
    const symbols = ['🍰', '🍓', '☁️', '✨', '🫶', '🌙'];
    const chip = document.createElement('span');
    chip.className = 'cake-falling-ingredient';
    chip.textContent = symbols[index % symbols.length];
    chip.style.left = `${18 + (index % 6) * 12}%`;
    chip.style.setProperty('--fall-x', `${-26 + (index % 6) * 10}px`);
    chip.style.animationDelay = `${index * 20}ms`;
    cake.appendChild(chip);
    window.setTimeout(() => chip.remove(), 1100);
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
      <div class="gift-content animated-final-gift">
        <p class="eyebrow">final gift</p>
        <h2 class="modal-title">${escapeHtml(CONFIG.finalGift.title)}</h2>
        <p class="modal-subtitle">${escapeHtml(CONFIG.finalGift.beforeBlow)}</p>
        <div class="final-gift-stage" id="finalGiftStage">
          <div class="gift-box-anim" id="giftBoxAnim">
            <div class="gift-glow"></div>
            <div class="gift-lid"></div>
            <div class="gift-box-body"></div>
            <div class="gift-ribbon-anim vertical"></div>
            <div class="gift-ribbon-anim horizontal"></div>
          </div>
          <div class="surprise-cake hidden" id="surpriseCake">
            <div class="candle"><span class="flame"></span><span class="smoke">⌁</span></div>
            <div class="cake-body"></div>
            <div class="cake-plate"></div>
          </div>
        </div>
        <div class="gift-actions">
          <button class="primary-btn" id="openGiftRibbonBtn">${escapeHtml(CONFIG.finalGift.openButton || 'Buka pitanya 🎀')}</button>
          <button class="primary-btn hidden" id="blowCandleBtn">${escapeHtml(CONFIG.finalGift.blowButton)}</button>
        </div>
        <div id="finalMessageBox"></div>
      </div>
    `);

    $('#openGiftRibbonBtn').addEventListener('click', () => {
      tap();
      $('#giftBoxAnim').classList.add('open');
      $('#openGiftRibbonBtn').classList.add('hidden');
      window.setTimeout(() => {
        $('#surpriseCake').classList.remove('hidden');
        $('#blowCandleBtn').classList.remove('hidden');
        confetti(28);
      }, 650);
    });

    $('#blowCandleBtn').addEventListener('click', () => {
      tap();
      $('#surpriseCake').classList.add('blown');
      $('#blowCandleBtn').classList.add('hidden');
      $('#finalMessageBox').innerHTML = `
        <h2 class="modal-title final-title-reveal">${escapeHtml(CONFIG.finalGift.afterBlowTitle)}</h2>
        <p class="final-message final-message-reveal">${escapeHtml(CONFIG.finalGift.message)}</p>
      `;
      confetti(70);
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
        <li>Untuk mengganti nama, teks, foto, dan efek klik, edit file <strong>js/config.js</strong>.</li>
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

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('`', '&#096;');
  }

  init();
})();
