// Procedural Web Audio Engine for Solas Haven

export type SoundscapeType = "432hz" | "528hz" | "rain" | "ocean";

export interface SoundscapeInfo {
  id: SoundscapeType;
  name: string;
  description: string;
  tag: string;
}

export const SOUNDSCAPES: SoundscapeInfo[] = [
  {
    id: "432hz",
    name: "432Hz Cosmic Drone",
    description: "Deep harmonic grounding and celestial stillness",
    tag: "✦ Celestial",
  },
  {
    id: "528hz",
    name: "528Hz Heart Resonance",
    description: "Solfeggio frequency of emotional healing and peace",
    tag: "🤍 Miracle",
  },
  {
    id: "rain",
    name: "Midnight Rain",
    description: "Gentle rainfall against a dark sanctuary window",
    tag: "🌧 Rain",
  },
  {
    id: "ocean",
    name: "Ocean Tidal Drift",
    description: "Slow nocturnal waves rolling onto distant shores",
    tag: "🌊 Tidal",
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = true;
  private currentSoundscape: SoundscapeType = "432hz";

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private createPinkNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 6; // 6-second seamless loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Start procedural ambient soundscape
  public startAmbient(soundscape?: SoundscapeType) {
    this.initContext();
    if (!this.ctx) return;

    if (soundscape) {
      this.currentSoundscape = soundscape;
    }

    this.stopAmbient(true);

    if (this.currentSoundscape === "432hz") {
      this.start432HzDrone();
    } else if (this.currentSoundscape === "528hz") {
      this.start528HzResonance();
    } else if (this.currentSoundscape === "rain") {
      this.startMidnightRain();
    } else if (this.currentSoundscape === "ocean") {
      this.startOceanDrift();
    }

    this.isMuted = false;
  }

  private start432HzDrone() {
    if (!this.ctx) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(540, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);
    filter.connect(this.ctx.destination);
    this.filterNode = filter;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 3.0);
    masterGain.connect(filter);
    this.droneGain = masterGain;

    // 108Hz, 216Hz, 324Hz, 432Hz
    const freqs = [108, 216, 324, 432];
    this.oscillators = freqs.map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      const lfo = this.ctx!.createOscillator();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.04, this.ctx!.currentTime);
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.setValueAtTime(1.2, this.ctx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.28 / (idx + 1), this.ctx!.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      return osc;
    });
  }

  private start528HzResonance() {
    if (!this.ctx) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
    filter.connect(this.ctx.destination);
    this.filterNode = filter;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 3.0);
    masterGain.connect(filter);
    this.droneGain = masterGain;

    // 264Hz, 528Hz, 792Hz, 1056Hz
    const freqs = [264, 528, 792, 1056];
    this.oscillators = freqs.map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();

      osc.type = idx === 1 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      const lfo = this.ctx!.createOscillator();
      lfo.frequency.setValueAtTime(0.06 + idx * 0.03, this.ctx!.currentTime);
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.setValueAtTime(0.9, this.ctx!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.22 / (idx + 1), this.ctx!.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      return osc;
    });
  }

  private startMidnightRain() {
    if (!this.ctx) return;

    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.6, this.ctx.currentTime);
    filter.connect(this.ctx.destination);
    this.filterNode = filter;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 2.5);
    masterGain.connect(filter);
    this.droneGain = masterGain;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(masterGain);
    source.start();
    this.noiseSource = source;
  }

  private startOceanDrift() {
    if (!this.ctx) return;

    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
    filter.connect(this.ctx.destination);
    this.filterNode = filter;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.055, this.ctx.currentTime + 3.0);
    masterGain.connect(filter);
    this.droneGain = masterGain;

    // Organic ocean wave LFO (11.5 second wave period)
    const waveLfo = this.ctx.createOscillator();
    waveLfo.type = "sine";
    waveLfo.frequency.setValueAtTime(0.085, this.ctx.currentTime); // ~11.7 sec cycle

    const waveFilterGain = this.ctx.createGain();
    waveFilterGain.gain.setValueAtTime(260, this.ctx.currentTime);
    waveLfo.connect(waveFilterGain);
    waveFilterGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    waveLfo.connect(waveGain);
    waveGain.connect(masterGain.gain);

    waveLfo.start();
    this.oscillators.push(waveLfo);

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(masterGain);
    source.start();
    this.noiseSource = source;
  }

  public stopAmbient(immediate: boolean = false) {
    if (!this.ctx) {
      this.isMuted = true;
      return;
    }

    const currentDroneGain = this.droneGain;
    const currentOscs = [...this.oscillators];
    const currentNoise = this.noiseSource;

    this.droneGain = null;
    this.filterNode = null;
    this.oscillators = [];
    this.noiseSource = null;
    this.isMuted = true;

    if (currentDroneGain) {
      try {
        if (immediate) {
          currentDroneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        } else {
          currentDroneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
        }
      } catch {}
    }

    const delay = immediate ? 50 : 1250;
    setTimeout(() => {
      currentOscs.forEach((osc) => {
        try {
          osc.stop();
        } catch {}
      });
      if (currentNoise) {
        try {
          currentNoise.stop();
        } catch {}
      }
    }, delay);
  }

  public toggleAmbient(soundscape?: SoundscapeType): boolean {
    if (this.isMuted) {
      this.startAmbient(soundscape);
      return true;
    } else {
      this.stopAmbient();
      return false;
    }
  }

  public setSoundscape(soundscape: SoundscapeType) {
    this.currentSoundscape = soundscape;
    if (!this.isMuted) {
      this.startAmbient(soundscape);
    }
  }

  public getCurrentSoundscape(): SoundscapeType {
    return this.currentSoundscape;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Celestial ascension chime when releasing letter into stars
  public playCelestialAscension() {
    this.initContext();
    if (!this.ctx) return;

    const notes = [185.0, 233.08, 277.18, 369.99, 415.3, 554.37];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.6);
    });
  }

  // Delicate Solfeggio 528Hz shimmer note when clicking "Send Light" or "Wander"
  public playLightShimmer() {
    this.initContext();
    if (!this.ctx) return;

    const notes = [528, 660, 792];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.5);
    });
  }
  // Sacred Prayer Ascension Chime (528Hz Solfeggio Healing Resonance with golden bell harmonics)
  public playPrayerAscensionChime() {
    this.initContext();
    if (!this.ctx) return;

    // 528Hz (Transformation & Miracles) + sacred harmonic intervals (396Hz, 528Hz, 639Hz, 852Hz)
    const freqs = [396, 528, 639, 852, 1056];
    const now = this.ctx.currentTime;

    // Soft master envelope for a cathedral/temple singing bowl effect
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      // Gentle bloom and long ethereal decay
      gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.09 / (idx + 1), now + idx * 0.1 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + idx * 0.1 + 3.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 3.9);
    });
  }

  // Global Silent Vigil Harmonic: Deep Tibetan singing bowl & crystal swell
  public playVigilHarmonic(intensity: number = 1.0) {
    this.initContext();
    if (!this.ctx) return;

    const baseFreq = 216; // 432Hz sub-octave
    const harmonics = [baseFreq, baseFreq * 1.5, baseFreq * 2, 528];
    const now = this.ctx.currentTime;

    harmonics.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      const targetGain = (0.05 / (idx + 1)) * Math.min(intensity, 1.5);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  // Sacred Breath 4-7-8 Somatic Tone
  public playBreathTone(phase: "inhale" | "hold" | "exhale") {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";

    if (phase === "inhale") {
      // 4-second gentle ascension (216Hz -> 324Hz)
      osc.frequency.setValueAtTime(216, now);
      osc.frequency.exponentialRampToValueAtTime(324, now + 3.9);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 3.9);
      osc.start(now);
      osc.stop(now + 4.0);
    } else if (phase === "hold") {
      // 7-second suspended tranquility (324Hz with gentle pulse)
      osc.frequency.setValueAtTime(324, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 3.5);
      gain.gain.exponentialRampToValueAtTime(0.02, now + 6.9);
      osc.start(now);
      osc.stop(now + 7.0);
    } else {
      // 8-second long, deep release (324Hz -> 162Hz)
      osc.frequency.setValueAtTime(324, now);
      osc.frequency.exponentialRampToValueAtTime(162, now + 7.9);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.9);
      osc.start(now);
      osc.stop(now + 8.0);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
  }
}

export const soundEngine = new SoundEngine();