# Cadence — Rainmeter Desktop Suite (v2.0.1)

A modular Rainmeter suite combining five desktop skins—**Visualizer**, **Clock**, **Music Player**, **Weather**, and **App Dock**—with a unified settings panel and a live browser preview.

## Modules

### 1. Audio Visualizer (`Skins\Cadence\Visualizer`)
- **6 Visualizer Modes (`VisualizerMode`):**
  - `0 = DreamWave` — Center-mirrored bars paired with a spring-coupled WaterWave Bezier overlay (`DreamWave.lua`).
  - `1 = Inside Dream` — Center-mirrored spectrum bars (`Rounded`, `Sharp`, or `Connected-Through`).
  - `2 = Irena` — Standalone 1D spring-coupled WaterWave spline with optional translucent gradient fill.
  - `3 = Monstercat` — Bottom-up spectrum bars with weighted neighbor smoothing (`VisualizerFactory.lua`).
  - `4 = WMP Scope` — Windows Media Player (2007–2013) oscilloscope trace with dedicated controls in `Settings\Scope.ini` (**Sharpness**, **Thickness**, **Sensitivity**, **Glow / Bloom**, **Trace Smoothing**, **Wave Speed**, **Phosphor Afterglow Trail**, **Edge Taper**, and **Dual-Beam Stereo Trace**).
  - `5 = Radial Ring` — 96-point symmetric circular spectrum ring sized independently of `BarHeight`.
- **8 Combinable Overlay Layers (Mix & Match):** Toggle any combination of **Spheres**, **Stereo Rays**, **Peak Dots**, **Bass Aura**, **Particles**, **Shockwaves**, **Orbitals**, and **Aurora Ribbon** on top of any visualizer mode.
- **Audio & Styling:** Configurable `FFTSize`, `Sensitivity`, `AverageSize`, `Multiplier`, `Angle` rotation (`MeasureRotate.inc`), `AudioDeviceID` selector, `Chameleon.dll` cover-art coloring, 18 color palettes, and independent `GradientAngle` / `BarGradientAngle`.

### 2. Clock, Date & Greeting (`Skins\Cadence\Clock`)
- **4 Clock Modes:** `0 = Summit × Robik (Blended)`, `1 = Summit Vertical`, `2 = Robik Layered`, and `3 = Summit Horizontal`.
- Configurable weekday fonts (`Moving Skate`, `Tuesday Night`, `Allura`, `Anurati`, `Cactus Classical Serif`, `Chiron Sung HK`, `LXGW WenKai TC`, `JetBrains Mono SemiBold`), `Center` / `Lower` weekday placement, 24H/12H format, seconds, `:` or `.` separator, and `% of day elapsed`.

### 3. Music Player (`Skins\Cadence\Player`)
- Supports `WebNowPlaying` (`PlayerName=Web`), `Spotify`, `AIMP`, `CAD`, `iTunes`, `WMP`, `Winamp`, and `MediaMonkey`.
- **3 Layouts:** `0 = Cadence Studio` (full frosted card, rounded cover mask, radial scrubber, vector transport controls), `1 = Minimal Totem`, and `2 = Monstercat Compact`.
- Includes scrolling marquee for long track titles (`PlayerHelper.lua`) and toggles for cover art, header, percentage readout, card background, and auto-hide.

### 4. Weather (`Skins\Cadence\Weather`)
- Zero-key **Open-Meteo** geocoding and forecast backend (`WeatherHelper.lua`) with feels-like, wind speed, humidity, and 4-day `↑Hi ↓Lo` forecast.
- **2 Layouts:** `0 = Cadence Studio` (card + 4-day forecast) and `1 = Minimal Horizon` (borderless readout).
- Supports custom city search (`InputText`), 6 quick preset cities, `°C`/`°F` units, and 3 icon packs (`dream`, `robik`, `mond`).

### 5. App Dock (`Skins\Cadence\Dock`)
- Hover-magnified monochrome icon dock (`DockHelper.lua`) with live `RecycleManager` empty/full bin badge.
- Configurable `7`, `9`, `11`, `13`, or `15` slots, `Studio Capsule` or `Summit Float` layout, `Horizontal` or `Vertical` orientation, customizable slot icons/labels/commands, and hover tooltip placement/style.

### 6. Suite Presets (`Skins\Cadence\Settings\General.ini`)
One-click presets coordinate Visualizer mode, overlays, palette, opacity, Clock, Player, Weather, and Dock together:
- **Studio Glass** · **WMP Retro** · **Minimal Focus** · **Warm Amber** · **Sakura Bloom** · **Jade Neon** · **Ice Blizzard** · **Lavender Town** · **Midnight Nostalgia**

## Installation

- **Package (`.rmskin`):** Double-click `Cadence-v2.0.1.rmskin` (or rebuild it with `python Build-RMSKIN.py`).
- **PowerShell:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\Install-Cadence.ps1 -Activate
  ```

## Live Browser Preview (`preview\`)

Serve `preview\` over HTTP:
```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory preview
```
Open `http://127.0.0.1:4173/` to test all visualizer modes, overlays, suite presets, palettes, Web Audio synth or local audio files, and export your configuration to `Variables.inc`.
