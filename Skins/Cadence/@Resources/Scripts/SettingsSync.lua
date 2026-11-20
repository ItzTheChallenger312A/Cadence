-- SettingsSync.lua
-- Applies active card & toggle highlight styles via Rainmeter Shape Extend
-- so Shape options never use comma-separated RGB strings inside ternary formulas.

local function setCard(meter, active, strokeColor)
	if not SKIN:GetMeter(meter) then return end
	local fill = active and "Fill Color #CardBgActive#" or "Fill Color #CardBg#"
	local border = active and ("StrokeWidth 1 | Stroke Color " .. (strokeColor or "#Color1#")) or "StrokeWidth 1 | Stroke Color #BorderHairline#"
	SKIN:Bang("!SetOption", meter, "CardFill", fill)
	SKIN:Bang("!SetOption", meter, "CardStroke", border)
	SKIN:Bang("!UpdateMeter", meter)
end

local function setPaletteCard(meter, active)
	if not SKIN:GetMeter(meter) then return end
	local border = active and "StrokeWidth 2 | Stroke Color 255,255,255" or "StrokeWidth 2 | Stroke Color 255,255,255,30"
	SKIN:Bang("!SetOption", meter, "CardStroke", border)
	SKIN:Bang("!UpdateMeter", meter)
end

local function setToggle(meter, varName)
	if not SKIN:GetMeter(meter) then return end
	local on = tonumber(SKIN:GetVariable(varName, "0")) == 1
	SKIN:Bang("!SetOption", meter, "TrackFill", on and "Fill Color #Color1#" or "Fill Color 58,64,76")
	SKIN:Bang("!UpdateMeter", meter)
end

function Initialize()
	-- General
	local visMode = tonumber(SKIN:GetVariable("VisualizerMode", "0"))
	for i = 0, 5 do setCard("MeterMode" .. i, visMode == i) end
	local lang = SKIN:GetVariable("Language", "English")
	setToggle("MeterToggleProg", "ShowProgressBar")
	setToggle("MeterToggleAutoHide", "EnableAutoHide")
	setToggle("MeterToggleAutoMute", "EnableAutoMute")
	local overlayVars = {
		"EnableSpheresLayer", "EnableRaysLayer", "EnablePeaksLayer",
		"EnableBassAuraLayer", "EnableParticlesLayer", "EnableShockwaveLayer",
		"EnableOrbitalsLayer", "EnableRibbonLayer",
	}
	for i, varName in ipairs(overlayVars) do
		setCard("MeterOverlay" .. (i - 1), tonumber(SKIN:GetVariable(varName, "0")) == 1)
	end

	-- Clock
	local clkMode = tonumber(SKIN:GetVariable("ClockMode", "0"))
	for i = 0, 3 do setCard("MeterClockMode" .. i, clkMode == i) end
	local wkFont = SKIN:GetVariable("ClockWeekdayFont", "Moving Skate")
	setCard("MeterFont0", wkFont == "Moving Skate")
	setCard("MeterFont1", wkFont == "Tuesday Night")
	setCard("MeterFont2", wkFont == "Allura")
	setCard("MeterFont3", wkFont == "Anurati")
	setCard("MeterFont4", wkFont == "Cactus Classical Serif")
	setCard("MeterFont5", wkFont == "Chiron Sung HK")
	setCard("MeterFont6", wkFont == "LXGW WenKai TC")
	setCard("MeterFont7", wkFont == "JetBrains Mono SemiBold")
	if SKIN:GetMeter("MeterFontViNote") then
		local showViNote = (lang == "Vietnamese") and (
			wkFont == "Moving Skate" or
			wkFont == "Tuesday Night" or
			wkFont == "Allura" or
			wkFont == "Anurati"
		)
		SKIN:Bang("!SetOption", "MeterFontViNote", "Hidden", showViNote and "0" or "1")
		SKIN:Bang("!SetOption", "MeterDayPosLabel", "Y", showViNote and "([MeterFont6:Y]+56)" or "([MeterFont6:Y]+36)")
		SKIN:Bang("!UpdateMeter", "MeterFontViNote")
		SKIN:Bang("!UpdateMeter", "MeterDayPosLabel")
	end
	local dayPos = tonumber(SKIN:GetVariable("ClockDayPosition", "0"))
	for i = 0, 1 do setCard("MeterDayPos" .. i, dayPos == i) end
	local sep = SKIN:GetVariable("ClockSeparator", ":")
	setCard("MeterSep0", sep == ":")
	setCard("MeterSep1", sep == ".")
	setToggle("MeterToggle24H", "Clock24H")
	setToggle("MeterToggleSec", "ClockShowSeconds")
	setToggle("MeterToggleRules", "ClockShowRules")
	setToggle("MeterToggleGreet", "ClockShowGreeting")
	setToggle("MeterToggleDayProg", "ClockShowDayProgress")
	setToggle("MeterToggleGradAcc", "ClockUseGradientAccent")

	-- Visualizer
	local barStyle = tonumber(SKIN:GetVariable("BarStyle", "0"))
	for i = 0, 2 do setCard("MeterBarStyle" .. i, barStyle == i) end
	local fft = tonumber(SKIN:GetVariable("FFTSize", "4096"))
	setCard("MeterBtnFFT512", fft == 512)
	setCard("MeterBtnFFT2048", fft == 2048)
	setCard("MeterBtnFFT4096", fft == 4096)
	setCard("MeterBtnFFT8192", fft == 8192)
	setToggle("MeterToggleMirror", "MirrorMode")
	setToggle("MeterToggleInvert", "InvertVisualizer")

	-- WavePhysics
	setToggle("MeterToggleWave", "WaveEnabled")
	setToggle("MeterToggleWaveFill", "WaveFill")
	setToggle("MeterToggleWaveTrail", "WaveTrail")
	setToggle("MeterToggleWaveDual", "WaveDualTrace")

	-- WMP Scope
	setToggle("MeterToggleScopeTrail", "ScopeTrail")
	setToggle("MeterToggleScopeTaper", "ScopeEdgeTaper")
	setToggle("MeterToggleScopeDual", "ScopeDualTrace")

	-- Styling
	local pal = SKIN:GetVariable("PaletteName", "Irena Dusk")
	if pal == "Mond Ember" or pal == "Robik Sunset" then
		pal = "Warm Amber"
	end
	local palettes = {
		"Irena Dusk", "Inside Dream", "Warm Amber",
		"Summit Frost", "Monochrome", "Icy Snowfall",
		"Dark Town", "Cherry Blossom", "Lavender Nightfall",
		"Jade Garden", "Moonlight Blue", "Rainbow",
		"Festival Mix", "Azure Light", "Aurora Night",
	}
	for i, name in ipairs(palettes) do
		setPaletteCard("MeterPal" .. i, pal == name)
	end
	local gradAngles = { 0, 45, 90, 135, 180, 270 }
	local curGradAngle = tonumber(SKIN:GetVariable("GradientAngle", "0"))
	local curBarGradAngle = tonumber(SKIN:GetVariable("BarGradientAngle", "90"))
	for i, deg in ipairs(gradAngles) do
		setCard("MeterGradPre" .. (i - 1), curGradAngle == deg)
		setCard("MeterBarGradPre" .. (i - 1), curBarGradAngle == deg)
	end
	local dyn = tonumber(SKIN:GetVariable("EnableDynamicColors", "0"))
	for i = 0, 2 do setCard("MeterDyn" .. i, dyn == i) end
	setToggle("MeterToggleGradBars", "UseGradientBars")
	setToggle("MeterToggleShadow", "EnableDropShadow")

	-- MediaPlayer
	local mp = SKIN:GetVariable("PlayerName", "Web")
	setCard("MeterMPWeb", mp == "Web")
	setCard("MeterMPSpotify", mp == "Spotify")
	setCard("MeterMPAIMP", mp == "AIMP")
	setCard("MeterMPCAD", mp == "CAD")
	setCard("MeterMPiTunes", mp == "iTunes")
	setCard("MeterMPWMP", mp == "WMP")
	setCard("MeterMPWinamp", mp == "Winamp")
	setCard("MeterMPMediaMonkey", mp == "MediaMonkey")

	-- Player Skin
	local pMode = tonumber(SKIN:GetVariable("PlayerMode", "0"))
	for i = 0, 2 do setCard("MeterPMode" .. i, pMode == i) end
	setToggle("MeterTogglePCover", "PlayerShowCover")
	setToggle("MeterTogglePHeader", "PlayerShowHeader")
	setToggle("MeterTogglePMarquee", "PlayerMarquee")
	setToggle("MeterTogglePPct", "PlayerShowPercent")
	setToggle("MeterTogglePCardBg", "PlayerShowCardBg")
	setToggle("MeterTogglePAutoHide", "PlayerAutoHide")

	-- Weather Skin
	local wMode = tonumber(SKIN:GetVariable("WeatherMode", "0"))
	if wMode ~= 1 then wMode = 0 end
	for i = 0, 1 do setCard("MeterWMode" .. i, wMode == i) end
	local wCity = SKIN:GetVariable("WeatherCity", "Ho Chi Minh City")
	local cities = { "Ho Chi Minh City", "Tokyo", "Seoul", "London", "New York", "Reykjavik" }
	for i, c in ipairs(cities) do
		setCard("MeterCity" .. (i - 1), wCity == c)
	end
	local wUnit = SKIN:GetVariable("WeatherUnit", "C")
	setCard("MeterWUnitC", wUnit == "C")
	setCard("MeterWUnitF", wUnit == "F")
	local wPack = SKIN:GetVariable("WeatherIconPack", "dream")
	setCard("MeterWPackDream", wPack == "dream")
	setCard("MeterWPackRobik", wPack == "robik")
	setCard("MeterWPackMond", wPack == "mond")
	setToggle("MeterToggleWForecast", "WeatherShowForecast")
	setToggle("MeterToggleWDetails", "WeatherShowDetails")
	setToggle("MeterToggleWCardBg", "WeatherShowCardBg")
	setToggle("MeterToggleWTint", "WeatherTintIcon")

	-- Dock Skin
	local dMode = tonumber(SKIN:GetVariable("DockMode", "0"))
	local rawOrient = SKIN:GetVariable("DockOrientation", "")
	local isVert = (rawOrient ~= "" and tonumber(rawOrient) == 1) or (rawOrient == "" and dMode == 2)
	local dStyle = (dMode == 1) and 1 or 0
	for i = 0, 1 do setCard("MeterDMode" .. i, dStyle == i) end
	setCard("MeterDOrient0", not isVert)
	setCard("MeterDOrient1", isVert)
	local dLblPos = tonumber(SKIN:GetVariable("DockLabelPosition", "0"))
	setCard("MeterDLabelPos0", dLblPos == 0)
	setCard("MeterDLabelPos1", dLblPos == 1)
	local dLblStyle = tonumber(SKIN:GetVariable("DockLabelStyle", "0"))
	setCard("MeterDLabelStyle0", dLblStyle == 0)
	setCard("MeterDLabelStyle1", dLblStyle == 1)
	if SKIN:GetMeter("MeterDLabelPos0Txt") then
		SKIN:Bang("!SetOption", "MeterDLabelPos0Txt", "Text", isVert and "Left" or "Upper")
		SKIN:Bang("!SetOption", "MeterDLabelPos1Txt", "Text", isVert and "Right" or "Lower")
		SKIN:Bang("!UpdateMeter", "MeterDLabelPos0Txt")
		SKIN:Bang("!UpdateMeter", "MeterDLabelPos1Txt")
	end
	local dCount = tonumber(SKIN:GetVariable("DockIconCount", "9"))
	setCard("MeterDCount7", dCount == 7)
	setCard("MeterDCount9", dCount == 9)
	setCard("MeterDCount11", dCount == 11)
	setCard("MeterDCount13", dCount == 13)
	setCard("MeterDCount15", dCount == 15)
	setToggle("MeterToggleDZoom", "DockHoverZoom")
	setToggle("MeterToggleDLabels", "DockShowLabels")
	setToggle("MeterToggleDCardBg", "DockShowCardBg")
	setToggle("MeterToggleDTint", "DockTintIcons")
	setToggle("MeterToggleDBin", "DockShowBinCount")

	SKIN:Bang("!Redraw")
end

function Update()
	Initialize()
	return 1
end
