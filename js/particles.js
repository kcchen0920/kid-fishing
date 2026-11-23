/* =========================================================
   Juicy Arcade Particle & Underwater Scenery System (v2)
   Poppable bubbles, splashes, ripples, confetti, lightning,
   finger sparks, flying reward stars, and idle cast target!
   ========================================================= */

class ParticleSystem {
  constructor() {
    this.bubbles = [];
    this.splashes = [];
    this.ripples = [];
    this.popups = [];
    this.confetti = [];
    this.lightningBolts = [];
    this.fingerSparks = [];
    this.flyingStars = [];
    this.seaweeds = [];
    this.crab = {
      x: 160,
      dir: 1,
      danceTimer: 0,
      phase: 0
    };
    this.starfish = {
      x: 320,
      spinTimer: 0,
      angle: 0
    };
    this.clam = {
      x: 240,
      openAmount: 0,
      openTimer: 0,
      breathPhase: 0
    };
    this.vent = {
      x: 110,
      timer: 0
    };
    this.corals = [];
    this.bgSchools = [];
    this.plankton = [];
    this.sandPuffs = [];
    this.seagulls = [];
    this.shootingStars = [];
    this.shootingStarTimer = 3.5;
    this.sailboat = {
      x: 80,
      dir: 1
    };
  }

  initScenery(width, height) {
    this.seaweeds = [];
    const count = Math.max(7, Math.floor(width / 110));
    for (let i = 0; i < count; i++) {
      this.seaweeds.push({
        x: (i + 0.5) * (width / count) + (Math.random() - 0.5) * 40,
        height: 65 + Math.random() * 85,
        segments: 5,
        phase: Math.random() * Math.PI * 2,
        color: i % 2 === 0 ? '#26a69a' : '#43a047'
      });
    }
    this.crab.x = width * 0.25;
    this.starfish.x = width * 0.76;
    this.clam.x = width * 0.52;
    this.vent.x = width * 0.12;
    this.sailboat.x = width * 0.18;

    // Colorful cartoon coral clusters on seabed
    this.corals = [];
    const coralColors = ['#ff7043', '#f06292', '#ba68c8', '#ffb74d', '#4dd0e1'];
    const coralCount = Math.max(4, Math.floor(width / 220));
    for (let i = 0; i < coralCount; i++) {
      this.corals.push({
        x: width * ((i + 0.35) / coralCount) + (Math.random() - 0.5) * 35,
        scale: 0.75 + Math.random() * 0.5,
        color: coralColors[i % coralColors.length],
        type: i % 2
      });
    }

    // Distant translucent mini-fish schools for ocean depth!
    this.bgSchools = [0, 1].map((idx) => ({
      x: idx === 0 ? width * 0.2 : width * 0.78,
      y: height * (0.36 + idx * 0.22),
      dir: idx === 0 ? 1 : -1,
      speed: 24 + idx * 10,
      phase: Math.random() * Math.PI * 2,
      members: Array.from({ length: 6 }, (_, m) => ({
        ox: (m - 2.5) * 18 + (Math.random() - 0.5) * 8,
        oy: ((m % 3) - 1) * 14 + (Math.random() - 0.5) * 6,
        size: 6 + (m % 3) * 1.8
      }))
    }));

    // Floating marine glow / plankton specks
    this.plankton = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: 130 + Math.random() * Math.max(100, height - 180),
      r: 1.6 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      speed: 8 + Math.random() * 14
    }));

    // Playful seagulls for Coral Day stage
    this.seagulls = [0, 1].map((i) => ({
      x: width * (0.2 + i * 0.45),
      y: 38 + i * 24,
      dir: i === 0 ? 1 : -1,
      speed: 38 + i * 14,
      flapPhase: i * 1.8,
      boostTimer: 0
    }));

    this.bubbles = [];
    for (let i = 0; i < 16; i++) {
      this.spawnBubble(width, height, Math.random() * height);
    }
  }

  spawnBubble(width, height, yOverride = null) {
    const r = 10 + Math.random() * 18;
    this.bubbles.push({
      x: 24 + Math.random() * (width - 48),
      y: yOverride !== null ? yOverride : height + r,
      r,
      vy: 35 + Math.random() * 45,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 2 + Math.random() * 2
    });
  }

  addSplash(x, y, count = 16, color = '#e1f5fe') {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI + Math.random() * Math.PI;
      const speed = 90 + Math.random() * 240;
      this.splashes.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        r: 4 + Math.random() * 7,
        color,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 1.1
      });
    }
  }

  addFingerSpark(x, y, color = '#ffeb3b', count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 110;
      this.fingerSparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        r: 4 + Math.random() * 5,
        color,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7
      });
    }
  }

  addFlyingStars(fromX, fromY, toX, toY, count = 6) {
    for (let i = 0; i < count; i++) {
      this.flyingStars.push({
        startX: fromX + (Math.random() - 0.5) * 60,
        startY: fromY + (Math.random() - 0.5) * 40,
        toX,
        toY,
        t: -i * 0.08, // staggered launch!
        duration: 0.65 + Math.random() * 0.2
      });
    }
  }

  addRipple(x, y, maxRadius = 70, color = 'rgba(255,255,255,0.75)') {
    this.ripples.push({
      x,
      y,
      r: 8,
      maxR: maxRadius,
      color,
      alpha: 1
    });
  }

  addPopup(x, y, text, color = '#ffeb3b', size = 30) {
    this.popups.push({
      x,
      y,
      vy: -75,
      text,
      color,
      size,
      life: 1.0,
      maxLife: 1.0
    });
  }

  addConfetti(x, y, count = 45) {
    const colors = ['#ff5252', '#ffca28', '#69f0ae', '#40c4ff', '#e040fb', '#ffab40'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 340;
      this.confetti.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        color: colors[i % colors.length],
        life: 1.4 + Math.random() * 0.7
      });
    }
  }

  addLightning(x1, y1, x2, y2) {
    const segments = 9;
    const points = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = (Math.random() - 0.5) * 44;
      points.push({
        x: x1 + (x2 - x1) * t + jitter,
        y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20
      });
    }
    points.push({ x: x2, y: y2 });
    this.lightningBolts.push({
      points,
      life: 0.42,
      maxLife: 0.42
    });
  }

  tryPopBubble(px, py) {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const dx = px - b.x;
      const dy = py - b.y;
      if (dx * dx + dy * dy <= (b.r + 22) * (b.r + 22)) {
        this.bubbles.splice(i, 1);
        this.addSplash(b.x, b.y, 10, '#ffffff');
        this.addRipple(b.x, b.y, b.r * 2.4);
        this.addPopup(b.x, b.y, '啵！✨', '#ffffff', 24);
        return true;
      }
    }
    return false;
  }

  tryTapCrab(px, py, height) {
    const cy = height - 34;
    const dx = px - this.crab.x;
    const dy = py - cy;
    if (dx * dx + dy * dy <= 52 * 52) {
      this.crab.danceTimer = 1.6;
      this.addPopup(this.crab.x, cy - 36, '🦀 哈哈！', '#ff8a80', 26);
      this.addSplash(this.crab.x, cy - 10, 8, '#fff59d');
      return true;
    }
    return false;
  }

  tryTapStarfish(px, py, height, width) {
    const sy = height - 28;
    const dx = px - this.starfish.x;
    const dy = py - sy;
    if (dx * dx + dy * dy <= 48 * 48) {
      this.starfish.spinTimer = 1.5;
      this.addPopup(this.starfish.x, sy - 38, '⭐ 轉圈圈！', '#ffeb3b', 26);
      for (let i = 0; i < 3; i++) {
        this.spawnBubble(width, height, sy - 10 - i * 16);
      }
      return true;
    }
    return false;
  }

  addSwimBubble(x, y) {
    if (this.bubbles.length > 28) return;
    this.bubbles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      r: 4 + Math.random() * 5,
      vy: 42 + Math.random() * 30,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 3.5
    });
  }

  addSandPuff(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.sandPuffs.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 45,
        vy: -18 - Math.random() * 35,
        r: 4 + Math.random() * 7,
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2
      });
    }
  }

  tryTapClam(px, py, height, width) {
    const cy = height - 30;
    const dx = px - this.clam.x;
    const dy = py - cy;
    if (dx * dx + dy * dy <= 52 * 52) {
      this.clam.openTimer = 2.6;
      this.addPopup(this.clam.x, cy - 42, '🦪 閃亮珍珠！+⚡', '#fff59d', 25);
      for (let i = 0; i < 5; i++) {
        this.bubbles.push({
          x: this.clam.x + (Math.random() - 0.5) * 24,
          y: cy - 12 - i * 10,
          r: 8 + Math.random() * 8,
          vy: 55 + Math.random() * 35,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 2.8
        });
      }
      return true;
    }
    return false;
  }

  tryTapSeagull(px, py, stageId) {
    if (stageId !== 'coral') return false;
    for (const g of this.seagulls) {
      const dx = px - g.x;
      const dy = py - g.y;
      if (dx * dx + dy * dy <= 42 * 42) {
        g.boostTimer = 1.6;
        this.addPopup(g.x, g.y - 18, '嘎嘎！🕊️', '#ffffff', 22);
        return true;
      }
    }
    return false;
  }

  update(dt, width, height, waterSurfaceY, stageId = 'coral') {
    if (this.bubbles.length < 16 && Math.random() < dt * 2.5) {
      this.spawnBubble(width, height);
    }

    // Seabed bubble vent periodically releases streams of bubbles
    this.vent.timer += dt;
    if (this.vent.timer >= 1.9) {
      this.vent.timer = 0;
      if (this.bubbles.length < 24) {
        for (let i = 0; i < 2; i++) {
          this.bubbles.push({
            x: this.vent.x + (Math.random() - 0.5) * 14,
            y: height - 34 - i * 14,
            r: 8 + Math.random() * 8,
            vy: 50 + Math.random() * 28,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 2.6
          });
        }
      }
    }

    // Update shy pearl clam breathing / open state
    this.clam.breathPhase += dt * 2.2;
    if (this.clam.openTimer > 0) {
      this.clam.openTimer -= dt;
      this.clam.openAmount += (1 - this.clam.openAmount) * Math.min(1, dt * 10);
    } else {
      const idleOpen = 0.08 + Math.max(0, Math.sin(this.clam.breathPhase)) * 0.12;
      this.clam.openAmount += (idleOpen - this.clam.openAmount) * Math.min(1, dt * 5);
    }

    // Update distant background fish schools
    this.bgSchools.forEach((sc) => {
      sc.phase += dt * 2.4;
      sc.x += sc.dir * sc.speed * dt;
      if (sc.dir === 1 && sc.x > width + 90) sc.x = -90;
      if (sc.dir === -1 && sc.x < -90) sc.x = width + 90;
    });

    // Update drifting marine plankton
    this.plankton.forEach((pl) => {
      pl.phase += dt * 1.8;
      pl.y -= pl.speed * 0.25 * dt;
      pl.x += Math.sin(pl.phase) * 10 * dt;
      if (pl.y < waterSurfaceY + 14) {
        pl.y = height - 48;
        pl.x = Math.random() * width;
      }
    });

    // Update sand puffs
    for (let i = this.sandPuffs.length - 1; i >= 0; i--) {
      const sp = this.sandPuffs[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.r += 6 * dt;
      sp.life -= dt;
      if (sp.life <= 0) this.sandPuffs.splice(i, 1);
    }

    // Update seagulls & sailboat & shooting stars
    this.seagulls.forEach((g) => {
      const mult = g.boostTimer > 0 ? 2.4 : 1.0;
      if (g.boostTimer > 0) g.boostTimer -= dt;
      g.flapPhase += dt * (g.boostTimer > 0 ? 15 : 6.5);
      g.x += g.dir * g.speed * mult * dt;
      if (g.dir === 1 && g.x > width + 50) g.x = -50;
      if (g.dir === -1 && g.x < -50) g.x = width + 50;
    });

    this.sailboat.x += this.sailboat.dir * 16 * dt;
    if (this.sailboat.x > width + 60) this.sailboat.x = -60;

    if (stageId === 'starry') {
      this.shootingStarTimer -= dt;
      if (this.shootingStarTimer <= 0) {
        this.shootingStarTimer = 3.2 + Math.random() * 3.5;
        this.shootingStars.push({
          x: width * (0.2 + Math.random() * 0.7),
          y: 12 + Math.random() * Math.max(18, waterSurfaceY * 0.35),
          vx: -260 - Math.random() * 140,
          vy: 55 + Math.random() * 35,
          life: 0.65,
          maxLife: 0.65
        });
      }
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.life -= dt;
      if (ss.life <= 0) this.shootingStars.splice(i, 1);
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.vy * dt;
      b.wobblePhase += b.wobbleSpeed * dt;
      b.x += Math.sin(b.wobblePhase) * 20 * dt;
      if (b.y < waterSurfaceY + 10) {
        this.bubbles.splice(i, 1);
      }
    }

    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const p = this.splashes[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      p.life -= dt;
      if (p.life <= 0) this.splashes.splice(i, 1);
    }

    for (let i = this.fingerSparks.length - 1; i >= 0; i--) {
      const s = this.fingerSparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) this.fingerSparks.splice(i, 1);
    }

    for (let i = this.flyingStars.length - 1; i >= 0; i--) {
      const fs = this.flyingStars[i];
      fs.t += dt / fs.duration;
      if (fs.t >= 1) this.flyingStars.splice(i, 1);
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.r += 110 * dt;
      r.alpha = Math.max(0, 1 - r.r / r.maxR);
      if (r.r >= r.maxR) this.ripples.splice(i, 1);
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy * dt;
      pop.life -= dt;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 320 * dt;
      c.rot += c.vRot * dt;
      c.life -= dt;
      if (c.life <= 0) this.confetti.splice(i, 1);
    }

    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      this.lightningBolts[i].life -= dt;
      if (this.lightningBolts[i].life <= 0) this.lightningBolts.splice(i, 1);
    }

    this.crab.phase += dt * (this.crab.danceTimer > 0 ? 16 : 4);
    if (this.crab.danceTimer > 0) {
      this.crab.danceTimer -= dt;
    } else {
      this.crab.x += this.crab.dir * 32 * dt;
      if (this.crab.x < 60) this.crab.dir = 1;
      if (this.crab.x > width - 60) this.crab.dir = -1;
    }

    if (this.starfish.spinTimer > 0) {
      this.starfish.spinTimer -= dt;
      this.starfish.angle += dt * 12;
    } else {
      this.starfish.angle *= Math.max(0, 1 - dt * 5);
    }
  }

  drawCastTarget(ctx, x, y, time) {
    const pulse = (time * 1.1) % 1;
    ctx.save();
    ctx.translate(x, y);

    // Expanding glowing water ring
    ctx.strokeStyle = `rgba(255, 241, 118, ${0.85 * (1 - pulse)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 + pulse * 46, (18 + pulse * 46) * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Soft center target dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bouncing pointing finger emoji above target
    const bounce = Math.sin(time * 5.5) * 8;
    ctx.font = '34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👇', 0, -24 + bounce);
    ctx.restore();
  }

  drawSkyExtras(ctx, width, waterSurfaceY, time, stageId, feverMode) {
    ctx.save();

    // Big pastel Rainbow Arch during Fever Mode!
    if (feverMode) {
      const cx = width * 0.5;
      const cy = waterSurfaceY + 12;
      const baseR = Math.min(width * 0.42, waterSurfaceY * 1.45);
      const colors = ['#ff5252', '#ffab40', '#ffea00', '#69f0ae', '#40c4ff', '#e040fb'];
      colors.forEach((col, i) => {
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(20, baseR - i * 7), Math.PI, 0);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    if (stageId === 'coral') {
      // Smiling rotating sun in top-right sky
      const sx = width - 78;
      const sy = Math.max(36, waterSurfaceY * 0.44);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.save();
      ctx.rotate(time * 0.4);
      ctx.strokeStyle = 'rgba(255, 238, 88, 0.9)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 23, Math.sin(a) * 23);
        ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#ffee58';
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e65100';
      ctx.beginPath();
      ctx.arc(-5, -2, 2.2, 0, Math.PI * 2);
      ctx.arc(5, -2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 2, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Playful seagulls
      this.seagulls.forEach((g) => {
        const flap = Math.sin(g.flapPhase) * 7;
        ctx.save();
        ctx.translate(g.x, g.y + Math.sin(g.flapPhase * 0.5) * 3);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-14, flap);
        ctx.quadraticCurveTo(-7, -8 - flap * 0.3, 0, 0);
        ctx.quadraticCurveTo(7, -8 - flap * 0.3, 14, flap);
        ctx.stroke();
        ctx.restore();
      });
    } else if (stageId === 'sunset') {
      // Glowing golden setting sun on the horizon
      const sx = width * 0.5;
      const sy = waterSurfaceY - 6;
      const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 85);
      glow.addColorStop(0, 'rgba(255, 245, 157, 0.95)');
      glow.addColorStop(0.45, 'rgba(255, 183, 77, 0.55)');
      glow.addColorStop(1, 'rgba(255, 138, 101, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(sx, sy, 32, Math.PI, 0);
      ctx.fill();

      // Cute sailboat gliding along the horizon
      const bx = this.sailboat.x;
      const by = waterSurfaceY - 4 + Math.sin(time * 2.5) * 2;
      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(16, -6);
      ctx.lineTo(0, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.moveTo(-2, -22);
      ctx.lineTo(-12, -6);
      ctx.lineTo(-2, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.moveTo(-16, -5);
      ctx.lineTo(18, -5);
      ctx.lineTo(12, 4);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (stageId === 'starry') {
      // Smiling crescent moon
      const mx = width - 82;
      const my = Math.max(36, waterSurfaceY * 0.44);
      ctx.save();
      ctx.translate(mx, my);
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#28236f';
      ctx.beginPath();
      ctx.arc(8, -5, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shooting stars
      this.shootingStars.forEach((ss) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ss.life / ss.maxLife);
        ctx.strokeStyle = '#fff9c4';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 0.14, ss.y - ss.vy * 0.14);
        ctx.stroke();
        ctx.restore();
      });
    }

    ctx.restore();
  }

  drawBackgroundDetails(ctx, width, height, waterSurfaceY, time, feverMode, stageId = 'coral', isReeling = false) {
    // Sunset golden shimmer reflection bars on upper water
    if (stageId === 'sunset' && !feverMode) {
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const rw = 90 - i * 11 + Math.sin(time * 3 + i) * 14;
        const ry = waterSurfaceY + 18 + i * 18;
        ctx.fillStyle = `rgba(255, 224, 130, ${0.34 - i * 0.045})`;
        ctx.fillRect(width * 0.5 - rw / 2, ry, rw, 5);
      }
      ctx.restore();
    }

    // Light beams (God rays)
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const bx = width * (0.12 + i * 0.2) + Math.sin(time * 0.6 + i) * 30;
      const grad = ctx.createLinearGradient(bx, waterSurfaceY, bx + 40, height * 0.8);
      if (feverMode) {
        const hue = (time * 90 + i * 65) % 360;
        grad.addColorStop(0, `hsla(${hue}, 95%, 75%, 0.28)`);
        grad.addColorStop(1, `hsla(${hue}, 95%, 75%, 0)`);
      } else if (stageId === 'starry') {
        grad.addColorStop(0, 'rgba(179, 136, 255, 0.22)');
        grad.addColorStop(1, 'rgba(179, 136, 255, 0)');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(bx - 28, waterSurfaceY);
      ctx.lineTo(bx + 28, waterSurfaceY);
      ctx.lineTo(bx + 90, height * 0.82);
      ctx.lineTo(bx - 10, height * 0.82);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Distant background mini-fish schools (depth layer!)
    ctx.save();
    ctx.fillStyle = stageId === 'starry' ? 'rgba(128, 222, 234, 0.22)' : 'rgba(255, 255, 255, 0.16)';
    this.bgSchools.forEach((sc) => {
      sc.members.forEach((m, idx) => {
        const fx = sc.x + m.ox;
        const fy = sc.y + m.oy + Math.sin(sc.phase + idx) * 4;
        ctx.save();
        ctx.translate(fx, fy);
        if (sc.dir < 0) ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.ellipse(0, 0, m.size, m.size * 0.55, 0, 0, Math.PI * 2);
        ctx.moveTo(-m.size * 0.7, 0);
        ctx.lineTo(-m.size * 1.45, -m.size * 0.5);
        ctx.lineTo(-m.size * 1.45, m.size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    });
    ctx.restore();

    // Floating marine snow / bioluminescent plankton
    ctx.save();
    this.plankton.forEach((pl) => {
      const alpha = 0.25 + Math.abs(Math.sin(pl.phase)) * 0.45;
      ctx.fillStyle = stageId === 'starry'
        ? `rgba(128, 255, 234, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Distant soft coral-reef hill silhouette behind sand
    ctx.save();
    ctx.fillStyle = stageId === 'starry'
      ? 'rgba(49, 27, 146, 0.55)'
      : stageId === 'sunset'
        ? 'rgba(0, 105, 92, 0.35)'
        : 'rgba(1, 87, 155, 0.28)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 40; x += 40) {
      const ry = height - 76 - Math.sin(x * 0.008 + 1.2) * 24 - Math.cos(x * 0.022) * 10;
      ctx.lineTo(x, ry);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Stage-themed sand floor
    ctx.save();
    const sandGrad = ctx.createLinearGradient(0, height - 68, 0, height);
    if (stageId === 'starry') {
      sandGrad.addColorStop(0, '#9575cd');
      sandGrad.addColorStop(1, '#5e35b1');
    } else if (stageId === 'sunset') {
      sandGrad.addColorStop(0, '#ffd54f');
      sandGrad.addColorStop(1, '#ff8f00');
    } else {
      sandGrad.addColorStop(0, '#ffe082');
      sandGrad.addColorStop(1, '#ffb74d');
    }
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, height - 42);
    for (let x = 0; x <= width; x += 60) {
      const y = height - 42 + Math.sin(x * 0.015) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Seabed bubble vent (cute rocky mound)
    ctx.save();
    ctx.fillStyle = stageId === 'starry' ? '#4527a0' : '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(this.vent.x, height - 30, 22, 11, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(this.vent.x, height - 34, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Colorful cartoon coral clusters
    this.corals.forEach((co) => {
      ctx.save();
      ctx.translate(co.x, height - 32);
      ctx.scale(co.scale, co.scale);
      ctx.strokeStyle = co.color;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -34);
      ctx.moveTo(0, -14);
      ctx.lineTo(-14, -26);
      ctx.moveTo(0, -18);
      ctx.lineTo(15, -30);
      ctx.stroke();
      ctx.restore();
    });

    // Swaying seaweeds (sway harder when reeling a struggling fish!)
    const swayBoost = isReeling ? 1.85 : 1.0;
    this.seaweeds.forEach((sw) => {
      ctx.save();
      ctx.strokeStyle = stageId === 'starry' ? '#4db6ac' : sw.color;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sw.x, height - 24);
      const sway = Math.sin(time * (2.2 * swayBoost) + sw.phase) * (18 * swayBoost);
      ctx.quadraticCurveTo(
        sw.x + sway,
        height - 24 - sw.height * 0.5,
        sw.x - sway * 0.6,
        height - 24 - sw.height
      );
      ctx.stroke();
      ctx.restore();
    });

    // Sand puffs kicked up during reeling struggle
    this.sandPuffs.forEach((sp) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (sp.life / sp.maxLife) * 0.5);
      ctx.fillStyle = stageId === 'starry' ? '#b39ddb' : '#ffe082';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.drawClam(ctx, height);
    this.drawCrab(ctx, height);
    this.drawStarfish(ctx, height);
  }

  drawClam(ctx, height) {
    const cx = this.clam.x;
    const cy = height - 30;
    const open = this.clam.openAmount;
    ctx.save();
    ctx.translate(cx, cy);

    // Bottom shell
    ctx.fillStyle = '#f48fb1';
    ctx.strokeStyle = '#ad1457';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, 24, 11, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Glowing pearl inside when open
    if (open > 0.12) {
      ctx.save();
      ctx.fillStyle = '#fffde7';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 12 * open;
      ctx.beginPath();
      ctx.arc(0, -1, 7.5 * Math.min(1, open * 1.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Top shell tilting open
    ctx.save();
    ctx.translate(0, 2);
    ctx.rotate(-open * 0.72);
    ctx.fillStyle = '#f8bbd0';
    ctx.beginPath();
    ctx.ellipse(0, -4, 24, 13, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Cute eyes on top shell
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(-6, -8, 2.2, 0, Math.PI * 2);
    ctx.arc(6, -8, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  drawStarfish(ctx, height) {
    const sx = this.starfish.x;
    const hop = this.starfish.spinTimer > 0 ? Math.abs(Math.sin(this.starfish.angle * 0.5)) * 18 : 0;
    const sy = height - 28 - hop;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.starfish.angle);

    ctx.fillStyle = '#ffab40';
    ctx.strokeStyle = '#ff6d00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 22 : 10;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute eyes & smile
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  drawCrab(ctx, height) {
    const cx = this.crab.x;
    const jump = this.crab.danceTimer > 0 ? Math.abs(Math.sin(this.crab.phase)) * 22 : 0;
    const cy = height - 34 - jump;

    ctx.save();
    ctx.translate(cx, cy);
    if (this.crab.danceTimer > 0) {
      ctx.rotate(Math.sin(this.crab.phase) * 0.25);
    }

    ctx.fillStyle = '#ff5252';
    const clawWave = Math.sin(this.crab.phase) * 5;
    ctx.beginPath();
    ctx.arc(-22, -12 + clawWave, 8, 0, Math.PI * 2);
    ctx.arc(22, -12 - clawWave, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -12, 5, 0, Math.PI * 2);
    ctx.arc(7, -12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-7, -12, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 1, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  drawForegroundEffects(ctx) {
    this.bubbles.forEach((b) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(225, 245, 254, 0.32)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.ripples.forEach((r) => {
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    this.splashes.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Finger & Reel Speed Sparks
    this.fingerSparks.forEach((s) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Flying Reward Stars arcing to top-left HUD!
    this.flyingStars.forEach((fs) => {
      if (fs.t < 0) return;
      const ease = 1 - Math.pow(1 - fs.t, 3);
      const x = fs.startX + (fs.toX - fs.startX) * ease;
      const y = fs.startY + (fs.toY - fs.startY) * ease - Math.sin(fs.t * Math.PI) * 90;
      ctx.save();
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐', x, y);
      ctx.restore();
    });

    this.lightningBolts.forEach((bolt) => {
      ctx.save();
      const alpha = bolt.life / bolt.maxLife;
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 14;
      ctx.beginPath();
      bolt.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    });

    this.confetti.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });

    this.popups.forEach((pop) => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, pop.life * 1.4);
      ctx.font = `900 ${pop.size}px "PingFang TC", "Noto Sans TC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(1, 87, 155, 0.85)';
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });
  }
}

window.ParticleSystem = ParticleSystem;
