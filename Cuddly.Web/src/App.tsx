import { clsx } from 'clsx';
import { useSet, useMap, useEvents } from './Hooks';
import { Class, ClassColor, RaidFlag, RaidFlagImageUrlMap } from './utilities';
import { ClassUpdate, CombatLogEvent, Event, EventType, HealthUpdate, MaxHealthUpdate, UnitGUID } from './Events';
import EncounterTimers from './widgets/EncounterTimers';

export default function App() {

    const unitGUIDs = useSet<UnitGUID>();
    const nameMap = useMap<UnitGUID, string>();
    const classMap = useMap<UnitGUID, Class>();
    const raidFlagMap = useMap<UnitGUID, RaidFlag>();
    const maxHealthMap = useMap<UnitGUID, number>();
    const healthMap = useMap<UnitGUID, number>();
    const shieldMap = useMap<UnitGUID, number>();
    const deadMap = useMap<UnitGUID, boolean>();

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
        }
    });
    
    return (
        <div
            className="
                flex items-start
                min-w-full min-h-screen
                bg-neutral-800
            "
        >
            <div
                className="
                    w-[550px]
                    m-2 p-1
                    bg-black
                "
            >
                <div
                    className="
                        grid grid-cols-4 auto-rows-[65px]
                        gap-x-1 gap-y-px
                    "
                >
                    {Array.from(unitGUIDs).map(unitGUID => (
                        <div
                            key={unitGUID}
                            className="
                                flex
                                w-full h-full
                                relative
                            "
                        >
                            {!deadMap.get(unitGUID) && (
                                <div
                                    className={clsx(
                                        `h-full`,
                                        classMap.get(unitGUID) == undefined && 'bg-neutral-500',
                                        // @ts-ignore
                                        classMap.get(unitGUID) != undefined && `bg-[${ClassColor[Class[classMap.get(unitGUID)]]}]`
                                    )}
                                    style={{ width: healthMap.get(unitGUID) != undefined && maxHealthMap.get(unitGUID) ? `${Math.min(healthMap.get(unitGUID)! / maxHealthMap.get(unitGUID)! * 100, 100)}%` : '100%' }}
                                />
                            )}
                            {shieldMap.get(unitGUID) && !deadMap.get(unitGUID) && (
                                <div
                                    className="
                                        flex-1
                                        h-full
                                        bg-white opacity-80
                                    "
                                    style={{ maxWidth: maxHealthMap.get(unitGUID) && shieldMap.get(unitGUID) ? `${shieldMap.get(unitGUID)! / maxHealthMap.get(unitGUID)! * 100}%` : `` }}
                                >
                                </div>
                            )}
                            <div
                                className={clsx(
                                    `
                                        absolute
                                        left-1/2 top-1/2
                                        -translate-x-1/2 -translate-y-1/2
                                        text-xs text-shadow
                                    `,
                                    classMap.get(unitGUID) == undefined && 'text-neutral-500',
                                    // @ts-ignore
                                    classMap.get(unitGUID) != undefined && `text-[${ClassColor[Class[classMap.get(unitGUID)]]}]`
                                )}
                            >
                                {nameMap.get(unitGUID) || unitGUID}
                            </div>
                            {deadMap.get(unitGUID) && (
                                <div
                                    className="
                                        absolute
                                        left-1/2 top-3/4
                                        -translate-x-1/2
                                        text-[0.6rem] text-white
                                    "
                                >
                                    Dead
                                </div>
                            )}
                            {raidFlagMap.get(unitGUID) && (
                                <div
                                    className="
                                        absolute
                                        left-1/2 top-0
                                        -translate-x-1/2 -translate-y-[10px]
                                    "
                                >
                                    <img
                                        className="w-[35px]"
                                        src={RaidFlagImageUrlMap.get(raidFlagMap.get(unitGUID)!)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <EncounterTimers />
        </div>
    );
};