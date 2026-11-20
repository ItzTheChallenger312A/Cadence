-- DockHelper.lua
-- Dynamically lays out Cadence Dock icons:
--   DockMode: 0 = Studio Capsule (frosted bar/rail with gradient accent hairline), 1 = Summit Float (borderless)
--   DockOrientation: 0 = Horizontal, 1 = Vertical
--   DockLabelPosition: 0 = Upper (Horiz) / Left (Vert), 1 = Lower (Horiz) / Right (Vert)
-- Also handles smooth hover zoom, palette hover tint, separator line, and live Recycle Bin status.

local ThemeHelper = nil
local function getThemeHelper()
	if not ThemeHelper then
		ThemeHelper = dofile(SKIN:GetVariable("@") .. "Scripts\\ThemeHelper.lua")
	end
	return ThemeHelper
end

local zoom = {}
local targetZoom = {}
for i = 1, 15 do
	zoom[i] = 1.0
	targetZoom[i] = 1.0
end

local hoverIdx = 0
local animating = true
local lastBinCount = -1

local function numVar(name, def)
	local v = tonumber(SKIN:GetVariable(name, tostring(def)))
	return v or def
end

local function strVar(name, def)
	local v = SKIN:GetVariable(name, def)
	if not v or v == "" then return def end
	return v
end

local function rgb3(val, def)
	local r, g, b = tostring(val):match("^(%d+)%s*,%s*(%d+)%s*,%s*(%d+)")
	if r then return r .. "," .. g .. "," .. b end
	return def
end

local function readConfig()
	local rawMode = math.floor(numVar("DockMode", 0))
	local rawOrient = tonumber(SKIN:GetVariable("DockOrientation", ""))
	if rawOrient == nil then
		rawOrient = (rawMode == 2) and 1 or 0
	else
		rawOrient = (math.floor(rawOrient) == 1) and 1 or 0
	end
	local mode = (rawMode == 1) and 1 or 0
	local labelPos = (math.floor(numVar("DockLabelPosition", 0)) == 1) and 1 or 0
	local labelStyle = (math.floor(numVar("DockLabelStyle", 0)) == 1) and 1 or 0
	return {
		mode = mode,
		isVert = (rawOrient == 1),
		labelPos = labelPos,
		labelStyle = labelStyle,
		scale = math.max(0.5, math.min(1.6, numVar("DockScale", 1.0))),
		iconSize = math.max(16, math.min(44, numVar("DockIconSize", 24))),
		spacing = math.max(4, math.min(72, numVar("DockSpacing", 50))),
		count = math.max(1, math.min(15, math.floor(numVar("DockIconCount", 9)))),
		hoverZoom = numVar("DockHoverZoom", 1) == 1,
		showLabels = numVar("DockShowLabels", 1) == 1,
		showCardBg = numVar("DockShowCardBg", 1) == 1,
		tintIcons = numVar("DockTintIcons", 1) == 1,
		showBinCount = numVar("DockShowBinCount", 1) == 1,
	}
end

local function getBinCount()
	local m = SKIN:GetMeasure("MeasureBinCount")
	if not m then return 0 end
	return math.max(0, math.floor(tonumber(m:GetValue()) or 0))
end

local function applyLayout()
	local cfg = readConfig()
	local binCount = getBinCount()
	local s = cfg.scale
	local baseSz = cfg.iconSize * s
	local gap = cfg.spacing * s
	local step = baseSz + gap
	local maxZoom = cfg.hoverZoom and 1.32 or 1.0
	local padX = 14 * s
	local padY = 10 * s
	local isVert = cfg.isVert
	local labelSecond = (cfg.labelPos == 1)
	local topReserve, bottomReserve, leftReserve, rightReserve
	if isVert then
		topReserve = 8 * s
		bottomReserve = 8 * s
		leftReserve = labelSecond and (8 * s) or (124 * s)
		rightReserve = labelSecond and (124 * s) or (8 * s)
	else
		topReserve = labelSecond and (8 * s) or (34 * s)
		bottomReserve = labelSecond and (34 * s) or (8 * s)
		leftReserve = 8 * s
		rightReserve = 8 * s
	end

	local sepAfter = 0
	if cfg.count >= 4 then
		local function isUtilIcon(ic)
			return ic == "cadence" or ic == "settings" or ic == "power" or ic:sub(1, 5) == "trash"
		end
		local idx = cfg.count
		while idx >= 2 and isUtilIcon(strVar("DockSlot" .. idx .. "Icon", "")) do
			idx = idx - 1
		end
		if idx < cfg.count and idx >= 1 then
			sepAfter = idx
		elseif cfg.count >= 8 then
			sepAfter = 7
		end
	end
	local hasSep = sepAfter > 0
	local sepGap = hasSep and (10 * s) or 0
	local capH = isVert and (padX * 2 + cfg.count * baseSz + (cfg.count - 1) * gap + sepGap) or (baseSz + padY * 2)
	local capW = isVert and (baseSz + padY * 2) or (padX * 2 + cfg.count * baseSz + (cfg.count - 1) * gap + sepGap)

	-- Capsule backdrop & gradient accent synced with ThemeMode & ThemeBgOpacity
	local c1 = rgb3(strVar("ActiveColor1", strVar("Color1", "117,125,229")), "117,125,229")
	local c2 = rgb3(strVar("ActiveColor2", strVar("Color2", "199,154,224")), "199,154,224")
	local c3 = rgb3(strVar("ActiveColor3", strVar("Color3", "245,147,181")), "245,147,181")
	local gradAngle = (math.floor(tonumber(SKIN:GetVariable("GradientAngle", "0")) or 0) % 360 + 360) % 360
	local theme = getThemeHelper().resolve(SKIN)
	local useCard = (cfg.mode == 0 and cfg.showCardBg)
	local restTint = useCard and theme.inkRgb or strVar("TextColor", "242,244,248")

	if useCard then
		SKIN:Bang("!ShowMeter", "MeterDockBg")
		SKIN:Bang("!SetOption", "MeterDockBg", "X", string.format("%.1f", leftReserve))
		SKIN:Bang("!SetOption", "MeterDockBg", "Y", string.format("%.1f", topReserve))
		SKIN:Bang("!SetOption", "MeterDockBg", "Shape",
			string.format("Rectangle 0,0,%.1f,%.1f,%.1f | Fill Color %s,%d | StrokeWidth 1 | Stroke Color %s",
				capW, capH, 12 * s, theme.surfaceRgb, theme.bgAlpha, theme.borderRgba))
		if isVert then
			SKIN:Bang("!SetOption", "MeterDockBg", "Shape2",
				string.format("Rectangle 0,%.1f,2,%.1f,1 | Fill LinearGradient GradAccent | StrokeWidth 0",
					6 * s, math.max(12, capH - 12 * s)))
			SKIN:Bang("!SetOption", "MeterDockBg", "GradAccent",
				string.format("%d | %s ; 0.0 | %s ; 0.5 | %s ; 1.0", (gradAngle + 90) % 360, c1, c2, c3))
		else
			SKIN:Bang("!SetOption", "MeterDockBg", "Shape2",
				string.format("Rectangle %.1f,0,%.1f,2,1 | Fill LinearGradient GradAccent | StrokeWidth 0",
					6 * s, math.max(12, capW - 12 * s)))
			SKIN:Bang("!SetOption", "MeterDockBg", "GradAccent",
				string.format("%d | %s ; 0.0 | %s ; 0.5 | %s ; 1.0", gradAngle, c1, c2, c3))
		end
	else
		SKIN:Bang("!HideMeter", "MeterDockBg")
	end

	-- Separator between primary slots and trailing utility slots
	if hasSep then
		local sepOffset = padX + sepAfter * baseSz + (sepAfter - 1) * gap + (gap + sepGap) * 0.5
		local sepStroke = (useCard and theme.isLight) and "24,28,36,48" or "255,255,255,44"
		SKIN:Bang("!ShowMeter", "MeterDockSep")
		if isVert then
			SKIN:Bang("!SetOption", "MeterDockSep", "X", string.format("%.1f", leftReserve + 8 * s))
			SKIN:Bang("!SetOption", "MeterDockSep", "Y", string.format("%.1f", topReserve + sepOffset))
			SKIN:Bang("!SetOption", "MeterDockSep", "Shape",
				string.format("Line 0,0,%.1f,0 | StrokeWidth 1 | Stroke Color %s", capW - 16 * s, sepStroke))
		else
			SKIN:Bang("!SetOption", "MeterDockSep", "X", string.format("%.1f", leftReserve + sepOffset))
			SKIN:Bang("!SetOption", "MeterDockSep", "Y", string.format("%.1f", topReserve + 8 * s))
			SKIN:Bang("!SetOption", "MeterDockSep", "Shape",
				string.format("Line 0,0,0,%.1f | StrokeWidth 1 | Stroke Color %s", capH - 16 * s, sepStroke))
		end
	else
		SKIN:Bang("!HideMeter", "MeterDockSep")
	end

	-- Position all slots 1..15
	local activeX, activeY = 0, 0
	for i = 1, 15 do
		local mName = "MeterDockIcon" .. i
		local m = SKIN:GetMeter(mName)
		if m then
			if i <= cfg.count then
				SKIN:Bang("!ShowMeter", mName)
				local iconName = strVar("DockSlot" .. i .. "Icon", "folder")
				if iconName:sub(1, 5) == "trash" and cfg.showBinCount then
					iconName = (binCount > 0) and "trash-full" or "trash-empty"
				end
				SKIN:Bang("!SetOption", mName, "ImageName", "#@#DockIcons\\" .. iconName .. ".png")

				local curZ = cfg.hoverZoom and zoom[i] or (hoverIdx == i and 1.08 or 1.0)
				local drawSz = baseSz * curZ
				local extra = (drawSz - baseSz) * 0.5
				local sepAdd = (hasSep and i > sepAfter) and sepGap or 0

				local slotOffset = padX + (i - 1) * step + sepAdd
				local cx, cy
				if isVert then
					cx = leftReserve + padY - (labelSecond and (extra * 0.55) or (extra * 1.45))
					cy = topReserve + slotOffset - extra
				else
					cx = leftReserve + slotOffset - extra
					cy = topReserve + padY - (labelSecond and (extra * 0.55) or (extra * 1.45))
				end

				SKIN:Bang("!SetOption", mName, "X", string.format("%.1f", cx))
				SKIN:Bang("!SetOption", mName, "Y", string.format("%.1f", cy))
				SKIN:Bang("!SetOption", mName, "W", string.format("%.1f", drawSz))
				SKIN:Bang("!SetOption", mName, "H", string.format("%.1f", drawSz))

				local tint = (hoverIdx == i and cfg.tintIcons) and c2 or restTint
				SKIN:Bang("!SetOption", mName, "ImageTint", tint)

				if hoverIdx == i then
					activeX = cx + drawSz * 0.5
					activeY = cy
				end
			else
				SKIN:Bang("!HideMeter", mName)
			end
		end
	end

	local totalW = capW + leftReserve + rightReserve
	local totalH = capH + topReserve + bottomReserve

	-- Tooltip pill on hover
	local VI_DOCK_LABELS = {
		["This PC"] = "Máy tính",
		["Downloads"] = "Tải xuống",
		["Music"] = "Âm nhạc",
		["Recycle Bin"] = "Thùng rác",
		["Documents"] = "Tài liệu",
		["Videos"] = "Video",
		["Notepad"] = "Ghi chú",
		["Settings"] = "Cài đặt",
		["Shut Down"] = "Tắt nguồn",
	}
	if hoverIdx > 0 and hoverIdx <= cfg.count and cfg.showLabels then
		local lbl = strVar("DockSlot" .. hoverIdx .. "Label", "App " .. hoverIdx)
		local isVi = SKIN:GetVariable("Language", "English") == "Vietnamese"
		if isVi and VI_DOCK_LABELS[lbl] then
			lbl = VI_DOCK_LABELS[lbl]
		end
		local iconBase = strVar("DockSlot" .. hoverIdx .. "Icon", "")
		if cfg.showBinCount and iconBase:sub(1, 5) == "trash" then
			local emptyWord = isVi and "Trống" or "Empty"
			lbl = lbl .. (binCount > 0 and (" (" .. binCount .. ")") or (" (" .. emptyWord .. ")"))
		end
		local pillW = math.max(54 * s, (#lbl * 6.5 + 20) * s)
		local pillH = 22 * s
		local px, py
		if isVert then
			px = labelSecond and (leftReserve + capW + 10 * s) or math.max(2, leftReserve - pillW - 10 * s)
			py = activeY + (baseSz * zoom[hoverIdx] - pillH) * 0.5
		else
			px = math.max(2, math.min(totalW - pillW - 2, activeX - pillW * 0.5))
			py = labelSecond and (topReserve + capH + 8 * s) or math.max(2, topReserve - pillH - 8 * s)
		end

		local isTextOnly = (cfg.labelStyle == 1)
		if isTextOnly then
			SKIN:Bang("!HideMeter", "MeterDockTooltipBg")
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "FontSize", string.format("%.1f", 10.0 * s))
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "FontColor", strVar("TextColor", "242,244,248") .. ",248")
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "StringEffect", "Shadow")
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "FontEffectColor", "0,0,0,175")
		else
			SKIN:Bang("!ShowMeter", "MeterDockTooltipBg")
			SKIN:Bang("!SetOption", "MeterDockTooltipBg", "X", string.format("%.1f", px))
			SKIN:Bang("!SetOption", "MeterDockTooltipBg", "Y", string.format("%.1f", py))
			SKIN:Bang("!SetOption", "MeterDockTooltipBg", "Shape",
				string.format("Rectangle 0,0,%.1f,%.1f,%.1f | Fill Color 14,16,22,235 | StrokeWidth 1 | Stroke Color %s,150",
					pillW, pillH, pillH * 0.5, c2))
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "FontSize", string.format("%.1f", 9.0 * s))
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "FontColor", "242,244,248,255")
			SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "StringEffect", "None")
		end
		SKIN:Bang("!ShowMeter", "MeterDockTooltipTxt")
		SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "X", string.format("%.1f", px + pillW * 0.5))
		SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "Y", string.format("%.1f", py + pillH * 0.5))
		SKIN:Bang("!SetOption", "MeterDockTooltipTxt", "Text", lbl)
	else
		SKIN:Bang("!HideMeter", "MeterDockTooltipBg")
		SKIN:Bang("!HideMeter", "MeterDockTooltipTxt")
	end

	-- Keep window bounding canvas stable across hover states
	local boundW = math.ceil(totalW)
	local boundH = math.ceil(totalH)
	SKIN:Bang("!SetOption", "MeterDockBounds", "W", tostring(boundW))
	SKIN:Bang("!SetOption", "MeterDockBounds", "H", tostring(boundH))
	SKIN:Bang("!SetOption", "MeterDockBounds", "Shape",
		string.format("Rectangle 0,0,%d,%d | Fill Color 0,0,0,0 | StrokeWidth 0", boundW, boundH))

	SKIN:Bang("!UpdateMeter", "*")
	SKIN:Bang("!Redraw")
end

function Initialize()
	applyLayout()
end

function Update()
	local binNow = getBinCount()
	local binChanged = (binNow ~= lastBinCount)
	lastBinCount = binNow

	local moved = false
	local cfg = readConfig()
	local maxZ = cfg.hoverZoom and 1.32 or 1.0
	for i = 1, 15 do
		targetZoom[i] = (i == hoverIdx) and maxZ or 1.0
		local diff = targetZoom[i] - zoom[i]
		if math.abs(diff) > 0.008 then
			zoom[i] = zoom[i] + diff * 0.36
			moved = true
		elseif zoom[i] ~= targetZoom[i] then
			zoom[i] = targetZoom[i]
			moved = true
		end
	end

	if animating or moved or binChanged then
		animating = moved
		applyLayout()
	end
	return binNow
end

function SetHover(idx)
	hoverIdx = tonumber(idx) or 0
	animating = true
	applyLayout()
end

function ClearHover(idx)
	if hoverIdx == (tonumber(idx) or 0) then
		hoverIdx = 0
		animating = true
		applyLayout()
	end
end
