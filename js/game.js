/* =========================================================
   歡樂釣魚大冒險 - Main Arcade Fishing Game Engine
   Designed for 4-year-olds: ultra-responsive, tactile, joyful!
   ========================================================= */

(() => {
  const canvas = document.getElementById('ocean-canvas');
  const ctx = canvas.getContext('2d');

  // HUD & UI Elements
  const starCountEl = document.getElementById('star-count');
  const starDisplayEl = document.getElementById('star-display');
  const albumProgressEl = document.getElementById('album-progress');
  const feverFillEl = document.getElementById('fever-fill');
  const eventBannerEl = document.getElementById('event-banner');
  const eventBannerTextEl = document.getElementById('event-banner-text');
  const castHintEl = document.getElementById('cast-hint');
  const arcadeControlsEl = document.getElementById('arcade-controls');
  const reelProgressFillEl = document.getElementById('reel-progress-fill');
  const zapBtnEl = document.getElementById('btn-zap');
  const zapChargeFillEl = document.getElementById('zap-charge-fill');
  const reelCrankZoneEl = document.getElementById('reel-crank-zone');
  const reelWheelEl = document.getElementById('reel-wheel');

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

  const btnSound = document.getElementById('btn-sound');
  const btnMotion = document.getElementById('btn-motion');
  const startScreenEl = document.getElementById('start-screen');
  const btnStartGame = document.getElementById('btn-start-game');

  // Persistent Progress
  const STORAGE_KEY = 'arcade_fishing_kids_v1';
  let saveState = {
    stars: 0,
    caught: {} // { fishId: count }
  };

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        saveState.stars = parsed.stars || 0;
        saveState.caught = parsed.caught || {};
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

  // 'idle' | 'casting' | 'waiting' | 'reeling' | 'caught'
  let phase = 'idle';
  let started = false;

  const particles = new window.ParticleSystem();
  let fishes = [];
  let hookedFish = null;

  // Bobber / Line state
  const bobber = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    startX: 0,
    startY: 0,
    castT: 0,
    bobPhase: 0,
    nibbleTimer: 0
  };

  // Reeling state
  let reelProgress = 0; // 0..100 (100 = caught!)
  let reelAngle = 0;
  let rodBend = 0;
  let zapCharge = 50; // 0..100, starts half full so kids can zap early!
  let shockTimer = 0;

  // Arcade Events
  let feverCharge = 0; // 0..100 (every 5 catches triggers Fever!)
  let feverTimer = 0;
  let bossCooldown = 22; // seconds until next boss visit
  let bannerTimer = 0;

  // Motion Sensor (DeviceMotion)
  let motionEnabled = false;
  let lastMotionTrigger = 0;

  // Catch Modal preview animation
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
    // During Fever Time, much higher chance of rare & golden fish!
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
      state: 'swim', // 'swim' | 'curious' | 'nibble' | 'hooked' | 'flee'
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
    const hasBoss = fishes.some((f) => f.def.isBoss);
    if (hasBoss) return;
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
    showBanner('🌈 彩虹派對時間！', 'fever', 2.8);
    window.arcadeAudio.playFeverStart();
    window.arcadeAudio.speak('彩虹派對時間！好多閃亮亮的魚喔！');
    // Spawn extra golden fish!
    for (let i = 0; i < 3; i++) {
      spawnFish(window.FISH_BY_ID['goldfish'], true);
    }
    particles.addConfetti(width / 2, height * 0.3, 40);
  }

  function showBanner(text, styleClass = '', duration = 2.0) {
    eventBannerTextEl.textContent = text;
    eventBannerEl.className = `event-banner ${styleClass}`;
    bannerTimer = duration;
  }

  // ---------------- Core Fishing Flow ----------------
  function castLine(targetX, targetY) {
    if (!started || phase === 'reeling' || phase === 'caught') return;

    // Clamp target inside ocean water
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
    castHintEl.classList.add('hidden');
    window.arcadeAudio.playCast();
  }

  function startReeling(fish) {
    phase = 'reeling';
    hookedFish = fish;
    fish.state = 'hooked';
    reelProgress = 26; // Start with encouraging progress!
    shockTimer = 0;
    screenShake = 12;

    arcadeControlsEl.classList.remove('hidden');
    showBanner('⚡ 咬鉤了！快轉轉轉！', '', 1.8);
    window.arcadeAudio.playBiteAlarm();
    particles.addSplash(fish.x, fish.y, 22, '#ffffff');
    particles.addRipple(fish.x, fish.y, 110, '#ffeb3b');
    particles.addPopup(fish.x, fish.y - 36, '咬鉤了！', '#ffeb3b', 34);
    updateReelUI();
  }

  function addReelPower(amount, showSpark = true) {
    if (phase !== 'reeling' || !hookedFish) return;

    // Boss fish needs slightly more cranking, small fish are super breezy!
    const resistance = hookedFish.def.isBoss ? 0.65 : 1.0;
    reelProgress = Math.min(100, reelProgress + amount * resistance);
    zapCharge = Math.min(100, zapCharge + amount * 1.15);
    reelAngle += amount * 16;

    window.arcadeAudio.playReelClick(reelProgress / 100);

    if (showSpark && Math.random() < 0.45) {
      particles.addSplash(hookedFish.x, hookedFish.y, 4, '#b3e5fc');
    }

    updateReelUI();

    if (reelProgress >= 100) {
      completeCatch();
    }
  }

  function triggerElectricZap() {
    if (phase !== 'reeling' || !hookedFish || zapCharge < 100) return;

    zapCharge = 0;
    shockTimer = 1.6;
    screenShake = 16;

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

    // Remove fish from ocean
    const idx = fishes.indexOf(caught);
    if (idx !== -1) fishes.splice(idx, 1);

    // Celebration particles!
    particles.addSplash(caught.x, waterSurfaceY + 10, 32, '#ffffff');
    particles.addConfetti(width / 2, height * 0.42, def.isBoss ? 90 : 55);

    // Update Save
    const isNew = !saveState.caught[def.id];
    saveState.caught[def.id] = (saveState.caught[def.id] || 0) + 1;
    const reward = feverTimer > 0 ? def.stars * 2 : def.stars;
    saveState.stars += reward;
    persistSave();
    updateHud(true);

    // Fever meter progress
    if (feverTimer <= 0) {
      feverCharge = Math.min(100, feverCharge + 22);
      if (feverCharge >= 100) {
        setTimeout(() => {
          if (phase !== 'caught') triggerFeverMode();
        }, 500);
      }
    }

    // Play fanfare & joyful Mandarin voice!
    window.arcadeAudio.playCatchFanfare(def.rarity >= 3);
    setTimeout(() => {
      window.arcadeAudio.speak(def.voiceLine);
    }, 350);

    // Populate Catch Modal
    catchPreviewFish = def;
    catchStarsEl.textContent = '⭐'.repeat(Math.min(4, def.rarity));
    catchNewBadgeEl.classList.toggle('hidden', !isNew);
    catchNameEl.textContent = def.name;
    catchFunLineEl.textContent = def.funLine;
    catchRewardStarsEl.textContent = reward;
    catchModalEl.classList.remove('hidden');
  }

  function closeCatchModal() {
    catchModalEl.classList.add('hidden');
    catchPreviewFish = null;
    phase = 'idle';
    castHintEl.classList.remove('hidden');
    window.arcadeAudio.playBoop(620);

    if (feverCharge >= 100 && feverTimer <= 0) {
      triggerFeverMode();
    }
  }

  function updateReelUI() {
    reelProgressFillEl.style.width = `${Math.max(4, Math.min(100, reelProgress))}%`;
    reelWheelEl.style.transform = `rotate(${reelAngle}deg)`;
    zapChargeFillEl.style.width = `${Math.min(100, zapCharge)}%`;
    zapBtnEl.classList.toggle('ready', zapCharge >= 100);
  }

  function updateHud(popStar = false) {
    starCountEl.textContent = saveState.stars;
    if (popStar) {
      starDisplayEl.classList.remove('pop');
      void starDisplayEl.offsetWidth;
      starDisplayEl.classList.add('pop');
      setTimeout(() => starDisplayEl.classList.remove('pop'), 220);
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

  // ---------------- Input Handling (Touch, Mouse, Keyboard, Motion) ----------------
  let swipeStart = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (!started) return;
    window.arcadeAudio.unlock();

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // 1. If reeling, tapping the ocean ALSO reels so 4yo can mash anywhere!
    if (phase === 'reeling') {
      addReelPower(6.5);
      particles.addRipple(px, py, 48, 'rgba(255,255,255,0.6)');
      return;
    }

    // 2. Interactive ocean fun: pop bubbles!
    if (particles.tryPopBubble(px, py)) {
      window.arcadeAudio.playBubblePop();
      zapCharge = Math.min(100, zapCharge + 8);
      return;
    }

    // 3. Interactive seafloor crab!
    if (particles.tryTapCrab(px, py, height)) {
      window.arcadeAudio.playCreatureGiggle();
      return;
    }

    // 4. Interactive tap on swimming fish (they giggle / puff up!)
    for (const f of fishes) {
      const dx = px - f.x;
      const dy = py - f.y;
      const hitR = f.def.size * 0.7;
      if (dx * dx + dy * dy <= hitR * hitR && phase === 'idle') {
        f.tapTimer = 1.2;
        if (f.def.id === 'puffer') f.puffed = 1;
        window.arcadeAudio.playCreatureGiggle();
        particles.addPopup(f.x, f.y - 30, '哈哈！', '#fff59d', 24);
        // Also cast right near the fish they tapped so a 4yo gets instant gratification!
        castLine(px, py);
        return;
      }
    }

    swipeStart = { x: px, y: py, t: performance.now() };

    // Instant tap-to-cast!
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

    // Upward flick cast!
    if (dy > 60 && dt < 400 && (phase === 'idle' || phase === 'waiting')) {
      castLine(px, waterSurfaceY + 80 + Math.random() * (height * 0.45));
    }
    swipeStart = null;
  });

  // Giant Tactile Reel Crank: supports BOTH circular spinning AND tapping!
  let crankPointerId = null;
  let lastCrankAngle = null;
  let crankMoved = false;

  function getCrankAngle(clientX, clientY) {
    const rect = reelWheelEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }

  reelCrankZoneEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    crankPointerId = e.pointerId;
    reelCrankZoneEl.setPointerCapture(e.pointerId);
    lastCrankAngle = getCrankAngle(e.clientX, e.clientY);
    crankMoved = false;
    // Instant tap feedback!
    addReelPower(7.5);
  });

  reelCrankZoneEl.addEventListener('pointermove', (e) => {
    if (e.pointerId !== crankPointerId || phase !== 'reeling') return;
    const angle = getCrankAngle(e.clientX, e.clientY);
    if (lastCrankAngle !== null) {
      let delta = angle - lastCrankAngle;
      // Wrap around -PI..PI
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      // Both clockwise & counter-clockwise spinning work for 4yo kids!
      const absDelta = Math.abs(delta);
      if (absDelta > 0.04) {
        crankMoved = true;
        addReelPower(absDelta * 9.5);
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

  // Zap Button
  zapBtnEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    window.arcadeAudio.unlock();
    triggerElectricZap();
  });

  // Keyboard support (great for desktop / laptop play!)
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

  // Motion Sensor (Flick to cast, Shake to reel!)
  function handleDeviceMotion(event) {
    if (!motionEnabled || !started) return;
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;
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
      btnMotion.classList.add('active');
      showBanner('📱 體感模式開啟！甩一甩！', '', 2.0);
      window.arcadeAudio.playBoop(700);
    } else {
      motionEnabled = false;
      window.removeEventListener('devicemotion', handleDeviceMotion);
      btnMotion.classList.remove('active');
      window.arcadeAudio.playBoop(420);
    }
  }

  // UI Buttons
  btnStartGame.addEventListener('click', () => {
    window.arcadeAudio.unlock();
    window.arcadeAudio.playFeverStart();
    startScreenEl.classList.add('hidden');
    started = true;
    setTimeout(() => {
      window.arcadeAudio.speak('歡迎來到歡樂釣魚大冒險！點水面拋竿吧！');
    }, 300);
  });

  btnSound.addEventListener('click', () => {
    const on = window.arcadeAudio.toggle();
    btnSound.classList.toggle('active', on);
    btnSound.querySelector('.btn-icon').textContent = on ? '🔊' : '🔇';
  });

  btnMotion.addEventListener('click', toggleMotion);
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
      }
    }

    // Periodic Boss Event!
    if (started && phase !== 'caught') {
      bossCooldown -= dt;
      if (bossCooldown <= 0) {
        bossCooldown = 34 + Math.random() * 14;
        triggerBossEvent();
      }
    }

    // Keep ocean lively
    const minFish = feverTimer > 0 ? 13 : 9;
    if (fishes.length < minFish && Math.random() < dt * 2.2) {
      spawnFish(null, true);
    }

    // Update Casting Arc
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

    // Bobber gentle bobbing
    if (phase === 'waiting') {
      bobber.bobPhase += dt * 4.5;
      if (Math.random() < dt * 1.4) {
        particles.addRipple(bobber.x, bobber.y, 42, 'rgba(255,255,255,0.45)');
      }
    }

    // Update Fishes
    let anyCurious = fishes.some((f) => f.state === 'curious' || f.state === 'nibble');

    for (let i = fishes.length - 1; i >= 0; i--) {
      const f = fishes[i];
      f.phase += dt * 3.5;
      if (f.tapTimer > 0) f.tapTimer -= dt;

      // Pufferfish puff decay
      if (f.def.id === 'puffer' && f.state !== 'hooked' && f.tapTimer <= 0) {
        f.puffed = Math.max(0, f.puffed - dt * 1.2);
      }

      if (f.state === 'hooked') {
        if (shockTimer > 0) {
          shockTimer -= dt;
        } else {
          // Kid-friendly gentle tug! Never drops below 12% so child never loses unfairly.
          const gentlePull = f.def.pullStrength * 14 * dt;
          reelProgress = Math.max(12, reelProgress - gentlePull);
          updateReelUI();
        }

        if (f.def.id === 'puffer') {
          f.puffed = Math.min(1, f.puffed + dt * 3);
        }

        // Fish moves closer to bottom-center rod as reelProgress approaches 100!
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

        // Attract nearest fish!
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

      // Normal Swimming
      const boost = f.tapTimer > 0 ? 2.2 : 1.0;
      f.x += f.dir * f.speed * boost * dt;
      f.y = f.baseY + Math.sin(f.phase) * 14;

      // Remove off-screen fish
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
    // Bright cheerful sky above water
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

    // Cute fluffy clouds
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

    // Ocean gradient
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

    // Animated wavy waterline
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

    // Draw Fishing Line
    if (phase === 'casting' || phase === 'waiting' || phase === 'reeling') {
      const lineEndX = phase === 'reeling' && hookedFish ? hookedFish.x : bobber.x;
      const lineEndY = phase === 'reeling' && hookedFish ? hookedFish.y : bobber.y;

      ctx.save();
      ctx.strokeStyle = phase === 'reeling' ? '#fff59d' : 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = phase === 'reeling' ? 4 : 2.5;
      ctx.beginPath();
      ctx.moveTo(rodTipX, rodTipY);
      if (phase === 'reeling') {
        // Taut vibrating line!
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

      // Draw Cute Red & White Arcade Bobber (when casting or waiting)
      if (phase === 'casting' || phase === 'waiting') {
        const by = bobber.y + (phase === 'waiting' ? Math.sin(bobber.bobPhase) * 5 : 0);
        ctx.save();
        ctx.translate(bobber.x, by);

        // Glowing bait aura
        const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
        aura.addColorStop(0, 'rgba(255, 241, 118, 0.7)');
        aura.addColorStop(1, 'rgba(255, 241, 118, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        // Red top half
        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(0, 0, 14, Math.PI, 0);
        ctx.fill();
        // White bottom half
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI);
        ctx.fill();
        // Outline
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(-4, -5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw Arcade Fishing Rod at Bottom Center
    ctx.save();
    ctx.lineCap = 'round';
    // Outer white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.quadraticCurveTo(rodBaseX + rodBend * 25, height - 55, rodTipX, rodTipY);
    ctx.stroke();

    // Inner bright arcade rod color
    ctx.strokeStyle = '#ff6f00';
    ctx.lineWidth = 11;
    ctx.stroke();

    // Glowing rod tip
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(rodTipX, rodTipY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render() {
    ctx.save();
    if (screenShake > 0) {
      const sx = (Math.random() - 0.5) * screenShake;
      const sy = (Math.random() - 0.5) * screenShake;
      ctx.translate(sx, sy);
    }

    drawWaterBackground();
    particles.drawBackgroundDetails(ctx, width, height, waterSurfaceY, time, feverTimer > 0);

    // Draw all swimming & hooked fish
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

    // Animate caught fish inside celebration modal!
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

  // Init!
  loadSave();
  populateOcean();
  requestAnimationFrame(loop);
})();
