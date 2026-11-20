// Cadence Visualizer Preview Engine
// Faithfully mirrors:
// 1. Inside Dream centered mirrored bars
// 2. Irena WaterWave 1D spring height-map Bezier curve + 3-stop gradient
// 3. Monstercat weighted neighbor smoothing, log multiplier, FFT settings, and dynamic colors

const PALETTES = {
  irena:     { name: "Irena Dusk",         c1: "#8785fe", c2: "#c79ae0", c3: "#fdacc7", bar: "#ebeeff" },
  dream:     { name: "Inside Dream",       c1: "#a8b5db", c2: "#e8eff8", c3: "#5fb4b2", bar: "#f0f5fc" },
  amber:     { name: "Warm Amber",         c1: "#f17a18", c2: "#ffb35c", c3: "#ffe8cc", bar: "#fff5e8" },
  summit:    { name: "Summit Frost",       c1: "#74b3ff", c2: "#c9e2ff", c3: "#ffffff", bar: "#e8f2ff" },
  mono:      { name: "Monochrome",         c1: "#ffffff", c2: "#c8d0dc", c3: "#8c96a8", bar: "#ffffff" },
  snowfall:  { name: "Icy Snowfall",       c1: "#8ee8f8", c2: "#d8f5fc", c3: "#f4fbff", bar: "#eefaff" },
  darktown:  { name: "Dark Town",          c1: "#63799b", c2: "#a67b96", c3: "#e08e6d", bar: "#c9d4e3" },
  sakura:    { name: "Cherry Blossom",     c1: "#f06c9b", c2: "#f9b4cb", c3: "#ffeaf2", bar: "#fff2f7" },
  lavender:  { name: "Lavender Nightfall", c1: "#6c63d9", c2: "#b497f0", c3: "#e4d4ff", bar: "#ede5ff" },
  jade:      { name: "Jade Garden",        c1: "#2da884", c2: "#7cd8b4", c3: "#d7f7e6", bar: "#e6fbf0" },
  moonlight: { name: "Moonlight Blue",     c1: "#3b6fd8", c2: "#7aa9f5", c3: "#cfe4ff", bar: "#e4f0ff" },
  rainbow:   { name: "Rainbow",            c1: "#ff5e7e", c2: "#f9d423", c3: "#00d2ff", bar: "#ffffff" },
  festival:  { name: "Festival Mix",       c1: "#ff3d9a", c2: "#00e5c3", c3: "#ffb703", bar: "#fff5f9" },
  azure:     { name: "Azure Light",        c1: "#1da1f2", c2: "#6cd4ff", c3: "#dff7ff", bar: "#ebfaff" },
  aurora:    { name: "Aurora Night",       c1: "#26e3a8", c2: "#46a8f5", c3: "#b46cff", bar: "#d8fff3" },
  ice:       { name: "Ice Blizzard",       c1: "#b8f2ff", c2: "#6ec6ff", c3: "#f0fbff", bar: "#eaf8ff" },
  lavender_town: { name: "Lavender Town",  c1: "#9d7bff", c2: "#d39bff", c3: "#ff9ed2", bar: "#efe6ff" },
  midnight:  { name: "Midnight Nostalgia", c1: "#2b4c7e", c2: "#7b68ee", c3: "#ffb87a", bar: "#dce6ff" },
};

const GENRES = [
  { label: "FUTURE BASS", track: "DreamWave Synthesis", artist: "Procedural WebAudio · 128 BPM", color: "#9a98fc", cover: ["#6c63ff", "#fdacc7"] },
  { label: "GLITCH HOP", track: "Neon Canopy", artist: "Synth Demo · 110 BPM", color: "#0b9757", cover: ["#0b9757", "#67e8b5"] },
  { label: "TRANCE", track: "Horizon Pulse", artist: "Synth Demo · 138 BPM", color: "#007ee7", cover: ["#007ee7", "#63dded"] },
  { label: "DRUM & BASS", track: "Midnight Velocity", artist: "Synth Demo · 174 BPM", color: "#f21904", cover: ["#f21904", "#fa7e00"] },
  { label: "NU DISCO", track: "Velvet Arcade", artist: "Synth Demo · 120 BPM", color: "#1cabb3", cover: ["#1cabb3", "#f32188"] },
  { label: "DUBSTEP", track: "Subharmonic Drift", artist: "Synth Demo · 140 BPM", color: "#8d04e1", cover: ["#8d04e1", "#e066ff"] },
];

const DOCK_APP_PRESETS = [
  { icon: "computer", label: "This PC", cmd: '["shell:MyComputerFolder"]' },
  { icon: "downloads", label: "Downloads", cmd: '["shell:Downloads"]' },
  { icon: "music", label: "Music", cmd: '["shell:My Music"]' },
  { icon: "edge", label: "Edge", cmd: '["msedge.exe"]' },
  { icon: "chrome", label: "Chrome", cmd: '["chrome.exe"]' },
  { icon: "spotify", label: "Spotify", cmd: '["spotify:"]' },
  { icon: "terminal", label: "Terminal", cmd: '["wt.exe"]' },
  { icon: "cadence", label: "Cadence", cmd: '[!ActivateConfig "#ROOTCONFIG#\\Settings" "General.ini"]' },
  { icon: "trash-empty", label: "Recycle Bin", cmd: '["shell:RecycleBinFolder"]' },
  { icon: "steam", label: "Steam", cmd: '["steam://open/main"]' },
  { icon: "discord", label: "Discord", cmd: '["discord:"]' },
  { icon: "folder", label: "Documents", cmd: '["shell:Personal"]' },
  { icon: "media", label: "Videos", cmd: '["shell:My Video"]' },
  { icon: "mail", label: "Mail", cmd: '["mailto:"]' },
  { icon: "notes", label: "Notepad", cmd: '["notepad.exe"]' },
  { icon: "settings", label: "Settings", cmd: '["ms-settings:"]' },
  { icon: "power", label: "Shut Down", cmd: '["shutdown.exe","/s","/t","0"]' },
];

const DEFAULTS = {
  visualizerMode: 0,
  scaleVisualizer: 1.0,
  barHeight: 220,
  angle: 0,
  showProgressBar: true,
  enableAutoHide: false,
  enableAutoMute: false,

  barStyle: 0,
  barWidth: 5,
  barGap: 8,
  barCount: 64,
  barRadius: 3,
  sensitivity: 38,
  averageSize: 3,
  multiplier: 42,
  fftSize: 4096,
  mirrorMode: true,
  invertVisualizer: false,

  waveEnabled: true,
  waveFill: true,
  waveStiffness: 1.04,
  waveSpread: 8,
  waveScale: 7,
  waveExpScale: 1.6,
  waveStrokeWidth: 2.5,
  wavePoints: 128,
  scopeSharpness: 1.0,
  scopeThickness: 1.4,
  scopeSensitivity: 1.0,
  scopeGlow: 35,
  scopeSmoothing: 0.30,
  scopeSpeed: 1.0,
  scopeTrail: true,
  scopeEdgeTaper: true,
  scopeDualTrace: false,
  enableSpheresLayer: false,
  enableRaysLayer: false,
  enablePeaksLayer: false,
  enableBassAuraLayer: false,
  enableParticlesLayer: false,
  enableShockwaveLayer: false,
  enableOrbitalsLayer: false,
  enableRibbonLayer: false,

  paletteKey: "irena",
  paletteName: "Irena Dusk",
  color1: "#8785fe",
  color2: "#c79ae0",
  color3: "#fdacc7",
  barColor: "#ebeeff",
  gradientAngle: 0,
  barGradientAngle: 90,
  barAlpha: 84,
  enableDynamicColors: 0,
  useGradientBars: true,
  enableDropShadow: true,

  playerName: "Web",

  clockMode: 0,
  clockScale: 1.0,
  clock24H: true,
  clockShowSeconds: false,
  clockSeparator: ":",
  clockWeekdayFont: "Moving Skate",
  clockDayPos: 0,
  clockShowRules: true,
  clockShowGreeting: true,
  clockShowDayProgress: true,
  clockTimeAlpha: 38,
  clockUseGradientAccent: true,

  playerMode: 0,
  playerScale: 1.0,
  playerCoverRadius: 8,
  playerShowCover: true,
  playerShowHeader: true,
  playerMarquee: true,
  playerShowPercent: true,
  playerShowCardBg: true,
  playerAutoHide: false,
  weatherMode: 0,
  weatherScale: 1.0,
  weatherCity: "Ho Chi Minh City",
  weatherUnit: "C",
  weatherIconPack: "dream",
  weatherDemoCond: "auto",
  weatherShowForecast: true,
  weatherShowDetails: true,
  weatherShowCardBg: true,
  weatherTintIcon: true,
  themeMode: 0,
  bgOpacity: 86,
  customCardBg: "#161a24",
  customTextColor: "#f2f4f8",
  language: "English",
  dockMode: 0,
  dockOrientation: 0,
  dockLabelPos: 0,
  dockLabelStyle: 0,
  dockScale: 1.0,
  dockIconSize: 24,
  dockSpacing: 50,
  dockIconCount: 9,
  dockHoverZoom: true,
  dockShowLabels: true,
  dockShowCardBg: true,
  dockTintIcons: true,
  dockShowBinCount: true,
  dockBinHasItems: true,
  dockSelectedSlot: 0,
  dockSlots: DOCK_APP_PRESETS.slice(0, 9).map((p) => ({ ...p })),
};

const WMO_WEATHER_MAP = {
  0:  { label: "Clear Sky",     day: 32, night: 31 },
  1:  { label: "Mainly Clear",  day: 34, night: 33 },
  2:  { label: "Partly Cloudy", day: 30, night: 29 },
  3:  { label: "Overcast",      day: 26, night: 26 },
  45: { label: "Foggy",         day: 20, night: 20 },
  48: { label: "Rime Fog",      day: 20, night: 20 },
  51: { label: "Light Drizzle", day: 9,  night: 9  },
  53: { label: "Drizzle",       day: 9,  night: 9  },
  55: { label: "Dense Drizzle", day: 9,  night: 9  },
  56: { label: "Freezing Mist", day: 8,  night: 8  },
  57: { label: "Freezing Rain", day: 10, night: 10 },
  61: { label: "Light Rain",    day: 11, night: 11 },
  63: { label: "Rain",          day: 12, night: 12 },
  65: { label: "Heavy Rain",    day: 40, night: 40 },
  66: { label: "Sleet",         day: 10, night: 10 },
  67: { label: "Freezing Rain", day: 10, night: 10 },
  71: { label: "Light Snow",    day: 14, night: 14 },
  73: { label: "Snowfall",      day: 16, night: 16 },
  75: { label: "Heavy Snow",    day: 41, night: 41 },
  77: { label: "Snow Grains",   day: 13, night: 13 },
  80: { label: "Rain Showers",  day: 39, night: 45 },
  81: { label: "Showers",       day: 11, night: 45 },
  82: { label: "Heavy Showers", day: 40, night: 40 },
  85: { label: "Snow Showers",  day: 14, night: 46 },
  86: { label: "Heavy Flurry",  day: 16, night: 46 },
  95: { label: "Thunderstorm",  day: 4,  night: 47 },
  96: { label: "Storm & Hail",  day: 38, night: 47 },
  99: { label: "Severe Storm",  day: 3,  night: 47 },
};

const WEATHER_PRESETS = {
  "ho chi minh city": {
    city: "Ho Chi Minh City", lat: 10.8231, lon: 106.6297,
    tempC: 31, feelsC: 35, wind: 13, hum: 72, code: 2, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 33, loC: 25, code: 80 },
      { day: "WED", hiC: 32, loC: 25, code: 95 },
      { day: "THU", hiC: 33, loC: 24, code: 2 },
      { day: "FRI", hiC: 34, loC: 25, code: 1 },
    ],
  },
  "tokyo": {
    city: "Tokyo", lat: 35.6762, lon: 139.6503,
    tempC: 16, feelsC: 15, wind: 14, hum: 54, code: 1, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 18, loC: 10, code: 0 },
      { day: "WED", hiC: 17, loC: 11, code: 2 },
      { day: "THU", hiC: 14, loC: 9,  code: 61 },
      { day: "FRI", hiC: 19, loC: 10, code: 1 },
    ],
  },
  "seoul": {
    city: "Seoul", lat: 37.5665, lon: 126.9780,
    tempC: 12, feelsC: 10, wind: 16, hum: 48, code: 0, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 14, loC: 5, code: 1 },
      { day: "WED", hiC: 13, loC: 6, code: 2 },
      { day: "THU", hiC: 11, loC: 4, code: 3 },
      { day: "FRI", hiC: 15, loC: 6, code: 0 },
    ],
  },
  "london": {
    city: "London", lat: 51.5072, lon: -0.1276,
    tempC: 11, feelsC: 9, wind: 19, hum: 79, code: 61, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 12, loC: 7, code: 3 },
      { day: "WED", hiC: 13, loC: 8, code: 80 },
      { day: "THU", hiC: 14, loC: 7, code: 2 },
      { day: "FRI", hiC: 13, loC: 6, code: 1 },
    ],
  },
  "new york": {
    city: "New York", lat: 40.7128, lon: -74.0060,
    tempC: 14, feelsC: 12, wind: 15, hum: 58, code: 2, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 16, loC: 8, code: 0 },
      { day: "WED", hiC: 15, loC: 9, code: 61 },
      { day: "THU", hiC: 13, loC: 7, code: 3 },
      { day: "FRI", hiC: 17, loC: 9, code: 1 },
    ],
  },
  "reykjavik": {
    city: "Reykjavik", lat: 64.1466, lon: -21.9426,
    tempC: 2, feelsC: -3, wind: 26, hum: 81, code: 73, isDay: 1,
    forecast: [
      { day: "TUE", hiC: 3, loC: -2, code: 85 },
      { day: "WED", hiC: 4, loC: -1, code: 3 },
      { day: "THU", hiC: 1, loC: -4, code: 71 },
      { day: "FRI", hiC: 2, loC: -3, code: 2 },
    ],
  },
};

let state = {
  ...DEFAULTS,
  dockSlots: DEFAULTS.dockSlots.map((slot) => ({ ...slot })),
};
let isMediaPlaying = true;
let genreIdx = 0;
let trackProgress = 0.28;
let currentTrack = {
  genre: GENRES[0].label,
  title: GENRES[0].track,
  artist: GENRES[0].artist,
  durationSec: 218,
  coverColors: GENRES[0].cover,
  isCustomFile: false,
};
let lastRenderedTimeKey = "";

// Audio engine state
let audioCtx = null;
let analyser = null;
let freqData = null;
let timeData = null;
let synthRunning = false;
let synthTimer = null;
let audioEl = null;
let mediaSourceNode = null;
let usingRealAudio = false;
let customTracks = [];
let customTrackIdx = -1;
let customWallpaperUrl = null;

// Wave & smoothing buffers
let waveMap1 = new Float32Array(256);
let waveMap2 = new Float32Array(256);
let useMap1 = true;
let smoothedHistory = [];
let scopePrevY = new Float32Array(240);
let scopePrevPts = null;
let scopePhase = 0;
let peakHold = new Float32Array(128);
let overlayParticles = Array.from({ length: 28 }, (_, i) => ({
  xFrac: ((i * 37) % 100) / 100,
  yFrac: ((i * 53) % 100) / 100,
  vx: (((i % 7) - 3) * 0.0007),
  vy: -(0.0012 + (i % 5) * 0.0005),
  size: 1.1 + (i % 3) * 0.7,
}));

// DOM refs
const clockWindow = document.getElementById("clockWindow");
const clockTotem = document.getElementById("clockTotem");
const playerWindow = document.getElementById("playerWindow");
const weatherWindow = document.getElementById("weatherWindow");
const weatherSkin = document.getElementById("weatherSkin");
const dockWindow = document.getElementById("dockWindow");
const dockSkin = document.getElementById("dockSkin");
const dockToast = document.getElementById("dockToast");
let dockToastTimer = null;
const weatherLiveCache = {};
let activeWeatherMeta = { lat: 10.8231, lon: 106.6297, resolvedCity: "Ho Chi Minh City" };
const playerSkin = document.getElementById("playerSkin");
const desktopStage = document.getElementById("desktopStage");
const skinWindow = document.getElementById("skinWindow");
const canvas = document.getElementById("visualizerCanvas");
const ctx = canvas.getContext("2d");
const settingsPanel = document.getElementById("settingsPanel");
const togglePanelBtn = document.getElementById("togglePanelBtn");

function hexToRgbTuple(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function mapRange(v, a1, a2, b1, b2) {
  if (a2 === a1) return b1;
  return b1 + (b2 - b1) * ((v - a1) / (a2 - a1));
}

function edgeDenom(dist) {
  if (dist === 0) return 12;
  if (dist === 1) return 10;
  if (dist === 2) return 8;
  if (dist === 3) return 6;
  if (dist === 4) return 4;
  if (dist === 5) return 3;
  if (dist <= 8) return 2.8;
  return 3;
}

// Extract dominant & accent colors from an HTMLImageElement or fallback
function extractDynamicColors() {
  const g = GENRES[genreIdx];
  if (state.enableDynamicColors === 1) {
    return { c1: g.color, c2: g.color, c3: g.color, bar: g.color };
  }
  if (state.enableDynamicColors === 2) {
    return { c1: g.cover[0], c2: g.cover[1], c3: g.cover[0], bar: g.cover[1] };
  }
  return { c1: state.color1, c2: state.color2, c3: state.color3, bar: state.barColor };
}

function syncCssAccent() {
  const colors = extractDynamicColors();
  const cssDeg = (((state.gradientAngle % 360) + 360) % 360 + 90) % 360;
  const vertCssDeg = (cssDeg + 90) % 360;
  const barCssDeg = (((state.barGradientAngle % 360) + 360) % 360 + 90) % 360;
  const root = document.documentElement.style;
  root.setProperty("--accent-1", colors.c1);
  root.setProperty("--accent-2", colors.c2);
  root.setProperty("--accent-3", colors.c3);
  root.setProperty("--grad-css-angle", `${cssDeg}deg`);
  root.setProperty("--grad-css-angle-vert", `${vertCssDeg}deg`);
  root.setProperty("--bar-grad-css-angle", `${barCssDeg}deg`);
}

function createAngledLinearGradient(x, y, w, h, rmAngleDeg, stops) {
  const rad = ((rmAngleDeg || 0) * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const halfSpan = Math.max(1, (Math.abs(w * dx) + Math.abs(h * dy)) * 0.5);
  const grad = ctx.createLinearGradient(
    cx - dx * halfSpan,
    cy - dy * halfSpan,
    cx + dx * halfSpan,
    cy + dy * halfSpan
  );
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(0.5, stops[1]);
  grad.addColorStop(1, stops[2]);
  return grad;
}

// Compute procedural or real FFT spectrum mapped into barCount bands
function sampleRawSpectrum(tSec) {
  const count = state.barCount;
  const raw = new Float32Array(count);
  const sensScale = mapRange(state.sensitivity, 10, 80, 0.45, 1.55);

  if (state.enableAutoMute && !isMediaPlaying) {
    return raw;
  }

  if (usingRealAudio && analyser && freqData) {
    analyser.getByteFrequencyData(freqData);
    const sr = audioCtx ? audioCtx.sampleRate : 48000;
    const nyquist = sr / 2;
    const minBin = Math.max(1, Math.floor((25 / nyquist) * freqData.length));
    const maxBin = Math.min(freqData.length - 1, Math.floor((16000 / nyquist) * freqData.length));

    for (let i = 0; i < count; i++) {
      // Logarithmic frequency distribution matching Rainmeter AudioLevel
      const frac0 = i / count;
      const frac1 = (i + 1) / count;
      const b0 = Math.floor(minBin * Math.pow(maxBin / minBin, frac0));
      const b1 = Math.max(b0 + 1, Math.floor(minBin * Math.pow(maxBin / minBin, frac1)));
      let sum = 0;
      for (let b = b0; b < b1; b++) {
        sum += freqData[b];
      }
      const norm = sum / ((b1 - b0) * 255);
      raw[i] = clamp(Math.pow(norm, 1.15) * sensScale, 0, 1.4);
    }
    return raw;
  }

  // Musical procedural spectrum when sound is muted or before user clicks audio
  const beat = Math.pow(Math.max(0, Math.sin(tSec * Math.PI * 2.13)), 4);
  const snare = Math.pow(Math.max(0, Math.sin(tSec * Math.PI * 1.065 + 1.55)), 8);
  for (let i = 0; i < count; i++) {
    const f = i / Math.max(1, count - 1);
    const bass = Math.exp(-Math.pow((f - 0.08) / 0.14, 2)) * (0.42 + 0.58 * beat);
    const mids = Math.exp(-Math.pow((f - 0.38) / 0.22, 2)) * (0.28 + 0.34 * Math.sin(tSec * 3.1 + f * 9) * 0.5 + 0.36 * snare);
    const highs = Math.exp(-Math.pow((f - 0.72) / 0.2, 2)) * (0.14 + 0.25 * Math.abs(Math.sin(tSec * 6.7 + f * 17)));
    const ripple = 0.07 * Math.sin(tSec * 5.2 - f * 12) + 0.05 * Math.cos(tSec * 8.4 + f * 21);
    raw[i] = clamp((bass + mids + highs + ripple) * sensScale * (isMediaPlaying ? 1 : 0.12), 0, 1.3);
  }
  return raw;
}

function applyMonstercatSmoothing(raw) {
  const count = state.barCount;
  const out = new Float32Array(count);
  const mult = Math.log(Math.max(2, state.multiplier)) * 0.65;

  if (smoothedHistory.length !== count) {
    smoothedHistory = Array.from({ length: count }, () => []);
  }
  const avgLen = Math.max(1, state.averageSize + 1);

  for (let i = 0; i < count; i++) {
    const srcIdx = state.invertVisualizer ? count - 1 - i : i;
    const l = clamp(srcIdx - 1, 0, count - 1);
    const r = clamp(srcIdx + 1, 0, count - 1);
    const d = edgeDenom(Math.min(srcIdx, count - 1 - srcIdx));
    const weighted = ((raw[l] + raw[srcIdx] + raw[r]) / d) * mult;

    const hist = smoothedHistory[i];
    hist.push(weighted);
    while (hist.length > avgLen) hist.shift();

    let avg = 0;
    for (let k = 0; k < hist.length; k++) avg += hist[k];
    avg /= hist.length;

    out[i] = clamp(0.02 + avg, 0.02, 1.0);
  }
  return out;
}

function stepWaterWave(smoothed) {
  const nPoints = state.wavePoints;
  const nBands = state.barCount;
  const source = useMap1 ? waveMap1 : waveMap2;
  const dest = useMap1 ? waveMap2 : waveMap1;

  const energies = new Float32Array(nPoints);
  let sumEnergy = 0;
  for (let i = 0; i < nPoints; i++) {
    const frac = i / Math.max(1, nPoints - 1);
    const pos = frac * (nBands - 1);
    const idx0 = Math.floor(pos);
    const idx1 = Math.min(idx0 + 1, nBands - 1);
    const alpha = pos - idx0;
    const val = (state.enableAutoMute && !isMediaPlaying)
      ? 0
      : smoothed[idx0] + (smoothed[idx1] - smoothed[idx0]) * alpha;

    const e = Math.pow(Math.max(0, val), state.waveExpScale);
    energies[i] = e;
    sumEnergy += e;
  }
  const meanDrive = (sumEnergy / Math.max(1, nPoints)) * 0.55;

  for (let i = 0; i < nPoints; i++) {
    dest[i] += (energies[i] - meanDrive);
    const left = source[clamp(i - 1, 0, nPoints - 1)];
    const right = source[clamp(i + 1, 0, nPoints - 1)];
    dest[i] = (left + right) / Math.max(1, state.waveStiffness) - dest[i];
    dest[i] -= dest[i] / Math.max(1.5, state.waveSpread);
  }
  useMap1 = !useMap1;
  return dest;
}

function drawRoundedRect(x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

// Convert point list [{x, y}] into smooth Catmull-Rom cubic Bezier segments
function catmullRomToBeziers(pts, tension = 1.0) {
  const segs = [];
  const k = tension / 6;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    segs.push({
      cx1: p1.x + (p2.x - p0.x) * k,
      cy1: p1.y + (p2.y - p0.y) * k,
      cx2: p2.x - (p3.x - p1.x) * k,
      cy2: p2.y - (p3.y - p1.y) * k,
      x: p2.x,
      y: p2.y,
    });
  }
  return segs;
}

function traceSmoothPolyline(pts, moveFirst = true) {
  if (pts.length === 0) return;
  if (moveFirst) ctx.moveTo(pts[0].x, pts[0].y);
  else ctx.lineTo(pts[0].x, pts[0].y);
  const segs = catmullRomToBeziers(pts, 1.0);
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    ctx.bezierCurveTo(s.cx1, s.cy1, s.cx2, s.cy2, s.x, s.y);
  }
}

function renderFrame(nowMs) {
  const tSec = nowMs * 0.001;
  const dpr = window.devicePixelRatio || 1;
  const scale = state.scaleVisualizer;
  const barW = state.barWidth * scale;
  const barG = state.barGap * scale;
  const skinW = Math.max(120, state.barCount * (barW + barG) - barG);
  const skinH = state.barHeight * scale;
  const normAngle = ((state.angle % 360) + 360) % 360;
  const isRotated = normAngle !== 0;
  const rad = (normAngle * Math.PI) / 180;
  const progPad = state.showProgressBar && !isRotated ? 22 : 0;
  const pad = 24;

  let drawScale = 1;
  let boxW, boxH;
  if (isRotated) {
    const stageW = desktopStage.clientWidth || 1440;
    const stageH = desktopStage.clientHeight || 900;
    const panelOpen = !settingsPanel.classList.contains("is-collapsed");
    const centerX = panelOpen ? (stageW * 0.5 - 255) : (stageW * 0.5);
    const rightLim = panelOpen ? (settingsPanel.offsetLeft - 14) : (stageW - 16);
    const maxW = Math.max(240, 2 * Math.min(centerX - 16, rightLim - centerX));
    const maxH = Math.max(240, stageH - 132);
    const maxDiam = Math.min(maxW, maxH);
    const rawDiam = Math.ceil(Math.hypot(skinW, skinH) + pad * 2);
    if (rawDiam > maxDiam) {
      drawScale = clamp(maxDiam / rawDiam, 0.35, 1);
    }
    const fitDiam = Math.ceil(Math.min(rawDiam, maxDiam));
    boxW = fitDiam;
    boxH = fitDiam;
  } else {
    const isRingMode = state.visualizerMode === 5;
    const ringOuter = isRingMode ? (Math.min(skinW * 0.22, 145 * scale) + Math.min(skinW * 0.14, 95 * scale)) * 2 + 16 : 0;
    boxW = Math.ceil(skinW + pad * 2);
    boxH = Math.ceil(Math.max(skinH, ringOuter) + progPad + pad * 2);
  }
  skinWindow.classList.toggle("is-rotated", isRotated);

  if (canvas.width !== Math.round(boxW * dpr) || canvas.height !== Math.round(boxH * dpr)) {
    canvas.width = Math.round(boxW * dpr);
    canvas.height = Math.round(boxH * dpr);
    canvas.style.width = `${boxW}px`;
    canvas.style.height = `${boxH}px`;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, boxW, boxH);

  // Auto-hide when paused/stopped
  skinWindow.classList.toggle("is-hidden", state.enableAutoHide && !isMediaPlaying);

  const raw = sampleRawSpectrum(tSec);
  const smoothed = applyMonstercatSmoothing(raw);
  const waveBuf = stepWaterWave(smoothed);

  const colors = extractDynamicColors();
  const isMirrored = state.visualizerMode === 3 ? false : state.mirrorMode;
  const isScope = state.visualizerMode === 4;
  const isRing = state.visualizerMode === 5;
  const showBars = !isScope && !isRing && state.visualizerMode !== 2;
  const showWave = !isScope && !isRing && state.waveEnabled && (state.visualizerMode === 0 || state.visualizerMode === 2 || state.visualizerMode === 3);

  ctx.save();
  ctx.translate(boxW / 2, (boxH - progPad) / 2);
  ctx.rotate(rad);
  ctx.scale(drawScale, drawScale);
  ctx.translate(-skinW / 2, -skinH / 2);

  const stops = [colors.c1, colors.c2, colors.c3];
  const themeGrad = createAngledLinearGradient(0, 0, skinW, skinH, state.gradientAngle, stops);

  // 0.5 Combinable Overlay Layers (Sub-Bass Aura, Pulsing Spheres, Joined Stereo Rays, Peak Dots, Audio Particles)
  if (state.enableBassAuraLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const bass = isMuted ? 0 : (smoothed[0] + smoothed[1] + smoothed[2] + smoothed[3]) * 0.25;
    const cx = skinW * 0.5;
    const cy = skinH * 0.5;
    const r = Math.max(skinW, skinH) * (0.34 + bass * 0.26);
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    aura.addColorStop(0, `rgba(${hexToRgbTuple(colors.c1)}, ${(0.18 + bass * 0.34).toFixed(2)})`);
    aura.addColorStop(0.55, `rgba(${hexToRgbTuple(colors.c2)}, ${(0.08 + bass * 0.16).toFixed(2)})`);
    aura.addColorStop(1, `rgba(${hexToRgbTuple(colors.c3)}, 0)`);
    ctx.save();
    ctx.fillStyle = aura;
    ctx.fillRect(-40, -40, skinW + 80, skinH + 80);
    ctx.restore();
  }

  if (state.enableSpheresLayer) {
    const count = 12;
    const cy = skinH * 0.5;
    const maxR = Math.min(skinH * 0.24, 46 * scale);
    const minR = 6 * scale;
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const sphereColors = [colors.c1, colors.c2, colors.c3];
    const sampleAt = (frac) => {
      const idx = clamp(frac, 0, 1) * (state.barCount - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, state.barCount - 1);
      return smoothed[i0] + (smoothed[i1] - smoothed[i0]) * (idx - i0);
    };
    ctx.save();
    for (let i = 1; i <= count; i++) {
      const frac = (i - 0.5) / count;
      const lvl = isMuted ? 0.02 : clamp(sampleAt(frac), 0.02, 1);
      const r = minR + lvl * maxR;
      const x = frac * skinW + Math.sin(tSec * 2.4 + i * 1.3) * (8 * scale);
      const y = cy + Math.cos(tSec * 3.1 + i * 1.7) * (skinH * 0.22) * (0.35 + 0.65 * lvl);
      const col = sphereColors[(i - 1) % 3];
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const rgb = hexToRgbTuple(col);
      grad.addColorStop(0, `rgba(${rgb}, 0.61)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (state.enableRaysLayer) {
    const nodes = 18;
    const cy = skinH * 0.5;
    const maxAmp = skinH * 0.44;
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const sampleAt = (frac) => {
      const idx = clamp(frac, 0, 1) * (state.barCount - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, state.barCount - 1);
      return smoothed[i0] + (smoothed[i1] - smoothed[i0]) * (idx - i0);
    };
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let beam = 0; beam < 2; beam++) {
      ctx.beginPath();
      for (let i = 0; i < nodes; i++) {
        const frac = i / (nodes - 1);
        const x = frac * skinW;
        const lvl = isMuted ? 0.02 : clamp(sampleAt(frac), 0.02, 1);
        const dir = (i % 2 === 0 ? 1 : -1) * (beam === 0 ? -1 : 1);
        const mod = beam === 0
          ? 0.65 + 0.35 * Math.sin(tSec * 3.2 + i * 0.8)
          : 0.65 + 0.35 * Math.cos(tSec * 3.7 + i * 0.9);
        const y = cy + dir * (lvl * maxAmp * mod);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = themeGrad;
      ctx.globalAlpha = beam === 0 ? 0.72 : 0.55;
      ctx.lineWidth = (beam === 0 ? 1.6 : 1.2) * scale;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (state.enablePeaksLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const n = state.barCount;
    const stepX = n > 1 ? skinW / (n - 1) : skinW;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const lvl = isMuted ? 0 : smoothed[i];
      if (lvl >= peakHold[i]) peakHold[i] = lvl;
      else peakHold[i] = Math.max(0.01, peakHold[i] - 0.008);
      const px = i * stepX;
      const py = isMirrored
        ? skinH * 0.5 - peakHold[i] * (skinH * 0.46)
        : skinH - peakHold[i] * (skinH * 0.92);
      const pyMirror = skinH * 0.5 + peakHold[i] * (skinH * 0.46);
      ctx.fillStyle = colors.c3;
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (isMirrored) {
        ctx.beginPath();
        ctx.arc(px, pyMirror, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  if (state.enableParticlesLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const midEnergy = isMuted ? 0 : (smoothed[Math.floor(state.barCount * 0.25)] + smoothed[Math.floor(state.barCount * 0.6)]) * 0.5;
    const boost = 1 + midEnergy * 3.5;
    ctx.save();
    for (let i = 0; i < overlayParticles.length; i++) {
      const pt = overlayParticles[i];
      pt.xFrac = (pt.xFrac + pt.vx * boost + 1) % 1;
      pt.yFrac = (pt.yFrac + pt.vy * boost + 1) % 1;
      const px = pt.xFrac * skinW;
      const py = pt.yFrac * skinH;
      const col = i % 2 === 0 ? colors.c2 : colors.c3;
      ctx.fillStyle = `rgba(${hexToRgbTuple(col)}, ${(0.35 + midEnergy * 0.55).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(px, py, pt.size * scale * (0.9 + midEnergy * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (state.enableShockwaveLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const bass = isMuted ? 0 : (smoothed[0] + smoothed[1] + smoothed[2]) / 3;
    const cx = skinW * 0.5;
    const cy = skinH * 0.5;
    const maxR = Math.min(skinW * 0.42, skinH * 0.95);
    ctx.save();
    for (let k = 0; k < 3; k++) {
      const phase = ((tSec * 0.75 + k / 3) % 1);
      const r = (24 + phase * maxR) * (0.85 + bass * 0.35);
      const alpha = (1 - phase) * (0.28 + bass * 0.45);
      const col = k === 0 ? colors.c1 : (k === 1 ? colors.c2 : colors.c3);
      ctx.strokeStyle = `rgba(${hexToRgbTuple(col)}, ${alpha.toFixed(2)})`;
      ctx.lineWidth = (2.4 - phase * 1.4) * scale;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.35, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (state.enableOrbitalsLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const bass = isMuted ? 0 : (smoothed[0] + smoothed[1] + smoothed[2]) / 3;
    const cx = skinW * 0.5;
    const cy = skinH * 0.5;
    const baseOrbit = Math.min(skinW * 0.24, 155 * scale) + bass * 24 * scale;
    const orbs = 4;
    ctx.save();
    for (let i = 0; i < orbs; i++) {
      const ang = tSec * 1.15 + (i * Math.PI * 2) / orbs;
      const ox = cx + Math.cos(ang) * baseOrbit;
      const oy = cy + Math.sin(ang) * baseOrbit * 0.65;
      const r = (3.2 + bass * 3.5) * scale;
      const col = i % 2 === 0 ? colors.c1 : colors.c3;
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8 * scale;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (state.enableRibbonLayer) {
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const bass = isMuted ? 0 : (smoothed[0] + smoothed[1] + smoothed[2]) / 3;
    const mid = isMuted ? 0 : (smoothed[Math.floor(state.barCount * 0.35)] + smoothed[Math.floor(state.barCount * 0.5)]) * 0.5;
    const cy = skinH * 0.5;
    const pts = 48;
    const thick = (18 + bass * 26) * scale;
    const topPts = [];
    const botPts = [];
    for (let i = 0; i <= pts; i++) {
      const frac = i / pts;
      const x = frac * skinW;
      const env = Math.sin(Math.PI * frac);
      const yOff = Math.sin(frac * 5.5 + tSec * 1.6) * (22 + mid * 38) * scale * env
                 + Math.cos(frac * 9.0 - tSec * 1.1) * (10 + bass * 18) * scale * env;
      const halfH = thick * (0.45 + 0.55 * env);
      topPts.push({ x, y: cy + yOff - halfH });
      botPts.push({ x, y: cy + yOff + halfH });
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < topPts.length; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
    for (let i = botPts.length - 1; i >= 0; i--) ctx.lineTo(botPts[i].x, botPts[i].y);
    ctx.closePath();
    ctx.fillStyle = themeGrad;
    ctx.globalAlpha = 0.18 + bass * 0.18;
    ctx.fill();
    ctx.restore();
  }

  // 1. Inside Dream / Monstercat / Connected-Through Spectrum Bars
  if (showBars) {
    const alpha = state.barAlpha / 100;
    const isConnected = state.barStyle === 2;
    const r = state.barStyle === 0 ? state.barRadius * scale : 0;

    const barGrad = state.useGradientBars
      ? createAngledLinearGradient(0, 0, skinW, skinH, state.barGradientAngle, stops)
      : null;

    const barRects = [];
    const topPts = [];
    const botPts = [];
    for (let i = 0; i < state.barCount; i++) {
      const x = i * (barW + barG);
      const h = Math.max(2 * scale, smoothed[i] * skinH);
      const y = isMirrored ? (skinH - h) * 0.5 : skinH - h;
      barRects.push({ x, y, h, yB: y + h });

      const px = i === 0 ? 0 : i === state.barCount - 1 ? skinW : x + barW * 0.5;
      topPts.push({ x: px, y });
      botPts.push({ x: px, y: y + h });
    }

    const buildConnectedEnvelopePath = () => {
      ctx.beginPath();
      traceSmoothPolyline(topPts, true);
      if (isMirrored) {
        const botRev = [...botPts].reverse();
        traceSmoothPolyline(botRev, false);
      } else {
        ctx.lineTo(skinW, skinH);
        ctx.lineTo(0, skinH);
      }
      ctx.closePath();
    };

    // Connected-Through envelope fill behind bar columns
    if (isConnected && barRects.length > 1) {
      ctx.save();
      buildConnectedEnvelopePath();
      ctx.globalAlpha = alpha * 0.22;
      ctx.fillStyle = state.useGradientBars ? themeGrad : colors.bar;
      ctx.fill();
      ctx.restore();
    }

    // Drop shadows (clipped to smooth envelope when Connected-Through)
    if (state.enableDropShadow) {
      ctx.save();
      if (isConnected && barRects.length > 1) {
        ctx.save();
        ctx.translate(3 * scale, 3 * scale);
        buildConnectedEnvelopePath();
        ctx.restore();
        ctx.clip();
      }
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = "#080a10";
      for (let i = 0; i < barRects.length; i++) {
        const { x, y, h } = barRects[i];
        if (r > 0) {
          drawRoundedRect(x + 3 * scale, y + 3 * scale, barW, h, r);
          ctx.fill();
        } else {
          ctx.fillRect(x + 3 * scale, y + 3 * scale, barW, h);
        }
      }
      ctx.restore();
    }

    // Individual bars (clipped inside smooth envelope when Connected-Through so no corner pokes out)
    ctx.save();
    if (isConnected && barRects.length > 1) {
      buildConnectedEnvelopePath();
      ctx.clip();
    }
    ctx.globalAlpha = isConnected ? alpha * 0.72 : alpha;
    ctx.fillStyle = state.useGradientBars ? barGrad : colors.bar;
    for (let i = 0; i < barRects.length; i++) {
      const { x, y, h } = barRects[i];
      if (r > 0) {
        drawRoundedRect(x, y, barW, h, r);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barW, h);
      }
    }
    ctx.restore();

    // Connected-Through smooth continuous top/bottom contour + center axis spine
    if (isConnected && barRects.length > 1) {
      ctx.save();
      ctx.strokeStyle = state.useGradientBars ? themeGrad : colors.bar;
      ctx.lineWidth = 1.6 * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = Math.min(1, alpha * 1.08);

      ctx.beginPath();
      traceSmoothPolyline(topPts, true);
      ctx.stroke();

      if (isMirrored) {
        ctx.beginPath();
        traceSmoothPolyline(botPts, true);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, skinH);
        ctx.lineTo(skinW, skinH);
        ctx.stroke();
      }

      const spineY = isMirrored ? skinH * 0.5 : skinH;
      ctx.beginPath();
      ctx.moveTo(0, spineY);
      ctx.lineTo(skinW, spineY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.1 * scale;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 2.5 WMP Scope (2007-2013 Oscilloscope Line)
  if (isScope) {
    const ptsCount = 240;
    const yMid = skinH * 0.5;
    const maxAmp = skinH * 0.44;
    const isMuted = state.enableAutoMute && !isMediaPlaying;
    const sharp = clamp(state.scopeSharpness, 0.3, 2.5);
    const sens = clamp(state.scopeSensitivity, 0.3, 2.5);
    const thick = clamp(state.scopeThickness, 0.6, 4.0);
    const glowPct = clamp(state.scopeGlow, 0, 100);
    const smooth = clamp(state.scopeSmoothing, 0, 0.85);
    const speed = clamp(state.scopeSpeed, 0.2, 2.5);
    const useTaper = Boolean(state.scopeEdgeTaper);
    const useTrail = Boolean(state.scopeTrail);
    const useDual = Boolean(state.scopeDualTrace);

    scopePhase += (1 / 60) * 14.0 * speed;

    const mainPts = new Array(ptsCount);
    const dualPts = useDual ? new Array(ptsCount) : null;

    if (!isMuted && (usingRealAudio || synthRunning) && analyser) {
      if (!timeData || timeData.length !== analyser.fftSize) {
        timeData = new Uint8Array(analyser.fftSize);
      }
      analyser.getByteTimeDomainData(timeData);
      const step = Math.max(1, Math.floor(timeData.length / ptsCount));
      const rawSamples = new Float32Array(ptsCount);
      for (let i = 0; i < ptsCount; i++) {
        rawSamples[i] = (timeData[Math.min(timeData.length - 1, i * step)] - 128) / 128;
      }
      for (let i = 0; i < ptsCount; i++) {
        const frac = i / (ptsCount - 1);
        const x = frac * skinW;
        const edge = useTaper ? Math.pow(Math.sin(Math.PI * frac), 0.42) : 1.0;
        const prev = rawSamples[Math.max(0, i - 1)];
        const curr = rawSamples[i];
        const next = rawSamples[Math.min(ptsCount - 1, i + 1)];
        const avg = (prev + curr + next) / 3;
        const shaped = sharp < 1.0
          ? avg + (curr - avg) * sharp
          : curr + (curr - avg) * (sharp - 1.0) * 0.9;
        const targetY = yMid - clamp(shaped * 1.45 * sens, -1, 1) * maxAmp * edge;
        const prevY = scopePrevY[i] || yMid;
        const y = prevY * smooth + targetY * (1 - smooth);
        scopePrevY[i] = y;
        mainPts[i] = { x, y };
        if (useDual) {
          const opp = rawSamples[ptsCount - 1 - i];
          dualPts[i] = { x, y: yMid + clamp(opp * 1.3 * sens, -1, 1) * maxAmp * edge * 0.85 };
        }
      }
    } else {
      const ph = scopePhase;
      const freqMul = 0.7 + 0.3 * sharp;
      const peakExp = 1.0 / (0.65 + 0.35 * sharp);
      const sampleAt = (frac) => {
        const idx = clamp(frac, 0, 1) * (state.barCount - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(i0 + 1, state.barCount - 1);
        return smoothed[i0] + (smoothed[i1] - smoothed[i0]) * (idx - i0);
      };
      const bass = isMuted ? 0 : sampleAt(0.06);
      const lowMid = isMuted ? 0 : sampleAt(0.18);
      const mid = isMuted ? 0 : sampleAt(0.36);
      const hiMid = isMuted ? 0 : sampleAt(0.58);
      const treble = isMuted ? 0 : sampleAt(0.82);

      for (let i = 0; i < ptsCount; i++) {
        const frac = i / (ptsCount - 1);
        const x = frac * skinW;
        const edge = useTaper ? Math.pow(Math.sin(Math.PI * frac), 0.42) : 1.0;
        const localBand = isMuted ? 0 : sampleAt(frac);
        let sig = 0;
        if (!isMuted) {
          const w1 = Math.sin(frac * 18.0 * freqMul + ph * 0.9) * (0.35 * bass + 0.25 * localBand);
          const w2 = Math.sin(frac * 54.0 * freqMul - ph * 1.45) * (0.32 * lowMid + 0.18 * localBand);
          const w3 = Math.sin(frac * 126.0 * freqMul + ph * 2.15) * (0.28 * mid + 0.22 * localBand) * (0.45 + 0.55 * sharp);
          const w4 = Math.sin(frac * 240.0 * freqMul - ph * 3.1) * (0.24 * hiMid + 0.18 * treble) * sharp;
          const raw = clamp((w1 + w2 + w3 + w4) * sens, -1, 1);
          sig = Math.sign(raw) * Math.pow(Math.abs(raw), peakExp);
        }
        const targetY = yMid - sig * maxAmp * edge;
        const prevY = scopePrevY[i] || yMid;
        const y = prevY * smooth + targetY * (1 - smooth);
        scopePrevY[i] = y;
        mainPts[i] = { x, y };

        if (useDual) {
          let sig2 = 0;
          if (!isMuted) {
            const d1 = Math.sin(frac * 18.0 * freqMul + ph * 0.9 + 1.15) * (0.32 * bass + 0.22 * localBand);
            const d2 = Math.sin(frac * 54.0 * freqMul - ph * 1.45 + 0.75) * (0.30 * lowMid + 0.18 * localBand);
            const d3 = Math.sin(frac * 126.0 * freqMul + ph * 2.15 - 0.9) * (0.26 * mid + 0.20 * localBand) * (0.45 + 0.55 * sharp);
            const raw2 = clamp((d1 + d2 + d3) * sens, -1, 1);
            sig2 = Math.sign(raw2) * Math.pow(Math.abs(raw2), peakExp);
          }
          dualPts[i] = { x, y: yMid + sig2 * maxAmp * edge * 0.85 };
        }
      }
    }

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (useTrail && scopePrevPts && scopePrevPts.length === ptsCount) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < ptsCount; i++) {
        if (i === 0) ctx.moveTo(scopePrevPts[i].x, scopePrevPts[i].y);
        else ctx.lineTo(scopePrevPts[i].x, scopePrevPts[i].y);
      }
      ctx.strokeStyle = themeGrad;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = thick * scale;
      ctx.stroke();
      ctx.restore();
    }

    if (useDual && dualPts) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < ptsCount; i++) {
        if (i === 0) ctx.moveTo(dualPts[i].x, dualPts[i].y);
        else ctx.lineTo(dualPts[i].x, dualPts[i].y);
      }
      ctx.strokeStyle = themeGrad;
      ctx.globalAlpha = 0.44;
      ctx.lineWidth = thick * 0.85 * scale;
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    for (let i = 0; i < ptsCount; i++) {
      if (i === 0) ctx.moveTo(mainPts[i].x, mainPts[i].y);
      else ctx.lineTo(mainPts[i].x, mainPts[i].y);
    }
    ctx.strokeStyle = themeGrad;
    ctx.lineWidth = thick * scale;
    ctx.shadowColor = colors.c2;
    ctx.shadowBlur = glowPct <= 0 ? 0 : (thick * 1.6 + glowPct * 0.14) * scale;
    ctx.stroke();
    ctx.restore();

    scopePrevPts = mainPts;
  }

  // 2.6 Radial Ring Mode
  if (isRing) {
    const ringPts = 96;
    const cx = skinW * 0.5;
    const cy = skinH * 0.5;
    const baseR = Math.min(skinW * 0.22, 145 * scale);
    const maxOut = Math.min(skinW * 0.14, 95 * scale);
    const isMuted = state.enableAutoMute && !isMediaPlaying;

    const sampleAt = (frac) => {
      const idx = clamp(frac, 0, 1) * (state.barCount - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, state.barCount - 1);
      return smoothed[i0] + (smoothed[i1] - smoothed[i0]) * (idx - i0);
    };

    ctx.save();
    // Inner base circle
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = themeGrad;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.3 * scale;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < ringPts; i++) {
      const frac = i / ringPts;
      const symFrac = Math.abs(frac * 2 - 1);
      const lvl = isMuted ? 0.02 : clamp(sampleAt(symFrac), 0.02, 1.0);
      const r = baseR + lvl * maxOut;
      const theta = frac * Math.PI * 2 - Math.PI * 0.5;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = themeGrad;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = themeGrad;
    ctx.lineWidth = 2.0 * scale;
    ctx.lineJoin = "round";
    ctx.shadowColor = colors.c2;
    ctx.shadowBlur = 8 * scale;
    ctx.stroke();
    ctx.restore();
  }

  // 2. Irena WaterWave Spline Layer
  if (showWave) {
    const nPts = state.wavePoints;
    const stepX = skinW / Math.max(1, nPts - 1);
    const centerY = isMirrored ? skinH * 0.5 : skinH * 0.86;
    const amp = isMirrored ? skinH * 0.44 : skinH * 0.55;
    const tScale = -state.waveScale;

    const waveGrad = themeGrad;

    let yNext = mapRange(waveBuf[0], -tScale, tScale, centerY + amp, centerY - amp);
    const pts = [];
    for (let i = 0; i < nPts; i++) {
      const xEnd = mapRange(i, 0, nPts - 1, 0, skinW);
      const yVal = yNext;
      const nextIdx = clamp(i + 1, 0, nPts - 1);
      yNext = mapRange(waveBuf[nextIdx], -tScale, tScale, centerY + amp, centerY - amp);
      const yEnd = (yVal + yNext) * 0.5;
      pts.push({ xEnd, yEnd, cx: xEnd - stepX * 0.5, cy: yVal });
    }

    if (state.waveFill) {
      ctx.save();
      ctx.beginPath();
      const fillBaseY = isMirrored ? centerY : skinH;
      ctx.moveTo(0, fillBaseY);
      ctx.lineTo(0, pts[0].cy);
      for (let i = 0; i < pts.length; i++) {
        ctx.quadraticCurveTo(pts[i].cx, pts[i].cy, pts[i].xEnd, pts[i].yEnd);
      }
      ctx.lineTo(skinW, fillBaseY);
      ctx.closePath();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = waveGrad;
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, pts[0].cy);
    for (let i = 0; i < pts.length; i++) {
      ctx.quadraticCurveTo(pts[i].cx, pts[i].cy, pts[i].xEnd, pts[i].yEnd);
    }
    if (state.enableDropShadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
    }
    ctx.strokeStyle = waveGrad;
    ctx.lineWidth = state.waveStrokeWidth * scale;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  }

  // Advance playback progress for both visualizer bar and Music Player
  if (usingRealAudio && audioEl && !audioEl.paused && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
    trackProgress = clamp(audioEl.currentTime / audioEl.duration, 0, 1);
  } else if (isMediaPlaying) {
    trackProgress = (trackProgress + 1 / (Math.max(30, currentTrack.durationSec) * 60)) % 1;
  }
  updatePlayerProgressUI();

  // 3. Optional Song Progress Bar (angle = 0)
  if (state.showProgressBar && state.angle === 0) {
    const barY = skinH + 12;
    const barH = 3 * scale;
    const progGrad = createAngledLinearGradient(0, barY, skinW, Math.max(barH, 3 * scale), state.gradientAngle, stops);

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    drawRoundedRect(0, barY, skinW, barH, barH / 2);
    ctx.fill();

    ctx.fillStyle = progGrad;
    drawRoundedRect(0, barY, Math.max(barH, skinW * trackProgress), barH, barH / 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  requestAnimationFrame(renderFrame);
}

// --- Web Audio API Synth & File Playback ---
function ensureAudioContext() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtor();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = clamp(state.fftSize, 512, 8192);
    analyser.smoothingTimeConstant = 0.72;
    analyser.connect(audioCtx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function stopSynth() {
  synthRunning = false;
  clearInterval(synthTimer);
  synthTimer = null;
  document.getElementById("synthAudioBtn").textContent = t(synthRunning ? "Sound: On" : "Sound: Off");
  document.getElementById("synthAudioBtn").classList.remove("is-on");
  if (!audioEl || audioEl.paused) usingRealAudio = false;
}

async function startSynth() {
  ensureAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    try { await audioCtx.resume(); } catch {}
  }
  if (audioEl && !audioEl.paused) audioEl.pause();
  synthRunning = true;
  usingRealAudio = true;
  document.getElementById("synthAudioBtn").textContent = t("Sound: On");
  document.getElementById("synthAudioBtn").classList.add("is-on");

  const chords = [
    [130.81, 196.0, 246.94, 329.63],
    [164.81, 246.94, 293.66, 392.0],
    [174.61, 220.0, 261.63, 349.23],
    [146.83, 220.0, 261.63, 329.63],
  ];
  let step = 0;

  const triggerStep = () => {
    if (!synthRunning || !isMediaPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const chord = chords[Math.floor(step / 2) % chords.length];

    // Multi-voice pad/arp so low, mid, and high FFT bins stay active
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = idx === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq * (step % 2 === 1 && idx === 3 ? 2 : 1), now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(step % 4 === 0 ? 3200 : 1800, now);

      const peak = idx === 0 ? 0.07 : 0.04;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.34);
    });

    // Sub kick on beat
    if (step % 2 === 0) {
      const kOsc = audioCtx.createOscillator();
      const kGain = audioCtx.createGain();
      kOsc.type = "sine";
      kOsc.frequency.setValueAtTime(125, now);
      kOsc.frequency.exponentialRampToValueAtTime(40, now + 0.16);
      kGain.gain.setValueAtTime(0.24, now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      kOsc.connect(kGain);
      kGain.connect(analyser);
      kOsc.start(now);
      kOsc.stop(now + 0.24);
    }
    step++;
  };

  triggerStep();
  synthTimer = setInterval(triggerStep, 234);
}

// --- Generate Rainmeter Variables.inc ---
function buildVariablesInc() {
  const skinWidth = Math.ceil((state.barCount * (state.barWidth + state.barGap) - state.barGap) * state.scaleVisualizer);
  const mpMode = state.playerName === "Web" ? "Web" : "NowPlaying";
  return `[Variables]
Config=Cadence\\Visualizer
Language=${state.language}
SkinWidth=${skinWidth}
VisualizerMode=${state.visualizerMode}
ScaleVisualizer=${state.scaleVisualizer.toFixed(2)}
BarHeight=${state.barHeight}
Angle=${state.angle}
ShowProgressBar=${state.showProgressBar ? 1 : 0}
EnableAutoHide=${state.enableAutoHide ? 1 : 0}
EnableAutoMute=${state.enableAutoMute ? 1 : 0}
BarCount=${state.barCount}
BarStyle=${state.barStyle}
BarWidth=${state.barWidth}
BarGap=${state.barGap}
BarRadius=${state.barRadius}
MirrorMode=${state.mirrorMode ? 1 : 0}
InvertVisualizer=${state.invertVisualizer ? 1 : 0}
BarAlpha=${Math.round((state.barAlpha / 100) * 255)}
Sensitivity=${state.sensitivity}
AverageSize=${state.averageSize}
Multiplier=${state.multiplier}
FFTSize=${state.fftSize}
WaveEnabled=${state.waveEnabled ? 1 : 0}
WaveStiffness=${state.waveStiffness.toFixed(2)}
WaveSpread=${state.waveSpread}
WaveScale=${state.waveScale}
WaveExpScale=${state.waveExpScale.toFixed(1)}
WaveStrokeWidth=${state.waveStrokeWidth.toFixed(1)}
WaveFill=${state.waveFill ? 1 : 0}
ScopeSharpness=${state.scopeSharpness.toFixed(1)}
ScopeThickness=${state.scopeThickness.toFixed(1)}
ScopeSensitivity=${state.scopeSensitivity.toFixed(1)}
ScopeGlow=${state.scopeGlow}
ScopeSmoothing=${state.scopeSmoothing.toFixed(2)}
ScopeSpeed=${state.scopeSpeed.toFixed(1)}
ScopeTrail=${state.scopeTrail ? 1 : 0}
ScopeEdgeTaper=${state.scopeEdgeTaper ? 1 : 0}
ScopeDualTrace=${state.scopeDualTrace ? 1 : 0}
EnableSpheresLayer=${state.enableSpheresLayer ? 1 : 0}
EnableRaysLayer=${state.enableRaysLayer ? 1 : 0}
EnablePeaksLayer=${state.enablePeaksLayer ? 1 : 0}
EnableBassAuraLayer=${state.enableBassAuraLayer ? 1 : 0}
EnableParticlesLayer=${state.enableParticlesLayer ? 1 : 0}
EnableShockwaveLayer=${state.enableShockwaveLayer ? 1 : 0}
EnableOrbitalsLayer=${state.enableOrbitalsLayer ? 1 : 0}
EnableRibbonLayer=${state.enableRibbonLayer ? 1 : 0}
PaletteName=${state.paletteName}
Color1=${hexToRgbTuple(state.color1)}
Color2=${hexToRgbTuple(state.color2)}
Color3=${hexToRgbTuple(state.color3)}
Color=${hexToRgbTuple(state.barColor)}
GradientAngle=${state.gradientAngle}
BarGradientAngle=${state.barGradientAngle}
UseGradientBars=${state.useGradientBars ? 1 : 0}
EnableDropShadow=${state.enableDropShadow ? 1 : 0}
EnableDynamicColors=${state.enableDynamicColors}
PlayerName=${state.playerName}
MPMode=${mpMode}
ClockMode=${state.clockMode}
ClockScale=${state.clockScale.toFixed(2)}
Clock24H=${state.clock24H ? 1 : 0}
ClockShowSeconds=${state.clockShowSeconds ? 1 : 0}
ClockSeparator=${state.clockSeparator}
ClockWeekdayFont=${state.clockWeekdayFont}
ClockDayPosition=${state.clockDayPos}
ClockShowRules=${state.clockShowRules ? 1 : 0}
ClockShowGreeting=${state.clockShowGreeting ? 1 : 0}
ClockShowDayProgress=${state.clockShowDayProgress ? 1 : 0}
ClockTimeAlpha=${Math.round((state.clockTimeAlpha / 100) * 255)}
ClockUseGradientAccent=${state.clockUseGradientAccent ? 1 : 0}
PlayerMode=${state.playerMode}
PlayerScale=${state.playerScale.toFixed(2)}
PlayerCoverRadius=${state.playerCoverRadius}
PlayerShowCover=${state.playerShowCover ? 1 : 0}
PlayerShowHeader=${state.playerShowHeader ? 1 : 0}
PlayerMarquee=${state.playerMarquee ? 1 : 0}
PlayerShowPercent=${state.playerShowPercent ? 1 : 0}
PlayerShowCardBg=${state.playerShowCardBg ? 1 : 0}
PlayerAutoHide=${state.playerAutoHide ? 1 : 0}
WeatherMode=${state.weatherMode}
WeatherScale=${state.weatherScale.toFixed(2)}
WeatherCity=${state.weatherCity}
WeatherLat=${activeWeatherMeta.lat.toFixed(4)}
WeatherLon=${activeWeatherMeta.lon.toFixed(4)}
WeatherResolvedCity=${activeWeatherMeta.resolvedCity}
WeatherUnit=${state.weatherUnit}
WeatherUnitQuery=${state.weatherUnit === "F" ? "fahrenheit" : "celsius"}
WeatherIconPack=${state.weatherIconPack}
WeatherShowForecast=${state.weatherShowForecast ? 1 : 0}
WeatherShowDetails=${state.weatherShowDetails ? 1 : 0}
WeatherShowCardBg=${state.weatherShowCardBg ? 1 : 0}
WeatherTintIcon=${state.weatherTintIcon ? 1 : 0}
ThemeMode=${state.themeMode}
ThemeBgOpacity=${state.bgOpacity}
ThemeCustomCardBg=${hexToRgbTuple(state.customCardBg)}
ThemeCustomText=${hexToRgbTuple(state.customTextColor)}
CardSurfaceBg=${resolveAppearance().surfaceTuple}
CardBgAlpha=${Math.round((state.bgOpacity / 100) * 255)}
DockMode=${state.dockMode}
DockOrientation=${state.dockOrientation}
DockLabelPosition=${state.dockLabelPos}
DockLabelStyle=${state.dockLabelStyle}
DockScale=${state.dockScale.toFixed(2)}
DockIconSize=${state.dockIconSize}
DockSpacing=${state.dockSpacing}
DockIconCount=${state.dockIconCount}
DockHoverZoom=${state.dockHoverZoom ? 1 : 0}
DockShowLabels=${state.dockShowLabels ? 1 : 0}
DockShowCardBg=${state.dockShowCardBg ? 1 : 0}
DockTintIcons=${state.dockTintIcons ? 1 : 0}
DockShowBinCount=${state.dockShowBinCount ? 1 : 0}
${state.dockSlots
  .map(
    (s, i) => `DockSlot${i + 1}Icon=${s.icon}
DockSlot${i + 1}Label=${s.label}
DockSlot${i + 1}Cmd=${s.cmd}`
  )
  .join("\n")}
`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function getPlayerTimeParts() {
  const total = Math.max(1, currentTrack.durationSec);
  const pct = clamp(trackProgress, 0, 1);
  const elapsed = Math.floor(pct * total);
  const remaining = Math.max(0, Math.ceil(total - elapsed));
  const pctInt = Math.round(pct * 100);
  const posStr = formatDuration(elapsed);
  const remStr = `-${formatDuration(remaining)}`;
  const readout = state.playerShowPercent
    ? `${posStr}  ·  ${remStr}  (${pctInt}%)`
    : `${posStr}  ·  ${remStr}`;
  return { pct, pctInt, posStr, remStr, readout };
}

const PLAYER_SVGS = {
  note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  prev: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="2" y="3" width="2" height="10" rx="0.6"/><polygon points="13,3 5.5,8 13,13"/></svg>`,
  play: `<svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><polygon points="4,2 14,8 4,14"/></svg>`,
  pause: `<svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><rect x="3" y="2.5" width="3.5" height="11" rx="1"/><rect x="9.5" y="2.5" width="3.5" height="11" rx="1"/></svg>`,
  next: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><polygon points="3,3 10.5,8 3,13"/><rect x="12" y="3" width="2" height="10" rx="0.6"/></svg>`,
};

function renderTransportMarkup() {
  const playIcon = isMediaPlaying ? PLAYER_SVGS.pause : PLAYER_SVGS.play;
  const playLabel = isMediaPlaying ? "Pause" : "Play";
  return `
    <div class="player-transport">
      <button type="button" class="t-btn" data-action="prev" title="Previous track" aria-label="Previous track">${PLAYER_SVGS.prev}</button>
      <button type="button" class="t-btn is-primary" data-action="toggle" title="${playLabel}" aria-label="${playLabel}">${playIcon}</button>
      <button type="button" class="t-btn" data-action="next" title="Next track" aria-label="Next track">${PLAYER_SVGS.next}</button>
    </div>
  `;
}

function togglePlayPause() {
  isMediaPlaying = !isMediaPlaying;
  document.getElementById("playPauseLabel").textContent = t(isMediaPlaying ? "Pause" : "Play");
  if (audioEl) {
    if (isMediaPlaying) audioEl.play();
    else audioEl.pause();
  }
  renderPlayer();
}

function stepTrack(delta = 1) {
  if (customTracks.length > 0) {
    customTrackIdx = (customTrackIdx + delta + customTracks.length) % customTracks.length;
    playCustomTrack(customTrackIdx);
    return;
  }
  genreIdx = (genreIdx + delta + GENRES.length) % GENRES.length;
  const g = GENRES[genreIdx];
  if (audioEl && !audioEl.paused) {
    audioEl.pause();
    if (!synthRunning) usingRealAudio = false;
  }
  currentTrack = {
    genre: g.label,
    title: g.track,
    artist: g.artist,
    durationSec: 185 + ((genreIdx * 37) % 95),
    coverColors: g.cover,
    isCustomFile: false,
  };
  trackProgress = 0.08;
  document.getElementById("mediaGenreTag").textContent = g.label;
  refreshVarsPreview();
}

function updatePlayerProgressUI() {
  if (!playerSkin || !playerSkin.firstElementChild) return;
  const t = getPlayerTimeParts();
  const pctCss = `${(t.pct * 100).toFixed(2)}%`;

  const fill = playerSkin.querySelector(".scrub-fill");
  const halo = playerSkin.querySelector(".scrub-dot-halo");
  const dot = playerSkin.querySelector(".scrub-dot");
  if (fill) fill.style.width = pctCss;
  if (halo) halo.style.left = pctCss;
  if (dot) dot.style.left = pctCss;

  const key = `${t.posStr}|${t.remStr}|${t.pctInt}|${state.playerShowPercent}`;
  if (key !== lastRenderedTimeKey) {
    lastRenderedTimeKey = key;
    const meta = playerSkin.querySelector(".player-time-meta");
    if (meta) meta.textContent = t.readout;
    const posEl = playerSkin.querySelector("[data-pos]");
    if (posEl) posEl.textContent = t.posStr;
    const remEl = playerSkin.querySelector("[data-rem]");
    if (remEl) remEl.textContent = t.remStr;
  }
}

function renderPlayer() {
  playerSkin.style.setProperty("--player-scale", state.playerScale.toFixed(2));
  playerWindow.classList.toggle("is-hidden", state.playerAutoHide && !isMediaPlaying);

  const t = getPlayerTimeParts();
  const pctCss = `${(t.pct * 100).toFixed(2)}%`;
  const [cov0, cov1] = currentTrack.coverColors;
  const coverStyle = `border-radius: ${state.playerCoverRadius}px; background: linear-gradient(135deg, ${cov0}, ${cov1});`;
  const safeTitle = escapeHtml(currentTrack.title);
  let artistText = currentTrack.artist;
  if (isVi()) {
    if (artistText.startsWith("Procedural WebAudio")) {
      artistText = artistText.replace("Procedural WebAudio", "Nhạc tổng hợp WebAudio");
    } else if (artistText.startsWith("Local Audio File")) {
      artistText = artistText.replace("Local Audio File · Live FFT", "Nhạc trên máy · FFT trực tiếp");
    }
  }
  const safeArtist = escapeHtml(artistText);
  lastRenderedTimeKey = "";

  if (state.playerMode === 1) {
    const headerHtml = state.playerShowHeader
      ? `<div class="player-micro-header">${isVi() ? "BẠN ĐANG NGHE" : "YOU'RE LISTENING"}</div>`
      : "";
    playerSkin.innerHTML = `
      <div class="player-totem">
        ${headerHtml}
        <div class="player-title-wrap" style="width: 100%;">
          <div class="player-title">${safeTitle}</div>
        </div>
        <div class="player-artist">— ${safeArtist} —</div>
        <div class="totem-scrub-row">
          <span class="totem-time" data-pos="1" style="text-align: right;">${t.posStr}</span>
          <div class="scrub-track" data-scrub="1">
            <div class="scrub-rail">
              <div class="scrub-fill" style="width: ${pctCss};"></div>
              <div class="scrub-dot-halo" style="left: ${pctCss};"></div>
              <div class="scrub-dot" style="left: ${pctCss};"></div>
            </div>
          </div>
          <span class="totem-time" data-rem="1" style="text-align: left;">${t.remStr}</span>
        </div>
        ${renderTransportMarkup()}
      </div>
    `;
  } else if (state.playerMode === 2) {
    const coverHtml = state.playerShowCover
      ? `
        <div class="mc-cover" style="${coverStyle}">
          ${PLAYER_SVGS.note}
          <div class="mc-cover-overlay">${renderTransportMarkup()}</div>
        </div>
      `
      : "";
    const pctLine = state.playerShowPercent ? `<div class="player-time-meta">${t.readout}</div>` : "";
    playerSkin.innerHTML = `
      <div class="player-monstercat">
        ${coverHtml}
        <div class="mc-meta">
          <div class="mc-artist">${safeArtist}</div>
          <div class="mc-track">${safeTitle}</div>
          <div class="scrub-track" data-scrub="1">
            <div class="scrub-rail">
              <div class="scrub-fill" style="width: ${pctCss};"></div>
            </div>
          </div>
          ${pctLine}
        </div>
      </div>
    `;
  } else {
    const coverHtml = state.playerShowCover
      ? `<div class="player-cover-box" style="${coverStyle}">${PLAYER_SVGS.note}</div>`
      : "";
    const headerHtml = state.playerShowHeader
      ? `<div class="player-micro-header">${isVi() ? "♪  BẠN ĐANG NGHE" : "♪  YOU'RE LISTENING"}</div>`
      : "";
    playerSkin.innerHTML = `
      <div class="player-studio ${state.playerShowCardBg ? "has-card" : ""}">
        ${coverHtml}
        <div class="player-studio-body">
          ${headerHtml}
          <div class="player-title-wrap">
            <div class="player-title">${safeTitle}</div>
          </div>
          <div class="player-artist">${safeArtist}</div>
          <div class="player-bottom-row">
            <div class="player-scrub-col">
              <div class="scrub-track" data-scrub="1">
                <div class="scrub-rail">
                  <div class="scrub-fill" style="width: ${pctCss};"></div>
                  <div class="scrub-dot-halo" style="left: ${pctCss};"></div>
                  <div class="scrub-dot" style="left: ${pctCss};"></div>
                </div>
              </div>
              <div class="player-time-meta">${t.readout}</div>
            </div>
            ${renderTransportMarkup()}
          </div>
        </div>
      </div>
    `;
  }

  if (state.playerMarquee) {
    const wrap = playerSkin.querySelector(".player-title-wrap");
    const titleEl = playerSkin.querySelector(".player-title");
    if (wrap && titleEl && titleEl.scrollWidth > wrap.clientWidth + 2) {
      titleEl.style.setProperty("--marquee-overflow", `${titleEl.scrollWidth - wrap.clientWidth}px`);
      titleEl.classList.add("is-marquee");
    }
  }
}

function getTimeOfDayGreeting(hour) {
  if (isVi()) {
    if (hour >= 5 && hour < 11) return "sáng";
    if (hour >= 11 && hour < 13) return "trưa";
    if (hour >= 13 && hour < 18) return "chiều";
    if (hour >= 18 && hour < 22) return "tối";
    return "đêm";
  }
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

function renderTabularTimeHtml(timeStr) {
  return Array.from(timeStr)
    .map((ch) => {
      if (ch >= "0" && ch <= "9") return `<span class="clk-digit">${ch}</span>`;
      return `<span class="clk-sep">${escapeHtml(ch)}</span>`;
    })
    .join("");
}

function renderClock() {
  const now = new Date();
  const h24 = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const sep = state.clockSeparator;

  let hDisp = h24;
  let ampm = "";
  if (!state.clock24H) {
    ampm = h24 >= 12 ? "pm" : "am";
    hDisp = h24 % 12 || 12;
  }
  const hStr = String(hDisp).padStart(2, "0");
  const timeStr = state.clockShowSeconds ? `${hStr}${sep}${m}${sep}${s}` : `${hStr}${sep}${m}`;

  const weekdaysLongEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdaysShortEn = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdaysLongVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const weekdaysShortVi = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const dayLong = (isVi() ? weekdaysLongVi : weekdaysLongEn)[now.getDay()];
  const dayShort = (isVi() ? weekdaysShortVi : weekdaysShortEn)[now.getDay()];
  const dd = String(now.getDate()).padStart(2, "0");
  const dateLong = isVi()
    ? `${dd} Tháng ${now.getMonth() + 1} ${now.getFullYear()}`
    : `${dd} ${monthsEn[now.getMonth()]} ${now.getFullYear()}`;
  const dateShort = isVi()
    ? `${dd} Tháng ${now.getMonth() + 1}`
    : `${dd} ${monthsEn[now.getMonth()]}`;
  const greetingWord = getTimeOfDayGreeting(h24);
  const greetingFull = isVi() ? `CHÀO BUỔI ${greetingWord.toUpperCase()}` : `GOOD ${greetingWord.toUpperCase()}`;
  const dayPct = Math.round(((h24 * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100);

  clockTotem.style.setProperty("--clock-scale", state.clockScale.toFixed(2));
  clockTotem.style.setProperty("--clock-time-alpha", (state.clockTimeAlpha / 100).toFixed(2));

  const posField = document.getElementById("clockPosField");
  if (posField) {
    posField.classList.toggle("is-mode-inactive", state.clockMode === 1 || state.clockMode === 3);
  }

  const accentCls = state.clockUseGradientAccent ? "is-gradient" : "is-amber";
  let effectiveFont = state.clockWeekdayFont;
  if (isVi()) {
    if (effectiveFont === "Anurati") effectiveFont = "Montserrat";
    else if (VI_UNSUPPORTED_CLOCK_FONTS.has(effectiveFont)) {
      effectiveFont = "LXGW WenKai TC";
    }
  }
  const fontCss = `'${effectiveFont}', 'Montserrat', sans-serif`;
  const ruleTop = state.clockShowRules ? `<div class="clock-rule"></div>` : "";
  const ruleBot = state.clockShowRules ? `<div class="clock-rule is-bottom"></div>` : "";
  const ampmHtml = ampm ? `<span class="ampm">${ampm}</span>` : "";
  const tabularTimeHtml = renderTabularTimeHtml(timeStr);

  clockTotem.classList.toggle("is-summit-vert", state.clockMode === 1);

  if (state.clockMode === 1) {
    const greetHtml = state.clockShowGreeting
      ? `<div class="summit-good">${isVi() ? "CHÀO BUỔI" : "GOOD"}<br/>${greetingWord.toUpperCase()}</div>`
      : "";
    const ampmUpper = ampm ? `<span class="ampm-inline">${ampm.toUpperCase()}</span>` : "";
    clockTotem.innerHTML = `
      ${ruleTop}
      ${greetHtml}
      <div class="summit-day ${accentCls}">${dayShort}</div>
      <div class="summit-date">${dateShort.toUpperCase()}</div>
      <div class="summit-time">${tabularTimeHtml}${ampmUpper}</div>
      ${ruleBot}
    `;
    return;
  }

  if (state.clockMode === 3) {
    const divHtml = state.clockShowRules ? `<div class="summit-horiz-divider"></div>` : "";
    const greetHtml = state.clockShowGreeting ? `<div class="summit-horiz-greet">${greetingFull}</div>` : "";
    const pctSuffix = state.clockShowDayProgress ? ` · ${dayPct}%` : "";
    clockTotem.innerHTML = `
      <div class="summit-horiz">
        <div class="summit-horiz-day ${accentCls}">${dayLong.toUpperCase()}</div>
        ${divHtml}
        <div class="summit-horiz-meta">
          ${greetHtml}
          <div class="summit-horiz-time">${tabularTimeHtml}${ampmHtml}</div>
          <div class="summit-horiz-date">${dateLong.toUpperCase()}${pctSuffix}</div>
        </div>
      </div>
    `;
    return;
  }

  const EDITORIAL_FONTS = new Set([
    "Cactus Classical Serif",
    "Chiron Sung HK",
    "LXGW WenKai TC",
    "JetBrains Mono SemiBold",
  ]);
  const isBlended = state.clockMode === 0;
  const isAnurati = effectiveFont === "Anurati" || (isVi() && state.clockWeekdayFont === "Anurati");
  const isEditorial = EDITORIAL_FONTS.has(effectiveFont);
  const dayText = isAnurati ? dayLong.toUpperCase() : dayLong;
  const dayCls = isAnurati ? "is-anurati" : (isEditorial ? "is-editorial" : "");
  const stageCls = state.clockDayPos === 1 ? "is-lower" : "";
  const timeCls = state.clockShowSeconds ? "has-seconds" : "";
  const greetHtml = isBlended && state.clockShowGreeting ? `<div class="clock-greeting">${greetingFull}</div>` : "";
  const progressHtml =
    isBlended && state.clockShowDayProgress
      ? `<div class="clock-day-progress">${dayPct}% ${isVi() ? "ngày đã trôi qua" : "of the day has passed"}</div>`
      : "";

  clockTotem.innerHTML = `
    ${isBlended ? ruleTop : ""}
    ${greetHtml}
    <div class="clock-layered-stage ${stageCls}">
      <div class="clock-time-backdrop ${timeCls}">${tabularTimeHtml}${ampmHtml}</div>
      <div class="clock-weekday-overlay ${accentCls} ${dayCls}" style="font-family: ${fontCss};">${dayText}</div>
    </div>
    <div class="clock-pill ${state.clockUseGradientAccent ? "" : "is-amber"}"></div>
    <div class="clock-date-line">${dateLong.toUpperCase()}</div>
    ${progressHtml}
    ${isBlended ? ruleBot : ""}
  `;

  alignClockOverlay();
  if (document.fonts && document.fonts.load) {
    document.fonts.load(`1em "${effectiveFont}"`)
      .then(() => {
        if (state.clockMode === 0 || state.clockMode === 2) alignClockOverlay();
      })
      .catch(() => {});
  }
}

const clockMeasureCanvas = document.createElement("canvas");
clockMeasureCanvas.width = 760;
clockMeasureCanvas.height = 260;
const clockMeasureCtx = clockMeasureCanvas.getContext("2d", { willReadFrequently: true });

function measureOpticalOffsets(text, cs, cancelsTrailingLS) {
  if (!clockMeasureCtx || !text) return { dx: 0, dy: 0 };
  const w = clockMeasureCanvas.width;
  const h = clockMeasureCanvas.height;
  const startX = 140;
  const baseY = 170;

  clockMeasureCtx.clearRect(0, 0, w, h);
  clockMeasureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  clockMeasureCtx.fillStyle = "#ffffff";
  clockMeasureCtx.textAlign = "left";
  clockMeasureCtx.textBaseline = "alphabetic";
  const lsPx = parseFloat(cs.letterSpacing) || 0;
  if ("letterSpacing" in clockMeasureCtx) {
    clockMeasureCtx.letterSpacing = `${lsPx}px`;
  }

  const m = clockMeasureCtx.measureText(text);
  clockMeasureCtx.fillText(text, startX, baseY);

  const data = clockMeasureCtx.getImageData(0, 0, w, h).data;
  const colMax = new Uint8Array(w);
  const rowMax = new Uint8Array(h);
  let sumA = 0, sumY = 0;
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) {
    const rowOff = y * w * 4;
    for (let x = 0; x < w; x++) {
      const a = data[rowOff + x * 4 + 3];
      if (a > colMax[x]) colMax[x] = a;
      if (a > rowMax[y]) rowMax[y] = a;
      if (a > 24) {
        sumA += a;
        sumY += (y + 0.5) * a;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!sumA || maxX < minX) return { dx: 0, dy: 0 };

  // Sub-pixel edge interpolation on [minX .. maxX+1] and [minY .. maxY+1]
  const leftEdge = minX + Math.max(0, 1 - colMax[minX] / 255) * 0.5;
  const rightEdge = (maxX + 1) - Math.max(0, 1 - colMax[maxX] / 255) * 0.5;
  const topEdge = minY + Math.max(0, 1 - rowMax[minY] / 255) * 0.5;
  const botEdge = (maxY + 1) - Math.max(0, 1 - rowMax[maxY] / 255) * 0.5;

  const comY = sumY / sumA;
  const bboxMidX = (leftEdge + rightEdge) / 2;
  const bboxMidY = (topEdge + botEdge) / 2;
  const optX = bboxMidX;
  const optY = comY * 0.4 + bboxMidY * 0.6;

  const trailingCancel = cancelsTrailingLS ? lsPx : 0;
  const boxMidX = startX + (m.width - trailingCancel) / 2;
  const fMidY = ((m.fontBoundingBoxAscent || 0) - (m.fontBoundingBoxDescent || 0)) / 2;
  const boxMidY = baseY - fMidY;

  return { dx: optX - boxMidX, dy: optY - boxMidY };
}

function alignClockOverlay() {
  const stage = clockTotem.querySelector(".clock-layered-stage");
  const timeEl = clockTotem.querySelector(".clock-time-backdrop");
  const dayEl = clockTotem.querySelector(".clock-weekday-overlay");
  if (!stage || !timeEl || !dayEl || !clockMeasureCtx) return;

  const csTime = getComputedStyle(timeEl);
  const csDay = getComputedStyle(dayEl);
  // Measure vertical optical center against constant "88:88" reference so second ticks never alter Y
  const tOff = measureOpticalOffsets("88:88", csTime, false);
  const cancelsLS = dayEl.classList.contains("is-anurati");
  const dOff = measureOpticalOffsets(dayEl.textContent.trim(), csDay, cancelsLS);

  // Digits live in uniform-width .clk-digit cells, so keep timeEl strictly pinned to horizontal center
  timeEl.style.transform = "";
  const timeRectH = timeEl.getBoundingClientRect().height / Math.max(0.1, state.clockScale);
  const stagePadTop = parseFloat(getComputedStyle(stage).paddingTop) || 0;
  const lowerOffset = state.clockDayPos === 1 ? 36 : 10;
  const timeCenterY = stagePadTop + timeRectH / 2 + tOff.dy + lowerOffset;

  dayEl.style.top = `${timeCenterY.toFixed(2)}px`;
  dayEl.style.transform = `translate(calc(-50% - ${dOff.dx.toFixed(2)}px), calc(-50% - ${dOff.dy.toFixed(2)}px))`;
}

// --- Part 4: Blended Weather Renderer & Open-Meteo Engine ---
function escapeHtmlWeather(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTempUnit(tempC) {
  const c = Number.isFinite(tempC) ? tempC : 20;
  return state.weatherUnit === "F" ? Math.round((c * 9) / 5 + 32) : Math.round(c);
}

function mapWmoWeather(code, isDay = 1) {
  const entry = WMO_WEATHER_MAP[Number(code)] || { label: "Partly Cloudy", day: 30, night: 29 };
  const icon = Number(isDay) === 0 ? entry.night : entry.day;
  return { label: entry.label, icon };
}

function buildFallbackWeather(cityQuery) {
  const clean = (cityQuery || "Ho Chi Minh City").trim() || "Ho Chi Minh City";
  const key = clean.toLowerCase();
  if (WEATHER_PRESETS[key]) {
    return { ...WEATHER_PRESETS[key], source: "preset" };
  }
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const codes = [0, 1, 2, 3, 61, 80, 95, 73];
  const baseTemp = 7 + (hash % 21);
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const startDay = new Date().getDay();
  const forecast = [1, 2, 3, 4].map((offset) => {
    const fCode = codes[(hash + offset) % codes.length];
    return {
      day: days[(startDay + offset) % 7],
      hiC: baseTemp + 2 + ((hash + offset) % 4),
      loC: baseTemp - 4 - (offset % 3),
      code: fCode,
    };
  });
  return {
    city: clean,
    lat: Number((20 + (hash % 45) * 0.85).toFixed(4)),
    lon: Number((-60 + (hash % 140) * 1.1).toFixed(4)),
    tempC: baseTemp,
    feelsC: baseTemp - 1,
    wind: 8 + (hash % 18),
    hum: 45 + (hash % 40),
    code: codes[hash % codes.length],
    isDay: 1,
    forecast,
    source: "offline",
  };
}

function resolveWeatherData() {
  const clean = (state.weatherCity || "Ho Chi Minh City").trim() || "Ho Chi Minh City";
  const key = clean.toLowerCase();
  const base = weatherLiveCache[key] || buildFallbackWeather(clean);
  activeWeatherMeta = {
    lat: base.lat ?? 10.8231,
    lon: base.lon ?? 106.6297,
    resolvedCity: base.city || clean,
  };
  const overrideCode = state.weatherDemoCond === "auto" ? base.code : parseInt(state.weatherDemoCond, 10);
  return {
    ...base,
    code: Number.isFinite(overrideCode) ? overrideCode : base.code,
  };
}

async function fetchWeatherForCity(cityQuery) {
  const clean = (cityQuery || "Ho Chi Minh City").trim() || "Ho Chi Minh City";
  const key = clean.toLowerCase();
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (!geoRes.ok) return;
    const geoData = await geoRes.json();
    const loc = geoData && Array.isArray(geoData.results) ? geoData.results[0] : null;
    if (!loc) return;

    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (!wxRes.ok) return;
    const wxData = await wxRes.json();
    if (!wxData || !wxData.current || !wxData.daily) return;

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const forecast = [1, 2, 3, 4].map((idx) => {
      const dStr = wxData.daily.time[idx] || "";
      const parsed = dStr ? new Date(`${dStr}T12:00:00`) : null;
      const dayLabel = parsed && !Number.isNaN(parsed.getTime()) ? days[parsed.getDay()] : "DAY";
      return {
        day: dayLabel,
        hiC: wxData.daily.temperature_2m_max[idx] ?? wxData.current.temperature_2m,
        loC: wxData.daily.temperature_2m_min[idx] ?? wxData.current.temperature_2m - 4,
        code: wxData.daily.weather_code[idx] ?? 2,
      };
    });

    weatherLiveCache[key] = {
      city: loc.name || clean,
      lat: Number(loc.latitude),
      lon: Number(loc.longitude),
      tempC: wxData.current.temperature_2m,
      feelsC: wxData.current.apparent_temperature ?? wxData.current.temperature_2m,
      wind: Math.round(wxData.current.wind_speed_10m ?? 10),
      hum: Math.round(wxData.current.relative_humidity_2m ?? 60),
      code: wxData.current.weather_code ?? 2,
      isDay: wxData.current.is_day ?? 1,
      forecast,
      source: "live",
    };
    if ((state.weatherCity || "").trim().toLowerCase() === key) {
      renderWeather();
      document.getElementById("varsPreview").textContent = buildVariablesInc();
    }
  } catch {
    // Offline or sandboxed environment falls back silently to preset/deterministic data.
  }
}

const sysColorSchemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

// --- Localization (English & Tiếng Việt) ---
const VI_DICT = {
  "Part 1–5 · Clock, Visualizer, Player, Weather & Dock": "Phần 1–5 · Đồng hồ, Phổ nhạc, Trình phát, Thời tiết & Dock",
  "Obsidian": "Đá Đen",
  "Warm Dusk": "Hoàng Hôn",
  "Stone Light": "Đá Sáng",
  "Custom BG": "Ảnh nền riêng",
  "Settings": "Cài đặt",
  "Drag to move": "Kéo để di chuyển",
  "SETTINGS": "CÀI ĐẶT",
  "General": "Chung",
  "Clock & Date": "Đồng hồ & Ngày",
  "Music Player": "Trình phát nhạc",
  "Weather": "Thời tiết",
  "App Dock": "Thanh Dock",
  "Spectrum & Audio": "Phổ & Âm thanh",
  "Wave Physics": "Vật lý sóng",
  "Styling & Colors": "Màu sắc & Kiểu dáng",
  "Media & Export": "Nguồn nhạc & Xuất",
  "Reset Defaults": "Khôi phục mặc định",
  "Export Variables": "Xuất Variables",
  "Pause": "Tạm dừng",
  "Play": "Phát",
  "Sound: Off": "Âm thanh: Tắt",
  "Sound: On": "Âm thanh: Bật",
  "Load Audio": "Chọn nhạc",
  "Next Track": "Bài tiếp",

  // Tab General
  "General & Visual Mode": "Cài đặt chung",
  "Blend Irena's WaterWave and Inside Dream's centered bars, or isolate any single engine.": "Kết hợp sóng nước Irena với cột nhạc đối xứng Inside Dream, hoặc dùng riêng từng kiểu.",
  "Visualizer Mode": "Chọn loại phổ nhạc",
  "Blended": "Kết hợp",
  "Mirrored Bars": "Cột đối xứng",
  "WaterWave": "Sóng nước",
  "Bottom-Up": "Từ đáy lên",
  "Bar Style": "Kiểu cột",
  "Rounded": "Bo tròn",
  "Sharp (Monstercat)": "Sắc nét (Monstercat)",
  "Connected-Through": "Đường nối mượt",
  "Appearance Mode": "Giao diện",
  "Dark": "Tối",
  "Light": "Sáng",
  "Custom": "Tùy chỉnh",
  "System": "Hệ thống",
  "Card Background": "Màu nền thẻ",
  "Card Ink": "Màu chữ thẻ",
  "Background Opacity": "Độ mờ nền",
  "Language": "Ngôn ngữ",
  "Visualizer Scale": "Tỉ lệ phổ nhạc",
  "Visualizer Height": "Chiều cao phổ nhạc",
  "Rotation Angle": "Góc xoay",
  "Show song progress bar (when angle = 0°)": "Thanh tiến trình bài hát (góc = 0°)",
  "Hide skin when media is stopped": "Tự ẩn phổ nhạc khi dừng phát",
  "Ignore audio when media is paused": "Ngưng bắt âm khi tạm dừng",

  // Tab Clock
  "Clock, Date & Greeting": "Đồng hồ & Ngày",
  "Merge Summit's vertical hairline architecture with Robik's layered backdrop time and brush-script weekday.": "Kết hợp nét mảnh Summit, giờ nền lớn Robik và chữ thứ viết tay.",
  "Layout": "Bố cục",
  "Blended layered time": "Xếp lớp giờ & thứ",
  "Classic translucent script": "Giờ nền & chữ viết tay",
  "electroharmonix column": "Cột dọc electroharmonix",
  "electroharmonix lockup": "Xếp ngang electroharmonix",
  "Font": "Phông chữ",
  "Position": "Vị trí",
  "Center": "Giữa",
  "Lower": "Thấp hơn",
  "Scale": "Tỉ lệ",
  "Backdrop Time Opacity": "Độ mờ giờ nền",
  "Time Separator": "Dấu phân cách",
  "Colon (13:20)": "Hai chấm (13:20)",
  "Robik Dot (13.20)": "Dấu chấm (13.20)",
  "24-Hour clock format": "Định dạng 24 giờ",
  "Show seconds": "Hiển thị giây",
  "Show Summit vertical hairlines": "Thanh dọc mảnh Summit",
  "Show time-of-day greeting": "Lời chào theo buổi",
  "Show % of day passed": "Phần trăm ngày đã qua",
  "Use palette gradient on weekday": "Màu chữ thứ theo bảng màu",

  // Tab Player
  "Music Player & Song Info": "Trình phát nhạc",
  "Blends Monstercat cover art, Mond's glowing halo scrubber, Inside Dream marquee, Irena % progress, and Summit headers.": "Kết hợp ảnh bìa Monstercat, thanh tua Mond, chữ chạy Inside Dream và % tiến trình Irena.",
  "Cadence Studio": "Thẻ Studio",
  "Minimal Totem": "Tối giản",
  "Album Art Corner Radius": "Bo góc ảnh bìa",
  "Show album artwork": "Ảnh bìa album",
  "Show \"♪ You're Listening\" header": "Tiêu đề \"♪ Bạn đang nghe\"",
  "Scroll long track titles": "Cuộn tên bài hát dài",
  "Show track % elapsed": "Phần trăm bài đã phát",
  "Show card background": "Khung nền kính mờ",
  "Auto-hide player when stopped": "Tự ẩn khi dừng nhạc",

  // Tab Weather
  "Blended Weather": "Thời tiết",
  "Live Open-Meteo forecast with Mond tracked city, Robik tinted line icons, Irena narrative, and Inside Dream 4-day hi/lo strip.": "Dự báo Open-Meteo, tên thành phố Mond, biểu tượng nét Robik, mô tả Irena và dải 4 ngày Inside Dream.",
  "Minimal Horizon": "Tối giản ngang",
  "Irena Verse": "Mô tả Irena",
  "Location": "Địa điểm",
  "Apply": "Áp dụng",
  "Preset Cities": "Thành phố gợi ý",
  "Ho Chi Minh City": "TP. Hồ Chí Minh",
  "Temperature Unit": "Đơn vị nhiệt độ",
  "°C Celsius": "Độ C (°C)",
  "°F Fahrenheit": "Độ F (°F)",
  "Icon Pack": "Bộ biểu tượng",
  "Mond (Color)": "Mond (Màu)",
  "Weather Preview": "Thử kiểu thời tiết",
  "Auto (Live)": "Tự động",
  "Clear": "Quang đãng",
  "Cloudy": "Có mây",
  "Rain": "Mưa",
  "Storm": "Giông bão",
  "Snow": "Tuyết",
  "Show 4-day forecast": "Dải dự báo 4 ngày",
  "Show feels-like, wind speed & humidity": "Nhiệt độ cảm nhận, gió & độ ẩm",
  "Tint line icons with palette": "Tô màu biểu tượng theo bảng màu",

  // Tab Dock
  "Blended App Dock": "Thanh Dock",
  "Combines Inside Dream hover magnification, Summit monochrome icons and tooltips, Irena/Mond live Recycle Bin status, and studio glassmorphism.": "Kết hợp phóng to khi rê chuột Inside Dream, biểu tượng đơn sắc Summit, Thùng rác Irena/Mond và nền kính Studio.",
  "Studio Capsule": "Thanh kính Studio",
  "Summit Float": "Tối giản Summit",
  "Dock Position": "Hướng hiển thị",
  "Horizontal": "Ngang",
  "Vertical": "Dọc",
  "Hover Label Position": "Vị trí nhãn tên",
  "Hover Label Style": "Kiểu nhãn tên",
  "Text Background": "Có khung nền",
  "Text Only": "Chỉ chữ",
  "Visible Slots": "Số biểu tượng",
  "7 Icons": "7 biểu tượng",
  "9 Icons": "9 biểu tượng",
  "11 Icons": "11 biểu tượng",
  "13 Icons": "13 biểu tượng",
  "15 Icons": "15 biểu tượng",
  "Base Icon Size": "Kích thước biểu tượng",
  "Icon Spacing": "Khoảng cách biểu tượng",
  "Magnify icons on hover": "Phóng to khi rê chuột",
  "Show label on hover": "Hiện tên khi rê chuột",
  "Show dock background": "Khung nền kính mờ",
  "Tint hovered icon with palette": "Tô màu biểu tượng đang chọn",
  "Live Recycle Bin status & item badge": "Trạng thái & số mục Thùng rác",
  "Simulate full Recycle Bin": "Giả lập Thùng rác đầy",
  "Customize Dock Slot": "Tùy chỉnh nút trên Dock",

  // Tab Spectrum & Wave
  "Spectrum & Audio Engine": "Phổ nhạc & Âm thanh",
  "Monstercat FFT resolution, weighted neighbor smoothing, and Inside Dream bar spacing.": "Độ phân giải FFT Monstercat, làm mượt cột lân cận và khoảng cách cột Inside Dream.",
  "Bar Width": "Độ rộng cột",
  "Bar Gap": "Khoảng cách cột",
  "Bar Count": "Số lượng cột",
  "Bar Corner Radius": "Bo góc cột",
  "Sensitivity": "Độ nhạy (dB)",
  "Smoothing Level": "Độ mượt",
  "Log Multiplier": "Hệ số Log",
  "FFT Resolution": "Độ phân giải FFT",
  "Center-mirrored bars": "Cột đối xứng tâm",
  "Invert spectrum (flip bass / treble)": "Đảo chiều phổ tần (Bass / Treble)",
  "WaterWave Physics (Irena)": "Vật lý sóng (Irena)",
  "1D spring-coupled height-map simulation layered across the spectrum.": "Mô phỏng sóng lò xo 1D xếp lớp phía sau phổ nhạc.",
  "Enable WaterWave spline layer": "Đường sóng mượt WaterWave",
  "Translucent gradient fill under wave": "Tô màu mờ dưới đường sóng",
  "Spring Stiffness": "Độ cứng lò xo",
  "Ripple Spread": "Độ lan sóng",
  "Wave Amplitude": "Biên độ sóng",
  "Energy Exponent": "Độ nhạy năng lượng",
  "Stroke Thickness": "Độ dày nét sóng",

  // Tab Styling & Media
  "Styling & Dynamic Colors": "Màu sắc & Kiểu dáng",
  "3-stop Irena gradients, Inside Dream core tint, and Monstercat dynamic color modes.": "Dải màu 3 điểm Irena, màu nền Inside Dream và đổi màu tự động Monstercat.",
  "Signature Gradient Palettes": "Bảng màu gợi ý",
  "Custom Gradient Stops & Solid Tint": "Tùy chỉnh màu chuyển sắc & màu đơn",
  "Stop 1": "Điểm 1",
  "Stop 2": "Điểm 2",
  "Stop 3": "Điểm 3",
  "Solid Bar": "Màu đơn",
  "Color Gradient Angles": "Góc chuyển sắc màu",
  "Theme, Wave & Clock": "Sóng, Đồng hồ & Viền nhấn",
  "Spectrum Bars": "Cột phổ nhạc",
  "Dynamic Coloring": "Đổi màu tự động",
  "Static / Gradient": "Cố định / Dải màu",
  "Genre Tags": "Theo thể loại",
  "Cover Art": "Theo ảnh bìa",
  "Bar Opacity": "Độ đậm cột sóng",
  "Apply 3-stop gradient to bars": "Dải màu 3 điểm cho cột",
  "Enable soft drop shadow": "Đổ bóng mềm",
  "Media Source & Rainmeter Export": "Nguồn nhạc & Xuất cấu hình",
  "Configure Rainmeter player target or export your tuned preview settings into Variables.inc.": "Chọn trình phát Rainmeter hoặc xuất thông số sang Variables.inc.",
  "Rainmeter Player Target": "Trình phát nhạc Rainmeter",
  "Generated Variables.inc Snapshot": "Nội dung Variables.inc",
  "Copy Variables.inc": "Sao chép Variables.inc",
  "Download Variables.inc": "Tải về Variables.inc",
};

const WMO_VI = {
  0: "Trời quang", 1: "Ít mây", 2: "Có mây", 3: "Nhiều mây",
  45: "Sương mù", 48: "Sương giá",
  51: "Mưa phùn nhẹ", 53: "Mưa phùn", 55: "Mưa phùn dày",
  56: "Mưa băng nhẹ", 57: "Mưa đóng băng",
  61: "Mưa nhẹ", 63: "Có mưa", 65: "Mưa to",
  66: "Mưa tuyết", 67: "Mưa lạnh",
  71: "Tuyết nhẹ", 73: "Tuyết rơi", 75: "Tuyết dày", 77: "Mưa tuyết hạt",
  80: "Mưa rào nhẹ", 81: "Mưa rào", 82: "Mưa rào lớn",
  85: "Mưa tuyết", 86: "Bão tuyết",
  95: "Mưa giông", 96: "Giông & Mưa đá", 99: "Giông mạnh",
};

const DAY_SHORT_VI = { SUN: "CN", MON: "T2", TUE: "T3", WED: "T4", THU: "T5", FRI: "T6", SAT: "T7" };
const DOCK_LABEL_VI = {
  "This PC": "Máy tính",
  "Downloads": "Tải xuống",
  "Music": "Âm nhạc",
  "Recycle Bin": "Thùng rác",
  "Documents": "Tài liệu",
  "Videos": "Video",
  "Notepad": "Ghi chú",
  "Settings": "Cài đặt",
  "Shut Down": "Tắt nguồn",
};

function isVi() {
  return state.language === "Vietnamese";
}

function t(enText) {
  if (!isVi()) return enText;
  return VI_DICT[enText] || enText;
}

const VI_UNSUPPORTED_CLOCK_FONTS = new Set(["Moving Skate", "Tuesday Night", "Allura", "Anurati"]);

function updateClockFontNotice() {
  const noteEl = document.getElementById("clockFontViNote");
  if (!noteEl) return;
  const show = isVi() && VI_UNSUPPORTED_CLOCK_FONTS.has(state.clockWeekdayFont);
  noteEl.classList.toggle("is-hidden", !show);
  noteEl.textContent = show ? "Phông chữ này không hỗ trợ tiếng Việt" : "";
}

function updateDockLabelPosOptions() {
  const btns = document.querySelectorAll("#dockLabelPosButtons .seg-btn");
  if (!btns.length) return;
  const isVert = state.dockOrientation === 1;
  const labels = isVert
    ? (isVi() ? ["Bên trái", "Bên phải"] : ["Left", "Right"])
    : (isVi() ? ["Phía trên", "Phía dưới"] : ["Upper", "Lower"]);
  const enLabels = isVert ? ["Left", "Right"] : ["Upper", "Lower"];
  btns.forEach((btn, idx) => {
    btn.dataset.en = enLabels[idx] || enLabels[0];
    btn.textContent = labels[idx] || labels[0];
    btn.classList.toggle("is-active", parseInt(btn.dataset.dlblpos, 10) === state.dockLabelPos);
  });
}

function applyUiTranslations() {
  desktopStage.setAttribute("data-lang", isVi() ? "vi" : "en");
  const cityIn = document.getElementById("in-weatherCity");
  if (cityIn) {
    cityIn.placeholder = isVi() ? "Nhập thành phố (vd: Paris, Kyoto)..." : "Enter city (e.g. Paris, Kyoto)...";
  }
  const slotLblIn = document.getElementById("in-dockSlotLabel");
  if (slotLblIn) slotLblIn.placeholder = isVi() ? "Nhãn phím tắt" : "Shortcut label";
  const slotCmdIn = document.getElementById("in-dockSlotCmd");
  if (slotCmdIn) slotCmdIn.placeholder = isVi() ? 'Lệnh chạy (vd: ["wt.exe"])' : 'Command (e.g. ["wt.exe"])';

  const selectors = [
    ".brand-part",
    ".wallpaper-pills .pill-btn[data-wp]",
    ".upload-pill span",
    ".toggle-panel-btn",
    ".skin-drag-hint",
    ".sidebar-sub",
    ".nav-item",
    ".nav-action",
    ".pane-header h2",
    ".pane-header p",
    ".field-label",
    ".mode-card span",
    ".clock-card span",
    ".slider-top > span",
    ".toggle-row > span",
    ".seg-btn",
    ".custom-color-chip > span",
    ".color-box > span",
    ".file-label span",
    "#nextGenreBtn",
    "#copyVarsBtn",
    "#downloadVarsBtn",
  ];
  document.querySelectorAll(selectors.join(", ")).forEach((el) => {
    if (!el.dataset.en) {
      el.dataset.en = el.textContent.replace(/\s+/g, " ").trim();
    }
    el.textContent = t(el.dataset.en);
  });

  document.getElementById("playPauseLabel").textContent = t(isMediaPlaying ? "Pause" : "Play");
  document.getElementById("synthAudioBtn").textContent = t(synthRunning ? "Sound: On" : "Sound: Off");

  document.querySelectorAll("#langHudButtons .pill-btn[data-lang], #langSettingsButtons .seg-btn[data-lang]").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.lang === state.language);
  });
  updateClockFontNotice();
  updateDockLabelPosOptions();
}

function resolveAppearance() {
  const alpha = clamp(state.bgOpacity / 100, 0, 1);
  let isLightSurface = false;
  let r = 15, g = 17, b = 23;
  let ink = "#ffffff";
  let badgeLabel = isVi() ? "Nền tối" : "Dark Surface";

  if (state.themeMode === 1) {
    isLightSurface = true;
    r = 244; g = 246; b = 250;
    ink = "#181c24";
    badgeLabel = isVi() ? "Nền sáng" : "Light Surface";
  } else if (state.themeMode === 2) {
    [r, g, b] = hexToRgbTuple(state.customCardBg).split(",").map(Number);
    ink = state.customTextColor;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    isLightSurface = lum > 0.58;
    badgeLabel = isVi() ? "Nền tùy chỉnh" : "Custom Surface";
  } else if (state.themeMode === 3) {
    const sysLight = Boolean(sysColorSchemeQuery && sysColorSchemeQuery.matches);
    isLightSurface = sysLight;
    if (sysLight) {
      r = 244; g = 246; b = 250;
      ink = "#181c24";
      badgeLabel = isVi() ? "Theo hệ thống (Sáng)" : "Following OS (Light)";
    } else {
      badgeLabel = isVi() ? "Theo hệ thống (Tối)" : "Following OS (Dark)";
    }
  }

  return {
    alpha,
    isLightSurface,
    surfaceTuple: `${r},${g},${b}`,
    surfaceCss: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`,
    borderCss: isLightSurface
      ? `rgba(24, 28, 36, ${(0.15 * Math.max(0.15, alpha)).toFixed(2)})`
      : `rgba(255, 255, 255, ${(0.12 * Math.max(0.15, alpha)).toFixed(2)})`,
    sepCss: isLightSurface ? "rgba(24, 28, 36, 0.16)" : "rgba(255, 255, 255, 0.14)",
    ink,
    badgeLabel,
  };
}

function applyAppearanceTheme() {
  const app = resolveAppearance();
  const rootStyle = desktopStage.style;
  rootStyle.setProperty("--card-surface", app.surfaceCss);
  rootStyle.setProperty("--card-border", app.borderCss);
  rootStyle.setProperty("--card-ink", app.ink);
  rootStyle.setProperty("--card-sep", app.sepCss);
  desktopStage.setAttribute("data-theme", app.isLightSurface ? "light" : "dark");
  desktopStage.setAttribute("data-surface-light", app.isLightSurface ? "1" : "0");

  const badge = document.getElementById("themeResolvedNote");
  if (badge) badge.textContent = app.badgeLabel;
  const customBox = document.getElementById("customThemeBox");
  if (customBox) customBox.classList.toggle("is-hidden", state.themeMode !== 2);
}

function syncTintMatrix(matrixId, hasCard) {
  const matrix = document.getElementById(matrixId);
  if (!matrix) return;
  const app = resolveAppearance();
  const isLightBackdrop = (desktopStage.getAttribute("data-wallpaper") === "paper" && !hasCard) || (hasCard && app.isLightSurface);
  const [rv, gv, bv] = hexToRgbTuple(isLightBackdrop ? state.color1 : state.color2).split(",").map(Number);
  const scale = isLightBackdrop ? 0.62 : 1.0;
  const r = ((rv / 255) * scale).toFixed(3);
  const g = ((gv / 255) * scale).toFixed(3);
  const b = ((bv / 255) * scale).toFixed(3);
  matrix.setAttribute("values", `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`);
}

function renderWeatherIconMarkup(iconCode, sizePx) {
  const pack = state.weatherIconPack || "dream";
  const src = `./assets/weather-icons/${pack}/${iconCode}.png`;
  const isMono = pack !== "mond";
  const cls = ["w-icon-img"];
  if (isMono && state.weatherTintIcon) cls.push("is-tinted");
  else if (isMono) cls.push("is-mono-untinted");
  return `<img class="${cls.join(" ")}" src="${src}" width="${sizePx}" height="${sizePx}" alt="" />`;
}

function renderWeather() {
  weatherWindow.style.setProperty("--weather-scale", state.weatherScale.toFixed(2));
  const data = resolveWeatherData();
  const hasDarkCard = state.weatherMode === 0 && state.weatherShowCardBg;
  syncTintMatrix("weatherTintMatrix", hasDarkCard);

  weatherSkin.className = hasDarkCard ? "weather-skin" : "weather-skin no-dark-card";

  const { label: condLabelEn, icon: mainIcon } = mapWmoWeather(data.code, data.isDay);
  const condLabel = isVi() ? (WMO_VI[Number(data.code)] || "Có mây") : condLabelEn;
  const temp = formatTempUnit(data.tempC);
  const feels = formatTempUnit(data.feelsC);
  const unit = state.weatherUnit === "F" ? "F" : "C";
  const displayCity = isVi() && data.city === "Ho Chi Minh City" ? "TP. Hồ Chí Minh" : data.city;
  const cityText = escapeHtmlWeather(displayCity);
  const badgeText = data.source === "live" ? "OPEN-METEO" : (isVi() ? "XEM TRƯỚC" : "PREVIEW");
  const detailsText = isVi()
    ? `CẢM GIÁC ${feels}°  ·  GIÓ ${Math.round(data.wind)} KM/H  ·  ĐỘ ẨM ${Math.round(data.hum)}%`
    : `FEELS ${feels}°  ·  WIND ${Math.round(data.wind)} KM/H  ·  HUM ${Math.round(data.hum)}%`;

  if (state.weatherMode === 1) {
    weatherSkin.innerHTML = `
      <div class="weather-horizon">
        <div class="w-horizon-top">
          ${renderWeatherIconMarkup(mainIcon, 52)}
          <div class="w-hero-meta">
            <div class="w-horizon-temp">${temp}°${unit}</div>
            <div class="w-horizon-cond">${escapeHtmlWeather(condLabel)}</div>
            <div class="w-horizon-city">${cityText}</div>
          </div>
        </div>
        ${state.weatherShowDetails ? `<div class="w-details">${detailsText}</div>` : ""}
      </div>
    `;
    return;
  }

  const forecastHtml = state.weatherShowForecast
    ? `<div class="w-forecast-row">${data.forecast
        .slice(0, 4)
        .map((d) => {
          const { icon: fIcon } = mapWmoWeather(d.code, 1);
          const hi = formatTempUnit(d.hiC);
          const lo = formatTempUnit(d.loC);
          const dLabel = isVi() ? (DAY_SHORT_VI[d.day] || d.day) : d.day;
          return `
            <div class="w-fday">
              <span class="w-fday-name">${escapeHtmlWeather(dLabel)}</span>
              ${renderWeatherIconMarkup(fIcon, 22)}
              <span class="w-fday-range">↑${hi}° ↓${lo}°</span>
            </div>
          `;
        })
        .join("")}</div>`
    : "";

  weatherSkin.innerHTML = `
    <div class="weather-studio${state.weatherShowCardBg ? " has-card" : ""}">
      <div class="w-city-row">
        <span class="w-city">${cityText}</span>
        <span class="w-badge">${badgeText}</span>
      </div>
      <div class="w-hero-row">
        <div class="w-icon-box">${renderWeatherIconMarkup(mainIcon, 48)}</div>
        <div class="w-hero-meta">
          <div class="w-temp">${temp}°${unit}</div>
          <div class="w-cond">${escapeHtmlWeather(condLabel)}</div>
        </div>
      </div>
      ${state.weatherShowDetails ? `<div class="w-details">${detailsText}</div>` : ""}
      ${forecastHtml}
    </div>
  `;
}

// --- Part 5: Blended App Dock ---
function resolveDockSlotIcon(slot) {
  if (state.dockShowBinCount && String(slot.icon).startsWith("trash")) {
    return state.dockBinHasItems ? "trash-full" : "trash-empty";
  }
  return slot.icon || "folder";
}

function getDockSeparatorIndex(count) {
  if (count < 4) return -1;
  const isUtil = (s) => {
    const ic = String(s?.icon || "");
    return ic === "cadence" || ic === "settings" || ic === "power" || ic.startsWith("trash");
  };
  let idx = count - 1;
  while (idx >= 1 && isUtil(state.dockSlots[idx])) {
    idx -= 1;
  }
  if (idx < count - 1 && idx >= 0) return idx + 1;
  return count >= 8 ? 7 : -1;
}

function localizedDockLabel(rawLabel) {
  return isVi() && DOCK_LABEL_VI[rawLabel] ? DOCK_LABEL_VI[rawLabel] : rawLabel;
}

function showDockToast(msg) {
  if (!dockToast) return;
  dockToast.textContent = msg;
  dockToast.classList.add("is-visible");
  dockWindow.classList.add("has-toast");
  clearTimeout(dockToastTimer);
  dockToastTimer = setTimeout(() => {
    dockToast.classList.remove("is-visible");
    dockWindow.classList.remove("has-toast");
  }, 1800);
}

const MAX_DOCK_SLOTS = 15;

function findDockUtilInsertIdx() {
  const isUtil = (s) => {
    const ic = String(s?.icon || "");
    return ic === "cadence" || ic === "settings" || ic === "power" || ic.startsWith("trash");
  };
  let insertIdx = state.dockSlots.length;
  while (insertIdx > 0 && isUtil(state.dockSlots[insertIdx - 1])) {
    insertIdx -= 1;
  }
  return insertIdx;
}

function appendNextDockSlot() {
  if (state.dockSlots.length >= MAX_DOCK_SLOTS) return -1;
  const used = new Set(state.dockSlots.map((s) => s.icon));
  const nextPreset = DOCK_APP_PRESETS.find((p) => !used.has(p.icon)) || DOCK_APP_PRESETS[9];
  const insertIdx = findDockUtilInsertIdx();
  state.dockSlots.splice(insertIdx, 0, { ...nextPreset });
  return insertIdx;
}

function applyPresetDockCount(targetCount) {
  const target = clamp(targetCount, 1, MAX_DOCK_SLOTS);
  while (state.dockSlots.length < target) {
    if (appendNextDockSlot() < 0) break;
  }
  if (target >= 9 && state.dockSlots.length > target) {
    const utilIdx = findDockUtilInsertIdx();
    const utilCount = state.dockSlots.length - utilIdx;
    const keepPrimary = Math.max(0, target - utilCount);
    if (utilIdx > keepPrimary) {
      state.dockSlots.splice(keepPrimary, utilIdx - keepPrimary);
    }
    while (state.dockSlots.length > target) {
      state.dockSlots.pop();
    }
    state.dockSelectedSlot = clamp(state.dockSelectedSlot, 0, state.dockSlots.length - 1);
  }
  state.dockIconCount = target;
}

function renderDock() {
  const isVertical = state.dockOrientation === 1;
  const hasCard = state.dockMode !== 1 && state.dockShowCardBg;
  const isSecondSide = state.dockLabelPos === 1;
  dockWindow.classList.toggle("is-vertical", isVertical);
  dockWindow.classList.toggle("is-label-lower", !isVertical && isSecondSide);
  dockWindow.classList.toggle("is-label-right", isVertical && isSecondSide);
  dockWindow.style.setProperty("--dock-fit", "1");
  dockWindow.style.setProperty("--dock-scale", state.dockScale.toFixed(2));
  dockWindow.style.setProperty("--dock-icon-sz", `${state.dockIconSize}px`);
  dockWindow.style.setProperty("--dock-gap", `${state.dockSpacing}px`);
  dockWindow.style.setProperty("--dock-gap-v", `${state.dockSpacing}px`);
  const sepComp = state.dockSpacing > 10 ? -Math.round((state.dockSpacing - 10) * 0.42) : 0;
  dockWindow.style.setProperty("--dock-sep-comp", `${sepComp}px`);

  syncTintMatrix("dockTintMatrix", hasCard);

  const count = clamp(state.dockIconCount, 1, Math.min(MAX_DOCK_SLOTS, state.dockSlots.length));
  const sepIdx = getDockSeparatorIndex(count);
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    if (i === sepIdx) {
      parts.push('<span class="dock-sep" aria-hidden="true"></span>');
    }
    const slot = state.dockSlots[i] || { icon: "folder", label: `Slot ${i + 1}`, cmd: "" };
    const iconName = resolveDockSlotIcon(slot);
    const isBin = String(slot.icon).startsWith("trash");
    const displayLbl = localizedDockLabel(slot.label);
    const binSuffix = isBin && state.dockShowBinCount ? (state.dockBinHasItems ? " (4)" : ` (${isVi() ? "Trống" : "Empty"})`) : "";
    const tipText = `${displayLbl}${binSuffix}`;
    const btnCls = ["dock-item"];
    if (state.dockHoverZoom) btnCls.push("can-zoom");
    if (state.dockTintIcons) btnCls.push("can-tint");

    const tipHtml = state.dockShowLabels
      ? `<span class="dock-tooltip">${escapeHtml(tipText)}</span>`
      : "";
    const binPip =
      isBin && state.dockShowBinCount && state.dockBinHasItems
        ? '<span class="dock-bin-pip">4</span>'
        : "";

    parts.push(`
      <button class="${btnCls.join(" ")}" type="button" data-slot="${i}" aria-label="${escapeHtml(tipText)}">
        <img class="dock-item-img" src="./assets/dock-icons/${encodeURIComponent(iconName)}.png" alt="" />
        ${binPip}
        ${tipHtml}
      </button>
    `);
  }

  const barCls = ["dock-bar"];
  if (isVertical) barCls.push("is-vertical");
  if (hasCard) barCls.push("has-card");
  if (!isVertical && isSecondSide) barCls.push("is-label-lower");
  if (isVertical && isSecondSide) barCls.push("is-label-right");
  if (state.dockLabelStyle === 1) barCls.push("is-label-text-only");
  dockSkin.innerHTML = `<div class="${barCls.join(" ")}">${parts.join("")}</div>`;

  const barEl = dockSkin.firstElementChild;
  if (barEl && !dockWindow.classList.contains("is-custom-pos")) {
    const stageW = desktopStage.clientWidth || 1440;
    const stageH = desktopStage.clientHeight || 900;
    const panelOpen = !settingsPanel.classList.contains("is-collapsed");
    if (!isVertical) {
      const centerPx = panelOpen ? (stageW * 0.5 - 255) : (stageW * 0.5);
      const rightLimit = panelOpen ? (settingsPanel.offsetLeft - 14) : (stageW - 20);
      const availW = Math.max(240, 2 * Math.min(centerPx - 20, rightLimit - centerPx));
      const scaledW = barEl.offsetWidth * state.dockScale;
      if (scaledW > availW) {
        dockWindow.style.setProperty("--dock-fit", clamp(availW / scaledW, 0.42, 1).toFixed(3));
      }
    } else {
      const availH = Math.max(240, stageH - 96);
      const scaledH = barEl.offsetHeight * state.dockScale;
      if (scaledH > availH) {
        dockWindow.style.setProperty("--dock-fit", clamp(availH / scaledH, 0.42, 1).toFixed(3));
      }
    }
  }
}

function syncDockCountButtons() {
  document.querySelectorAll("#dockCountButtons .seg-btn").forEach((btn) => {
    const req = parseInt(btn.dataset.dcount, 10);
    btn.classList.toggle("is-active", req === state.dockIconCount);
  });
}

function renderDockCustomizerUI() {
  const tabsEl = document.getElementById("dockSlotTabs");
  const pickerEl = document.getElementById("dockIconPicker");
  const labelIn = document.getElementById("in-dockSlotLabel");
  const cmdIn = document.getElementById("in-dockSlotCmd");
  const metaEl = document.getElementById("dockSlotMeta");
  const addBtn = document.getElementById("dockAddSlotBtn");
  const remBtn = document.getElementById("dockRemoveSlotBtn");
  if (!tabsEl || !pickerEl) return;

  const sel = clamp(state.dockSelectedSlot, 0, state.dockSlots.length - 1);
  state.dockSelectedSlot = sel;
  syncDockCountButtons();

  tabsEl.innerHTML = state.dockSlots
    .map((slot, i) => {
      const inactive = i >= state.dockIconCount;
      const cls = `dock-slot-pill${i === sel ? " is-active" : ""}`;
      const pillLbl = localizedDockLabel(slot.label);
      return `
        <button class="${cls}" type="button" data-pickslot="${i}" style="${inactive ? "opacity:0.42" : ""}">
          <img src="./assets/dock-icons/${encodeURIComponent(slot.icon)}.png" alt="" />
          <span>${escapeHtml(pillLbl || `#${i + 1}`)}</span>
        </button>
      `;
    })
    .join("");

  const cur = state.dockSlots[sel];
  if (metaEl) {
    const slotTitle = isVi() ? `Ô ${sel + 1}/${state.dockSlots.length}` : `Slot ${sel + 1} of ${state.dockSlots.length}`;
    metaEl.textContent = `${slotTitle} · ${localizedDockLabel(cur.label)}`;
  }
  if (addBtn) {
    addBtn.textContent = isVi() ? "+ Thêm" : "+ Add";
    addBtn.disabled = state.dockSlots.length >= MAX_DOCK_SLOTS;
  }
  if (remBtn) {
    remBtn.textContent = isVi() ? "Xóa nút" : "Remove";
    remBtn.disabled = state.dockSlots.length <= 1;
  }
  if (document.activeElement !== labelIn) labelIn.value = cur.label;
  if (document.activeElement !== cmdIn) cmdIn.value = cur.cmd;

  pickerEl.innerHTML = DOCK_APP_PRESETS.map((preset) => {
    const cls = `dock-icon-choice${cur.icon === preset.icon ? " is-active" : ""}`;
    const tipTitle = `${localizedDockLabel(preset.label)} — ${preset.cmd}`;
    return `
      <button class="${cls}" type="button" data-pickicon="${preset.icon}" title="${escapeHtml(tipTitle)}">
        <img src="./assets/dock-icons/${preset.icon}.png" alt="${escapeHtml(preset.label)}" />
      </button>
    `;
  }).join("");
}

function syncGradientAnglePresetButtons() {
  document.querySelectorAll("#gradAngleButtons .seg-btn").forEach((b) => {
    b.classList.toggle("is-active", parseInt(b.dataset.gangle, 10) === state.gradientAngle);
  });
  document.querySelectorAll("#barGradAngleButtons .seg-btn").forEach((b) => {
    b.classList.toggle("is-active", parseInt(b.dataset.bangle, 10) === state.barGradientAngle);
  });
}

function refreshVarsPreview() {
  document.getElementById("varsPreview").textContent = buildVariablesInc();
  syncCssAccent();
  applyUiTranslations();
  applyAppearanceTheme();
  renderClock();
  renderPlayer();
  renderWeather();
  renderDock();
  renderDockCustomizerUI();
  syncGradientAnglePresetButtons();
}

// --- Wire Controls ---
function updateSliderFill(input) {
  const min = parseFloat(input.min || "0");
  const max = parseFloat(input.max || "100");
  const val = parseFloat(input.value || "0");
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--pct", `${pct.toFixed(1)}%`);
}

function bindSlider(id, stateKey, formatFn) {
  const input = document.getElementById(`in-${id}`);
  const out = document.getElementById(`out-${id}`);
  input.value = state[stateKey];
  out.textContent = formatFn(state[stateKey]);
  updateSliderFill(input);
  input.addEventListener("input", () => {
    state[stateKey] = parseFloat(input.value);
    out.textContent = formatFn(state[stateKey]);
    updateSliderFill(input);
    refreshVarsPreview();
  });
}

function bindCheckbox(id, stateKey) {
  const input = document.getElementById(`in-${id}`);
  input.checked = Boolean(state[stateKey]);
  input.addEventListener("change", () => {
    state[stateKey] = input.checked;
    refreshVarsPreview();
  });
}

function initUI() {
  // Sidebar tabs
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("is-active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("is-active");
    });
  });

  // Panel collapse (start collapsed on tablet/mobile so widgets are visible first)
  if (window.innerWidth <= 1024) {
    settingsPanel.classList.add("is-collapsed");
    desktopStage.classList.add("is-panel-collapsed");
  }
  const toggleDrawer = () => {
    const collapsed = settingsPanel.classList.toggle("is-collapsed");
    desktopStage.classList.toggle("is-panel-collapsed", collapsed);
    renderDock();
  };
  togglePanelBtn.addEventListener("click", toggleDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h" && document.activeElement.tagName !== "INPUT") {
      toggleDrawer();
    }
  });
  skinWindow.addEventListener("dblclick", () => {
    settingsPanel.classList.remove("is-collapsed");
    desktopStage.classList.remove("is-panel-collapsed");
  });

  // Wallpaper switcher & upload
  const applyCustomWallpaper = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (customWallpaperUrl) {
      try { URL.revokeObjectURL(customWallpaperUrl); } catch {}
    }
    customWallpaperUrl = URL.createObjectURL(file);
    document.querySelectorAll(".wallpaper-pills .pill-btn").forEach((b) => b.classList.remove("is-active"));
    const uploadPill = document.querySelector(".wallpaper-pills .upload-pill");
    if (uploadPill) uploadPill.classList.add("is-active");
    desktopStage.removeAttribute("data-wallpaper");
    desktopStage.style.backgroundImage = `url("${customWallpaperUrl}")`;
    desktopStage.style.backgroundSize = "cover";
    desktopStage.style.backgroundPosition = "center";
    renderWeather();
    renderDock();
  };

  document.querySelectorAll(".wallpaper-pills .pill-btn[data-wp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".wallpaper-pills .pill-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      desktopStage.style.backgroundImage = "";
      desktopStage.setAttribute("data-wallpaper", btn.dataset.wp);
      renderWeather();
      renderDock();
    });
  });

  document.getElementById("wallpaperUpload").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    applyCustomWallpaper(file);
    e.target.value = "";
  });

  // Mode cards
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".mode-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      const m = parseInt(card.dataset.mode, 10);
      state.visualizerMode = m;
      if (m === 0) { state.waveEnabled = true; state.mirrorMode = true; }
      if (m === 1) { state.waveEnabled = false; state.mirrorMode = true; }
      if (m === 2) { state.waveEnabled = true; }
      if (m === 3) { state.mirrorMode = false; }
      if (m === 4) { state.waveEnabled = true; }
      document.getElementById("in-waveEnabled").checked = state.waveEnabled;
      document.getElementById("in-mirrorMode").checked = state.mirrorMode;
      refreshVarsPreview();
    });
  });

  // Suite Presets
  const SUITE_PRESETS = {
    studio: {
      visualizerMode: 0, waveEnabled: true, barStyle: 0, mirrorMode: true, showProgressBar: true, bgOpacity: 86,
      paletteKey: "irena",
      clockMode: 0, clockWeekdayFont: "Moving Skate", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 0, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "dream", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
    wmp: {
      visualizerMode: 4, waveEnabled: true, showProgressBar: true, bgOpacity: 92,
      scopeSharpness: 1.3, scopeThickness: 1.6, scopeSensitivity: 1.2, scopeGlow: 65, scopeTrail: true,
      paletteKey: "aurora",
      clockMode: 2, clockWeekdayFont: "JetBrains Mono SemiBold", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 1, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "robik", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
    minimal: {
      visualizerMode: 5, waveEnabled: true, enableSpheresLayer: false, enableRaysLayer: false, showProgressBar: false, bgOpacity: 65,
      paletteKey: "summit",
      clockMode: 1, clockWeekdayFont: "Moving Skate", clockShowGreeting: false, clockShowDayProgress: false,
      playerMode: 2, playerShowCardBg: false,
      weatherMode: 1, weatherIconPack: "mond", weatherShowForecast: false, weatherShowDetails: false, weatherShowCardBg: false,
      dockMode: 1, dockShowCardBg: false,
    },
    amber: {
      visualizerMode: 0, waveEnabled: true, barStyle: 2, mirrorMode: true, enableSpheresLayer: false, enableRaysLayer: false, showProgressBar: true, bgOpacity: 88,
      paletteKey: "amber",
      clockMode: 3, clockWeekdayFont: "Moving Skate", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 0, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "robik", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
    sakura: {
      visualizerMode: 2, waveEnabled: true, enableSpheresLayer: true, enableRaysLayer: false, showProgressBar: true, bgOpacity: 82,
      paletteKey: "sakura",
      clockMode: 0, clockWeekdayFont: "Allura", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 0, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "dream", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
    jade: {
      visualizerMode: 5, waveEnabled: true, enableSpheresLayer: false, enableRaysLayer: true, showProgressBar: false, bgOpacity: 84,
      paletteKey: "jade",
      clockMode: 2, clockWeekdayFont: "JetBrains Mono SemiBold", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 1, playerShowCardBg: true,
      weatherMode: 1, weatherIconPack: "mond", weatherShowForecast: false, weatherShowDetails: false, weatherShowCardBg: true,
      dockMode: 1, dockShowCardBg: false,
    },
    ice: {
      visualizerMode: 1, waveEnabled: false, barStyle: 1, mirrorMode: true, enableSpheresLayer: true, enableRaysLayer: false, showProgressBar: true, bgOpacity: 74,
      paletteKey: "ice",
      clockMode: 1, clockWeekdayFont: "Anurati", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 2, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "robik", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 1, dockShowCardBg: false,
    },
    lavender_town: {
      visualizerMode: 4, waveEnabled: true, scopeSharpness: 1.1, scopeThickness: 1.5, scopeSensitivity: 1.2, scopeGlow: 75, scopeTrail: true, scopeDualTrace: true,
      enableSpheresLayer: true, enableRaysLayer: false, showProgressBar: true, bgOpacity: 88,
      paletteKey: "lavender_town",
      clockMode: 0, clockWeekdayFont: "Tuesday Night", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 0, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "dream", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
    midnight: {
      visualizerMode: 0, waveEnabled: true, barStyle: 0, mirrorMode: true, enableSpheresLayer: false, enableRaysLayer: true, showProgressBar: true, bgOpacity: 90,
      paletteKey: "midnight",
      clockMode: 3, clockWeekdayFont: "Cactus Classical Serif", clockShowGreeting: true, clockShowDayProgress: true,
      playerMode: 1, playerShowCardBg: true,
      weatherMode: 0, weatherIconPack: "mond", weatherShowForecast: true, weatherShowDetails: true, weatherShowCardBg: true,
      dockMode: 0, dockShowCardBg: true,
    },
  };
  document.querySelectorAll("#suitePresetButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = SUITE_PRESETS[btn.dataset.preset];
      if (!preset) return;
      document.querySelectorAll("#suitePresetButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      Object.assign(state, preset);
      if (preset.paletteKey && PALETTES[preset.paletteKey]) {
        const p = PALETTES[preset.paletteKey];
        state.paletteName = p.name;
        state.color1 = p.c1;
        state.color2 = p.c2;
        state.color3 = p.c3;
        state.barColor = p.bar;
      }
      document.querySelectorAll(".mode-card").forEach((c) => {
        c.classList.toggle("is-active", parseInt(c.dataset.mode, 10) === state.visualizerMode);
      });
      document.querySelectorAll("#barStyleButtons .seg-btn").forEach((b) => {
        b.classList.toggle("is-active", parseInt(b.dataset.barstyle, 10) === state.barStyle);
      });
      document.querySelectorAll("#clockModeButtons .clock-card").forEach((b) => {
        b.classList.toggle("is-active", parseInt(b.dataset.clockmode, 10) === state.clockMode);
      });
      document.querySelectorAll("#playerModeButtons .seg-btn").forEach((b) => {
        b.classList.toggle("is-active", parseInt(b.dataset.pmode, 10) === state.playerMode);
      });
      const syncRange = (id, val, fmt) => {
        const el = document.getElementById(`in-${id}`);
        const out = document.getElementById(`out-${id}`);
        if (el) { el.value = val; updateSliderFill(el); }
        if (out) out.textContent = fmt(val);
      };
      syncRange("scopeSharpness", state.scopeSharpness, (v) => `${v.toFixed(1)}x`);
      syncRange("scopeThickness", state.scopeThickness, (v) => `${v.toFixed(1)} px`);
      syncRange("scopeSensitivity", state.scopeSensitivity, (v) => `${v.toFixed(1)}x`);
      syncRange("scopeGlow", state.scopeGlow, (v) => `${v}%`);
      const setChk = (id, v) => { const el = document.getElementById(`in-${id}`); if (el) el.checked = Boolean(v); };
      setChk("waveEnabled", state.waveEnabled);
      setChk("mirrorMode", state.mirrorMode);
      setChk("scopeTrail", state.scopeTrail);
      setChk("scopeDualTrace", state.scopeDualTrace);
      syncOverlayButtons();
      renderClock();
      renderPlayer();
      renderWeather();
      renderDock();
      refreshVarsPreview();
    });
  });

  // Bar Style selector (0 = Rounded, 1 = Sharp, 2 = Connected-Through)
  document.querySelectorAll("#barStyleButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#barStyleButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.barStyle = parseInt(btn.dataset.barstyle, 10);
      refreshVarsPreview();
    });
  });

  bindSlider("bgOpacity", "bgOpacity", (v) => `${v}%`);

  document.querySelectorAll("#langHudButtons .pill-btn[data-lang], #langSettingsButtons .seg-btn[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.language = btn.dataset.lang;
      renderDockCustomizerUI();
      refreshVarsPreview();
    });
  });

  // Part 2: Clock Controls
  document.querySelectorAll("#clockModeButtons .clock-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#clockModeButtons .clock-card").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.clockMode = parseInt(btn.dataset.clockmode, 10);
      refreshVarsPreview();
    });
  });
  document.querySelectorAll("#clockFontButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#clockFontButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.clockWeekdayFont = btn.dataset.clockfont;
      refreshVarsPreview();
    });
  });
  document.querySelectorAll("#clockPosButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#clockPosButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.clockDayPos = parseInt(btn.dataset.clockpos, 10);
      refreshVarsPreview();
    });
  });
  document.querySelectorAll("#clockSepButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#clockSepButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.clockSeparator = btn.dataset.sep;
      refreshVarsPreview();
    });
  });

  bindSlider("clockScale", "clockScale", (v) => `${v.toFixed(2)}x`);
  bindSlider("clockTimeAlpha", "clockTimeAlpha", (v) => `${v}%`);
  bindCheckbox("clock24H", "clock24H");
  bindCheckbox("clockShowSeconds", "clockShowSeconds");
  bindCheckbox("clockShowRules", "clockShowRules");
  bindCheckbox("clockShowGreeting", "clockShowGreeting");
  bindCheckbox("clockShowDayProgress", "clockShowDayProgress");
  bindCheckbox("clockUseGradientAccent", "clockUseGradientAccent");

  // Part 3: Music Player Controls
  document.querySelectorAll("#playerModeButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#playerModeButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.playerMode = parseInt(btn.dataset.playermode, 10);
      refreshVarsPreview();
    });
  });

  bindSlider("playerScale", "playerScale", (v) => `${v.toFixed(2)}x`);
  bindSlider("playerCoverRadius", "playerCoverRadius", (v) => `${v} px`);
  bindCheckbox("playerShowCover", "playerShowCover");
  bindCheckbox("playerShowHeader", "playerShowHeader");
  bindCheckbox("playerMarquee", "playerMarquee");
  bindCheckbox("playerShowPercent", "playerShowPercent");
  bindCheckbox("playerShowCardBg", "playerShowCardBg");
  bindCheckbox("playerAutoHide", "playerAutoHide");

  // Part 4: Weather Controls
  document.querySelectorAll("#weatherModeButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#weatherModeButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.weatherMode = parseInt(btn.dataset.wmode, 10);
      refreshVarsPreview();
    });
  });

  const cityInput = document.getElementById("in-weatherCity");
  const commitCity = (cityName) => {
    const clean = (cityName || "").trim() || "Ho Chi Minh City";
    state.weatherCity = clean;
    cityInput.value = clean;
    document.querySelectorAll("#weatherCityButtons .seg-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.city.toLowerCase() === clean.toLowerCase());
    });
    refreshVarsPreview();
    fetchWeatherForCity(clean);
  };

  document.getElementById("applyCityBtn").addEventListener("click", () => commitCity(cityInput.value));
  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commitCity(cityInput.value);
  });

  document.querySelectorAll("#weatherCityButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => commitCity(btn.dataset.city));
  });

  document.querySelectorAll("#weatherUnitButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#weatherUnitButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.weatherUnit = btn.dataset.wunit;
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#weatherPackButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#weatherPackButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.weatherIconPack = btn.dataset.wpack;
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#weatherCondButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#weatherCondButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.weatherDemoCond = btn.dataset.wcond;
      refreshVarsPreview();
    });
  });

  bindSlider("weatherScale", "weatherScale", (v) => `${v.toFixed(2)}x`);
  bindCheckbox("weatherShowForecast", "weatherShowForecast");
  bindCheckbox("weatherShowDetails", "weatherShowDetails");
  bindCheckbox("weatherShowCardBg", "weatherShowCardBg");
  bindCheckbox("weatherTintIcon", "weatherTintIcon");

  // Part 5: Blended App Dock Controls
  const resetDockWindowPos = () => {
    dockWindow.classList.remove("is-custom-pos");
    dockWindow.style.left = "";
    dockWindow.style.right = "";
    dockWindow.style.top = "";
    dockWindow.style.bottom = "";
    dockWindow.style.transform = "";
  };

  document.querySelectorAll("#dockModeButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dockModeButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.dockMode = parseInt(btn.dataset.dmode, 10);
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#dockOrientationButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dockOrientationButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.dockOrientation = parseInt(btn.dataset.dorient, 10);
      resetDockWindowPos();
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#dockLabelPosButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dockLabelPosButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.dockLabelPos = parseInt(btn.dataset.dlblpos, 10);
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#dockLabelStyleButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dockLabelStyleButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.dockLabelStyle = parseInt(btn.dataset.dlblstyle, 10);
      refreshVarsPreview();
    });
  });

  document.querySelectorAll("#dockCountButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = clamp(parseInt(btn.dataset.dcount, 10) || 9, 1, MAX_DOCK_SLOTS);
      applyPresetDockCount(req);
      refreshVarsPreview();
    });
  });

  bindSlider("dockScale", "dockScale", (v) => `${v.toFixed(2)}x`);
  bindSlider("dockIconSize", "dockIconSize", (v) => `${v} px`);
  bindSlider("dockSpacing", "dockSpacing", (v) => `${v} px`);
  bindCheckbox("dockHoverZoom", "dockHoverZoom");
  bindCheckbox("dockShowLabels", "dockShowLabels");
  bindCheckbox("dockShowCardBg", "dockShowCardBg");
  bindCheckbox("dockTintIcons", "dockTintIcons");
  bindCheckbox("dockShowBinCount", "dockShowBinCount");
  bindCheckbox("dockBinHasItems", "dockBinHasItems");

  document.getElementById("dockSlotTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pickslot]");
    if (!btn) return;
    state.dockSelectedSlot = parseInt(btn.dataset.pickslot, 10);
    renderDockCustomizerUI();
  });

  document.getElementById("dockIconPicker").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pickicon]");
    if (!btn) return;
    const preset = DOCK_APP_PRESETS.find((p) => p.icon === btn.dataset.pickicon);
    if (!preset) return;
    state.dockSlots[state.dockSelectedSlot] = {
      icon: preset.icon,
      label: preset.label,
      cmd: preset.cmd,
    };
    document.getElementById("in-dockSlotLabel").value = preset.label;
    document.getElementById("in-dockSlotCmd").value = preset.cmd;
    refreshVarsPreview();
  });

  document.getElementById("dockAddSlotBtn").addEventListener("click", () => {
    const insertIdx = appendNextDockSlot();
    if (insertIdx < 0) return;
    state.dockSelectedSlot = insertIdx;
    state.dockIconCount = state.dockSlots.length;
    refreshVarsPreview();
  });

  document.getElementById("dockRemoveSlotBtn").addEventListener("click", () => {
    if (state.dockSlots.length <= 1) return;
    const sel = clamp(state.dockSelectedSlot, 0, state.dockSlots.length - 1);
    state.dockSlots.splice(sel, 1);
    state.dockSelectedSlot = clamp(sel, 0, state.dockSlots.length - 1);
    state.dockIconCount = state.dockSlots.length;
    refreshVarsPreview();
  });

  document.getElementById("in-dockSlotLabel").addEventListener("input", (e) => {
    const val = e.target.value;
    state.dockSlots[state.dockSelectedSlot].label = val;
    const pillSpan = document.querySelector(`#dockSlotTabs [data-pickslot="${state.dockSelectedSlot}"] span`);
    if (pillSpan) pillSpan.textContent = localizedDockLabel(val) || `#${state.dockSelectedSlot + 1}`;
    document.getElementById("varsPreview").textContent = buildVariablesInc();
    renderDock();
  });

  document.getElementById("in-dockSlotCmd").addEventListener("input", (e) => {
    state.dockSlots[state.dockSelectedSlot].cmd = e.target.value;
    document.getElementById("varsPreview").textContent = buildVariablesInc();
  });

  renderDockCustomizerUI();

  // Bind Sliders
  bindSlider("scaleVisualizer", "scaleVisualizer", (v) => `${v.toFixed(2)}x`);
  bindSlider("barHeight", "barHeight", (v) => `${v} px`);
  bindSlider("angle", "angle", (v) => `${v}°`);
  bindSlider("barWidth", "barWidth", (v) => `${v} px`);
  bindSlider("barGap", "barGap", (v) => `${v} px`);
  bindSlider("barCount", "barCount", (v) => `${v} bands`);
  bindSlider("barRadius", "barRadius", (v) => `${v} px`);
  bindSlider("sensitivity", "sensitivity", (v) => `${v} dB`);
  bindSlider("averageSize", "averageSize", (v) => `${v}`);
  bindSlider("multiplier", "multiplier", (v) => `${v}`);
  bindSlider("waveStiffness", "waveStiffness", (v) => v.toFixed(2));
  bindSlider("waveSpread", "waveSpread", (v) => `${v}`);
  bindSlider("waveScale", "waveScale", (v) => `${v}`);
  bindSlider("waveExpScale", "waveExpScale", (v) => v.toFixed(1));
  bindSlider("waveStrokeWidth", "waveStrokeWidth", (v) => `${v.toFixed(1)} px`);
  bindSlider("scopeSharpness", "scopeSharpness", (v) => `${v.toFixed(1)}x`);
  bindSlider("scopeThickness", "scopeThickness", (v) => `${v.toFixed(1)} px`);
  bindSlider("scopeSensitivity", "scopeSensitivity", (v) => `${v.toFixed(1)}x`);
  bindSlider("scopeGlow", "scopeGlow", (v) => `${v}%`);
  bindSlider("scopeSmoothing", "scopeSmoothing", (v) => v.toFixed(2));
  bindSlider("scopeSpeed", "scopeSpeed", (v) => `${v.toFixed(1)}x`);
  bindSlider("gradientAngle", "gradientAngle", (v) => `${v}°`);
  bindSlider("barGradientAngle", "barGradientAngle", (v) => `${v}°`);
  bindSlider("barAlpha", "barAlpha", (v) => `${v}%`);

  // Bind Checkboxes
  bindCheckbox("showProgressBar", "showProgressBar");
  bindCheckbox("enableAutoHide", "enableAutoHide");
  bindCheckbox("enableAutoMute", "enableAutoMute");
  // Overlay Layer Multi-Toggle Buttons
  const OVERLAY_KEYS = [
    "enableSpheresLayer", "enableRaysLayer", "enablePeaksLayer",
    "enableBassAuraLayer", "enableParticlesLayer",
    "enableShockwaveLayer", "enableOrbitalsLayer", "enableRibbonLayer",
  ];
  window.syncOverlayButtons = () => {
    document.querySelectorAll("#overlayLayerButtons .seg-btn").forEach((btn) => {
      const k = btn.dataset.overlay;
      if (k === "clear") btn.classList.remove("is-active");
      else btn.classList.toggle("is-active", Boolean(state[k]));
    });
  };
  document.querySelectorAll("#overlayLayerButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.overlay;
      if (k === "clear") {
        OVERLAY_KEYS.forEach((key) => { state[key] = false; });
      } else {
        state[k] = !state[k];
      }
      syncOverlayButtons();
      refreshVarsPreview();
    });
  });
  syncOverlayButtons();
  bindCheckbox("mirrorMode", "mirrorMode");
  bindCheckbox("invertVisualizer", "invertVisualizer");
  bindCheckbox("waveEnabled", "waveEnabled");
  bindCheckbox("waveFill", "waveFill");
  bindCheckbox("scopeTrail", "scopeTrail");
  bindCheckbox("scopeEdgeTaper", "scopeEdgeTaper");
  bindCheckbox("scopeDualTrace", "scopeDualTrace");
  bindCheckbox("useGradientBars", "useGradientBars");
  bindCheckbox("enableDropShadow", "enableDropShadow");

  // FFT buttons
  document.querySelectorAll("#fftButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#fftButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.fftSize = parseInt(btn.dataset.fft, 10);
      if (analyser) {
        analyser.fftSize = clamp(state.fftSize, 512, 8192);
        freqData = new Uint8Array(analyser.frequencyBinCount);
        timeData = new Uint8Array(analyser.fftSize);
      }
      refreshVarsPreview();
    });
  });

  // Palettes & Color Pickers
  const c1In = document.getElementById("in-color1");
  const c2In = document.getElementById("in-color2");
  const c3In = document.getElementById("in-color3");
  const barIn = document.getElementById("in-barColor");
  const paletteGrid = document.getElementById("paletteGrid");

  if (paletteGrid) {
    paletteGrid.innerHTML = Object.entries(PALETTES)
      .map(([key, p]) => {
        const active = key === state.paletteKey ? " is-active" : "";
        return `
          <button class="palette-chip${active}" type="button" data-palette="${key}" title="${escapeHtml(p.name)}">
            <span class="swatch" style="background: linear-gradient(var(--grad-css-angle, 90deg), ${p.c1}, ${p.c2}, ${p.c3});"></span>
            <span>${escapeHtml(p.name)}</span>
          </button>
        `;
      })
      .join("");

    paletteGrid.addEventListener("click", (e) => {
      const chip = e.target.closest(".palette-chip");
      if (!chip) return;
      const p = PALETTES[chip.dataset.palette];
      if (!p) return;
      paletteGrid.querySelectorAll(".palette-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      state.paletteKey = chip.dataset.palette;
      state.paletteName = p.name;
      state.color1 = c1In.value = p.c1;
      state.color2 = c2In.value = p.c2;
      state.color3 = c3In.value = p.c3;
      state.barColor = barIn.value = p.bar;
      refreshVarsPreview();
    });
  }

  [
    [c1In, "color1"],
    [c2In, "color2"],
    [c3In, "color3"],
    [barIn, "barColor"],
  ].forEach(([el, key]) => {
    el.addEventListener("input", () => {
      state[key] = el.value;
      state.paletteName = "Custom";
      paletteGrid?.querySelectorAll(".palette-chip").forEach((c) => c.classList.remove("is-active"));
      refreshVarsPreview();
    });
  });

  // Gradient Angle Preset Buttons
  const bindAnglePresetGroup = (containerId, attrName, stateKey, inputId, outId) => {
    document.querySelectorAll(`#${containerId} .seg-btn`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.dataset[attrName], 10);
        if (!Number.isFinite(val)) return;
        state[stateKey] = val;
        const inp = document.getElementById(inputId);
        const out = document.getElementById(outId);
        if (inp) {
          inp.value = val;
          updateSliderFill(inp);
        }
        if (out) out.textContent = `${val}°`;
        refreshVarsPreview();
      });
    });
  };
  bindAnglePresetGroup("gradAngleButtons", "gangle", "gradientAngle", "in-gradientAngle", "out-gradientAngle");
  bindAnglePresetGroup("barGradAngleButtons", "bangle", "barGradientAngle", "in-barGradientAngle", "out-barGradientAngle");

  // Dynamic Color Mode
  document.querySelectorAll("#dynColorButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dynColorButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.enableDynamicColors = parseInt(btn.dataset.dyn, 10);
      refreshVarsPreview();
    });
  });

  // Player selector
  document.querySelectorAll("#playerButtons .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#playerButtons .seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.playerName = btn.dataset.player;
      refreshVarsPreview();
    });
  });

  // Draggable Desktop Widgets (scaling is configured in Settings only)
  function makeDraggable(el, anchorCenter = false) {
    let start = null;
    el.addEventListener("mousedown", (e) => {
      if (e.target.closest("button, [data-scrub], input, label")) return;
      const rect = el.getBoundingClientRect();
      el.classList.add("is-custom-pos");
      el.style.right = "auto";
      el.style.bottom = "auto";
      if (anchorCenter) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        el.style.transform = "translate(-50%, -50%)";
        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
        start = { x: e.clientX - cx, y: e.clientY - cy };
      } else {
        el.style.transform = "none";
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        start = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      el.classList.add("is-dragging");
    });
    window.addEventListener("mousemove", (e) => {
      if (!start) return;
      el.style.left = `${e.clientX - start.x}px`;
      el.style.top = `${e.clientY - start.y}px`;
    });
    window.addEventListener("mouseup", () => {
      start = null;
      el.classList.remove("is-dragging");
    });
  }

  makeDraggable(skinWindow, true);
  makeDraggable(clockWindow);

  clockWindow.addEventListener("dblclick", () => {
    settingsPanel.classList.remove("is-collapsed");
    desktopStage.classList.remove("is-panel-collapsed");
    document.querySelector('.nav-item[data-tab="clock"]').click();
  });

  makeDraggable(playerWindow);

  playerWindow.addEventListener("dblclick", (e) => {
    if (e.target.closest("button, [data-scrub]")) return;
    settingsPanel.classList.remove("is-collapsed");
    desktopStage.classList.remove("is-panel-collapsed");
    document.querySelector('.nav-item[data-tab="player"]').click();
  });

  makeDraggable(weatherWindow);

  weatherWindow.addEventListener("dblclick", () => {
    settingsPanel.classList.remove("is-collapsed");
    desktopStage.classList.remove("is-panel-collapsed");
    document.querySelector('.nav-item[data-tab="weather"]').click();
  });

  makeDraggable(dockWindow);

  dockWindow.addEventListener("dblclick", (e) => {
    if (e.target.closest("button")) return;
    settingsPanel.classList.remove("is-collapsed");
    desktopStage.classList.remove("is-panel-collapsed");
    document.querySelector('.nav-item[data-tab="dock"]').click();
  });

  dockSkin.addEventListener("click", (e) => {
    const slotBtn = e.target.closest(".dock-item");
    if (!slotBtn) return;
    e.stopPropagation();
    const idx = parseInt(slotBtn.dataset.slot, 10);
    const slot = state.dockSlots[idx];
    if (!slot) return;
    if (slot.icon === "cadence") {
      toggleDrawer();
      return;
    }
    const label = isVi() && DOCK_LABEL_VI[slot.label] ? DOCK_LABEL_VI[slot.label] : slot.label;
    showDockToast(`${label} → ${slot.cmd}`);
  });

  playerSkin.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      if (action === "prev") stepTrack(-1);
      else if (action === "next") stepTrack(1);
      else if (action === "toggle") togglePlayPause();
      return;
    }
    const scrub = e.target.closest("[data-scrub]");
    if (scrub) {
      e.stopPropagation();
      const rect = scrub.getBoundingClientRect();
      const ratio = clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      trackProgress = ratio;
      if (usingRealAudio && audioEl && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
        audioEl.currentTime = ratio * audioEl.duration;
      }
      updatePlayerProgressUI();
    }
  });

  // Media Simulation Controls
  const playPauseBtn = document.getElementById("playPauseBtn");
  playPauseBtn.addEventListener("click", togglePlayPause);

  document.getElementById("synthAudioBtn").addEventListener("click", () => {
    if (currentTrack.isCustomFile && audioEl) {
      ensureAudioContext();
      audioEl.muted = !audioEl.muted;
      if (!audioEl.muted && audioEl.paused && isMediaPlaying) {
        audioEl.play().catch(() => {});
      }
      const soundOn = !audioEl.muted;
      const btn = document.getElementById("synthAudioBtn");
      btn.textContent = t(soundOn ? "Sound: On" : "Sound: Off");
      btn.classList.toggle("is-on", soundOn);
      return;
    }
    if (synthRunning) stopSynth();
    else startSynth();
  });

  window.playCustomTrack = (idx, skipCors = false) => {
    const item = customTracks[idx];
    if (!item) return;
    stopSynth();
    ensureAudioContext();
    if (mediaSourceNode) {
      try { mediaSourceNode.disconnect(); } catch {}
      mediaSourceNode = null;
    }
    if (audioEl) {
      audioEl.pause();
      audioEl.src = "";
    }
    audioEl = new Audio(item.url);
    audioEl.muted = false;
    const useWebAudio = !skipCors;
    if (useWebAudio) {
      audioEl.crossOrigin = "anonymous";
      try {
        mediaSourceNode = audioCtx.createMediaElementSource(audioEl);
        mediaSourceNode.connect(analyser);
        usingRealAudio = true;
      } catch {
        usingRealAudio = false;
      }
    } else {
      usingRealAudio = false;
    }
    isMediaPlaying = true;
    trackProgress = 0;
    currentTrack = {
      genre: customTracks.length > 1 ? `TRACK ${idx + 1}/${customTracks.length}` : (item.isUrl ? "WEB AUDIO" : "LOCAL FILE"),
      title: item.title,
      artist: item.isUrl ? (useWebAudio ? "Web Audio URL · Live FFT" : "Web Audio URL (CORS fallback)") : "Local Audio File · Live FFT",
      durationSec: item.durationSec || 210,
      coverColors: [state.color1, state.color3],
      isCustomFile: true,
    };
    document.getElementById("mediaGenreTag").textContent = currentTrack.genre;
    document.getElementById("playPauseLabel").textContent = t("Pause");
    const synthBtn = document.getElementById("synthAudioBtn");
    synthBtn.textContent = t("Sound: On");
    synthBtn.classList.add("is-on");
    const statusEl = document.getElementById("audioImportStatus");
    if (statusEl) statusEl.textContent = `Playing: ${item.title}`;
    audioEl.addEventListener("error", () => {
      if (item.isUrl && !skipCors) {
        window.playCustomTrack(idx, true);
      } else if (statusEl) {
        statusEl.textContent = "Could not load audio URL (needs a direct MP3/WAV/OGG stream).";
      }
    });
    audioEl.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
        item.durationSec = Math.round(audioEl.duration);
        currentTrack.durationSec = item.durationSec;
        renderPlayer();
      }
    });
    audioEl.addEventListener("ended", () => {
      if (customTracks.length > 1) {
        stepTrack(1);
      } else {
        trackProgress = 1;
        isMediaPlaying = false;
        document.getElementById("playPauseLabel").textContent = t("Play");
        renderPlayer();
      }
    });
    renderPlayer();
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (statusEl) statusEl.textContent = `Loaded: ${item.title} — click Play to start audio.`;
      });
    }
  };

  const loadAudioFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|flac|ogg|m4a|aac|webm)$/i.test(f.name));
    if (!files.length) return;
    const startIdx = customTracks.length;
    files.forEach((file) => {
      customTracks.push({
        title: file.name.replace(/\.[^.]+$/, ""),
        url: URL.createObjectURL(file),
        durationSec: 210,
        isUrl: false,
      });
    });
    customTrackIdx = startIdx;
    playCustomTrack(customTrackIdx);
  };

  const loadAudioUrl = (raw) => {
    const url = (raw || "").trim();
    const statusEl = document.getElementById("audioImportStatus");
    if (!/^https?:\/\//i.test(url)) {
      if (statusEl) statusEl.textContent = "Enter a valid http:// or https:// direct audio URL.";
      return;
    }
    let title = "Web Audio Stream";
    try {
      const pathname = new URL(url).pathname;
      const base = decodeURIComponent(pathname.split("/").pop() || "").replace(/\.[^.]+$/, "");
      if (base) title = base;
    } catch {}
    customTracks.push({ title, url, durationSec: 210, isUrl: true });
    customTrackIdx = customTracks.length - 1;
    playCustomTrack(customTrackIdx);
  };

  document.getElementById("loadAudioUrlBtn").addEventListener("click", () => {
    loadAudioUrl(document.getElementById("audioUrlInput").value);
  });
  document.getElementById("audioUrlInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadAudioUrl(e.target.value);
  });

  document.getElementById("clearPlaylistBtn").addEventListener("click", () => {
    customTracks = [];
    customTrackIdx = -1;
    if (audioEl) { audioEl.pause(); audioEl.src = ""; }
    usingRealAudio = false;
    stepTrack(0);
    const statusEl = document.getElementById("audioImportStatus");
    if (statusEl) statusEl.textContent = "Playlist cleared. Back to demo tracks.";
  });

  document.getElementById("loadBgUrlBtn").addEventListener("click", () => {
    const url = (document.getElementById("bgUrlInput").value || "").trim();
    if (!/^https?:\/\//i.test(url)) return;
    document.querySelectorAll(".wallpaper-pills .pill-btn").forEach((b) => b.classList.remove("is-active"));
    const uploadPill = document.querySelector(".wallpaper-pills .upload-pill");
    if (uploadPill) uploadPill.classList.add("is-active");
    desktopStage.removeAttribute("data-wallpaper");
    desktopStage.style.backgroundImage = `url("${url}")`;
    desktopStage.style.backgroundSize = "cover";
    desktopStage.style.backgroundPosition = "center";
    renderWeather();
    renderDock();
  });

  document.getElementById("audioUpload").addEventListener("change", (e) => {
    loadAudioFiles(e.target.files);
    e.target.value = "";
  });

  // Drag & drop custom wallpaper image or audio file(s) onto stage
  desktopStage.addEventListener("dragover", (e) => {
    if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
    }
  });
  desktopStage.addEventListener("drop", (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const img = files.find((f) => f.type.startsWith("image/"));
    if (img) applyCustomWallpaper(img);
    loadAudioFiles(files);
  });

  document.getElementById("nextGenreBtn").addEventListener("click", () => stepTrack(1));

  // Export & Reset
  document.getElementById("copyVarsBtn").addEventListener("click", async () => {
    const btn = document.getElementById("copyVarsBtn");
    await navigator.clipboard.writeText(buildVariablesInc());
    btn.textContent = isVi() ? "Đã chép!" : "Copied!";
    setTimeout(() => (btn.textContent = t("Copy Variables.inc")), 1500);
  });

  const downloadFn = () => {
    const blob = new Blob([buildVariablesInc()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Variables.inc";
    a.click();
  };
  document.getElementById("downloadVarsBtn").addEventListener("click", downloadFn);
  document.getElementById("exportVarsBtn").addEventListener("click", downloadFn);

  document.getElementById("resetDefaultsBtn").addEventListener("click", () => {
    state = { ...DEFAULTS };
    location.reload();
  });

  window.addEventListener("resize", () => renderDock());
  refreshVarsPreview();
  fetchWeatherForCity(state.weatherCity);
  setInterval(renderClock, 1000);
  requestAnimationFrame(renderFrame);
}

initUI();
