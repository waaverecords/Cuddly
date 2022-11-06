local addonName = ...
Cuddly = {}

SLASH_RELOAD1 = "/rl"
local function ReloadHandler()
    C_UI.Reload()
end

SlashCmdList["RELOAD"] = ReloadHandler



function string.startsWith(str, startStr)
    return string.sub(str, 1, startStr:len()) == startStr
end

function string.endsWith(str, endStr)
    return string.sub(str, -endStr:len(), str:len()) == endStr
end

local function IntegerToBytes(i)
    if i == nil then
        return { 0, 0, 0 }
    end
    local b = i % 256
    i = math.floor(i / 256)
    local g = i % 256
    i = math.floor(i / 256)
    local r = i % 256

    return { r, g, b }
end

local function TimestampToBytes(timestamp)
    local i = math.floor(timestamp)
    local f = math.floor((timestamp - i) * 1000 + 0.5) -- TODO: why + 0.5

    -- integer
    local a = i % 256
    i = math.floor(i / 256)
    local b = i % 256
    i = math.floor(i / 256)
    local c = i % 256
    i = math.floor(i / 256)
    local d = i % 256

    -- fractional
    local e = f % 256
    f = math.floor(f / 256)
    f = f % 256

    return {
        d, c, b,
        a, f, e
    }
end

local stringToBytesCache = {}
local function StringToBytes(str)
    if str == nil then
        return { 0 }
    end

    if stringToBytesCache[str] ~= nil then
        return stringToBytesCache[str]
    end

    local bytes = {}
    for i = 1, #str do
        bytes[i] = str:sub(i, i):byte()
    end
    bytes[#bytes + 1] = 0

    stringToBytesCache[str] = bytes
    
    return bytes;
end

local physicalWidth, physicalHeight = GetPhysicalScreenSize()

local UIParent = CreateFrame("Frame", "CuddlyParent", nil)
UIParent:SetFrameStrata("TOOLTIP")
UIParent:SetFrameLevel(10000)
UIParent:SetAllPoints()
UIParent:SetScale(UIParent:GetWidth() / physicalWidth)

local frames = {}
local pixelsPerEvent = 80
local eventCount = 170
-- there's a limit on how many frames you can create (~16000)
for j = 1, eventCount do
    frames[j] = {}

    for i = 1, pixelsPerEvent do
        local frame = CreateFrame("Frame", nil, UIParent)
        frame:SetPoint("TOP", -1 + j + 0.5, -i + 1) -- + 0.5 to make pixel perferct
        frame:SetSize(1, 1)
        frame.tex = frame:CreateTexture()
        frame.tex:SetAllPoints(frame)
        frame.tex:SetColorTexture(1, 0, 0)

        frames[j][i] = frame
    end
end

local eventIndex = 1
local function RenderBytes(bytes)
    for i = 1, math.ceil(#bytes / 3) do
        local bi = (i - 1) * 3

        frames[eventIndex][i].tex:SetColorTexture(
            bytes[bi + 1] / 255,
            (bytes[bi + 2] or 0) / 255,
            (bytes[bi + 3] or 0) / 255
        )
    end
    eventIndex = (eventIndex % eventCount) + 1
end

local eventId = 0
local function NextEventId()
    eventId = (eventId % 16777216) + 1
    return eventId
end

local function OnBigWigsEvent(event, ...)
    -- TODO: extract as class / object
    local bytes = {}
    local function append(otherBytes)
        if type(otherBytes) == "table" then
            for i = 1, #otherBytes do
                bytes[#bytes + 1] = otherBytes[i]
            end
            return
        end

        bytes[#bytes + 1] = otherBytes
    end

    if event == "BigWigs_StartBar" then
        local addon, spellId, text, duration, icon = ...
        
        append(IntegerToBytes(NextEventId()))
        append(TimestampToBytes(GetServerTime()))
        append(EventType.ENCOUNTER_TIMER)
        
        append(StringToBytes(text))
        append(IntegerToBytes(duration))
        append(IntegerToBytes(type(spellId) ~= "string" and spellId or 0))

        RenderBytes(bytes)
    end
end

function UIParent:ADDON_LOADED(name)
    if name ~= addonName then
        return
    end

    if BigWigsLoader then
        BigWigsLoader.RegisterMessage(Cuddly, 'BigWigs_StartBar', OnBigWigsEvent)
        -- BigWigsLoader.RegisterMessage(Cuddly, "BigWigs_StopBar", OnBigWigsEvent)
        -- BigWigsLoader.RegisterMessage(Cuddly, "BigWigs_StopBars", OnBigWigsEvent)
        -- BigWigsLoader.RegisterMessage(Cuddly, "BigWigs_OnBossDisable", OnBigWigsEvent)
        -- BigWigsLoader.RegisterMessage(Cuddly, "BigWigs_PauseBar", OnBigWigsEvent)
        -- BigWigsLoader.RegisterMessage(Cuddly, "BigWigs_ResumeBar", OnBigWigsEvent)
    end
    
    -- HEALTH_UPDATE
    C_Timer.NewTicker(1, function()
        if not IsInRaid() then
            return
        end

        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        local i = 1
        while i <= 45 do

            bytes = {}

            append(IntegerToBytes(NextEventId()))
            append(TimestampToBytes(GetServerTime()))
            append(EventType.HEALTH_UPDATE)

            local unitCount = 0
            append(unitCount)
            local byteIndex = #bytes

            while unitCount < 8 and i <= 40 do

                local name = GetRaidRosterInfo(i)
                if name ~= nil then

                    local unit = "raid" .. i
                    append(StringToBytes(UnitGUID(unit)))
                    append(IntegerToBytes(UnitHealth(unit)))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            while unitCount < 8 and i > 40 and i <= 45 do
                local unit = "boss".. i - 40
                local unitGUID = UnitGUID(unit)
                
                if unitGUID ~= nil then
                    append(StringToBytes(unitGUID))
                    append(IntegerToBytes(UnitHealth(unit)))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            if unitCount > 0 then
                bytes[byteIndex] = unitCount
                RenderBytes(bytes)
            end
        end
    end)

    -- MAX_HEALTH_UPDATE
    C_Timer.NewTicker(2, function()
        if not IsInRaid() then
            return
        end
        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        local i = 1
        while i <= 45 do

            bytes = {}

            append(IntegerToBytes(NextEventId()))
            append(TimestampToBytes(GetServerTime()))
            append(EventType.MAX_HEALTH_UPDATE)

            local unitCount = 0
            append(unitCount)
            local byteIndex = #bytes

            while unitCount < 8 and i <= 40 do

                local name = GetRaidRosterInfo(i)
                if name ~= nil then

                    local unit = "raid" .. i
                    append(StringToBytes(UnitGUID(unit)))
                    append(IntegerToBytes(UnitHealthMax(unit)))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            while unitCount < 8 and i > 40 and i <= 45 do
                local unit = "boss".. i - 40
                local unitGUID = UnitGUID(unit)
                
                if unitGUID ~= nil then
                    append(StringToBytes(unitGUID))
                    append(IntegerToBytes(UnitHealthMax(unit)))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            if unitCount > 0 then
                bytes[byteIndex] = unitCount
                RenderBytes(bytes)
            end
        end
    end)

    -- CLASS_UPDATE
    C_Timer.NewTicker(10, function()
        if UnitAffectingCombat("player") or not IsInRaid() then
            return
        end

        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        local i = 1
        while i <= 40 do

            bytes = {}

            append(IntegerToBytes(NextEventId()))
            append(TimestampToBytes(GetServerTime()))
            append(EventType.CLASS_UPDATE)

            local unitCount = 0
            append(unitCount)
            local byteIndex = #bytes

            while unitCount < 9 and i <= 40 do

                local name = GetRaidRosterInfo(i)
                if name ~= nil then

                    local unit = "raid" .. i
                    append(StringToBytes(UnitGUID(unit)))
                    append(IntegerToBytes(select(3, UnitClass(unit)) - 1))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            if unitCount > 0 then
                bytes[byteIndex] = unitCount
                RenderBytes(bytes)
            end
        end
    end)

    -- COMBAT_ROLE_UPDATE
    C_Timer.NewTicker(10, function()
        if UnitAffectingCombat("player") or not IsInRaid() then
            return
        end

        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        local i = 1
        while i <= 40 do

            bytes = {}

            append(IntegerToBytes(NextEventId()))
            append(TimestampToBytes(GetServerTime()))
            append(EventType.COMBAT_ROLE_UPDATE)

            local unitCount = 0
            append(unitCount)
            local byteIndex = #bytes

            while unitCount < 9 and i <= 40 do

                local name, rank, subgroup, level, class, fileName, zone, online, isDead, role, isML, combatRole = GetRaidRosterInfo(i)
                if name ~= nil then

                    local unit = "raid" .. i
                    append(StringToBytes(UnitGUID(unit)))
                    append(CombatRoleMap[combatRole])
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            if unitCount > 0 then
                bytes[byteIndex] = unitCount
                RenderBytes(bytes)
            end
        end
    end)

    -- POWER_UPDATE
    C_Timer.NewTicker(2, function()
        if not IsInRaid() then
            return
        end

        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        local i = 1
        while i <= 40 do

            bytes = {}

            append(IntegerToBytes(NextEventId()))
            append(TimestampToBytes(GetServerTime()))
            append(EventType.POWER_UPDATE)

            local unitCount = 0
            append(unitCount)
            local byteIndex = #bytes

            while unitCount < 9 and i <= 40 do

                local name, rank, subgroup, level, class, fileName, zone, online, isDead, role, isML, combatRole = GetRaidRosterInfo(i)
                if name ~= nil and CombatRoleMap[combatRole] == CombatRole.HEALER then

                    local unit = "raid" .. i
                    append(StringToBytes(UnitGUID(unit)))
                    append(IntegerToBytes(UnitPower(unit, 0)))
                    unitCount = unitCount + 1
                end

                i = i + 1
            end

            if unitCount > 0 then
                bytes[byteIndex] = unitCount
                RenderBytes(bytes)
            end
        end
    end)

    -- BOSS_UPDATE
    C_Timer.NewTicker(5, function()
        if not UnitAffectingCombat("player") and not IsInRaid() then
            return
        end

        -- TODO: extract as class / object
        local bytes = {}
        local function append(otherBytes)
            if type(otherBytes) == "table" then
                for i = 1, #otherBytes do
                    bytes[#bytes + 1] = otherBytes[i]
                end
                return
            end

            bytes[#bytes + 1] = otherBytes
        end

        append(IntegerToBytes(NextEventId()))
        append(TimestampToBytes(GetServerTime()))
        append(EventType.BOSS_UPDATE)
        
        local unitCount = 0
        append(unitCount)
        local byteIndex = #bytes

        for i = 1, 5 do
            local unit = "boss"..i
            local unitGUID = UnitGUID(unit)
            
            if unitGUID ~= nil then
                append(StringToBytes(unitGUID))
                append(IntegerToBytes(UnitIdMap[unit]))
                unitCount = unitCount + 1
            end
        end

        if unitCount > 0 then
            bytes[byteIndex] = unitCount
            RenderBytes(bytes)
        end
    end)
end

function UIParent:ENCOUNTER_START(encounterId, encounterName, difficultyId)
    -- TODO: extract as class / object
    local bytes = {}
    local function append(otherBytes)
        if type(otherBytes) == "table" then
            for i = 1, #otherBytes do
                bytes[#bytes + 1] = otherBytes[i]
            end
            return
        end

        bytes[#bytes + 1] = otherBytes
    end

    append(IntegerToBytes(NextEventId()))
    append(TimestampToBytes(GetServerTime()))
    append(EventType.ENCOUNTER_START)
    
    append(IntegerToBytes(encounterId))
    append(StringToBytes(encounterName))
    append(IntegerToBytes(difficultyId))

    RenderBytes(bytes)
end

function UIParent:ENCOUNTER_END(encounterId, _, _, _, success)
    -- TODO: extract as class / object
    local bytes = {}
    local function append(otherBytes)
        if type(otherBytes) == "table" then
            for i = 1, #otherBytes do
                bytes[#bytes + 1] = otherBytes[i]
            end
            return
        end

        bytes[#bytes + 1] = otherBytes
    end

    append(IntegerToBytes(NextEventId()))
    append(TimestampToBytes(GetServerTime()))
    append(EventType.ENCOUNTER_END)
    
    append(IntegerToBytes(encounterId))
    append(success)

    RenderBytes(bytes)
end

function UIParent:COMBAT_LOG_EVENT_UNFILTERED(...)
    local timestamp, subEvent, hideCaster, sourceGUID, sourceName, sourceFlags, sourceRaidFlags, destGUID, destName, destFlags, destRaidFlags = ...
    -- if not string.startsWith(subEvent, "SPELL") then
    --     return
    -- end
    -- if not string.startsWith(subEvent, "SPELL") or sourceName ~= "Adateknight" then
    --     return
    -- end
    -- if sourceName ~= "Adateknight" then
    --     return
    -- end

    if not LogMap[CombatLogSubEventMap[subEvent]] then
        return
    end

    if string.startsWith(subEvent, "RANGE")
        or string.startsWith(subEvent, "SPELL")
        or string.startsWith(subEvent, "SPELL_PERIODIC")
        or string.startsWith(subEvent, "SPELL_BUILDING") then
        local spellId = select(12, ...)

        if not LogMap[CombatLogSubEvent[subEvent]] or not LogMap[CombatLogSubEvent[subEvent]][spellId] then
            return
        end
    end

    -- TODO: extract as class / object
    local bytes = {}
    local function append(otherBytes)
        if type(otherBytes) == "table" then
            for i = 1, #otherBytes do
                bytes[#bytes + 1] = otherBytes[i]
            end
            return
        end

        bytes[#bytes + 1] = otherBytes
    end

    append(IntegerToBytes(NextEventId()))
    append(TimestampToBytes(timestamp))
    append(EventType.COMBAT_LOG_EVENT)

    append(StringToBytes(subEvent))
    append(StringToBytes(sourceGUID))
    append(StringToBytes(sourceName))
    append(StringToBytes(destGUID))
    append(StringToBytes(destName))
    append(sourceRaidFlags)
    append(destRaidFlags)

    local spellId, spellName, spellSchool
    local i = 12

    -- special events
    if subEvent == "DAMAGE_SPLIT"
        or subEvent == "DAMAGE_SHIELD"
        or subEvent == "DAMAGE_SHIELD_MISSED" then

    elseif subEvent == "ENCHANT_APPLIED"
        or subEvent == "ENCHANT_REMOVED" then

    elseif subEvent == "PARTY_KILL" then

    elseif subEvent == "UNIT_DIED"
        or subEvent == "UNIT_DESTROYED"
        or subEvent == "UNIT_DISSIPATES" then

    end

    -- prefixes
    if string.startsWith(subEvent, "SWING") then
    elseif subEvent == "SPELL_ABSORBED" then

    elseif string.startsWith(subEvent, "RANGE")
        or string.startsWith(subEvent, "SPELL")
        or string.startsWith(subEvent, "SPELL_PERIODIC")
        or string.startsWith(subEvent, "SPELL_BUILDING") then
        local spellId, spellName, spellSchool = select(i, ...)
        append(IntegerToBytes(spellId))
        append(StringToBytes(spellName))
        i = i + 3
    elseif string.startsWith(subEvent, "ENVIRONMENTAL") then
        i = i + 1
    end

    -- suffixes
    if string.endsWith(subEvent, "_DAMAGE") then
        local amount, overkill, school, resisted, blocked, asbsorbed, critical, glancing, crushing, isOffHand = select(i, ...)
        append(IntegerToBytes(amount))
        append(IntegerToBytes(overkill > 0 and overkill or 0))
        append(IntegerToBytes(resisted))
        append(IntegerToBytes(blocked))
        append(IntegerToBytes(asbsorbed))
    elseif string.endsWith(subEvent, "_AURA_APPLIED_DOSE")
        or string.endsWith(subEvent, "_AURA_REMOVED_DOSE") then
        local auraType, amount = select(i, ...)
        append(amount)
    end

    RenderBytes(bytes)
end

UIParent:RegisterEvent("ADDON_LOADED")
UIParent:RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED")
UIParent:RegisterEvent("ENCOUNTER_START")
UIParent:RegisterEvent("ENCOUNTER_END")

UIParent:SetScript(
    "OnEvent",
    function(self, event, ...)

        if event == "COMBAT_LOG_EVENT_UNFILTERED" then
            self:COMBAT_LOG_EVENT_UNFILTERED(CombatLogGetCurrentEventInfo())
            return
        end

        self[event](self, ...)
    end
)