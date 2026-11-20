/* =========================================================
   Ocean Creatures Catalog & Cute Cartoon Canvas Renderer
   12 adorable sea creatures tailored for 4-year-old kids!
   ========================================================= */

window.FISH_CATALOG = [
  {
    id: 'clownfish',
    name: '小丑魚',
    rarity: 1,
    stars: 10,
    size: 42,
    speed: 1.0,
    pullStrength: 0.22,
    depthRange: [0.22, 0.55],
    weight: 22,
    funLine: '橘色條紋好可愛，牠最喜歡海葵！',
    voiceLine: '哇！釣到小丑魚了！好棒喔！'
  },
  {
    id: 'blue_tang',
    name: '藍寶石魚',
    rarity: 1,
    stars: 10,
    size: 44,
    speed: 1.15,
    pullStrength: 0.24,
    depthRange: [0.24, 0.62],
    weight: 20,
    funLine: '亮晶晶的藍色身體，游得好快呀！',
    voiceLine: '耶！是藍寶石魚！游得好快喔！'
  },
  {
    id: 'puffer',
    name: '胖胖河豚',
    rarity: 1,
    stars: 15,
    size: 44,
    speed: 0.8,
    pullStrength: 0.28,
    depthRange: [0.3, 0.7],
    weight: 18,
    funLine: '噗噗！牠一緊張就會鼓成大氣球喔！',
    voiceLine: '哈哈！胖胖河豚鼓成圓圓的大氣球了！'
  },
  {
    id: 'jellyfish',
    name: '彩虹水母',
    rarity: 2,
    stars: 15,
    size: 44,
    speed: 0.65,
    pullStrength: 0.25,
    depthRange: [0.22, 0.68],
    weight: 15,
    funLine: '軟綿綿像小雨傘一樣在海裡飄呀飄！',
    voiceLine: '哇！閃亮亮的彩虹水母！像小雨傘一樣！'
  },
  {
    id: 'seahorse',
    name: '星星海馬',
    rarity: 2,
    stars: 20,
    size: 40,
    speed: 0.72,
    pullStrength: 0.25,
    depthRange: [0.45, 0.82],
    weight: 14,
    funLine: '捲捲的小尾巴會抓著海草玩遊戲！',
    voiceLine: '好可愛！是捲捲尾巴的星星海馬！'
  },
  {
    id: 'turtle',
    name: '微笑海龜',
    rarity: 2,
    stars: 20,
    size: 56,
    speed: 0.78,
    pullStrength: 0.34,
    depthRange: [0.32, 0.72],
    weight: 13,
    funLine: '背著圓圓的硬殼，慢悠悠地跟你說哈囉！',
    voiceLine: '太厲害了！釣到愛笑的海龜！'
  },
  {
    id: 'octopus',
    name: '害羞章魚',
    rarity: 2,
    stars: 25,
    size: 52,
    speed: 0.85,
    pullStrength: 0.36,
    depthRange: [0.5, 0.84],
    weight: 12,
    funLine: '有八隻軟軟的腳，最愛吹泡泡！',
    voiceLine: '哇塞！是八隻腳的害羞章魚！'
  },
  {
    id: 'goldfish',
    name: '黃金大鯉魚',
    rarity: 3,
    stars: 30,
    size: 56,
    speed: 1.25,
    pullStrength: 0.38,
    depthRange: [0.25, 0.65],
    weight: 9,
    funLine: '閃閃發光的幸運金魚，帶來滿滿星星！',
    voiceLine: '超幸運！釣到閃亮亮的黃金大鯉魚！'
  },
  {
    id: 'baby_shark',
    name: '小小鯊魚',
    rarity: 3,
    stars: 35,
    size: 68,
    speed: 1.35,
    pullStrength: 0.44,
    depthRange: [0.35, 0.75],
    weight: 8,
    funLine: '嘟嘟嘟！牠其實是很愛笑的乖寶寶鯊魚！',
    voiceLine: '好厲害！釣到愛笑的小小鯊魚！嘟嘟嘟！'
  },
  {
    id: 'narwhal',
    name: '獨角鯨寶寶',
    rarity: 3,
    stars: 40,
    size: 68,
    speed: 1.1,
    pullStrength: 0.44,
    depthRange: [0.28, 0.68],
    weight: 7,
    funLine: '頭上有根神奇的黃金小尖角，像海洋獨角獸！',
    voiceLine: '哇！是海洋獨角獸，獨角鯨寶寶！'
  },
  {
    id: 'treasure',
    name: '黃金大寶箱',
    rarity: 3,
    stars: 50,
    size: 54,
    speed: 0.35,
    pullStrength: 0.42,
    depthRange: [0.76, 0.87],
    weight: 5,
    funLine: '打開裡面有滿滿的星星和閃亮寶石！',
    voiceLine: '發財啦！釣到超級黃金大寶箱！'
  },
  {
    id: 'rainbow_whale',
    name: '彩虹大鯨魚',
    rarity: 4, // BOSS!
    stars: 100,
    size: 110,
    speed: 0.9,
    pullStrength: 0.56,
    depthRange: [0.32, 0.6],
    weight: 0, // Spawned via exciting Boss Event!
    isBoss: true,
    funLine: '大海裡最溫柔的巨無霸好朋友！超級無敵棒！',
    voiceLine: '超級無敵大成功！你釣到了彩虹大鯨魚！太強了！'
  }
];

window.FISH_BY_ID = {};
window.FISH_CATALOG.forEach((f) => {
  window.FISH_BY_ID[f.id] = f;
});

/**
 * Draw any creature centered at (0, 0) facing RIGHT (+x).
 * Caller handles translate/scale/flip.
 */
window.drawCreature = function drawCreature(ctx, typeId, options = {}) {
  const {
    size = 50,
    time = 0,
    puffed = 0, // 0..1 for pufferfish inflate
    excited = false,
    silhouette = false,
    shocked = false
  } = options;

  const s = size / 50; // normalized scale around 50px base
  const wag = Math.sin(time * (excited ? 18 : 7)) * 0.22;

  ctx.save();
  ctx.scale(s, s);

  if (silhouette) {
    ctx.filter = 'brightness(0) opacity(0.32)';
  }

  // Boss or golden aura
  if (!silhouette && (typeId === 'rainbow_whale' || typeId === 'goldfish' || typeId === 'treasure')) {
    ctx.save();
    const glowR = typeId === 'rainbow_whale' ? 74 : 46;
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, glowR);
    grad.addColorStop(0, 'rgba(255, 241, 118, 0.55)');
    grad.addColorStop(1, 'rgba(255, 241, 118, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const drawCuteEye = (x, y, r = 7.5) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (shocked) {
      // Cartoon dizzy/star eyes when zapped!
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y - r * 0.5);
      ctx.lineTo(x + r * 0.5, y + r * 0.5);
      ctx.moveTo(x + r * 0.5, y - r * 0.5);
      ctx.lineTo(x - r * 0.5, y + r * 0.5);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.arc(x + r * 0.2, y - r * 0.05, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + r * 0.38, y - r * 0.28, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSmile = (x, y, w = 8) => {
    ctx.strokeStyle = '#4a148c';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, w, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  };

  const drawCheek = (x, y, r = 4.5) => {
    ctx.fillStyle = 'rgba(255, 105, 180, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.25, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  switch (typeId) {
    case 'clownfish': {
      // Tail
      ctx.save();
      ctx.translate(-26, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-18, -18, -22, -10);
      ctx.quadraticCurveTo(-14, 0, -22, 10);
      ctx.quadraticCurveTo(-18, 18, 0, 0);
      ctx.fill();
      ctx.restore();

      // Top & bottom fins
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.ellipse(-2, -18, 14, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-4, 17, 10, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // White stripes (clipped to body)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      [-10, 6].forEach((sx) => {
        ctx.beginPath();
        ctx.rect(sx - 4, -24, 8, 48);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();

      drawCuteEye(15, -4, 7.5);
      drawCheek(12, 6, 4);
      drawSmile(20, 4, 5);
      break;
    }

    case 'blue_tang': {
      // Yellow tail
      ctx.save();
      ctx.translate(-28, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, -16);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-20, 16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Body
      ctx.fillStyle = '#1e88e5';
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Royal dark blue band
      ctx.fillStyle = '#0d47a1';
      ctx.beginPath();
      ctx.ellipse(-4, -8, 18, 9, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Yellow pectoral fin
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.ellipse(2, 6, 9, 5, 0.4 + wag * 0.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(16, -4, 7.5);
      drawCheek(13, 6, 4);
      drawSmile(21, 5, 5);
      break;
    }

    case 'puffer': {
      const inflate = 1 + puffed * 0.42;
      ctx.scale(inflate, inflate);

      // Little tail
      ctx.save();
      ctx.translate(-22, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#ffb74d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, -10);
      ctx.lineTo(-14, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Spikes
      ctx.fillStyle = '#ff8f00';
      const spikes = 12;
      for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2;
        const r = 24;
        const tip = 31 + puffed * 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a - 0.14) * r, Math.sin(a - 0.14) * r);
        ctx.lineTo(Math.cos(a) * tip, Math.sin(a) * tip);
        ctx.lineTo(Math.cos(a + 0.14) * r, Math.sin(a + 0.14) * r);
        ctx.closePath();
        ctx.fill();
      }

      // Round body
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();

      // Cream belly
      ctx.fillStyle = '#fff8e1';
      ctx.beginPath();
      ctx.ellipse(2, 10, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(11, -5, 8);
      drawCheek(8, 5, 5);
      // Cute "O" mouth when puffed!
      if (puffed > 0.3) {
        ctx.fillStyle = '#ff7043';
        ctx.beginPath();
        ctx.arc(20, 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawSmile(17, 4, 5);
      }
      break;
    }

    case 'jellyfish': {
      const pulse = Math.sin(time * 5) * 0.1;
      ctx.scale(1 + pulse, 1 - pulse);

      // Tentacles
      const tentacleColors = ['#ff80ab', '#ea80fc', '#80d8ff', '#ffd180'];
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = tentacleColors[(i + 2) % tentacleColors.length];
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const x0 = i * 8;
        ctx.moveTo(x0, 6);
        const wave = Math.sin(time * 7 + i) * 7;
        ctx.quadraticCurveTo(x0 + wave, 22, x0 - wave * 0.6, 36);
        ctx.stroke();
      }

      // Bell dome
      const grad = ctx.createLinearGradient(0, -28, 0, 12);
      grad.addColorStop(0, '#ff80ab');
      grad.addColorStop(0.5, '#ea80fc');
      grad.addColorStop(1, '#b388ff');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 2, 26, Math.PI, 0);
      ctx.quadraticCurveTo(26, 12, 16, 10);
      ctx.quadraticCurveTo(8, 14, 0, 10);
      ctx.quadraticCurveTo(-8, 14, -16, 10);
      ctx.quadraticCurveTo(-26, 12, -26, 2);
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-9, -12, 7, 4, -0.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(-8, -3, 6);
      drawCuteEye(8, -3, 6);
      drawCheek(-14, 3, 3.5);
      drawCheek(14, 3, 3.5);
      drawSmile(0, 1, 5);
      break;
    }

    case 'seahorse': {
      // Dorsal fin
      ctx.fillStyle = '#fff176';
      ctx.beginPath();
      ctx.ellipse(-15, -2, 8, 13, wag * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Curly body
      ctx.fillStyle = '#ffab91';
      ctx.beginPath();
      ctx.arc(2, -16, 14, 0, Math.PI * 2); // head
      ctx.fill();

      // Snout
      ctx.beginPath();
      ctx.roundRect(10, -18, 16, 8, 4);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.ellipse(-2, 4, 13, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Curly tail
      ctx.strokeStyle = '#ff8a65';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-4, 24, 9, -0.5, Math.PI * 1.3);
      ctx.stroke();

      // Star belly spots
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(3, 0, 4, 0, Math.PI * 2);
      ctx.arc(2, 9, 3.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(5, -18, 6.5);
      drawCheek(1, -11, 3.5);
      break;
    }

    case 'turtle': {
      // Flippers
      ctx.fillStyle = '#66bb6a';
      ctx.save();
      ctx.translate(6, 14);
      ctx.rotate(0.4 + wag);
      ctx.beginPath();
      ctx.ellipse(0, 6, 13, 6, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(-16, 14);
      ctx.rotate(-0.3 - wag * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 5, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head
      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.ellipse(28, -2, 13, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shell
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(-2, 0, 26, 19, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Shell rim
      ctx.fillStyle = '#aed581';
      ctx.beginPath();
      ctx.ellipse(-2, 2, 27, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shell pattern dots
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath();
      ctx.arc(-2, -10, 6, 0, Math.PI * 2);
      ctx.arc(-14, -6, 4.5, 0, Math.PI * 2);
      ctx.arc(10, -6, 4.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(31, -5, 6.5);
      drawCheek(28, 3, 3.5);
      drawSmile(33, 3, 5);
      break;
    }

    case 'octopus': {
      // Cute waving tentacles
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let i = -3; i <= 3; i++) {
        const wave = Math.sin(time * 6 + i * 0.9) * 6;
        ctx.beginPath();
        ctx.moveTo(i * 6, 8);
        ctx.quadraticCurveTo(i * 9 + wave, 22, i * 11, 28 + (i % 2) * 4);
        ctx.stroke();
      }

      // Big round head
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(0, -4, 24, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(-9, -14, 7, 4, -0.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(-9, -2, 7.5);
      drawCuteEye(9, -2, 7.5);
      drawCheek(-16, 6, 4.5);
      drawCheek(16, 6, 4.5);
      drawSmile(0, 5, 6);
      break;
    }

    case 'goldfish': {
      // Flowing golden tail
      ctx.save();
      ctx.translate(-26, 0);
      ctx.rotate(wag * 1.2);
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-24, -24, -30, -10);
      ctx.quadraticCurveTo(-18, 0, -30, 10);
      ctx.quadraticCurveTo(-24, 24, 0, 0);
      ctx.fill();
      ctx.restore();

      // Crown fin
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.ellipse(-4, -20, 15, 9, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Golden gradient body
      const grad = ctx.createLinearGradient(-25, -20, 25, 20);
      grad.addColorStop(0, '#fff59d');
      grad.addColorStop(0.5, '#ffca28');
      grad.addColorStop(1, '#ff8f00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 31, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Little crown on head!
      ctx.fillStyle = '#ffeb3b';
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(8, -28);
      ctx.lineTo(13, -22);
      ctx.lineTo(18, -28);
      ctx.lineTo(20, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawCuteEye(15, -3, 8);
      drawCheek(12, 7, 4.5);
      drawSmile(21, 5, 5);
      break;
    }

    case 'baby_shark': {
      // Tail
      ctx.save();
      ctx.translate(-32, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#42a5f5';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-22, -20);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-18, 16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Dorsal fin
      ctx.fillStyle = '#1e88e5';
      ctx.beginPath();
      ctx.moveTo(-8, -16);
      ctx.quadraticCurveTo(0, -38, 12, -16);
      ctx.closePath();
      ctx.fill();

      // Body
      ctx.fillStyle = '#42a5f5';
      ctx.beginPath();
      ctx.ellipse(0, 0, 38, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // White belly
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(4, 10, 30, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute teeth smile
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1565c0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(22, 6, 10, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      drawCuteEye(18, -5, 8);
      drawCheek(14, 5, 4.5);
      break;
    }

    case 'narwhal': {
      // Golden unicorn horn!
      ctx.fillStyle = '#ffd54f';
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, -8);
      ctx.lineTo(58, -15);
      ctx.lineTo(31, -1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.save();
      ctx.translate(-32, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#80deea';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-18, -18, -22, -8);
      ctx.quadraticCurveTo(-14, 0, -22, 8);
      ctx.quadraticCurveTo(-18, 18, 0, 0);
      ctx.fill();
      ctx.restore();

      // Chubby body
      ctx.fillStyle = '#80deea';
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft white belly
      ctx.fillStyle = '#e0f7fa';
      ctx.beginPath();
      ctx.ellipse(4, 11, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pastel spots
      ctx.fillStyle = '#b2ebf2';
      ctx.beginPath();
      ctx.arc(-10, -8, 5, 0, Math.PI * 2);
      ctx.arc(-20, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      drawCuteEye(18, -4, 7.5);
      drawCheek(14, 6, 4.5);
      drawSmile(22, 5, 5);
      break;
    }

    case 'treasure': {
      const bob = Math.sin(time * 5) * 2;
      ctx.translate(0, bob);

      // Chest box
      ctx.fillStyle = '#8d6e63';
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-26, -8, 52, 30, 8);
      ctx.fill();
      ctx.stroke();

      // Lid
      ctx.fillStyle = '#a1887f';
      ctx.beginPath();
      ctx.roundRect(-28, -22, 56, 18, [14, 14, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Gold bands
      ctx.fillStyle = '#ffca28';
      ctx.fillRect(-16, -22, 8, 44);
      ctx.fillRect(8, -22, 8, 44);
      ctx.fillRect(-26, -10, 52, 6);

      // Center lock
      ctx.fillStyle = '#ffe082';
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-7, -12, 14, 14, 4);
      ctx.fill();
      ctx.stroke();

      // Sparkles
      ctx.fillStyle = '#fff59d';
      const sp = 0.7 + Math.sin(time * 8) * 0.3;
      ctx.beginPath();
      ctx.arc(-18, -28, 4 * sp, 0, Math.PI * 2);
      ctx.arc(20, -26, 5 * sp, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rainbow_whale': {
      // Giant happy BOSS whale!
      // Tail
      ctx.save();
      ctx.translate(-38, 0);
      ctx.rotate(wag * 0.8);
      ctx.fillStyle = '#7c4dff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-24, -26, -28, -12);
      ctx.quadraticCurveTo(-18, 0, -28, 12);
      ctx.quadraticCurveTo(-24, 26, 0, 0);
      ctx.fill();
      ctx.restore();

      // Rainbow gradient body
      const grad = ctx.createLinearGradient(-40, -28, 40, 28);
      grad.addColorStop(0, '#7c4dff');
      grad.addColorStop(0.35, '#29b6f6');
      grad.addColorStop(0.7, '#26c6da');
      grad.addColorStop(1, '#ff80ab');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Striped pastel belly
      ctx.fillStyle = '#fff8e1';
      ctx.beginPath();
      ctx.ellipse(8, 15, 32, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water spout on top!
      ctx.strokeStyle = '#80d8ff';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const spoutH = 14 + Math.sin(time * 8) * 4;
      ctx.beginPath();
      ctx.moveTo(10, -27);
      ctx.quadraticCurveTo(6, -27 - spoutH, -2, -25 - spoutH * 0.7);
      ctx.moveTo(10, -27);
      ctx.quadraticCurveTo(14, -27 - spoutH, 22, -25 - spoutH * 0.7);
      ctx.stroke();

      // Golden crown
      ctx.fillStyle = '#ffeb3b';
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -26);
      ctx.lineTo(-6, -38);
      ctx.lineTo(1, -31);
      ctx.lineTo(8, -38);
      ctx.lineTo(10, -26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      drawCuteEye(22, -4, 9);
      drawCheek(17, 7, 5.5);
      drawSmile(26, 7, 8);
      break;
    }
  }

  ctx.restore();
};
