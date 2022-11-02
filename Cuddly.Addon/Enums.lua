local function ZeroBasedEnum(table)
    for i = 1, #table do
        local value = table[i]
        table[value] = i - 1
    end

    return table
end

CombatLogSubEvent = ZeroBasedEnum {
    "SPELL_CAST_SUCCESS",
    "SPELL_AURA_APPLIED"
}
CombatLogSubEventMap = {}
CombatLogSubEventMap["SPELL_CAST_SUCCESS"] = CombatLogSubEvent.SPELL_CAST_SUCCESS
CombatLogSubEventMap["SPELL_AURA_APPLIED"] = CombatLogSubEvent.SPELL_AURA_APPLIED

EventType = ZeroBasedEnum {
    "COMBAT_LOG_EVENT",
    "HEALTH_UPDATE",
    "MAX_HEALTH_UPDATE",
    "CLASS_UPDATE",
    "ENCOUNTER_TIMER",
    "COMBAT_ROLE_UPDATE",
    "POWER_UPDATE",
    "ENCOUNTER_START",
    "ENCOUNTER_END",
    "BOSS_UPDATE"
}

CombatRole = ZeroBasedEnum {
    "NONE",
    "DAMAGER",
    "TANK",
    "HEALER"
}
CombatRoleMap = {}
CombatRoleMap["NONE"] = CombatRole.NONE
CombatRoleMap["DAMAGER"] = CombatRole.DAMAGER
CombatRoleMap["TANK"] = CombatRole.TANK
CombatRoleMap["HEALER"] = CombatRole.HEALER

UnitId = ZeroBasedEnum {
    "boss1",
    "boss2",
    "boss3",
    "boss4",
    "boss5",
}
UnitIdMap = {}
UnitIdMap["boss1"] = UnitId.boss1
UnitIdMap["boss2"] = UnitId.boss2
UnitIdMap["boss3"] = UnitId.boss3
UnitIdMap["boss4"] = UnitId.boss4
UnitIdMap["boss5"] = UnitId.boss5