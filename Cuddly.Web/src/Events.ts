import { Class, CombatRole, RaidDifficultyId, UnitId } from './wowUtilities';

export enum EventType {
    COMBAT_LOG_EVENT,
    HEALTH_UPDATE,
    MAX_HEALTH_UPDATE,
    CLASS_UPDATE,
    ENCOUNTER_TIMER,
    COMBAT_ROLE_UPDATE,
    POWER_UPDATE,
    ENCOUNTER_START,
    ENCOUNTER_END,
    BOSS_UPDATE
};

export interface Event {
    id: number;
    timestamp: string;
    type: EventType;
}

export type UnitGUID = string;

export interface CombatLogEvent extends Event {
    parameters: { [key: string]: string | number };
}

export interface EncounterTimer extends Event {
    text: string;
    duration: number;
    timeLeft: number;
    spellId?: number;
}

export interface EncounterStart extends Event {
    encounterId: number;
    encounterName: string;
    difficultyId: RaidDifficultyId;
}

export interface EncounterEnd extends Event {
    encounterId: number;
    success: boolean;
}

export interface UnitGUID_Value<T> {
    unitGUID: UnitGUID;
    value: T;
}

export interface EventForUnits<T> extends Event {
    units: Array<UnitGUID_Value<T>>;
}

export interface HealthUpdate extends EventForUnits<number> { }

export interface MaxHealthUpdate extends EventForUnits<number> { }

export interface ClassUpdate extends EventForUnits<Class> { }

export interface CombatRoleUpdate extends EventForUnits<CombatRole> { }

export interface PowerUpdate extends EventForUnits<number> { }

export interface BossUpdate extends EventForUnits<UnitId> { }