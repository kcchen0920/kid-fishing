/* =========================================================
   歡樂釣魚大冒險 - Main Arcade Fishing Game Engine (v2)
   Full UI/UX + Player Progression + Ergonomic Arcade Polish
   ========================================================= */

(() => {
  const canvas = document.getElementById('ocean-canvas');
  const ctx = canvas.getContext('2d');

  // HUD & UI Elements
  const feverBorderEl = document.getElementById('fever-border');
  const rankDisplayEl = document.getElementById('rank-display');
  const rankIconEl = document.getElementById('rank-icon');
  const rankTitleEl = document.getElementById('rank-title');
  const rankXpRingEl = document.getElementById('rank-xp-ring');
  const starCountEl = document.getElementById('star-count');
  const basketFishRowEl = document.getElementById('basket-fish-row');
  const albumProgressEl = document.getElementById('album-progress');

  const feverBarWrapEl = document.getElementById('fever-bar-wrap');
  const feverFillEl = document.getElementById('fever-fill');
  const feverX2TagEl = document.getElementById('fever-x2-tag');
  const comboBadgeEl = document.getElementById('combo-badge');

  const motionIndicatorEl = document.getElementById('motion-indicator');
  const motionRodIconEl = document.getElementById('motion-rod-icon');
  const btnParentSettings = document.getElementById('btn-parent-settings');
  const parentHoldRingEl = document.getElementById('parent-hold-ring');

  const eventBannerEl = document.getElementById('event-banner');
  const eventBannerTextEl = document.getElementById('event-banner-text');

  const idleControlsEl = document.getElementById('idle-controls');
  const rodTagEl = document.getElementById('rod-tag');
  const btnBigCast = document.getElementById('btn-big-cast');

  const arcadeControlsEl = document.getElementById('arcade-controls');
  const reelProgressFillEl = document.getElementById('reel-progress-fill');
  const tugFishSliderEl = document.getElementById('tug-fish-slider');
  const tugFishEmojiEl = document.getElementById('tug-fish-emoji');
  const tugStatusFxEl = document.getElementById('tug-status-fx');

  const zapBtnEl = document.getElementById('btn-zap');
  const zapRingProgressEl = document.getElementById('zap-ring-progress');
  const reelCrankZoneEl = document.getElementById('reel-crank-zone');
  const reelWheelEl = document.getElementById('reel-wheel');
  const reelSpeedTagEl = document.getElementById('reel-speed-tag');

  // Modals
  const catchModalEl = document.getElementById('catch-modal');
  const catchFishCanvas = document.getElementById('catch-fish-canvas');
  const catchFishCtx = catchFishCanvas.getContext('2d');
  const catchStarsEl = document.getElementById('catch-stars');
  const catchNewBadgeEl = document.getElementById('catch-new-badge');
  const catchNameEl = document.getElementById('catch-name');
  const catchFunLineEl = document.getElementById('catch-fun-line');
  const catchRewardStarsEl = document.getElementById('catch-reward-stars');
  const btnCatchOk = document.getElementById('btn-catch-ok');

  const albumModalEl = document.getElementById('album-modal');
  const albumGridEl = document.getElementById('album-grid');
  const btnAlbum = document.getElementById('btn-album');
  const btnAlbumClose = document.getElementById('btn-album-close');

  const parentModalEl = document.getElementById('parent-modal');
  const btnParentClose = document.getElementById('btn-parent-close');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const btnToggleVoice = document.getElementById('btn-toggle-voice');
  const btnToggleMotion = document.getElementById('btn-toggle-motion');
  const btnResetSave = document.getElementById('btn-reset-save');

  const startScreenEl = document.getElementById('start-screen');
  const btnStartGame = document.getElementById('btn-start-game');

  // Fisher Ranks & Auto-Upgrading Fishing Rods!
  const RANKS = [
    { minStars: 0,   icon: '🫧', title: '泡泡新手', rodName: '🪵 木頭小釣竿', rodColor: '#ff7043', power: 1.00 },
    { minStars: 60,  icon: '🐠', title: '小魚達人', rodName: '🍬 彩虹糖果竿', rodColor: '#ff4081', power: 1.08 },
    { minStars: 160, icon: '🐢', title: '海龜夥伴', rodName: '🌊 海洋藍寶竿', rodColor: '#00b0ff', power: 1.15 },
    { minStars: 320, icon: '🦈', title: '鯊魚騎士', rodName: '⚡ 閃電黃金竿', rodColor: '#ffc400', power: 1.22 },
    { minStars: 550, icon: '👑', title: '海洋大王', rodName: '👑 鯨魚王者竿', rodColor: 'rainbow', power: 1.30 }
  ];

  const FISH_EMOJI = {
    clownfish: '🐠',
    blue_tang: '🐟',
    puffer: '🐡',
    jellyfish: '🪼',
    seahorse: '🐴',
    turtle: '🐢',
    octopus: '🐙',
    goldfish: '🥇',
    baby_shark: '🦈',
    narwhal: '🦄',
    treasure: '🎁',
    rainbow_whale: '🐳'
  };

  // Persistent Progress
  const STORAGE_KEY = 'arcade_fishing_kids_v1';
  let saveState = {
    stars: 0,
    caught: {},
    recentBasket: [] // latest 5 fish IDs
  };

  function getRankIndex(stars) {
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (stars >= RANKS[i].minStars) idx = i;
    }
    return idx;
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        saveState.stars = parsed.stars || 0;
        saveState.caught = parsed.caught || {};
        saveState.recentBasket = Array.isArray(parsed.recentBasket) ? parsed.recentBasket : [];
      }
    } catch (_) {}
    updateHud();
  }

  function persistSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
    } catch (_) {}
  }

  // Game State
  let width = window.innerWidth;
  let height = window.innerHeight;
  let waterSurfaceY = 120;
  let time = 0;
  let lastTime = performance.now();
  let screenShake = 0;

  let phase = 'idle'; // 'idle' | 'casting' | 'waiting' | 'reeling' | 'caught'
  let started = false;

  const particles = new window.ParticleSystem();
  let fishes = [];
  let hookedFish = null;

  const bobber = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    startX: 0,
    startY: 0,
    castT: 0,
    bobPhase: 0
  };

  // Reeling & Speed Tier state
  let reelProgress = 0;
  let reelAngle = 0;
  let spinSpeed = 0; // 0..100 for crank color tier & sparks!
  let rodBend = 0;
  let zapCharge = 55;
  let zapNotified = false;
  let shockTimer = 0;

  // Arcade Events & Combo
  let comboCount = 0;
  let feverCharge = 0;
  let feverTimer = 0;
  let bossCooldown = 22;
  let bannerTimer = 0;

  // Motion Sensor
  let motionEnabled = false;
  let lastMotionTrigger = 0;

  // Catch Modal preview
  let catchPreviewFish = null;

  // ---------------- Resize & Setup ----------------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    waterSurfaceY = Math.max(96, height * 0.16);
    particles.initScenery(width, height);
  }

  window.addEventListener('resize', resize);
  resize();

  // ---------------- Fish Spawning ----------------
  function pickRandomFishDef() {
    const pool = window.FISH_CATALOG.filter((f) => !f.isBoss);
    const totalWeight = pool.reduce((sum, f) => {
      const bonus = feverTimer > 0 && f.rarity >= 2 ? f.weight * 2.5 : f.weight;
      return sum + bonus;
    }, 0);
    let r = Math.random() * totalWeight;
    for (const f of pool) {
      const bonus = feverTimer > 0 && f.rarity >= 2 ? f.weight * 2.5 : f.weight;
      r -= bonus;
      if (r <= 0) return f;
    }
    return pool[0];
  }

  function spawnFish(defOverride = null, fromEdge = true) {
    const def = defOverride || pickRandomFishDef();
    const dir = Math.random() < 0.5 ? 1 : -1;
    const minY = waterSurfaceY + height * def.depthRange[0] * 0.75;
    const maxY = Math.min(height - 70, waterSurfaceY + height * def.depthRange[1] * 0.85);
    const y = minY + Math.random() * Math.max(20, maxY - minY);
    const x = fromEdge
      ? (dir === 1 ? -def.size * 1.5 : width + def.size * 1.5)
      : 60 + Math.random() * (width - 120);

    fishes.push({
      def,
      x,
      y,
      baseY: y,
      dir,
      speed: (55 + Math.random() * 45) * def.speed,
      phase: Math.random() * Math.PI * 2,
      state: 'swim',
      nibbleCount: 0,
      nibbleTimer: 0,
      puffed: 0,
      tapTimer: 0
    });
  }

  function populateOcean() {
    fishes = [];
    const targetCount = Math.min(13, Math.max(8, Math.floor(width / 85)));
    for (let i = 0; i < targetCount; i++) {
      spawnFish(null, false);
    }
  }

  function triggerBossEvent() {
    if (fishes.some((f) => f.def.isBoss)) return;
    const bossDef = window.FISH_BY_ID['rainbow_whale'];
    spawnFish(bossDef, true);
    showBanner('🐳 彩虹大鯨魚來了！', 'boss', 3.0);
    window.arcadeAudio.playBossAlert();
    window.arcadeAudio.speak('哇！彩虹大鯨魚來了！快拋竿！');
    screenShake = 10;
  }

  function triggerFeverMode() {
    feverTimer = 16;
    feverCharge = 100;
    feverBorderEl.classList.remove('hidden');
    feverBarWrapEl.classList.add('active');
    feverX2TagEl.classList.remove('hidden');
    showBanner('🌈 彩虹派對！星星 x2！', 'fever', 2.8);
    window.arcadeAudio.playFeverStart();
    window.arcadeAudio.speak('彩虹派對時間！星星變成兩倍囉！');
    for (let i = 0; i < 3; i++) {
      spawnFish(window.FISH_BY_ID['goldfish'], true);
    }
    particles.addConfetti(width / 2, height * 0.3, 45);
  }

  function showBanner(text, styleClass = '', duration = 2.0) {
    eventBannerTextEl.textContent = text;
    eventBannerEl.className = `event-banner ${styleClass}`;
    bannerTimer = duration;
  }

  // ---------------- Core Fishing Flow ----------------
  function castLine(targetX, targetY) {
    if (!started || phase === 'reeling' || phase === 'caught') return;

    const clampedX = Math.max(50, Math.min(width - 50, targetX));
    const clampedY = Math.max(waterSurfaceY + 26, Math.min(height - 95, targetY));

    phase = 'casting';
    bobber.startX = width / 2;
    bobber.startY = height - 20;
    bobber.x = bobber.startX;
    bobber.y = bobber.startY;
    bobber.targetX = clampedX;
    bobber.targetY = clampedY;
    bobber.castT = 0;
    idleControlsEl.classList.add('hidden');
    window.arcadeAudio.playCast();
  }

  function startReeling(fish) {
    phase = 'reeling';
    hookedFish = fish;
    fish.state = 'hooked';
    reelProgress = 26;
    spinSpeed = 0;
    shockTimer = 0;
    screenShake = 12;

    tugFishEmojiEl.textContent = FISH_EMOJI[fish.def.id] || '🐟';
    tugFishSliderEl.classList.add('struggling');
    tugStatusFxEl.textContent = '💦';

    arcadeControlsEl.classList.remove('hidden');
    showBanner('⚡ 咬鉤了！快轉轉轉！', '', 1.8);
    window.arcadeAudio.playBiteAlarm();
    particles.addSplash(fish.x, fish.y, 22, '#ffffff');
    particles.addRipple(fish.x, fish.y, 110, '#ffeb3b');
    particles.addPopup(fish.x, fish.y - 36, '咬鉤了！', '#ffeb3b', 34);
    updateReelUI();
  }

  function addReelPower(amount, showSpark = true, sparkPos = null) {
    if (phase !== 'reeling' || !hookedFish) return;

    const rank = RANKS[getRankIndex(saveState.stars)];
    const resistance = hookedFish.def.isBoss ? 0.68 : 1.0;
    reelProgress = Math.min(100, reelProgress + amount * resistance * rank.power);

    const prevZap = zapCharge;
    zapCharge = Math.min(100, zapCharge + amount * 1.15);
    if (prevZap < 100 && zapCharge >= 100 && !zapNotified) {
      zapNotified = true;
      window.arcadeAudio.playZapReady();
      window.arcadeAudio.speak('閃電集滿了！快按閃電！');
    }

    reelAngle += amount * 16;
    spinSpeed = Math.min(100, spinSpeed + amount * 3.8);

    window.arcadeAudio.playReelClick(reelProgress / 100, spinSpeed / 100);

    if (showSpark) {
      if (Math.random() < 0.45) {
        particles.addSplash(hookedFish.x, hookedFish.y, 4, '#b3e5fc');
      }
      if (sparkPos) {
        const sparkColor = spinSpeed > 70 ? '#ffea00' : spinSpeed > 40 ? '#69f0ae' : '#ffffff';
        particles.addFingerSpark(sparkPos.x, sparkPos.y, sparkColor, 2);
      }
    }

    updateReelUI();

    if (reelProgress >= 100) {
      completeCatch();
    }
  }

  function triggerElectricZap() {
    if (phase !== 'reeling' || !hookedFish || zapCharge < 100) return;

    zapCharge = 0;
    zapNotified = false;
    shockTimer = 1.6;
    screenShake = 16;
    tugStatusFxEl.textContent = '💫';

    const rodTipX = width / 2 + rodBend * 40;
    const rodTipY = height - 110;
    particles.addLightning(rodTipX, rodTipY, hookedFish.x, hookedFish.y);
    particles.addLightning(rodTipX, rodTipY, hookedFish.x, hookedFish.y);
    particles.addSplash(hookedFish.x, hookedFish.y, 26, '#fff176');
    particles.addPopup(hookedFish.x, hookedFish.y - 44, '⚡ 必殺閃電！', '#ffea00', 36);

    window.arcadeAudio.playZap();
    addReelPower(34, false);
    updateReelUI();
  }

  function completeCatch() {
    const caught = hookedFish;
    const def = caught.def;

    phase = 'caught';
    hookedFish = null;
    arcadeControlsEl.classList.add('hidden');

    const idx = fishes.indexOf(caught);
    if (idx !== -1) fishes.splice(idx, 1);

    // Combo Streak!
    comboCount++;
    const comboBonus = comboCount >= 2 ? comboCount * 5 : 0;
    if (comboCount >= 2) {
      comboBadgeEl.textContent = `🔥 ${comboCount} 連釣！+${comboBonus}⭐`;
      comboBadgeEl.classList.remove('hidden');
      window.arcadeAudio.playCombo(comboCount);
    }

    // Celebration particles & Flying Stars into HUD!
    particles.addSplash(caught.x, waterSurfaceY + 10, 32, '#ffffff');
    particles.addConfetti(width / 2, height * 0.42, def.isBoss ? 90 : 55);
    particles.addFlyingStars(width / 2, height * 0.45, 70, 34, def.isBoss ? 12 : 6);

    // Update Save & Check Rank Up!
    const oldRankIdx = getRankIndex(saveState.stars);
    const isNew = !saveState.caught[def.id];
    saveState.caught[def.id] = (saveState.caught[def.id] || 0) + 1;
    saveState.recentBasket = [def.id, ...saveState.recentBasket].slice(0, 4);

    const baseReward = feverTimer > 0 ? def.stars * 2 : def.stars;
    const totalReward = baseReward + comboBonus;
    saveState.stars += totalReward;
    const newRankIdx = getRankIndex(saveState.stars);
    persistSave();
    updateHud(true);

    // Fever meter progress
    if (feverTimer <= 0) {
      feverCharge = Math.min(100, feverCharge + 22);
      feverFillEl.style.width = `${feverCharge}%`;
    }

    // Play fanfare & joyful Mandarin voice!
    if (newRankIdx > oldRankIdx) {
      const nr = RANKS[newRankIdx];
      window.arcadeAudio.playRankUp();
      setTimeout(() => {
        showBanner(`${nr.icon} 升級成 ${nr.title}！`, 'rankup', 3.2);
        window.arcadeAudio.speak(`哇！太棒了！你升級成${nr.title}，拿到新釣竿囉！`);
      }, 450);
    } else {
      window.arcadeAudio.playCatchFanfare(def.rarity >= 3);
      setTimeout(() => {
        window.arcadeAudio.speak(def.voiceLine);
      }, 350);
    }

    // Populate Catch Modal
    catchPreviewFish = def;
    catchStarsEl.textContent = '⭐'.repeat(Math.min(4, def.rarity));
    catchNewBadgeEl.classList.toggle('hidden', !isNew);
    catchNameEl.textContent = def.name;
    catchFunLineEl.textContent = def.funLine;
    catchRewardStarsEl.textContent = totalReward;
    catchModalEl.classList.remove('hidden');
  }

  function closeCatchModal() {
    catchModalEl.classList.add('hidden');
    catchPreviewFish = null;
    phase = 'idle';
    idleControlsEl.classList.remove('hidden');
    window.arcadeAudio.playBoop(620);

    if (feverCharge >= 100 && feverTimer <= 0) {
      triggerFeverMode();
    }
  }

  function updateReelUI() {
    const pct = Math.max(6, Math.min(96, reelProgress));
    reelProgressFillEl.style.width = `${pct}%`;
    tugFishSliderEl.style.left = `${pct}%`;
    reelWheelEl.style.transform = `rotate(${reelAngle}deg)`;

    // Circular SVG charge ring on Zap button (circumference = 2 * PI * 58 = 364.4)
    const zapOffset = 364.4 * (1 - Math.min(100, zapCharge) / 100);
    zapRingProgressEl.style.strokeDashoffset = `${zapOffset}`;
    zapBtnEl.classList.toggle('ready', zapCharge >= 100);

    // Speed Tier Glow on Reel Crank!
    let tier = 0;
    let label = '轉轉轉！';
    if (spinSpeed > 78) {
      tier = 3;
      label = '無敵神速！🌈';
    } else if (spinSpeed > 48) {
      tier = 2;
      label = '超快！🔥';
    } else if (spinSpeed > 20) {
      tier = 1;
      label = '加油！✨';
    }
    reelCrankZoneEl.className = `reel-crank-zone speed-${tier}`;
    reelSpeedTagEl.textContent = label;
  }

  function updateHud(popRank = false) {
    const rankIdx = getRankIndex(saveState.stars);
    const rank = RANKS[rankIdx];
    const nextRank = RANKS[rankIdx + 1];

    rankIconEl.textContent = rank.icon;
    rankTitleEl.textContent = rank.title;
    rodTagEl.textContent = rank.rodName;
    starCountEl.textContent = saveState.stars;

    // Circular XP ring (circumference = 2 * PI * 19 = 119.4)
    let xpRatio = 1;
    if (nextRank) {
      xpRatio = (saveState.stars - rank.minStars) / Math.max(1, nextRank.minStars - rank.minStars);
    }
    rankXpRingEl.style.strokeDashoffset = `${119.4 * (1 - Math.max(0.05, Math.min(1, xpRatio)))}`;

    if (popRank) {
      rankDisplayEl.classList.remove('pop');
      void rankDisplayEl.offsetWidth;
      rankDisplayEl.classList.add('pop');
      setTimeout(() => rankDisplayEl.classList.remove('pop'), 240);
    }

    // Live Catch Basket mini-icons!
    basketFishRowEl.innerHTML = '';
    if (saveState.recentBasket.length === 0) {
      const dot = document.createElement('span');
      dot.className = 'basket-empty-dot';
      dot.textContent = '🐠';
      basketFishRowEl.appendChild(dot);
    } else {
      saveState.recentBasket.forEach((fid) => {
        const sp = document.createElement('span');
        sp.className = 'basket-mini-icon';
        sp.textContent = FISH_EMOJI[fid] || '🐟';
        basketFishRowEl.appendChild(sp);
      });
    }

    const caughtCount = Object.keys(saveState.caught).length;
    albumProgressEl.textContent = `${caughtCount}/${window.FISH_CATALOG.length}`;
    feverFillEl.style.width = `${Math.min(100, feverCharge)}%`;
  }

  // ---------------- Fish Album Modal ----------------
  function openAlbum() {
    window.arcadeAudio.playBoop(560);
    albumGridEl.innerHTML = '';

    window.FISH_CATALOG.forEach((def) => {
      const count = saveState.caught[def.id] || 0;
      const unlocked = count > 0;

      const card = document.createElement('div');
      card.className = `album-item ${unlocked ? '' : 'locked'}`;

      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 120;
      const cctx = c.getContext('2d');
      cctx.save();
      cctx.translate(80, 62);
      window.drawCreature(cctx, def.id, {
        size: def.isBoss ? 64 : 56,
        time: 0.5,
        silhouette: !unlocked
      });
      cctx.restore();

      const nameEl = document.createElement('div');
      nameEl.className = 'album-item-name';
      nameEl.textContent = unlocked ? def.name : '？？？';

      const countEl = document.createElement('div');
      countEl.className = 'album-item-count';
      countEl.textContent = unlocked ? `釣到 ${count} 隻 ⭐` : '還沒遇見喔';

      card.appendChild(c);
      card.appendChild(nameEl);
      card.appendChild(countEl);

      if (unlocked) {
        card.addEventListener('click', () => {
          window.arcadeAudio.playCreatureGiggle();
          window.arcadeAudio.speak(`${def.name}！${def.funLine}`);
        });
      }

      albumGridEl.appendChild(card);
    });

    albumModalEl.classList.remove('hidden');
  }

  // ---------------- Child-Proof Parent Settings (Hold 1.0s) ----------------
  let holdStart = 0;
  let holdRaf = null;
  const HOLD_DURATION = 1000;

  function cancelParentHold() {
    holdStart = 0;
    if (holdRaf) cancelAnimationFrame(holdRaf);
    holdRaf = null;
    parentHoldRingEl.style.strokeDashoffset = '138.2';
  }

  function tickParentHold() {
    if (!holdStart) return;
    const elapsed = performance.now() - holdStart;
    const ratio = Math.min(1, elapsed / HOLD_DURATION);
    parentHoldRingEl.style.strokeDashoffset = `${138.2 * (1 - ratio)}`;
    if (ratio >= 1) {
      cancelParentHold();
      openParentModal();
    } else {
      holdRaf = requestAnimationFrame(tickParentHold);
    }
  }

  function openParentModal() {
    window.arcadeAudio.playBoop(620);
    syncParentButtons();
    parentModalEl.classList.remove('hidden');
  }

  function syncParentButtons() {
    btnToggleSound.classList.toggle('active', window.arcadeAudio.enabled);
    btnToggleSound.querySelector('.opt-state').textContent = window.arcadeAudio.enabled ? '開啟' : '關閉';

    btnToggleVoice.classList.toggle('active', window.arcadeAudio.voiceEnabled);
    btnToggleVoice.querySelector('.opt-state').textContent = window.arcadeAudio.voiceEnabled ? '開啟' : '關閉';

    btnToggleMotion.classList.toggle('active', motionEnabled);
    btnToggleMotion.querySelector('.opt-state').textContent = motionEnabled ? '開啟' : '關閉';
  }

  btnParentSettings.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    if (e.shiftKey) {
      openParentModal();
      return;
    }
    holdStart = performance.now();
    holdRaf = requestAnimationFrame(tickParentHold);
  });
  btnParentSettings.addEventListener('pointerup', cancelParentHold);
  btnParentSettings.addEventListener('pointerleave', cancelParentHold);
  btnParentSettings.addEventListener('pointercancel', cancelParentHold);

  btnParentClose.addEventListener('click', () => {
    parentModalEl.classList.add('hidden');
    window.arcadeAudio.playBoop(460);
  });

  btnToggleSound.addEventListener('click', () => {
    window.arcadeAudio.toggleSound();
    syncParentButtons();
  });

  btnToggleVoice.addEventListener('click', () => {
    window.arcadeAudio.toggleVoice();
    syncParentButtons();
  });

  btnToggleMotion.addEventListener('click', async () => {
    await toggleMotion();
    syncParentButtons();
  });

  btnResetSave.addEventListener('click', () => {
    saveState = { stars: 0, caught: {}, recentBasket: [] };
    comboCount = 0;
    comboBadgeEl.classList.add('hidden');
    persistSave();
    updateHud();
    parentModalEl.classList.add('hidden');
    showBanner('✨ 已重新開始冒險！', '', 1.8);
  });

  // ---------------- Input Handling ----------------
  let swipeStart = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (!started) return;
    window.arcadeAudio.unlock();

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (phase === 'reeling') {
      addReelPower(6.5, true, { x: px, y: py });
      particles.addRipple(px, py, 48, 'rgba(255,255,255,0.6)');
      return;
    }

    if (particles.tryPopBubble(px, py)) {
      window.arcadeAudio.playBubblePop();
      zapCharge = Math.min(100, zapCharge + 8);
      return;
    }

    if (particles.tryTapCrab(px, py, height)) {
      window.arcadeAudio.playCreatureGiggle();
      return;
    }

    for (const f of fishes) {
      const dx = px - f.x;
      const dy = py - f.y;
      const hitR = f.def.size * 0.7;
      if (dx * dx + dy * dy <= hitR * hitR && phase === 'idle') {
        f.tapTimer = 1.2;
        if (f.def.id === 'puffer') f.puffed = 1;
        window.arcadeAudio.playCreatureGiggle();
        particles.addPopup(f.x, f.y - 30, '哈哈！', '#fff59d', 24);
        castLine(px, py);
        return;
      }
    }

    swipeStart = { x: px, y: py, t: performance.now() };
    if (phase === 'idle' || phase === 'waiting') {
      castLine(px, py);
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!swipeStart || !started) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dy = swipeStart.y - py;
    const dt = performance.now() - swipeStart.t;

    if (dy > 60 && dt < 400 && (phase === 'idle' || phase === 'waiting')) {
      castLine(px, waterSurfaceY + 80 + Math.random() * (height * 0.45));
    }
    swipeStart = null;
  });

  // Giant Pulsing Cast Button
  btnBigCast.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    castLine(width * (0.28 + Math.random() * 0.44), waterSurfaceY + height * (0.24 + Math.random() * 0.34));
  });

  // Giant Tactile Reel Crank (Spin OR Tap + Finger Spark Trail!)
  let crankPointerId = null;
  let lastCrankAngle = null;

  function getCrankAngle(clientX, clientY) {
    const rect = reelWheelEl.getBoundingClientRect();
    return Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2));
  }

  reelCrankZoneEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    crankPointerId = e.pointerId;
    reelCrankZoneEl.setPointerCapture(e.pointerId);
    lastCrankAngle = getCrankAngle(e.clientX, e.clientY);
    addReelPower(7.5, true, { x: e.clientX, y: e.clientY });
  });

  reelCrankZoneEl.addEventListener('pointermove', (e) => {
    if (e.pointerId !== crankPointerId || phase !== 'reeling') return;
    const angle = getCrankAngle(e.clientX, e.clientY);
    if (lastCrankAngle !== null) {
      let delta = angle - lastCrankAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      const absDelta = Math.abs(delta);
      if (absDelta > 0.04) {
        addReelPower(absDelta * 9.5, true, { x: e.clientX, y: e.clientY });
      }
    }
    lastCrankAngle = angle;
  });

  const endCrank = (e) => {
    if (e.pointerId === crankPointerId) {
      crankPointerId = null;
      lastCrankAngle = null;
    }
  };
  reelCrankZoneEl.addEventListener('pointerup', endCrank);
  reelCrankZoneEl.addEventListener('pointercancel', endCrank);

  zapBtnEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    triggerElectricZap();
  });

  window.addEventListener('keydown', (e) => {
    if (!started) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      e.preventDefault();
      if (phase === 'idle') {
        castLine(width * (0.25 + Math.random() * 0.5), waterSurfaceY + height * (0.25 + Math.random() * 0.35));
      } else if (phase === 'reeling') {
        addReelPower(7.5);
      } else if (phase === 'caught') {
        closeCatchModal();
      }
    } else if (e.code === 'KeyZ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      triggerElectricZap();
    }
  });

  // Motion Sensor + Live Tilt Indicator
  function handleDeviceMotion(event) {
    if (!motionEnabled || !started) return;
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    // Live tilt feedback on the top-right rod icon!
    const tiltDeg = Math.max(-35, Math.min(35, (acc.x || 0) * 4.5));
    motionRodIconEl.style.transform = `rotate(${tiltDeg}deg)`;

    const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
    const now = performance.now();

    if (phase === 'idle' && mag > 19 && now - lastMotionTrigger > 900) {
      lastMotionTrigger = now;
      castLine(width * (0.25 + Math.random() * 0.5), waterSurfaceY + height * (0.25 + Math.random() * 0.4));
    } else if (phase === 'reeling' && mag > 16 && now - lastMotionTrigger > 120) {
      lastMotionTrigger = now;
      addReelPower(8);
    }
  }

  async function toggleMotion() {
    window.arcadeAudio.unlock();
    if (!motionEnabled) {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const res = await DeviceMotionEvent.requestPermission();
          if (res !== 'granted') return;
        } catch (_) {
          return;
        }
      }
      motionEnabled = true;
      window.addEventListener('devicemotion', handleDeviceMotion);
      motionIndicatorEl.classList.remove('hidden');
      showBanner('📱 體感模式開啟！甩一甩！', '', 2.0);
      window.arcadeAudio.playBoop(700);
    } else {
      motionEnabled = false;
      window.removeEventListener('devicemotion', handleDeviceMotion);
      motionIndicatorEl.classList.add('hidden');
      window.arcadeAudio.playBoop(420);
    }
  }

  btnStartGame.addEventListener('click', () => {
    window.arcadeAudio.unlock();
    window.arcadeAudio.playFeverStart();
    startScreenEl.classList.add('hidden');
    started = true;
    setTimeout(() => {
      window.arcadeAudio.speak('歡迎來到歡樂釣魚大冒險！點水面或大按鈕拋竿吧！');
    }, 300);
  });

  btnCatchOk.addEventListener('click', closeCatchModal);
  btnAlbum.addEventListener('click', openAlbum);
  btnAlbumClose.addEventListener('click', () => {
    albumModalEl.classList.add('hidden');
    window.arcadeAudio.playBoop(460);
  });

  // ---------------- Update Loop ----------------
  function update(dt) {
    time += dt;

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt * 28);
    }

    if (spinSpeed > 0) {
      spinSpeed = Math.max(0, spinSpeed - dt * 42);
      if (phase === 'reeling') updateReelUI();
    }

    if (bannerTimer > 0) {
      bannerTimer -= dt;
      if (bannerTimer <= 0) {
        eventBannerEl.classList.add('hidden');
      }
    }

    if (feverTimer > 0) {
      feverTimer -= dt;
      feverCharge = Math.max(0, (feverTimer / 16) * 100);
      feverFillEl.style.width = `${feverCharge}%`;
      if (feverTimer <= 0) {
        feverCharge = 0;
        feverFillEl.style.width = '0%';
        feverBorderEl.classList.add('hidden');
        feverBarWrapEl.classList.remove('active');
        feverX2TagEl.classList.add('hidden');
      }
    }

    if (started && phase !== 'caught') {
      bossCooldown -= dt;
      if (bossCooldown <= 0) {
        bossCooldown = 34 + Math.random() * 14;
        triggerBossEvent();
      }
    }

    const minFish = feverTimer > 0 ? 13 : 9;
    if (fishes.length < minFish && Math.random() < dt * 2.2) {
      spawnFish(null, true);
    }

    if (phase === 'casting') {
      bobber.castT += dt * 2.6;
      if (bobber.castT >= 1) {
        bobber.castT = 1;
        bobber.x = bobber.targetX;
        bobber.y = bobber.targetY;
        phase = 'waiting';
        particles.addSplash(bobber.x, bobber.y, 18, '#ffffff');
        particles.addRipple(bobber.x, bobber.y, 85);
      } else {
        const t = bobber.castT;
        bobber.x = bobber.startX + (bobber.targetX - bobber.startX) * t;
        const arc = Math.sin(t * Math.PI) * 140;
        bobber.y = bobber.startY + (bobber.targetY - bobber.startY) * t - arc;
      }
    }

    if (phase === 'waiting') {
      bobber.bobPhase += dt * 4.5;
      if (Math.random() < dt * 1.4) {
        particles.addRipple(bobber.x, bobber.y, 42, 'rgba(255,255,255,0.45)');
      }
    }

    let anyCurious = fishes.some((f) => f.state === 'curious' || f.state === 'nibble');

    for (let i = fishes.length - 1; i >= 0; i--) {
      const f = fishes[i];
      f.phase += dt * 3.5;
      if (f.tapTimer > 0) f.tapTimer -= dt;

      if (f.def.id === 'puffer' && f.state !== 'hooked' && f.tapTimer <= 0) {
        f.puffed = Math.max(0, f.puffed - dt * 1.2);
      }

      if (f.state === 'hooked') {
        if (shockTimer > 0) {
          shockTimer -= dt;
          if (shockTimer <= 0) tugStatusFxEl.textContent = '💦';
        } else {
          const gentlePull = f.def.pullStrength * 14 * dt;
          reelProgress = Math.max(12, reelProgress - gentlePull);
          updateReelUI();
        }

        if (f.def.id === 'puffer') {
          f.puffed = Math.min(1, f.puffed + dt * 3);
        }

        const t = reelProgress / 100;
        const struggleX = shockTimer > 0
          ? (Math.random() - 0.5) * 14
          : Math.sin(time * 9) * (65 * (1 - t * 0.65));
        const targetX = width / 2 + struggleX;
        const targetY = (waterSurfaceY + height * 0.45) * (1 - t) + (height - 150) * t;

        f.x += (targetX - f.x) * Math.min(1, dt * 6);
        f.y += (targetY - f.y) * Math.min(1, dt * 6);
        f.dir = struggleX >= 0 ? 1 : -1;

        rodBend += ((f.x - width / 2) / (width * 0.4) - rodBend) * Math.min(1, dt * 8);
        continue;
      }

      if (phase === 'waiting') {
        const dx = bobber.x - f.x;
        const dy = bobber.y - f.y;
        const dist = Math.hypot(dx, dy);

        if (f.state === 'swim' && !anyCurious && dist < 260) {
          f.state = 'curious';
          anyCurious = true;
          particles.addPopup(f.x, f.y - 34, '！', '#ffeb3b', 28);
        }

        if (f.state === 'curious') {
          f.dir = dx >= 0 ? 1 : -1;
          const chaseSpeed = f.speed * 1.85;
          f.x += (dx / Math.max(1, dist)) * chaseSpeed * dt;
          f.y += (dy / Math.max(1, dist)) * chaseSpeed * dt;

          if (dist < 28) {
            f.state = 'nibble';
            f.nibbleCount = 0;
            f.nibbleTimer = 0.25;
          }
          continue;
        }

        if (f.state === 'nibble') {
          f.nibbleTimer -= dt;
          f.x += (bobber.x - f.x) * dt * 4;
          f.y += (bobber.y - f.y) * dt * 4;
          if (f.nibbleTimer <= 0) {
            f.nibbleCount++;
            window.arcadeAudio.playNibble();
            particles.addRipple(bobber.x, bobber.y, 55, '#fff59d');
            if (f.nibbleCount >= 2) {
              startReeling(f);
            } else {
              f.nibbleTimer = 0.45;
            }
          }
          continue;
        }
      } else if (f.state === 'curious' || f.state === 'nibble') {
        f.state = 'swim';
      }

      const boost = f.tapTimer > 0 ? 2.2 : 1.0;
      f.x += f.dir * f.speed * boost * dt;
      f.y = f.baseY + Math.sin(f.phase) * 14;

      if ((f.dir === 1 && f.x > width + f.def.size * 2.5) ||
          (f.dir === -1 && f.x < -f.def.size * 2.5)) {
        fishes.splice(i, 1);
      }
    }

    if (phase !== 'reeling') {
      rodBend *= Math.max(0, 1 - dt * 6);
    }

    particles.update(dt, width, height, waterSurfaceY);
  }

  // ---------------- Render Loop ----------------
  function drawWaterBackground() {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
    if (feverTimer > 0) {
      skyGrad.addColorStop(0, '#ff80ab');
      skyGrad.addColorStop(1, '#ffe082');
    } else {
      skyGrad.addColorStop(0, '#4fc3f7');
      skyGrad.addColorStop(1, '#b3e5fc');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, waterSurfaceY + 12);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    for (let i = 0; i < 3; i++) {
      const cx = ((time * 14 + i * (width / 2.6)) % (width + 180)) - 90;
      const cy = waterSurfaceY * 0.42 + (i % 2) * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy - 6, 26, 0, Math.PI * 2);
      ctx.arc(cx + 42, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    const seaGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, height);
    if (feverTimer > 0) {
      seaGrad.addColorStop(0, '#26c6da');
      seaGrad.addColorStop(0.5, '#7c4dff');
      seaGrad.addColorStop(1, '#1a237e');
    } else {
      seaGrad.addColorStop(0, '#29b6f6');
      seaGrad.addColorStop(0.55, '#0288d1');
      seaGrad.addColorStop(1, '#01579b');
    }
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, waterSurfaceY, width, height - waterSurfaceY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, waterSurfaceY);
    for (let x = 0; x <= width; x += 24) {
      const y = waterSurfaceY + Math.sin(x * 0.025 + time * 3.2) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, waterSurfaceY + 16);
    ctx.lineTo(0, waterSurfaceY + 16);
    ctx.closePath();
    ctx.fill();
  }

  function drawFishingRodAndLine() {
    const rodBaseX = width / 2;
    const rodBaseY = height + 10;
    const rodTipX = width / 2 + rodBend * 75;
    const rodTipY = height - (phase === 'reeling' ? 128 : 92);
    const rank = RANKS[getRankIndex(saveState.stars)];

    if (phase === 'casting' || phase === 'waiting' || phase === 'reeling') {
      const lineEndX = phase === 'reeling' && hookedFish ? hookedFish.x : bobber.x;
      const lineEndY = phase === 'reeling' && hookedFish ? hookedFish.y : bobber.y;

      ctx.save();
      ctx.strokeStyle = phase === 'reeling' ? '#fff59d' : 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = phase === 'reeling' ? 4 : 2.5;
      ctx.beginPath();
      ctx.moveTo(rodTipX, rodTipY);
      if (phase === 'reeling') {
        const midX = (rodTipX + lineEndX) / 2 + Math.sin(time * 45) * 4;
        const midY = (rodTipY + lineEndY) / 2;
        ctx.quadraticCurveTo(midX, midY, lineEndX, lineEndY);
      } else {
        ctx.quadraticCurveTo(
          (rodTipX + lineEndX) / 2,
          Math.max(rodTipY, lineEndY) - 40,
          lineEndX,
          lineEndY
        );
      }
      ctx.stroke();
      ctx.restore();

      if (phase === 'casting' || phase === 'waiting') {
        const by = bobber.y + (phase === 'waiting' ? Math.sin(bobber.bobPhase) * 5 : 0);
        ctx.save();
        ctx.translate(bobber.x, by);

        const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
        aura.addColorStop(0, 'rgba(255, 241, 118, 0.7)');
        aura.addColorStop(1, 'rgba(255, 241, 118, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(0, 0, 14, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(-4, -5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Auto-Upgraded Fishing Rod Appearance!
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 19;
    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.quadraticCurveTo(rodBaseX + rodBend * 25, height - 55, rodTipX, rodTipY);
    ctx.stroke();

    if (rank.rodColor === 'rainbow') {
      const rGrad = ctx.createLinearGradient(rodBaseX, rodBaseY, rodTipX, rodTipY);
      rGrad.addColorStop(0, '#ff5252');
      rGrad.addColorStop(0.35, '#ffea00');
      rGrad.addColorStop(0.7, '#69f0ae');
      rGrad.addColorStop(1, '#e040fb');
      ctx.strokeStyle = rGrad;
    } else {
      ctx.strokeStyle = rank.rodColor;
    }
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(rodTipX, rodTipY, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render() {
    ctx.save();
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    drawWaterBackground();
    particles.drawBackgroundDetails(ctx, width, height, waterSurfaceY, time, feverTimer > 0);

    // Zero-reading water cast target cue when idle!
    if (started && phase === 'idle') {
      particles.drawCastTarget(ctx, width * 0.5, waterSurfaceY + height * 0.34, time);
    }

    fishes.forEach((f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.dir < 0) ctx.scale(-1, 1);
      if (f.state === 'hooked') {
        ctx.rotate(Math.sin(time * 24) * 0.16);
      }
      window.drawCreature(ctx, f.def.id, {
        size: f.def.size,
        time: time + f.phase,
        puffed: f.puffed,
        excited: f.state === 'hooked' || f.state === 'curious' || f.tapTimer > 0,
        shocked: f.state === 'hooked' && shockTimer > 0
      });
      ctx.restore();
    });

    drawFishingRodAndLine();
    particles.drawForegroundEffects(ctx);
    ctx.restore();

    if (catchPreviewFish) {
      catchFishCtx.clearRect(0, 0, catchFishCanvas.width, catchFishCanvas.height);
      catchFishCtx.save();
      catchFishCtx.translate(130, 102 + Math.sin(time * 5) * 8);
      catchFishCtx.rotate(Math.sin(time * 3.5) * 0.08);
      window.drawCreature(catchFishCtx, catchPreviewFish.id, {
        size: catchPreviewFish.isBoss ? 115 : 108,
        time,
        puffed: catchPreviewFish.id === 'puffer' ? 0.55 : 0,
        excited: true
      });
      catchFishCtx.restore();
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  loadSave();
  populateOcean();
  requestAnimationFrame(loop);
})();
