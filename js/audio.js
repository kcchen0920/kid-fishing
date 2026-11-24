/* =========================================================
   Synthesized Arcade Sound Engine (Web Audio API)
   + Independent Mandarin Voice Encouragement + Haptics
   ========================================================= */

class ArcadeAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.voiceEnabled = true;
    this.bgmEnabled = true;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmFever = false;
    this.lastReelSoundTime = 0;
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.unlock();
      this.playBoop(520);
    }
    return this.enabled;
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (this.voiceEnabled) {
      this.speak('語音打開囉！');
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.voiceEnabled;
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.unlock();
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  startBgm() {
    if (this.bgmTimer) return;
    // Cheerful, gentle pentatonic toy-marimba melody!
    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 392.0,
                   440.0, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25];
    const tick = () => {
      if (this.enabled && this.bgmEnabled && this.ctx && this.ctx.state === 'running') {
        const freq = notes[this.bgmStep % notes.length] * (this.bgmFever ? 1.122 : 1.0);
        this.playTone(freq, 0.22, 'sine', 0.048);
        if (this.bgmStep % 4 === 0) {
          this.playTone(freq * 0.5, 0.3, 'triangle', 0.035);
        }
        this.bgmStep++;
      }
      this.bgmTimer = setTimeout(tick, this.bgmFever ? 250 : 380);
    };
    tick();
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  pauseForBackground() {
    this._wasBgmRunning = Boolean(this.bgmTimer);
    this.stopBgm();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  resumeFromBackground() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this._wasBgmRunning && this.bgmEnabled) {
      this.startBgm();
    }
  }

  setBgmFever(active) {
    this.bgmFever = active;
  }

  playTreasureJackpot() {
    const coins = [784, 988, 1175, 1319, 1568, 1319, 1568, 2093];
    coins.forEach((f, i) => {
      this.playTone(f, 0.16, 'triangle', 0.2, null, i * 0.065);
    });
    this.vibrate([50, 30, 50, 30, 140]);
  }

  playLeap() {
    this.playTone(340, 0.28, 'sine', 0.18, 920);
    this.playSplash(0.02);
  }

  playParadeChime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(f, 0.12, 'sine', 0.16, null, i * 0.07);
    });
  }

  vibrate(pattern) {
    if (!this.enabled) return;
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }

  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-TW';
      utter.rate = 1.08;
      utter.pitch = 1.25;
      utter.volume = 0.92;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  playTone(freq, duration, type = 'sine', volume = 0.18, slideTo = null, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(duration, filterFreq = 900, volume = 0.14, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playBoop(freq = 480) {
    this.playTone(freq, 0.12, 'triangle', 0.2, freq * 1.35);
  }

  playBubblePop() {
    const base = 420 + Math.random() * 260;
    this.playTone(base, 0.09, 'sine', 0.2, base * 2.1);
  }

  playCast() {
    this.playTone(260, 0.22, 'sine', 0.15, 720);
    this.playNoise(0.18, 1200, 0.08);
    this.playSplash(0.2);
    this.vibrate(25);
  }

  playSplash(delay = 0) {
    this.playNoise(0.28, 700, 0.18, delay);
    this.playTone(320, 0.16, 'sine', 0.14, 150, delay);
    this.playTone(540, 0.14, 'sine', 0.12, 820, delay + 0.07);
  }

  playNibble() {
    this.playTone(520, 0.08, 'sine', 0.16, 680);
    this.vibrate(20);
  }

  playBiteAlarm() {
    const notes = [587.33, 880, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.14, 'square', 0.12, n * 1.04, idx * 0.07);
    });
    this.playSplash(0.05);
    this.vibrate([50, 35, 80]);
  }

  playReelClick(progress = 0.5, speedBoost = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastReelSoundTime < 46) return;
    this.lastReelSoundTime = now;

    const pitch = 340 + progress * 500 + speedBoost * 160 + Math.random() * 30;
    this.playTone(pitch, 0.045, 'triangle', 0.16, pitch * 1.25);
    this.vibrate(12);
  }

  playZapReady() {
    this.playTone(660, 0.1, 'triangle', 0.18, 990, 0);
    this.playTone(990, 0.16, 'triangle', 0.2, 1320, 0.09);
  }

  playZap() {
    this.playTone(1200, 0.28, 'sawtooth', 0.14, 180);
    this.playTone(880, 0.25, 'square', 0.1, 1400, 0.05);
    this.playNoise(0.22, 2400, 0.16, 0.02);
    this.vibrate([40, 20, 60, 20, 80]);
  }

  playCatchFanfare(isBig = false) {
    const melody = isBig
      ? [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5]
      : [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, i) => {
      const dur = i === melody.length - 1 ? 0.42 : 0.13;
      this.playTone(freq, dur, 'triangle', 0.22, null, i * 0.1);
      this.playTone(freq * 1.5, dur * 0.8, 'sine', 0.08, null, i * 0.1);
    });
    this.vibrate([60, 40, 120]);
  }

  playRankUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((n, i) => {
      this.playTone(n, 0.18, 'triangle', 0.22, null, i * 0.08);
    });
    this.vibrate([50, 30, 50, 30, 120]);
  }

  playCombo(count) {
    const base = 520 + Math.min(count, 8) * 60;
    this.playTone(base, 0.12, 'triangle', 0.18, base * 1.25);
  }

  playBossAlert() {
    [330, 440, 330, 440, 587.33].forEach((freq, i) => {
      this.playTone(freq, 0.16, 'sawtooth', 0.1, null, i * 0.14);
    });
    this.vibrate([80, 50, 80]);
  }

  playFeverStart() {
    const notes = [523, 587, 659, 784, 880, 1046];
    notes.forEach((n, i) => {
      this.playTone(n, 0.14, 'triangle', 0.18, null, i * 0.065);
    });
  }

  playCreatureGiggle() {
    this.playTone(540, 0.07, 'sine', 0.16, 760, 0);
    this.playTone(620, 0.08, 'sine', 0.16, 880, 0.08);
  }

  playPearlChime() {
    const notes = [880, 1174.66, 1396.91, 1760];
    notes.forEach((n, i) => {
      this.playTone(n, 0.18, 'sine', 0.16, null, i * 0.055);
    });
    this.vibrate([20, 20, 40]);
  }

  playSeagull() {
    this.playTone(1350, 0.12, 'triangle', 0.12, 920, 0);
    this.playTone(1200, 0.14, 'triangle', 0.11, 860, 0.13);
  }

  playFeedPlop() {
    this.playTone(360, 0.09, 'sine', 0.16, 620, 0);
  }

  playStickerReward() {
    const notes = [659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((n, i) => {
      this.playTone(n, 0.16, 'triangle', 0.2, null, i * 0.07);
    });
    this.vibrate([40, 25, 80]);
  }
}

window.arcadeAudio = new ArcadeAudio();
