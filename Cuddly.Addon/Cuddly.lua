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

function zeroBasedEnum(table)
    for i = 1, #table do
        local value = table[i]
        table[value] = i - 1
    end

    return table
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

local function StringToBytes(str)
    local bytes = {}

    if str ~= nil then
        for i = 1, #str do
            bytes[i] = str:sub(i, i):byte()
        end
    end
    bytes[#bytes + 1] = 0

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

EventType = zeroBasedEnum {
    "COMBAT_LOG_EVENT",
    "HEALTH_UPDATE"
}

function UIParent:ADDON_LOADED(name)
    if name ~= "Cuddly" then
        return
    end

    C_Timer.NewTicker(0.5, function()
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

        local unitCount = 1

        append(IntegerToBytes(NextEventId()))
        append(TimestampToBytes(GetServerTime()))
        append(EventType.HEALTH_UPDATE)

        append(unitCount)
        -- TODO: for each unit
        append(StringToBytes(UnitGUID("player")))
        append(IntegerToBytes(UnitHealth("player")))
        
        RenderBytes(bytes)
    end)
end

function UIParent:COMBAT_LOG_EVENT_UNFILTERED(...)
    local timestamp, subEvent, hideCaster, sourceGUID, sourceName, sourceFlags, sourceRaidFlags, destGUID, destName, destFlags, destRaidFlags = ...
    -- if not string.startsWith(subEvent, "SPELL") then
    --     return
    -- end
    -- if not string.endsWith(subEvent, "_DAMAGE") or sourceName ~= "Minimumaddon" then
    --     return
    -- end
    -- if sourceName ~= "Minimumaddon" then
    --     return
    -- end
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

    elseif string.startsWith(subEvent, "RANGE")
        or string.startsWith(subEvent, "SPELL")
        or string.startsWith(subEvent, "SPELL_PERIODIC")
        or string.startsWith(subEvent, "SPELL_BUILDING") then
        spellId, spellName, spellSchool = select(i, ...)
        append(IntegerToBytes(spellId))
        append(StringToBytes(spellName))
        i = i + 3
    elseif string.startsWith(subEvent, "ENVIRONMENTAL") then
        i = i + 1
    end

    -- suffixes
    if string.endsWith(subEvent, "_DAMAGE") then
        local amount, overkill, school, resisted, blocked, asbsorbed, critical, glancing, crushing, isOffHand = select(i
            ,
            ...)
        append(IntegerToBytes(amount))
        append(IntegerToBytes(overkill > 0 and overkill or 0))
        append(IntegerToBytes(resisted))
        append(IntegerToBytes(blocked))
        append(IntegerToBytes(asbsorbed))
    end

    RenderBytes(bytes)
end

UIParent:RegisterEvent("ADDON_LOADED")
UIParent:RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED")

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
