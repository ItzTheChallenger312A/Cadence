-- PlayerHelper.lua
-- Formats Elapsed / Remaining time safely for both WebNowPlaying ("MM:SS") and NowPlaying (seconds),
-- computes integer progress %, and provides smooth sliding-window marquee text for long track titles.

local ThemeHelper = nil
local function getThemeHelper()
	if not ThemeHelper then
		ThemeHelper = dofile(SKIN:GetVariable("@") .. "Scripts\\ThemeHelper.lua")
	end
	return ThemeHelper
end

local scrollOffset = 0
local scrollDir = 1
local pauseTicks = 24
local lastTitle = ""
local lastMode = -1

local function parseSeconds(strVal, numVal)
	if strVal and strVal ~= "" then
		local h, m, s = strVal:match("^(%d+):(%d+):(%d+)$")
		if h then
			return tonumber(h) * 3600 + tonumber(m) * 60 + tonumber(s)
		end
		local mm, ss = strVal:match("^(%d+):(%d+)$")
		if mm then
			return tonumber(mm) * 60 + tonumber(ss)
		end
	end
	if numVal and numVal > 0 then
		return math.floor(numVal)
	end
	return 0
end

local function fmtTime(sec)
	sec = math.max(0, math.floor(sec))
	local h = math.floor(sec / 3600)
	local m = math.floor((sec % 3600) / 60)
	local s = sec % 60
	if h > 0 then
		return string.format("%d:%02d:%02d", h, m, s)
	end
	return string.format("%02d:%02d", m, s)
end

local function updatePingPongMarquee(mTitle)
	local pMode = math.floor(tonumber(SKIN:GetVariable("PlayerMode", "0")) or 0)
	local pScale = tonumber(SKIN:GetVariable("PlayerScale", "1")) or 1
	local showCover = tonumber(SKIN:GetVariable("PlayerShowCover", "1")) == 1
	local useMarquee = tonumber(SKIN:GetVariable("PlayerMarquee", "1")) == 1

	local curTitle = mTitle and mTitle:GetStringValue() or ""
	if curTitle ~= lastTitle or pMode ~= lastMode then
		lastTitle = curTitle
		lastMode = pMode
		scrollOffset = 0
		scrollDir = 1
		pauseTicks = 24
	end

	local meterName = "MeterTrack" .. pMode
	local boxW = 290 * pScale
	if pMode == 0 and not showCover then
		boxW = 384 * pScale
	elseif pMode == 1 then
		boxW = 400 * pScale
	elseif pMode == 2 then
		boxW = 310 * pScale
	end

	local meter = SKIN:GetMeter(meterName)
	if not meter then return end
	local textW = meter:GetW()

	if useMarquee and textW > boxW + 2 then
		local maxOff = textW - boxW
		if pauseTicks > 0 then
			pauseTicks = pauseTicks - 1
		else
			scrollOffset = scrollOffset + scrollDir * 1.5
			if scrollOffset >= maxOff then
				scrollOffset = maxOff
				scrollDir = -1
				pauseTicks = 20
			elseif scrollOffset <= 0 then
				scrollOffset = 0
				scrollDir = 1
				pauseTicks = 24
			end
		end
		if pMode == 1 then
			SKIN:Bang("!SetOption", meterName, "StringAlign", "Left")
		end
		SKIN:Bang("!SetOption", meterName, "X", tostring(-math.floor(scrollOffset + 0.5)))
		SKIN:Bang("!UpdateMeter", meterName)
		SKIN:Bang("!Redraw")
	else
		scrollOffset = 0
		scrollDir = 1
		pauseTicks = 24
		if pMode == 1 then
			SKIN:Bang("!SetOption", meterName, "StringAlign", "Center")
			SKIN:Bang("!SetOption", meterName, "X", tostring(math.floor(boxW * 0.5 + 0.5)))
		else
			SKIN:Bang("!SetOption", meterName, "X", "0")
		end
		SKIN:Bang("!UpdateMeter", meterName)
	end
end

function Initialize()
	scrollOffset = 0
	scrollDir = 1
	pauseTicks = 24
	lastTitle = ""
	lastMode = -1
	getThemeHelper().syncCardVars(SKIN, tonumber(SKIN:GetVariable("PlayerShowCardBg", "1")) == 1)
end

function Update()
	getThemeHelper().syncCardVars(SKIN, tonumber(SKIN:GetVariable("PlayerShowCardBg", "1")) == 1)
	local mPos = SKIN:GetMeasure("MeasurePosition")
	local mDur = SKIN:GetMeasure("MeasureDuration")
	local mProg = SKIN:GetMeasure("MeasureProgress")
	local mTitle = SKIN:GetMeasure("MeasureTrack")

	updatePingPongMarquee(mTitle)

	local posSec = parseSeconds(mPos and mPos:GetStringValue() or "", mPos and mPos:GetValue() or 0)
	local durSec = parseSeconds(mDur and mDur:GetStringValue() or "", mDur and mDur:GetValue() or 0)
	local prog = mProg and mProg:GetValue() or 0

	if durSec > 0 and posSec == 0 and prog > 0 then
		posSec = math.floor(durSec * prog / 100)
	elseif durSec > 0 and prog == 0 and posSec > 0 then
		prog = (posSec / durSec) * 100
	end

	local remSec = math.max(0, durSec - posSec)
	local posStr = fmtTime(posSec)
	local remStr = durSec > 0 and ("-" .. fmtTime(remSec)) or "--:--"
	local pctStr = string.format("%d%%", math.floor(math.max(0, math.min(100, prog)) + 0.5))
	local showPct = tonumber(SKIN:GetVariable("PlayerShowPercent", "1")) == 1
	local pctSuffix = showPct and ("  (" .. pctStr .. ")") or ""

	SKIN:Bang("!SetVariable", "PlayerPosFormatted", posStr)
	SKIN:Bang("!SetVariable", "PlayerRemFormatted", remStr)
	SKIN:Bang("!SetVariable", "PlayerPctFormatted", pctStr)
	SKIN:Bang("!SetVariable", "PlayerPctSuffix", pctSuffix)
	return posStr .. " - " .. remStr .. pctSuffix
end
