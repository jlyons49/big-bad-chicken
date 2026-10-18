/**
 * Big Bad Chicken - Web Audio Procedural Synthesizer & Music Engine
 * 100% Zero-dependency, lightweight, dynamic chiptune and sfx.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    
    this.soundMuted = false;
    this.musicMuted = false;
    
    // Music state
    this.isPlayingMusic = false;
    this.musicInterval = null;
    this.musicStep = 0;
    this.tempoBpm = 124;
    
    // Heartbeat state
    this.heartbeatTimer = null;
    this.isHeartbeatPlaying = false;
    
    this.loadSettings();
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundMuted ? 0 : 0.9;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.musicMuted ? 0 : 0.35;
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  loadSettings() {
    try {
      this.soundMuted = localStorage.getItem('bbc_sound_muted') === 'true';
      this.musicMuted = localStorage.getItem('bbc_music_muted') === 'true';
    } catch (e) {}
  }

  saveSettings() {
    try {
      localStorage.setItem('bbc_sound_muted', this.soundMuted);
      localStorage.setItem('bbc_music_muted', this.musicMuted);
    } catch (e) {}
  }

  toggleSound() {
    this.soundMuted = !this.soundMuted;
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.soundMuted ? 0 : 0.9;
    }
    this.saveSettings();
    return !this.soundMuted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.musicMuted ? 0 : 0.35;
    }
    if (!this.musicMuted && !this.isPlayingMusic) {
      this.startMusic();
    } else if (this.musicMuted && this.isPlayingMusic) {
      this.stopMusic();
    }
    this.saveSettings();
    return !this.musicMuted;
  }

  // --- Procedural Sound Effects ---

  peck() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  eat(tier = 1) {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Bubble / Vacuum Pop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = Math.max(160, 680 - tier * 45);
    osc.type = tier >= 4 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);

    // Extra crunch for large items
    if (tier >= 3) {
      this.crunch(tier);
    }
  }

  crunch(tier = 3) {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise crunch
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3000, 700 + tier * 250), now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(Math.min(0.8, 0.3 + tier * 0.08), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  cluck(excited = false) {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const startF = excited ? 580 : 420;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.linearRampToValueAtTime(startF + 140, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.17);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  levelUp() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.35, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.24);
    });
  }

  milestone() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [329.63, 440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.45, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.42);
    });
  }

  coin() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  dash() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  purchase() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chord.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  gameOver() {
    if (this.soundMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.stopHeartbeat();
    const now = this.ctx.currentTime;
    const notes = [440, 415.30, 392, 349.23, 293.66]; // Slide down
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.4, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.22);
    });
  }

  startHeartbeat() {
    if (this.isHeartbeatPlaying || this.soundMuted) return;
    this.isHeartbeatPlaying = true;
    this.playHeartbeatThud();
    this.heartbeatTimer = setInterval(() => {
      this.playHeartbeatThud();
    }, 620);
  }

  stopHeartbeat() {
    if (!this.isHeartbeatPlaying) return;
    this.isHeartbeatPlaying = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  playHeartbeatThud() {
    if (this.soundMuted || !this.isHeartbeatPlaying) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // --- Dynamic Procedural BGM Engine ---

  startMusic() {
    if (this.musicMuted || this.isPlayingMusic) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }

  scheduleMusicStep() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const stepDuration = 60 / this.tempoBpm / 2; // 16th notes
    this.playMusicNote(this.musicStep);

    this.musicStep = (this.musicStep + 1) % 32;
    this.musicInterval = setTimeout(() => {
      this.scheduleMusicStep();
    }, stepDuration * 1000);
  }

  playMusicNote(step) {
    if (this.musicMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Upbeat catchy bassline: C - G - A - F
    const bassline = [
      130.81, null, 130.81, 164.81, 196.00, null, 196.00, 220.00,
      220.00, null, 220.00, 246.94, 174.61, null, 174.61, 196.00,
      130.81, null, 130.81, 164.81, 196.00, null, 196.00, 261.63,
      220.00, null, 196.00, null, 174.61, 164.81, 146.83, 130.81
    ];

    const freq = bassline[step];
    if (freq) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.18);
    }

    // Gentle playful lead synth on key beats
    const lead = [
      523.25, null, 659.25, null, 783.99, null, 880.00, null,
      659.25, null, 523.25, null, 587.33, null, null, null,
      523.25, null, 659.25, null, 783.99, null, 1046.5, null,
      880.00, null, 783.99, null, 659.25, null, 587.33, null
    ];

    const leadFreq = lead[step];
    if (leadFreq && step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(leadFreq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.24);
    }
  }

  setTempoMultiplier(mult = 1.0) {
    this.tempoBpm = Math.min(170, Math.max(110, 124 * mult));
  }
}

export const sound = new SoundEngine();
