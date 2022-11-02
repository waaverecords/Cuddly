LogMap = {}
local function log(combatLogSubEvent, spellId)
    if LogMap[combatLogSubEvent] == nil then
        LogMap[combatLogSubEvent] = {}
    end

    if LogMap[combatLogSubEvent][spellId] == nil then
        LogMap[combatLogSubEvent][spellId] = true
    end
end

-- Druid
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 740) -- Tranquility

-- Paladin
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 31821) -- Aura Mastery

-- Priest
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 64843) -- Divine Hymm
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 62618) -- Power Word: Barrier

-- Monk
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 115310) -- Revival

-- Shaman
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 108280) -- Healing Tide Totem
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 16191) -- Mana Tide Totem
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 325174) -- Spirit Link Totem
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 2825) -- Bloodlust
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 32182) -- Heroism

-- Demon Hunter
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 196718) -- Darkness

-- Warrior
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 97462) -- Rallying Cry

-- Death Knight
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 51052) -- Anti-Magic Zone

-- Mage
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 80353) -- Time Warp

-- Evoker
log(CombatLogSubEvent.SPELL_CAST_SUCCESS, 390386) -- Fury of the Aspects