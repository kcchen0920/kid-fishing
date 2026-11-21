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
    this.starfish.x = width * 0.74;

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

  update(dt, width, height, waterSurfaceY) {
    if (this.bubbles.length < 16 && Math.random() < dt * 2.5) {
      this.spawnBubble(width, height);
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

  drawBackgroundDetails(ctx, width, height, waterSurfaceY, time, feverMode) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const bx = width * (0.12 + i * 0.2) + Math.sin(time * 0.6 + i) * 30;
      const grad = ctx.createLinearGradient(bx, waterSurfaceY, bx + 40, height * 0.8);
      if (feverMode) {
        const hue = (time * 90 + i * 65) % 360;
        grad.addColorStop(0, `hsla(${hue}, 95%, 75%, 0.28)`);
        grad.addColorStop(1, `hsla(${hue}, 95%, 75%, 0)`);
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

    ctx.save();
    const sandGrad = ctx.createLinearGradient(0, height - 68, 0, height);
    sandGrad.addColorStop(0, '#ffe082');
    sandGrad.addColorStop(1, '#ffb74d');
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

    this.seaweeds.forEach((sw) => {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sw.x, height - 24);
      const sway = Math.sin(time * 2.2 + sw.phase) * 18;
      ctx.quadraticCurveTo(
        sw.x + sway,
        height - 24 - sw.height * 0.5,
        sw.x - sway * 0.6,
        height - 24 - sw.height
      );
      ctx.stroke();
      ctx.restore();
    });

    this.drawCrab(ctx, height);
    this.drawStarfish(ctx, height);
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
