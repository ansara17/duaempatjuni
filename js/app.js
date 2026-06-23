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
      <div class="kit-layout animated-kit-layout survival-v35-layout">
        <section class="kit-visual animated-kit-visual survival-v35-visual">
          <div class="kit-mood-scene survival-v35-scene" id="kitMoodScene">
            <div class="mood-sun"></div>
            <div class="mood-cloud cloud-a"></div>
            <div class="mood-cloud cloud-b"></div>
            <svg class="character-svg mood-0" id="kitCharacter" viewBox="0 0 260 300" role="img" aria-label="Ilustrasi perempuan kecil yang mood-nya membaik">
              <defs>
                <linearGradient id="skinGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#ffdfcf" />
                  <stop offset="1" stop-color="#f0b89f" />
                </linearGradient>
                <linearGradient id="dressGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="#fff0dc" />
                  <stop offset="1" stop-color="#d98695" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#503b2f" flood-opacity=".18" />
                </filter>
              </defs>
              <ellipse class="char-shadow" cx="130" cy="276" rx="62" ry="13" fill="rgba(80,59,47,.14)" />
              <g class="char-body" filter="url(#softShadow)">
                <path class="char-dress" d="M76 244c4-50 31-75 54-75s50 25 54 75c1 12-8 22-21 22H97c-13 0-22-10-21-22Z" fill="url(#dressGrad)" />
                <path class="char-arm arm-left" d="M88 207c-22 12-29 25-22 34 6 8 20 2 35-14" fill="none" stroke="#f0b89f" stroke-width="15" stroke-linecap="round" />
                <path class="char-arm arm-right" d="M172 207c22 12 29 25 22 34-6 8-20 2-35-14" fill="none" stroke="#f0b89f" stroke-width="15" stroke-linecap="round" />
                <path class="char-hair-back" d="M78 130c0-44 24-73 52-73s52 29 52 73c0 36-15 73-52 73s-52-37-52-73Z" fill="#161213" />
                <path class="char-hair-side left" d="M79 126c-16 20-16 63-3 91 20-18 28-51 24-86Z" fill="#211819" />
                <path class="char-hair-side right" d="M181 126c16 20 16 63 3 91-20-18-28-51-24-86Z" fill="#211819" />
                <ellipse class="char-face" cx="130" cy="134" rx="47" ry="52" fill="url(#skinGrad)" />
                <path class="char-bang" d="M91 106c23-42 74-42 85-1-24-12-48-9-85 1Z" fill="#0e0c0d" />
                <path class="char-cap" d="M82 89c19-26 76-37 105-5-17 13-74 22-105 5Z" fill="#d98695" />
                <path class="char-cap-top" d="M111 66c18-13 45-10 58 7-18 9-39 12-58-7Z" fill="#b86478" opacity=".95" />
                <path class="char-brow brow-left" d="M103 130q8-7 17 0" fill="none" stroke="#6e463f" stroke-width="4" stroke-linecap="round" />
                <path class="char-brow brow-right" d="M140 130q9-7 18 0" fill="none" stroke="#6e463f" stroke-width="4" stroke-linecap="round" />
                <ellipse class="char-eye eye-left" cx="112" cy="143" rx="5" ry="7" fill="#4e332f" />
                <ellipse class="char-eye eye-right" cx="148" cy="143" rx="5" ry="7" fill="#4e332f" />
                <ellipse class="char-blush blush-left" cx="104" cy="160" rx="10" ry="5" fill="#d98695" opacity=".22" />
                <ellipse class="char-blush blush-right" cx="156" cy="160" rx="10" ry="5" fill="#d98695" opacity=".22" />
                <path class="mouth mouth-sad" d="M114 174q16-14 32 0" fill="none" stroke="#6e463f" stroke-width="5" stroke-linecap="round" />
                <path class="mouth mouth-flat" d="M116 171q14 2 28 0" fill="none" stroke="#6e463f" stroke-width="5" stroke-linecap="round" />
                <path class="mouth mouth-soft" d="M116 169q14 12 28 0" fill="none" stroke="#6e463f" stroke-width="5" stroke-linecap="round" />
                <path class="mouth mouth-happy" d="M111 166q19 20 38 0" fill="none" stroke="#6e463f" stroke-width="5" stroke-linecap="round" />
                <text class="char-heart" x="130" y="224" text-anchor="middle">♡</text>
              </g>
            </svg>
            <div class="mood-meter" aria-hidden="true"><span id="moodFill"></span></div>
            <p class="mood-text" id="moodText">Mood: ${escapeHtml(kit.moodLabels?.[0] || 'masih mendung')}</p>
          </div>
        </section>
        <section>
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
    const character = $('#kitCharacter');
    const scene = $('#kitMoodScene');
    const fill = $('#moodFill');
    const text = $('#moodText');
    const moodIndex = Math.min(5, Math.ceil((count / total) * 5));
    if (character) character.setAttribute('class', `character-svg mood-${moodIndex}`);
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
