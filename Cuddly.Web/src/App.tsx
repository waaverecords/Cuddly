import { useSet, useMap, useEvents } from './Hooks';
import { Class, CombatRole, RaidDifficultyId, RaidFlag } from './wowUtilities';
import { ClassUpdate, CombatLogEvent, CombatRoleUpdate, EncounterStart, Event, EventType, HealthUpdate, MaxHealthUpdate, PowerUpdate, UnitGUID } from './Events';
import EncounterTimers from './widgets/EncounterTimers';
import HealersMana from './widgets/HealersMana';
import ActiveRaidCooldownTimers from './widgets/ActiveRaidCooldownTimers';
import { useState } from 'react';
import BossFrames from './widgets/BossFrames';
import Movable from './components/Movable';
import RaidFrames from './widgets/RaidFrames';

export default function App() {

    const unitGUIDs = useSet<UnitGUID>();
    const nameMap = useMap<UnitGUID, string>();
    const classMap = useMap<UnitGUID, Class>();
    const combatRoleMap = useMap<UnitGUID, CombatRole>();
    const raidFlagMap = useMap<UnitGUID, RaidFlag>();
    const maxHealthMap = useMap<UnitGUID, number>();
    const healthMap = useMap<UnitGUID, number>();
    const powerMap = useMap<UnitGUID, number>();
    const deadMap = useMap<UnitGUID, boolean>();
    const [raidDifficulty, setRaidDifficulty] = useState<RaidDifficultyId>();

    useEvents((event: Event) => {
        switch (event.type) {
            case EventType.COMBAT_LOG_EVENT:
                const combatLogEvent = event as CombatLogEvent;

                const {
                    sourceGUID, sourceName,
                    destGUID, destName,
                    sourceRaidFlags, destRaidFlags
                } = combatLogEvent.parameters;

                if (sourceGUID && sourceName
                    && !nameMap.has(sourceGUID as UnitGUID)) {
                    unitGUIDs.hSet(sourceGUID as UnitGUID);
                    nameMap.hSet(sourceGUID as UnitGUID, sourceName as string);
                }

                if (destGUID && destName
                    && !nameMap.has(destGUID as UnitGUID)) {
                    unitGUIDs.hSet(destGUID as UnitGUID);
                    nameMap.hSet(destGUID as UnitGUID, destName as string);
                }

                raidFlagMap.hDelete(sourceGUID as UnitGUID);
                raidFlagMap.hDelete(destGUID as UnitGUID);
                if (sourceRaidFlags)
                    raidFlagMap.hSet(sourceGUID as UnitGUID, sourceRaidFlags as RaidFlag);
                if (destRaidFlags)
                    raidFlagMap.hSet(destGUID as UnitGUID, destRaidFlags as RaidFlag);

                break;

            case EventType.HEALTH_UPDATE:
                const healthUpdate = event as HealthUpdate;

                healthUpdate.units.forEach(u => {
                    unitGUIDs.hSet(u.unitGUID);
                    healthMap.hSet(u.unitGUID, u.value);
                });

                break;

            case EventType.MAX_HEALTH_UPDATE:
                const maxHealthUpdate = event as MaxHealthUpdate;

                maxHealthUpdate.units.forEach(u => {
                    unitGUIDs.hSet(u.unitGUID);
                    maxHealthMap.hSet(u.unitGUID, u.value);
                });

                break;

            case EventType.CLASS_UPDATE:
                const classUpdate = event as ClassUpdate;

                classUpdate.units.forEach(u => {
                    unitGUIDs.hSet(u.unitGUID);
                    classMap.hSet(u.unitGUID, u.value);
                });

                break;

            case EventType.COMBAT_ROLE_UPDATE:
                const combatRoleUpdate = event as CombatRoleUpdate;

                combatRoleUpdate.units.forEach(u => {
                    unitGUIDs.hSet(u.unitGUID);
                    combatRoleMap.hSet(u.unitGUID, u.value);
                });

                break;

            case EventType.POWER_UPDATE:
                const powerUpdate = event as PowerUpdate;
                
                powerUpdate.units.forEach(u => {
                    unitGUIDs.hSet(u.unitGUID);
                    powerMap.hSet(u.unitGUID, u.value);
                });

                break;

            case EventType.ENCOUNTER_START:
                const encounterStart = event as EncounterStart;

                setRaidDifficulty(encounterStart.difficultyId);

                break;
        }
    });
    
    return (
        <div
            className="
                min-w-full min-h-screen
                bg-neutral-800
            "
        >
            <Movable>
                <RaidFrames
                    unitGUIDs={unitGUIDs}
                    nameMap={nameMap}
                    classMap={classMap}
                    healthMap={healthMap}
                    maxHealthMap={maxHealthMap}
                    raidFlagMap={raidFlagMap}
                />
            </Movable>
            <Movable>
                <ActiveRaidCooldownTimers
                    nameMap={nameMap}
                    classMap={classMap}
                />
            </Movable>
            <Movable
                name="encountertimers"
            >
                <EncounterTimers
                    raidDifficultyId={raidDifficulty}
                />
            </Movable>
            <Movable>
                <HealersMana
                    combatRoleMap={combatRoleMap}
                    nameMap={nameMap}
                    classMap={classMap}
                    powerMap={powerMap}
                />
            </Movable>
            <Movable
            >
                <BossFrames
                    nameMap={nameMap}
                    maxHealthMap={maxHealthMap}
                    healthMap={healthMap}
                />
            </Movable>
        </div>
    );
};