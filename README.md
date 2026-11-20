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

- **Live Hosted Preview:** https://cadence-itzthechallenger312as-projects.vercel.app (deployed from `preview/` on Vercel)
- **Local HTTP Server:**
  ```powershell
  python -m http.server 4173 --bind 127.0.0.1 --directory preview
  ```
  Then open `http://127.0.0.1:4173/` in your browser.

Test all 6 visualizer modes, 8 combinable overlays, 9 suite presets, 18 color palettes, Web Audio synth or local audio files, and export your configuration directly to `Variables.inc`.

## Changelog

### v2.0.1
- **Sidebar Height Hotfix:** Increased minimum `SettingHeight` to `690` in `MediaPlayer.ini`, `WavePhysics.ini`, `Player.ini`, and `Scope.ini` so `Close Settings` clears `Edit Variables.inc`.
- **6 New Color-Themed Suite Presets:** Added **Warm Amber**, **Sakura Bloom**, **Jade Neon**, **Ice Blizzard**, **Lavender Town**, and **Midnight Nostalgia** (`3×3` preset grid in `General.ini` and the web preview).
- **3×3 Overlay Layers (Mix & Match):** Replaced stacked overlay toggles with a compact `3×3` button grid (**Spheres**, **Stereo Rays**, **Peak Dots**, **Bass Aura**, **Particles**, **Shockwaves**, **Orbitals**, **Aurora Ribbon**, and **Clear All**) in both Rainmeter (`Visualizer.ini`, `DreamWave.lua`, `General.ini`) and the web preview.

### v2.0.0
- **Expanded WMP Scope (`Settings\Scope.ini`):** Moved WMP Scope controls to a dedicated settings page and added **Glow / Bloom**, **Trace Smoothing**, **Wave Speed**, **Phosphor Afterglow Trail**, **Edge Taper**, and **Dual-Beam Stereo Trace**.
- **Radial Ring (`VisualizerMode=5`):** Added a 96-point symmetric circular spectrum ring sized from `SkinWidth` and `ScaleVisualizer` rather than `BarHeight`.
- **Suite Presets:** Added **Studio Glass**, **WMP Retro**, and **Minimal Focus** presets in `General.ini` to switch Visualizer, Clock, Player, Weather, Dock, Palette, and Opacity together.
- **Combinable Overlays:** Introduced **Pulsing Spheres** and **Joined Stereo Rays** as independent overlay layers.

### v1.0.0
- Initial release of the 5-part Cadence Rainmeter suite (`Visualizer`, `Clock`, `Player`, `Weather`, `Dock`), `.rmskin` packager, and live browser preview.
- Post-initial fixes and additions:
  - **Visualizer:** Added **WMP Scope (`VisualizerMode=4`)** with **Sharpness**, **Thickness**, and **Sensitivity** controls.
  - **Music Player:** Fixed full-card elapsed/percentage formula output and added marquee scrolling for long track titles.
  - **Weather:** Fixed city title and live temperature updates; removed the `Irena Verse` layout.
  - **App Dock & Scaling:** Fixed App Dock settings controls, removed the unused `Appearance` section, and synced scale adjustments across modules.

## Inspirations & Credits

Cadence takes design and feature inspiration from the following Rainmeter skins and visualizers:

- **Irena** by **Connect-R** — Spring-coupled WaterWave physics, 3-stop gradient palette styling, `% of day elapsed` readout, and Recycle Bin status badge.
- **Mond** by **Connect-R** — Glowing radial player scrubber, tracked location header, and `mond` weather icon pack.
- **Robik** by **Connect-R** — Layered backdrop clock typography, brush-script weekday styling, pill divider, and `robik` weather icon pack.
- **Inside Dream (1.0)** by **Nasirivand** — Center-mirrored spectrum bars, scrolling track title marquee, 4-day forecast strip, and hover-magnified dock.
- **Monstercat Visualizer (2.0.2)** by **marcopixel** — Weighted FFT band smoothing, sharp bottom-up bars, dynamic genre/album-art coloring (`Chameleon.dll`), and compact player layout.
- **Summit** by **ani** — Vertical hairline clock framing, uppercase greeting, `electroharmonix` layouts, monochrome dock tooltips, and `Summit Float` dock layout.
- **Stereo-Optic (1.2019.09.02)** by **Eclectic Tech** — Pulsing radial-gradient spheres and joined stereo ray overlay concepts.
- **Windows Media Player (2007–2013)** — Classic Scope oscilloscope line aesthetic for `VisualizerMode=4`.
