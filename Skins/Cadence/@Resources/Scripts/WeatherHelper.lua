-- WeatherHelper.lua
-- Maps Open-Meteo WMO weather codes and JSON captures into Cadence Weather variables,
-- icon codes (0..47 Rainmeter icon set), 4-day forecast strings, and Irena narrative prose.

local ThemeHelper = nil
local function getThemeHelper()
	if not ThemeHelper then
		ThemeHelper = dofile(SKIN:GetVariable("@") .. "Scripts\\ThemeHelper.lua")
	end
	return ThemeHelper
end

local WMO_MAP = {
	[0]  = { label = "Clear Sky",     day = 32, night = 31 },
	[1]  = { label = "Mainly Clear",  day = 34, night = 33 },
	[2]  = { label = "Partly Cloudy", day = 30, night = 29 },
	[3]  = { label = "Overcast",      day = 26, night = 26 },
	[45] = { label = "Foggy",         day = 20, night = 20 },
	[48] = { label = "Rime Fog",      day = 20, night = 20 },
	[51] = { label = "Light Drizzle", day = 9,  night = 9  },
	[53] = { label = "Drizzle",       day = 9,  night = 9  },
	[55] = { label = "Dense Drizzle", day = 9,  night = 9  },
	[56] = { label = "Freezing Mist", day = 8,  night = 8  },
	[57] = { label = "Freezing Rain", day = 10, night = 10 },
	[61] = { label = "Light Rain",    day = 11, night = 11 },
	[63] = { label = "Rain",          day = 12, night = 12 },
	[65] = { label = "Heavy Rain",    day = 40, night = 40 },
	[66] = { label = "Sleet",         day = 10, night = 10 },
	[67] = { label = "Freezing Rain", day = 10, night = 10 },
	[71] = { label = "Light Snow",    day = 14, night = 14 },
	[73] = { label = "Snowfall",      day = 16, night = 16 },
	[75] = { label = "Heavy Snow",    day = 41, night = 41 },
	[77] = { label = "Snow Grains",   day = 13, night = 13 },
	[80] = { label = "Rain Showers",  day = 39, night = 45 },
	[81] = { label = "Showers",       day = 11, night = 45 },
	[82] = { label = "Heavy Showers", day = 40, night = 40 },
	[85] = { label = "Snow Showers",  day = 14, night = 46 },
	[86] = { label = "Heavy Flurry",  day = 16, night = 46 },
	[95] = { label = "Thunderstorm",  day = 4,  night = 47 },
	[96] = { label = "Storm & Hail",  day = 38, night = 47 },
	[99] = { label = "Severe Storm",  day = 3,  night = 47 },
}

local function roundInt(v, fallback)
	local n = tonumber(v)
	if not n then return fallback or 0 end
	return math.floor(n + 0.5)
end

local WMO_VI = {
	[0] = "Trời quang", [1] = "Ít mây", [2] = "Có mây", [3] = "Nhiều mây",
	[45] = "Sương mù", [48] = "Sương giá",
	[51] = "Mưa phùn nhẹ", [53] = "Mưa phùn", [55] = "Mưa phùn dày",
	[56] = "Mưa băng nhẹ", [57] = "Mưa đóng băng",
	[61] = "Mưa nhẹ", [63] = "Có mưa", [65] = "Mưa to",
	[66] = "Mưa tuyết", [67] = "Mưa lạnh",
	[71] = "Tuyết nhẹ", [73] = "Tuyết rơi", [75] = "Tuyết dày", [77] = "Mưa tuyết hạt",
	[80] = "Mưa rào nhẹ", [81] = "Mưa rào", [82] = "Mưa rào lớn",
	[85] = "Mưa tuyết", [86] = "Bão tuyết",
	[95] = "Mưa giông", [96] = "Giông & Mưa đá", [99] = "Giông mạnh",
}

local VI_DAYS = { ["0"] = "CN", ["1"] = "T2", ["2"] = "T3", ["3"] = "T4", ["4"] = "T5", ["5"] = "T6", ["6"] = "T7" }

local function weekdayShort(dateStr)
	if not dateStr then return "---" end
	local y, m, d = dateStr:match("^(%d+)-(%d+)-(%d+)$")
	if not y then return "---" end
	local t = os.time({ year = tonumber(y), month = tonumber(m), day = tonumber(d), hour = 12 })
	if not t then return "---" end
	if SKIN:GetVariable("Language", "English") == "Vietnamese" then
		return VI_DAYS[os.date("%w", t)] or "---"
	end
	return string.upper(os.date("%a", t))
end

local function mapWmo(code, isDay)
	local c = tonumber(code) or 2
	local entry = WMO_MAP[c] or { label = "Partly Cloudy", day = 30, night = 29 }
	local icon = (tonumber(isDay) == 0) and entry.night or entry.day
	local label = entry.label
	if SKIN:GetVariable("Language", "English") == "Vietnamese" then
		label = WMO_VI[c] or "Có mây"
	end
	return label, tostring(icon)
end

local function applyIconTint()
	local pack = SKIN:GetVariable("WeatherIconPack", "dream")
	local useTint = tonumber(SKIN:GetVariable("WeatherTintIcon", "1")) == 1
	local theme = getThemeHelper().resolve(SKIN)
	local onCard = tonumber(SKIN:GetVariable("WeatherMode", "0")) == 0 and tonumber(SKIN:GetVariable("WeatherShowCardBg", "1")) == 1
	local untinted = onCard and theme.inkRgb or SKIN:GetVariable("TextColor", "255,255,255")
	local tintVal = ""
	if pack ~= "mond" then
		tintVal = useTint and SKIN:GetVariable("ActiveColor2", "199,154,224") or untinted
	end

	local iconMeters = {
		"MeterWIcon0", "MeterWIcon1",
		"MeterF1Icon", "MeterF2Icon", "MeterF3Icon", "MeterF4Icon"
	}
	for _, m in ipairs(iconMeters) do
		if SKIN:GetMeter(m) then
			SKIN:Bang("!SetOption", m, "ImageTint", tintVal)
		end
	end
end

local function urlEncode(str)
	return tostring(str or ""):gsub("([^%w%-_%.~])", function(c)
		return string.format("%%%02X", string.byte(c))
	end)
end

function Initialize()
	local resolved = SKIN:GetVariable("WeatherResolvedCity", "")
	if resolved == "" or resolved == "0" or resolved == "0.0" then
		SKIN:Bang("!SetVariable", "WeatherResolvedCity", SKIN:GetVariable("WeatherCity", "Ho Chi Minh City"))
	end
	getThemeHelper().syncCardVars(SKIN, tonumber(SKIN:GetVariable("WeatherShowCardBg", "1")) == 1)
	applyIconTint()
	local city = SKIN:GetVariable("WeatherCity", "Ho Chi Minh City")
	local geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" .. urlEncode(city) .. "&count=1&format=json"
	SKIN:Bang("!SetOption", "MeasureGeo", "Url", geoUrl)
	SKIN:Bang("!UpdateMeasure", "MeasureGeo")
	SKIN:Bang("!CommandMeasure", "MeasureGeo", "Update")
	SKIN:Bang("!UpdateMeterGroup", "WeatherIcons")
	SKIN:Bang("!Redraw")
end

function Update()
	getThemeHelper().syncCardVars(SKIN, tonumber(SKIN:GetVariable("WeatherShowCardBg", "1")) == 1)
	applyIconTint()
	SyncWeather()
	return 1
end

function OnGeoResolved()
	local mLat = SKIN:GetMeasure("MeasureGeoLat")
	local mLon = SKIN:GetMeasure("MeasureGeoLon")
	local lat = mLat and mLat:GetStringValue() or ""
	local lon = mLon and mLon:GetStringValue() or ""
	if tonumber(lat) and tonumber(lon) then
		local curLat = SKIN:GetVariable("WeatherLat", "")
		local curLon = SKIN:GetVariable("WeatherLon", "")
		local unitQuery = SKIN:GetVariable("WeatherUnitQuery", "celsius")
		local apiUrl = string.format(
			"https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=%s&wind_speed_unit=kmh&timezone=auto&forecast_days=5",
			lat, lon, unitQuery
		)
		if curLat ~= lat or curLon ~= lon then
			local varsPath = SKIN:GetVariable("@") .. "Variables.inc"
			SKIN:Bang("!WriteKeyValue", "Variables", "WeatherLat", lat, varsPath)
			SKIN:Bang("!WriteKeyValue", "Variables", "WeatherLon", lon, varsPath)
			SKIN:Bang("!SetVariable", "WeatherLat", lat)
			SKIN:Bang("!SetVariable", "WeatherLon", lon)
		end
		SKIN:Bang("!SetOption", "MeasureWeatherApi", "Url", apiUrl)
		SKIN:Bang("!UpdateMeasure", "MeasureWeatherApi")
		SKIN:Bang("!CommandMeasure", "MeasureWeatherApi", "Update")
		SKIN:Bang("!UpdateMeasure", "MeasureGeoName")
		SKIN:Bang("!UpdateMeter", "MeterWCity0")
		SKIN:Bang("!UpdateMeter", "MeterWCity1")
		SKIN:Bang("!Redraw")
	end
end

function SyncWeather()
	local raw = SKIN:GetMeasure("MeasureWeatherApi")
	if not raw then return end

	local function mVal(name, def)
		local m = SKIN:GetMeasure(name)
		if not m then return def end
		local s = m:GetStringValue()
		if not s or s == "" then return def end
		return s
	end

	local tempRaw = tonumber(mVal("MeasureWTempRaw", ""))
	if not tempRaw then
		applyIconTint()
		return
	end

	local temp = roundInt(tempRaw, 28)
	local hum = roundInt(mVal("MeasureWHumRaw", "65"), 65)
	local feels = roundInt(mVal("MeasureWFeelsRaw", temp), temp)
	local wind = roundInt(mVal("MeasureWWindRaw", "12"), 12)
	local isDay = roundInt(mVal("MeasureWIsDayRaw", "1"), 1)
	local code = roundInt(mVal("MeasureWCodeRaw", "2"), 2)

	local unit = SKIN:GetVariable("WeatherUnit", "C")
	local city = SKIN:GetVariable("WeatherResolvedCity", SKIN:GetVariable("WeatherCity", "Ho Chi Minh City"))
	local condLabel, iconCode = mapWmo(code, isDay)

	SKIN:Bang("!SetVariable", "WeatherTempNum", tostring(temp))
	SKIN:Bang("!SetVariable", "WeatherFeelsNum", tostring(feels))
	SKIN:Bang("!SetVariable", "WeatherWindNum", tostring(wind))
	SKIN:Bang("!SetVariable", "WeatherHumNum", tostring(hum))
	SKIN:Bang("!SetVariable", "WeatherIconCode", iconCode)
	if SKIN:GetVariable("Language", "English") ~= "Vietnamese" then
		SKIN:Bang("!SetVariable", "WeatherCondLabel", string.upper(condLabel))
		local enCity = (city == "TP. Hồ Chí Minh") and "Ho Chi Minh City" or city
		SKIN:Bang("!SetVariable", "WeatherResolvedCity", enCity)
	end

	-- Daily forecast indices 2..5 = tomorrow + next 3 days
	for idx = 1, 4 do
		local dIdx = idx + 1
		local dateStr = mVal("MeasureFD" .. dIdx .. "Date", "")
		local fCode = mVal("MeasureFD" .. dIdx .. "Code", "2")
		local fHi = roundInt(mVal("MeasureFD" .. dIdx .. "Hi", temp), temp)
		local fLo = roundInt(mVal("MeasureFD" .. dIdx .. "Lo", temp - 4), temp - 4)
		local _, fIcon = mapWmo(fCode, 1)

		SKIN:Bang("!SetVariable", "WeatherDay" .. idx .. "Name", weekdayShort(dateStr))
		SKIN:Bang("!SetVariable", "WeatherDay" .. idx .. "Icon", fIcon)
		SKIN:Bang("!SetVariable", "WeatherDay" .. idx .. "Hi", tostring(fHi))
		SKIN:Bang("!SetVariable", "WeatherDay" .. idx .. "Lo", tostring(fLo))
	end

	applyIconTint()
	SKIN:Bang("!UpdateMeterGroup", "WeatherData")
	SKIN:Bang("!UpdateMeterGroup", "WeatherIcons")
	SKIN:Bang("!Redraw")
end
