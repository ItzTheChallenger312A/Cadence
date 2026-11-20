-- ThemeHelper.lua
-- Resolves Dark / Light / Custom / System appearance mode and Card Background Opacity
-- for Cadence cards and icon tints.

local M = {}

local function parseRgb(str, fallbackR, fallbackG, fallbackB)
	local r, g, b = tostring(str or ""):match("^(%d+)%s*,%s*(%d+)%s*,%s*(%d+)")
	if r then
		return math.min(255, tonumber(r)), math.min(255, tonumber(g)), math.min(255, tonumber(b))
	end
	return fallbackR, fallbackG, fallbackB
end

function M.resolve(SKIN)
	local mode = math.floor(tonumber(SKIN:GetVariable("ThemeMode", "0")) or 0)
	local opPct = tonumber(SKIN:GetVariable("ThemeBgOpacity", "86")) or 86
	opPct = math.max(0, math.min(100, opPct))
	local bgAlpha = math.floor(opPct * 2.55 + 0.5)

	local isLight = false
	local surfaceRgb = "15,17,23"
	local inkRgb = "242,244,248"

	if mode == 1 then
		isLight = true
		surfaceRgb = "244,246,250"
		inkRgb = "24,28,36"
	elseif mode == 2 then
		local sr, sg, sb = parseRgb(SKIN:GetVariable("ThemeCustomCardBg", "22,26,36"), 22, 26, 36)
		local ir, ig, ib = parseRgb(SKIN:GetVariable("ThemeCustomText", "242,244,248"), 242, 244, 248)
		surfaceRgb = string.format("%d,%d,%d", sr, sg, sb)
		inkRgb = string.format("%d,%d,%d", ir, ig, ib)
		local lum = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255.0
		isLight = lum > 0.58
	elseif mode == 3 then
		local reg = SKIN:GetMeasure("MeasureSystemTheme")
		local sysLight = reg and tonumber(reg:GetValue()) == 1
		isLight = sysLight
		if sysLight then
			surfaceRgb = "244,246,250"
			inkRgb = "24,28,36"
		end
	end

	local borderAlpha = math.floor(math.max(0, math.min(1.0, opPct / 86.0)) * (isLight and 38 or 28))
	local borderRgba = (isLight and "24,28,36," or "255,255,255,") .. tostring(borderAlpha)

	return {
		mode = mode,
		opacityPct = opPct,
		bgAlpha = bgAlpha,
		isLight = isLight,
		surfaceRgb = surfaceRgb,
		inkRgb = inkRgb,
		borderRgba = borderRgba,
	}
end

function M.syncCardVars(SKIN, useCard)
	local t = M.resolve(SKIN)
	local ink = useCard and t.inkRgb or (t.isLight and "24,28,36" or "242,244,248")
	local border = useCard and t.borderRgba or "255,255,255,0"
	SKIN:Bang("!SetVariable", "CardSurfaceBg", t.surfaceRgb)
	SKIN:Bang("!SetVariable", "CardBgAlpha", tostring(t.bgAlpha))
	SKIN:Bang("!SetVariable", "CardTextColor", ink)
	SKIN:Bang("!SetVariable", "CardBorderColor", border)
	return t
end

return M
