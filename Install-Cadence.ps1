param(
    [switch]$Activate
)

$ErrorActionPreference = "Stop"

$skinSource = Join-Path $PSScriptRoot "Skins\Cadence"
$docsDir = [Environment]::GetFolderPath("MyDocuments")
$skinsRoot = Join-Path $docsDir "Rainmeter\Skins"
$skinTarget = Join-Path $skinsRoot "Cadence"

if (-not (Test-Path $skinSource)) {
    Write-Error "Source skin folder not found: $skinSource"
    exit 1
}

New-Item -ItemType Directory -Force -Path $skinsRoot | Out-Null
if (Test-Path $skinTarget) {
    Remove-Item -Path $skinTarget -Recurse -Force
}
Copy-Item -Path $skinSource -Destination $skinTarget -Recurse -Force
Write-Host "[OK] Installed Cadence skin to: $skinTarget" -ForegroundColor Cyan

# Copy plugins (64-bit by default on 64-bit OS, 32-bit otherwise)
$arch = if ([Environment]::Is64BitOperatingSystem) { "64bit" } else { "32bit" }
$pluginSource = Join-Path $PSScriptRoot "Plugins\$arch"
$pluginTarget = Join-Path $env:APPDATA "Rainmeter\Plugins"
if (Test-Path $pluginSource) {
    New-Item -ItemType Directory -Force -Path $pluginTarget | Out-Null
    try {
        Copy-Item -Path "$pluginSource\*" -Destination $pluginTarget -Force -ErrorAction Stop
        Write-Host "[OK] Installed $arch plugins to: $pluginTarget" -ForegroundColor Cyan
    } catch {
        Write-Host "[INFO] Plugins already loaded in running Rainmeter process; kept existing DLLs." -ForegroundColor Yellow
    }
}

# Copy bundled Rainmeter layout so Load=Cadence works immediately
$layoutSource = Join-Path $PSScriptRoot "Layouts\Cadence"
$layoutTarget = Join-Path $env:APPDATA "Rainmeter\Layouts\Cadence"
if (Test-Path $layoutSource) {
    New-Item -ItemType Directory -Force -Path (Split-Path $layoutTarget -Parent) | Out-Null
    if (Test-Path $layoutTarget) {
        Remove-Item -Path $layoutTarget -Recurse -Force
    }
    Copy-Item -Path $layoutSource -Destination $layoutTarget -Recurse -Force
    Write-Host "[OK] Installed Cadence layout to: $layoutTarget" -ForegroundColor Cyan
}

$rmExe = @(
    (Join-Path $env:ProgramFiles "Rainmeter\Rainmeter.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Rainmeter\Rainmeter.exe")
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($rmExe) {
    $isRunning = Get-Process -Name "Rainmeter" -ErrorAction SilentlyContinue
    if ($isRunning) {
        & $rmExe !RefreshApp
        Write-Host "[OK] Refreshed Rainmeter skin list." -ForegroundColor Green
        if ($Activate) {
            Start-Sleep -Milliseconds 600
            foreach ($cfg in @(
                @("Cadence\Clock", "Clock.ini"),
                @("Cadence\Visualizer", "Visualizer.ini"),
                @("Cadence\Player", "Player.ini"),
                @("Cadence\Weather", "Weather.ini"),
                @("Cadence\Dock", "Dock.ini")
            )) {
                & $rmExe !ActivateConfig $cfg[0] $cfg[1]
            }
            Write-Host "[OK] Activated Cadence Clock, Visualizer, Player, Weather, and Dock." -ForegroundColor Green
            Start-Sleep -Milliseconds 400
            Add-Type -AssemblyName System.Windows.Forms
            $screenW = [System.Windows.Forms.SystemInformation]::PrimaryMonitorSize.Width
            $clockX = [int](($screenW / 2) - 380)
            & $rmExe !Move $clockX 110 "Cadence\Clock"
        }
    } else {
        Write-Host "[INFO] Rainmeter is not running. Launch Rainmeter and load Cadence\Visualizer." -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] Rainmeter.exe not found in Program Files. Build a .rmskin or copy Skins\Cadence manually." -ForegroundColor Yellow
}
