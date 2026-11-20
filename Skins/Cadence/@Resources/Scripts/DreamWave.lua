-- DreamWave.lua
-- Evolved from Irena's WaterWave.lua:
-- Spring-coupled height-map wave spline synced with Monstercat's smoothed FFT bands,
-- BarWidth/BarGap geometry, MirrorMode center baseline, and WaveFill option.

local nBands, nPoints, bUseMap1
local oMs, tHeightMap1, tHeightMap2, tC

local function clamp(val, lo, hi)
	if val < lo then return lo end
	if val > hi then return hi end
	return val
end

local function mapVal(v, min1, max1, min2, max2)
	if max1 == min1 then return min2 end
	return min2 + (max2 - min2) * ((v - min1) / (max1 - min1))
end

local function sampleBand(frac)
	if nBands <= 1 then
		return oMs[1] and oMs[1]:GetValue() or 0
	end
	local pos = clamp(frac, 0, 1) * (nBands - 1) + 1
	local idx0 = math.floor(pos)
	local idx1 = math.min(idx0 + 1, nBands)
	local alpha = pos - idx0
	local v0 = oMs[idx0] and oMs[idx0]:GetValue() or 0
	local v1 = oMs[idx1] and oMs[idx1]:GetValue() or 0
	return v0 + (v1 - v0) * alpha
end

local function toCurve(t, xStart, yCenter, amp, stepX, tScale, closedFill)
	local xMax = xStart + stepX * (#t - 1)
	local xHalf = stepX * 0.5
	local yValNext = mapVal(t[1], -tScale, tScale, yCenter + amp, yCenter - amp)

	local parts = {}
	if closedFill then
		parts[1] = string.format("%.1f,%.1f | LineTo %.1f,%.1f", xStart, tC.FillY, xStart, yValNext)
	else
		parts[1] = string.format("%.1f,%.1f", xStart, yValNext)
	end

	for i = 1, #t do
		local xEnd = mapVal(i, 1, #t, xStart, xMax)
		local yVal = yValNext
		local nextIdx = clamp(i + 1, 1, #t)
		yValNext = mapVal(t[nextIdx], -tScale, tScale, yCenter + amp, yCenter - amp)
		local yEnd = (yVal + yValNext) * 0.5
		parts[#parts + 1] = string.format("CurveTo %.1f,%.1f,%.1f,%.1f", xEnd, yEnd, xEnd - xHalf, yVal)
	end

	if closedFill then
		parts[#parts + 1] = string.format("LineTo %.1f,%.1f | ClosePath 1", xMax, tC.FillY)
	end

	return table.concat(parts, " | ")
end

function Initialize()
	nBands = clamp(math.floor(SKIN:ParseFormula(SKIN:GetVariable("BarCount", "64"))), 8, 100)
	nPoints = clamp(math.floor(SKIN:ParseFormula(SKIN:GetVariable("WavePoints", "128"))), 16, 256)

	local barWidth = SKIN:ParseFormula(SKIN:GetVariable("BarWidth", "5"))
	local barGap = SKIN:ParseFormula(SKIN:GetVariable("BarGap", "10"))
	local scaleVis = SKIN:ParseFormula(SKIN:GetVariable("ScaleVisualizer", "1"))
	local barHeight = SKIN:ParseFormula(SKIN:GetVariable("BarHeight", "220")) * scaleVis
	local mirrorMode = math.floor(SKIN:ParseFormula(SKIN:GetVariable("MirrorMode", "1")))
	local visMode = math.floor(SKIN:ParseFormula(SKIN:GetVariable("VisualizerMode", "0")))
	local waveEnabled = math.floor(SKIN:ParseFormula(SKIN:GetVariable("WaveEnabled", "1")))

	local totalWidth = (nBands * (barWidth + barGap) - barGap) * scaleVis
	if totalWidth <= 10 then totalWidth = 600 end

	oMs = {}
	for i = 1, nBands do
		oMs[i] = SKIN:GetMeasure("MeasureAudioSmoothed" .. (i - 1))
	end

	bUseMap1 = true
	tHeightMap1 = {}
	tHeightMap2 = {}
	for i = 1, nPoints do
		tHeightMap1[i] = 0
		tHeightMap2[i] = 0
	end

	tC = {}
	tC.ScopeMode = (visMode == 4)
	tC.RingMode = (visMode == 5)
	tC.ScaleVis = scaleVis
	tC.SpheresLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableSpheresLayer", "0"))) == 1
	tC.RaysLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableRaysLayer", "0"))) == 1
	tC.PeaksLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnablePeaksLayer", "0"))) == 1
	tC.BassAuraLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableBassAuraLayer", "0"))) == 1
	tC.ParticlesLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableParticlesLayer", "0"))) == 1
	tC.ShockwaveLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableShockwaveLayer", "0"))) == 1
	tC.OrbitalsLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableOrbitalsLayer", "0"))) == 1
	tC.RibbonLayer = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableRibbonLayer", "0"))) == 1
	tC.LayerPhase = 0
	tC.PeakHold = {}
	tC.Particles = {}
	for i = 1, 16 do
		tC.Particles[i] = {
			xf = ((i * 37) % 100) / 100.0,
			yf = ((i * 53) % 100) / 100.0,
			vx = (((i % 7) - 3) * 0.0022),
			vy = -(0.0035 + (i % 5) * 0.0015),
			sz = (1.3 + (i % 3) * 0.7) * scaleVis
		}
	end
	tC.Color1 = SKIN:GetVariable("ActiveColor1", "135,133,254")
	tC.Color2 = SKIN:GetVariable("ActiveColor2", "199,154,224")
	tC.Color3 = SKIN:GetVariable("ActiveColor3", "253,172,199")
	tC.Active = tC.ScopeMode or tC.RingMode or (waveEnabled == 1 and (visMode == 0 or visMode == 2 or visMode == 3))
	tC.ScopePhase = 0
	tC.ScopeSharpness = clamp(SKIN:ParseFormula(SKIN:GetVariable("ScopeSharpness", "1.0")), 0.3, 2.5)
	tC.ScopeSensitivity = clamp(SKIN:ParseFormula(SKIN:GetVariable("ScopeSensitivity", "1.0")), 0.3, 2.5)
	tC.ScopeSmoothing = clamp(SKIN:ParseFormula(SKIN:GetVariable("ScopeSmoothing", "0.30")), 0.0, 0.85)
	tC.ScopeSpeed = clamp(SKIN:ParseFormula(SKIN:GetVariable("ScopeSpeed", "1.0")), 0.2, 2.5)
	tC.ScopeTrail = math.floor(SKIN:ParseFormula(SKIN:GetVariable("ScopeTrail", "1")))
	tC.ScopeEdgeTaper = math.floor(SKIN:ParseFormula(SKIN:GetVariable("ScopeEdgeTaper", "1")))
	tC.ScopeDualTrace = math.floor(SKIN:ParseFormula(SKIN:GetVariable("ScopeDualTrace", "0")))
	tC.ScopePrevY = {}
	tC.ScopePrevPath = nil
	tC.Width = totalWidth
	tC.Height = barHeight
	tC.CenterY = (mirrorMode == 1) and (barHeight * 0.5) or (barHeight * 0.86)
	tC.Amp = (mirrorMode == 1) and (barHeight * 0.44) or (barHeight * 0.55)
	tC.ExpScaleFactor = math.abs(SKIN:ParseFormula(SKIN:GetVariable("WaveExpScale", "1.6")))
	tC.Stiffness = SKIN:ParseFormula(SKIN:GetVariable("WaveStiffness", "1.04"))
	if tC.Stiffness < 1.0 then tC.Stiffness = 1.0 end
	tC.Spread = math.max(1.5, math.abs(SKIN:ParseFormula(SKIN:GetVariable("WaveSpread", "8"))))
	tC.Scale = math.max(1.0, math.abs(SKIN:ParseFormula(SKIN:GetVariable("WaveScale", "7"))))
	tC.Fill = math.floor(SKIN:ParseFormula(SKIN:GetVariable("WaveFill", "1"))) > 0
	tC.WaveTrail = math.floor(SKIN:ParseFormula(SKIN:GetVariable("WaveTrail", "1"))) == 1
	tC.WaveDualTrace = math.floor(SKIN:ParseFormula(SKIN:GetVariable("WaveDualTrace", "0"))) == 1
	tC.WavePrevPath = nil
	tC.FillY = (mirrorMode == 1) and (barHeight * 0.5) or barHeight
	tC.BarStyle = math.floor(SKIN:ParseFormula(SKIN:GetVariable("BarStyle", "0")))
	tC.VisMode = visMode
	tC.MirrorMode = mirrorMode
	tC.BarW = barWidth * scaleVis
	tC.BarG = barGap * scaleVis
	tC.MinBar = math.max(0.005, SKIN:ParseFormula(SKIN:GetVariable("MinBarValue", "0.02")))
end

local function buildCatmullCurve(pts, moveFirst)
	local parts = {}
	if moveFirst then
		parts[1] = string.format("%.1f,%.1f", pts[1].x, pts[1].y)
	else
		parts[1] = string.format("LineTo %.1f,%.1f", pts[1].x, pts[1].y)
	end
	local k = 1.0 / 6.0
	local n = #pts
	for i = 1, n - 1 do
		local p0 = pts[math.max(1, i - 1)]
		local p1 = pts[i]
		local p2 = pts[i + 1]
		local p3 = pts[math.min(n, i + 2)]
		local cx1 = p1.x + (p2.x - p0.x) * k
		local cy1 = p1.y + (p2.y - p0.y) * k
		local cx2 = p2.x - (p3.x - p1.x) * k
		local cy2 = p2.y - (p3.y - p1.y) * k
		parts[#parts + 1] = string.format("CurveTo %.1f,%.1f,%.1f,%.1f,%.1f,%.1f", p2.x, p2.y, cx1, cy1, cx2, cy2)
	end
	return table.concat(parts, " | ")
end

local function updateConnectedPaths(isMuted)
	if tC.BarStyle ~= 2 or tC.VisMode == 2 or nBands < 2 then
		return
	end
	local topPts = {}
	local botPts = {}
	for i = 1, nBands do
		local xL = (i - 1) * (tC.BarW + tC.BarG)
		local px = (i == 1) and 0 or ((i == nBands) and tC.Width or (xL + tC.BarW * 0.5))
		local raw = isMuted and tC.MinBar or (oMs[i] and oMs[i]:GetValue() or tC.MinBar)
		local lvl = clamp(raw, tC.MinBar, 1.0)
		local h = lvl * tC.Height
		local yT = (tC.MirrorMode == 1) and ((tC.Height - h) * 0.5) or (tC.Height - h)
		local yB = (tC.MirrorMode == 1) and ((tC.Height + h) * 0.5) or tC.Height
		topPts[i] = { x = px, y = yT }
		botPts[i] = { x = px, y = yB }
	end

	local topStr = buildCatmullCurve(topPts, true)
	local botStr
	local fillStr
	if tC.MirrorMode == 1 then
		botStr = buildCatmullCurve(botPts, true)
		local botRev = {}
		for i = nBands, 1, -1 do
			botRev[#botRev + 1] = botPts[i]
		end
		fillStr = topStr .. " | " .. buildCatmullCurve(botRev, false) .. " | ClosePath 1"
	else
		botStr = string.format("0,%.1f | LineTo %.1f,%.1f", tC.Height, tC.Width, tC.Height)
		fillStr = topStr .. string.format(" | LineTo %.1f,%.1f | LineTo 0,%.1f | ClosePath 1", tC.Width, tC.Height, tC.Height)
	end

	SKIN:Bang("!SetOption", "MeterConnectedMask", "ConnectedFillPath", fillStr)
	SKIN:Bang("!SetOption", "MeterConnectedBars", "ConnectedFillPath", fillStr)
	SKIN:Bang("!SetOption", "MeterConnectedOutline", "ConnectedTopPath", topStr)
	SKIN:Bang("!SetOption", "MeterConnectedOutline", "ConnectedBotPath", botStr)
end

local function updateWmpScope(isMuted)
	local ptsCount = 220
	local yMid = tC.Height * 0.5
	local maxAmp = tC.Height * 0.44
	tC.ScopePhase = (tC.ScopePhase or 0) + 0.36 * (tC.ScopeSpeed or 1.0)
	local ph = tC.ScopePhase

	local bass = isMuted and 0 or sampleBand(0.06)
	local lowMid = isMuted and 0 or sampleBand(0.18)
	local mid = isMuted and 0 or sampleBand(0.36)
	local hiMid = isMuted and 0 or sampleBand(0.58)
	local treble = isMuted and 0 or sampleBand(0.82)

	local sharp = tC.ScopeSharpness or 1.0
	local sens = tC.ScopeSensitivity or 1.0
	local smooth = tC.ScopeSmoothing or 0.30
	local useTaper = (tC.ScopeEdgeTaper == 1)
	local useDual = (tC.ScopeDualTrace == 1)
	local freqMul = 0.7 + 0.3 * sharp
	local hiGain = clamp(sharp, 0.3, 2.5)
	local peakExp = 1.0 / (0.65 + 0.35 * sharp)

	local parts = {}
	local dualParts = {}
	for i = 0, ptsCount - 1 do
		local frac = i / (ptsCount - 1)
		local x = frac * tC.Width
		local edge = useTaper and (math.sin(math.pi * frac) ^ 0.42) or 1.0
		local localBand = isMuted and 0 or sampleBand(frac)

		local sig = 0
		if not isMuted then
			local w1 = math.sin(frac * 18.0 * freqMul + ph * 0.9) * (0.35 * bass + 0.25 * localBand)
			local w2 = math.sin(frac * 54.0 * freqMul - ph * 1.45) * (0.32 * lowMid + 0.18 * localBand)
			local w3 = math.sin(frac * 126.0 * freqMul + ph * 2.15) * (0.28 * mid + 0.22 * localBand) * (0.45 + 0.55 * hiGain)
			local w4 = math.sin(frac * 240.0 * freqMul - ph * 3.1) * (0.24 * hiMid + 0.18 * treble) * hiGain
			local raw = clamp((w1 + w2 + w3 + w4) * sens, -1.0, 1.0)
			local sgn = (raw >= 0) and 1 or -1
			sig = sgn * (math.abs(raw) ^ peakExp)
		end

		local targetY = yMid - sig * maxAmp * edge
		local prevY = tC.ScopePrevY[i + 1] or yMid
		local y = prevY * smooth + targetY * (1.0 - smooth)
		tC.ScopePrevY[i + 1] = y

		if i == 0 then
			parts[1] = string.format("%.1f,%.1f", x, y)
		else
			parts[#parts + 1] = string.format("LineTo %.1f,%.1f", x, y)
		end

		if useDual then
			local sig2 = 0
			if not isMuted then
				local d1 = math.sin(frac * 18.0 * freqMul + ph * 0.9 + 1.15) * (0.32 * bass + 0.22 * localBand)
				local d2 = math.sin(frac * 54.0 * freqMul - ph * 1.45 + 0.75) * (0.30 * lowMid + 0.18 * localBand)
				local d3 = math.sin(frac * 126.0 * freqMul + ph * 2.15 - 0.9) * (0.26 * mid + 0.20 * localBand) * (0.45 + 0.55 * hiGain)
				local raw2 = clamp((d1 + d2 + d3) * sens, -1.0, 1.0)
				local sgn2 = (raw2 >= 0) and 1 or -1
				sig2 = sgn2 * (math.abs(raw2) ^ peakExp)
			end
			local y2 = yMid + sig2 * maxAmp * edge * 0.85
			if i == 0 then
				dualParts[1] = string.format("%.1f,%.1f", x, y2)
			else
				dualParts[#dualParts + 1] = string.format("LineTo %.1f,%.1f", x, y2)
			end
		end
	end

	local waveStr = table.concat(parts, " | ")
	if tC.ScopeTrail == 1 and tC.ScopePrevPath then
		SKIN:Bang("!SetOption", "MeterWaveTrail", "TrailPath", tC.ScopePrevPath)
	end
	tC.ScopePrevPath = waveStr

	SKIN:Bang("!SetOption", "MeterWaveBar", "WavePath", waveStr)
	SKIN:Bang("!SetOption", "MeterWaveBar", "WaveFillPath", "0,0 | LineTo 1,0 | ClosePath 1")
	if useDual then
		SKIN:Bang("!SetOption", "MeterWaveDual", "DualPath", table.concat(dualParts, " | "))
	end
end

local function updateRingMode(isMuted)
	local ringPts = 96
	local cx = tC.Width * 0.5
	local cy = tC.Height * 0.5
	local baseR = math.min(tC.Width * 0.22, 145 * (tC.ScaleVis or 1))
	local maxOut = math.min(tC.Width * 0.14, 95 * (tC.ScaleVis or 1))

	local parts = {}
	for i = 0, ringPts - 1 do
		local frac = i / ringPts
		local symFrac = math.abs(frac * 2.0 - 1.0)
		local lvl = isMuted and tC.MinBar or clamp(sampleBand(symFrac), tC.MinBar, 1.0)
		local r = baseR + lvl * maxOut
		local theta = frac * (2.0 * math.pi) - (math.pi * 0.5)
		local x = cx + math.cos(theta) * r
		local y = cy + math.sin(theta) * r
		if i == 0 then
			parts[1] = string.format("%.1f,%.1f", x, y)
		else
			parts[#parts + 1] = string.format("LineTo %.1f,%.1f", x, y)
		end
	end
	parts[#parts + 1] = "ClosePath 1"
	SKIN:Bang("!SetOption", "MeterRingWave", "RingPath", table.concat(parts, " | "))
end

local function updateSpheresLayer(isMuted)
	local count = 12
	local cy = tC.Height * 0.5
	local maxR = math.min(tC.Height * 0.24, 46 * (tC.ScaleVis or 1))
	local minR = 6 * (tC.ScaleVis or 1)
	local ph = tC.LayerPhase
	for i = 1, count do
		local frac = (i - 0.5) / count
		local lvl = isMuted and tC.MinBar or clamp(sampleBand(frac), tC.MinBar, 1.0)
		local r = minR + lvl * maxR
		local x = frac * tC.Width + math.sin(ph * 0.7 + i * 1.3) * (8 * (tC.ScaleVis or 1))
		local driftY = math.cos(ph * 0.9 + i * 1.7) * (tC.Height * 0.22) * (0.35 + 0.65 * lvl)
		local y = cy + driftY
		local gradIdx = ((i - 1) % 3) + 1
		local opt = (i == 1) and "Shape" or ("Shape" .. i)
		SKIN:Bang("!SetOption", "MeterSpheresLayer", opt, string.format("Ellipse %.1f,%.1f,%.1f | Fill RadialGradient SphereGrad%d | StrokeWidth 0", x, y, r, gradIdx))
	end
end

local function updateRaysLayer(isMuted)
	local nodes = 18
	local cy = tC.Height * 0.5
	local maxAmp = tC.Height * 0.44
	local ph = tC.LayerPhase
	local p1 = {}
	local p2 = {}
	for i = 0, nodes - 1 do
		local frac = i / (nodes - 1)
		local x = frac * tC.Width
		local lvl = isMuted and tC.MinBar or clamp(sampleBand(frac), tC.MinBar, 1.0)
		local dir = ((i % 2) == 0) and 1 or -1
		local y1 = cy - dir * (lvl * maxAmp * (0.65 + 0.35 * math.sin(ph + i * 0.8)))
		local y2 = cy + dir * (lvl * maxAmp * (0.65 + 0.35 * math.cos(ph * 1.15 + i * 0.9)))
		if i == 0 then
			p1[1] = string.format("%.1f,%.1f", x, y1)
			p2[1] = string.format("%.1f,%.1f", x, y2)
		else
			p1[#p1 + 1] = string.format("LineTo %.1f,%.1f", x, y1)
			p2[#p2 + 1] = string.format("LineTo %.1f,%.1f", x, y2)
		end
	end
	SKIN:Bang("!SetOption", "MeterRaysLayer", "RayPath1", table.concat(p1, " | "))
	SKIN:Bang("!SetOption", "MeterRaysLayer", "RayPath2", table.concat(p2, " | "))
end

local function updateBassAuraLayer(isMuted)
	local bass = isMuted and 0 or ((sampleBand(0.02) + sampleBand(0.06) + sampleBand(0.10)) / 3.0)
	local r = math.max(tC.Width, tC.Height) * (0.34 + bass * 0.26)
	SKIN:Bang("!SetOption", "MeterBassAuraLayer", "Shape", string.format("Ellipse %.1f,%.1f,%.1f | Fill RadialGradient BassAuraGrad | StrokeWidth 0", tC.Width * 0.5, tC.Height * 0.5, r))
end

local function updateRibbonLayer(isMuted)
	local bass = isMuted and 0 or ((sampleBand(0.02) + sampleBand(0.06) + sampleBand(0.10)) / 3.0)
	local mid = isMuted and 0 or ((sampleBand(0.35) + sampleBand(0.50)) * 0.5)
	local cy = tC.Height * 0.5
	local pts = 40
	local sv = tC.ScaleVis or 1
	local thick = (18 + bass * 26) * sv
	local ph = tC.LayerPhase * 0.8
	local top = {}
	local bot = {}
	for i = 0, pts do
		local frac = i / pts
		local x = frac * tC.Width
		local env = math.sin(math.pi * frac)
		local yOff = math.sin(frac * 5.5 + ph) * (22 + mid * 38) * sv * env
		           + math.cos(frac * 9.0 - ph * 0.7) * (10 + bass * 18) * sv * env
		local halfH = thick * (0.45 + 0.55 * env)
		top[i + 1] = { x = x, y = cy + yOff - halfH }
		bot[i + 1] = { x = x, y = cy + yOff + halfH }
	end
	local parts = {}
	parts[1] = string.format("%.1f,%.1f", top[1].x, top[1].y)
	for i = 2, #top do parts[#parts + 1] = string.format("LineTo %.1f,%.1f", top[i].x, top[i].y) end
	for i = #bot, 1, -1 do parts[#parts + 1] = string.format("LineTo %.1f,%.1f", bot[i].x, bot[i].y) end
	parts[#parts + 1] = "ClosePath 1"
	SKIN:Bang("!SetOption", "MeterRibbonLayer", "RibbonPath", table.concat(parts, " | "))
end

local function updateShockwaveLayer(isMuted)
	local bass = isMuted and 0 or ((sampleBand(0.02) + sampleBand(0.06) + sampleBand(0.10)) / 3.0)
	local cx = tC.Width * 0.5
	local cy = tC.Height * 0.5
	local maxR = math.min(tC.Width * 0.42, tC.Height * 0.95)
	local sv = tC.ScaleVis or 1
	local cols = { tC.Color1, tC.Color2, tC.Color3 }
	for k = 0, 2 do
		local phase = ((tC.LayerPhase * 0.12 + k / 3.0) % 1.0)
		local r = (24 + phase * maxR) * (0.85 + bass * 0.35)
		local alpha = math.floor(clamp((1.0 - phase) * (0.28 + bass * 0.45) * 255, 0, 255))
		local sw = math.max(0.6, (2.4 - phase * 1.4) * sv)
		local opt = (k == 0) and "Shape" or ("Shape" .. (k + 1))
		SKIN:Bang("!SetOption", "MeterShockwaveLayer", opt, string.format("Ellipse %.1f,%.1f,%.1f,%.1f | Fill Color 0,0,0,0 | StrokeWidth %.1f | Stroke Color %s,%d", cx, cy, r * 1.35, r * 0.55, sw, cols[k + 1], alpha))
	end
end

local function updateOrbitalsLayer(isMuted)
	local bass = isMuted and 0 or ((sampleBand(0.02) + sampleBand(0.06) + sampleBand(0.10)) / 3.0)
	local cx = tC.Width * 0.5
	local cy = tC.Height * 0.5
	local sv = tC.ScaleVis or 1
	local baseOrbit = math.min(tC.Width * 0.24, 155 * sv) + bass * 24 * sv
	for i = 0, 3 do
		local ang = tC.LayerPhase * 0.22 + (i * math.pi * 2.0) / 4.0
		local ox = cx + math.cos(ang) * baseOrbit
		local oy = cy + math.sin(ang) * baseOrbit * 0.65
		local r = (3.2 + bass * 3.5) * sv
		local col = ((i % 2) == 0) and tC.Color1 or tC.Color3
		local opt = (i == 0) and "Shape" or ("Shape" .. (i + 1))
		SKIN:Bang("!SetOption", "MeterOrbitalsLayer", opt, string.format("Ellipse %.1f,%.1f,%.1f | Fill Color %s,220 | StrokeWidth 0", ox, oy, r, col))
	end
end

local function updateParticlesLayer(isMuted)
	local midE = isMuted and 0 or ((sampleBand(0.25) + sampleBand(0.60)) * 0.5)
	local boost = 1.0 + midE * 3.5
	for i = 1, 16 do
		local pt = tC.Particles[i]
		pt.xf = (pt.xf + pt.vx * boost + 1.0) % 1.0
		pt.yf = (pt.yf + pt.vy * boost + 1.0) % 1.0
		local px = pt.xf * tC.Width
		local py = pt.yf * tC.Height
		local r = pt.sz * (0.9 + midE * 0.7)
		local col = ((i % 2) == 0) and tC.Color2 or tC.Color3
		local alpha = math.floor(clamp((0.35 + midE * 0.55) * 255, 0, 255))
		local opt = (i == 1) and "Shape" or ("Shape" .. i)
		SKIN:Bang("!SetOption", "MeterParticlesLayer", opt, string.format("Ellipse %.1f,%.1f,%.1f | Fill Color %s,%d | StrokeWidth 0", px, py, r, col, alpha))
	end
end

local function updatePeaksLayer(isMuted)
	local n = 24
	local sv = tC.ScaleVis or 1
	local r = 2.0 * sv
	for i = 1, n do
		local frac = (i - 1) / (n - 1)
		local lvl = isMuted and 0 or sampleBand(frac)
		local prev = tC.PeakHold[i] or 0.01
		if lvl >= prev then prev = lvl else prev = math.max(0.01, prev - 0.012) end
		tC.PeakHold[i] = prev
		local px = frac * tC.Width
		local py = (tC.MirrorMode == 1) and (tC.Height * 0.5 - prev * tC.Height * 0.46) or (tC.Height - prev * tC.Height * 0.92)
		local opt = (i == 1) and "Shape" or ("Shape" .. i)
		SKIN:Bang("!SetOption", "MeterPeaksLayer", opt, string.format("Ellipse %.1f,%.1f,%.1f | Fill Color %s,225 | StrokeWidth 0", px, py, r, tC.Color3))
	end
end

function Update()
	local autoMute = math.floor(SKIN:ParseFormula(SKIN:GetVariable("EnableAutoMute", "0")))
	local stateMeasure = SKIN:GetMeasure("MeasureState")
	local isMuted = (autoMute == 1) and stateMeasure and (stateMeasure:GetValue() ~= 1)

	tC.LayerPhase = (tC.LayerPhase or 0) + 0.08
	tC.Color1 = SKIN:GetVariable("ActiveColor1", tC.Color1 or "135,133,254")
	tC.Color2 = SKIN:GetVariable("ActiveColor2", tC.Color2 or "199,154,224")
	tC.Color3 = SKIN:GetVariable("ActiveColor3", tC.Color3 or "253,172,199")
	if tC.BassAuraLayer then updateBassAuraLayer(isMuted) end
	if tC.RibbonLayer then updateRibbonLayer(isMuted) end
	if tC.SpheresLayer then updateSpheresLayer(isMuted) end
	if tC.RaysLayer then updateRaysLayer(isMuted) end
	if tC.ShockwaveLayer then updateShockwaveLayer(isMuted) end
	if tC.OrbitalsLayer then updateOrbitalsLayer(isMuted) end
	if tC.ParticlesLayer then updateParticlesLayer(isMuted) end
	if tC.PeaksLayer then updatePeaksLayer(isMuted) end

	updateConnectedPaths(isMuted)

	if tC.ScopeMode then
		updateWmpScope(isMuted)
		return 1
	end
	if tC.RingMode then
		updateRingMode(isMuted)
		return 1
	end

	if not tC.Active then
		return 0
	end

	local source, dest
	if bUseMap1 then
		source = tHeightMap1
		dest = tHeightMap2
	else
		source = tHeightMap2
		dest = tHeightMap1
	end

	local sumEnergy = 0
	local energies = {}
	for i = 1, nPoints do
		local frac = (i - 1) / math.max(1, nPoints - 1)
		local energy = isMuted and 0 or sampleBand(frac)
		energy = math.max(0, energy) ^ tC.ExpScaleFactor
		energies[i] = energy
		sumEnergy = sumEnergy + energy
	end
	local meanDrive = (sumEnergy / math.max(1, nPoints)) * 0.55

	for i = 1, nPoints do
		dest[i] = dest[i] + (energies[i] - meanDrive)
		dest[i] = (source[clamp(i - 1, 1, nPoints)] + source[clamp(i + 1, 1, nPoints)]) / tC.Stiffness - dest[i]
		dest[i] = dest[i] - (dest[i] / tC.Spread)
	end

	local stepX = tC.Width / math.max(1, nPoints - 1)
	local strokePath = toCurve(dest, 0, tC.CenterY, tC.Amp, stepX, -tC.Scale, false)
	if tC.WaveTrail and tC.WavePrevPath then
		SKIN:Bang("!SetOption", "MeterWaterWaveTrail", "WaterTrailPath", tC.WavePrevPath)
	end
	tC.WavePrevPath = strokePath
	if tC.WaveDualTrace then
		local dualDest = {}
		for i = 1, nPoints do
			dualDest[i] = -dest[i] * 0.85
		end
		local dualPath = toCurve(dualDest, 0, tC.CenterY, tC.Amp, stepX, -tC.Scale, false)
		SKIN:Bang("!SetOption", "MeterWaterWaveDual", "WaterDualPath", dualPath)
	end
	SKIN:Bang("!SetOption", "MeterWaveBar", "WavePath", strokePath)
	if tC.Fill then
		local fillPath = toCurve(dest, 0, tC.CenterY, tC.Amp, stepX, -tC.Scale, true)
		SKIN:Bang("!SetOption", "MeterWaveBar", "WaveFillPath", fillPath)
	end
	bUseMap1 = not bUseMap1
	return 1
end
