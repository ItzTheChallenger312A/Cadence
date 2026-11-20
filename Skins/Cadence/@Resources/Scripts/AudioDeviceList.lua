function Initialize()
	local a = 1
	for line in string.gmatch(SKIN:GetMeasure("MeasureAudioDeviceList"):GetStringValue(), "[^\n]+") do
		a = a + 1
		local b = 1
		for token in string.gmatch(line, "[^:]+") do
			if b ~= 1 then
				SKIN:Bang("!SetOption", "Rainmeter", "ContextTitle" .. a, token)
			else
				SKIN:Bang("!SetOption", "Rainmeter", "ContextAction" .. a, "[!WriteKeyValue Variables AudioDeviceID \"" .. token .. "\" \"#@#Variables.inc\"][!RefreshGroup Cadence][!DeactivateConfig]")
			end
			b = b + 1
		end
	end
end
