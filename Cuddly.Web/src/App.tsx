import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { Class, ClassColor } from './utilities';
import { clsx } from 'clsx';

enum EventType {
    COMBAT_LOG_EVENT,
    HEALTH_UPDATE,
    MAX_HEALTH_UPDATE,
    CLASS_UPDATE,
    ENCOUNTER_TIMER
};

interface Event {
    id: number;
    timestamp: string;
    type: EventType;
}

interface CombatLogEvent extends Event {
    parameters: { [key: string]: string | number };
}

interface EncounterTimer extends Event {
    text: string;
    duration: number;
}

interface UnitGUID_Value<T> {
    unitGUID: string;
    value: T;
}

interface EventForUnits<T> extends Event {
    units: Array<UnitGUID_Value<T>>;
}

interface HealthUpdate extends EventForUnits<number> { }

interface MaxHealthUpdate extends EventForUnits<number> { }

interface ClassUpdate extends EventForUnits<Class> { }

type UnitGUID = string;

function useSet<T>(initialSet = new Set<T>) {
    const [set, setSet] = useState(initialSet);

    return [
        set,
        (value: T) => setSet(set => new Set(set.add(value)))
    ] as const;
}

function useMap<K, V>(initialMap = new Map<K, V>()) {
    const [map, setMap] = useState(initialMap);

    return [
        map,
        (key: K, value: V) => setMap(map => new Map(map.set(key, value)))
    ] as const;
}

function useArray<T>(initialArray = new Array<T>()) {
    const [array, setArray] = useState(initialArray);

    return [
        array,
        (value: T) => setArray(array => [...array, value])
    ] as const;
}

export default function App() {

    const [unitGUIDs, addUnitGUID] = useSet<UnitGUID>();
    const [nameMap, setName] = useMap<UnitGUID, string>();
    const [classMap, setClass] = useMap<UnitGUID, Class>();
    const [maxHealthMap, setMaxHealth] = useMap<UnitGUID, number>();
    const [healthMap, setHealth] = useMap<UnitGUID, number>();
    const [shieldMap, setShield] = useMap<UnitGUID, number>();
    const [deadMap, setDead] = useMap<UnitGUID, boolean>();
    const [encounterTimerArray, setEncounterTimerArray] = useArray<Partial<EncounterTimer>>([
        {
            duration: 12,
            text: 'Sins'
        },
        {
            duration: 22,
            text: 'Bottles'
        },
        {
            duration: 33,
            text: 'Adds (1)'
        },
        {
            duration: 88,
            text: 'Focus Anima: Bottles (2)'
        }
    ]);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5015/events/consume')
            .withAutomaticReconnect()
            .build();

        connection.on('event', (event: Event) => {
            switch (event.type) {
                case EventType.COMBAT_LOG_EVENT:
                    const combatLogEvent = event as CombatLogEvent;

                    const {
                        sourceGUID, sourceName,
                        destGUID, destName
                    } = combatLogEvent.parameters;

                    if (sourceGUID && sourceName
                        && !nameMap.has(sourceGUID as UnitGUID)) {
                        addUnitGUID(sourceGUID as UnitGUID);
                        setName(sourceGUID as UnitGUID, sourceName as string);
                    }

                    if (destGUID && destName
                        && !nameMap.has(destGUID as UnitGUID)) {
                        addUnitGUID(destGUID as UnitGUID);
                        setName(destGUID as UnitGUID, destName as string);
                    }

                    break;

                case EventType.HEALTH_UPDATE:
                    const healthUpdate = event as HealthUpdate;

                    healthUpdate.units.forEach(u => {
                        addUnitGUID(u.unitGUID);
                        setHealth(u.unitGUID, u.value);
                    });

                    break;

                case EventType.MAX_HEALTH_UPDATE:
                    const maxHealthUpdate = event as MaxHealthUpdate;

                    maxHealthUpdate.units.forEach(u => {
                        addUnitGUID(u.unitGUID);
                        setMaxHealth(u.unitGUID, u.value);
                    });

                    break;

                case EventType.CLASS_UPDATE:
                    const classUpdate = event as ClassUpdate;

                    classUpdate.units.forEach(u => {
                        addUnitGUID(u.unitGUID);
                        setClass(u.unitGUID, u.value);
                    });

                    break;

                case EventType.ENCOUNTER_TIMER:
                    const latency = Date.now() - Number(event.timestamp) * 1000;
                    console.log('latency', latency);
                    setEncounterTimerArray(event as EncounterTimer)
                    break;
            }
        })

        connection.start();
    }, []);
    
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
                        </div>
                    ))}
                </div>
            </div>
            {encounterTimerArray.length && (
                <div
                    className="
                        grid
                        gap-x-1 gap-y-px
                        w-[375px]
                        m-2
                    "
                >
                    {encounterTimerArray.map(encounterTimer => (
                        <div
                            key={`${encounterTimer.id}-${encounterTimer.timestamp}`}
                            className="relative"
                        >
                            <div
                                className="
                                    absolute
                                    h-full
                                    bg-[#35478f]
                                "
                                style={{ width: '100%' }}
                            />
                            <div
                                className="
                                    relative
                                    flex
                                    py-1.5
                                    
                                    overflow-hidden
                                    text-sm
                                    text-white text-shadow
                                "
                            >
                                <div
                                    className="
                                        flex-1
                                        ml-1
                                        overflow-hidden
                                        text-ellipsis
                                        whitespace-nowrap
                                    "
                                >
                                    {encounterTimer.text}
                                </div>
                                <div
                                    className="mr-2"
                                >
                                    {encounterTimer.duration}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};