import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { Class, ClassColor } from './utilities';
import { clsx } from 'clsx';

enum EventType {
    COMBAT_LOG_EVENT,
    HEALTH_UPDATE,
    MAX_HEALTH_UPDATE
};

interface Event {
    id: number;
    timestamp: string;
    type: EventType;
}

interface UnitGUID_Value<T> {
    unitGUID: string;
    value: T;
}

interface HealthUpdate extends Event {
    units: Array<UnitGUID_Value<number>>;
}

interface MaxHealthUpdate extends HealthUpdate {};

interface CombatLogEvent extends Event {
    parameters: { [key: string]: string | number };
}

interface Unit {
    unitGUID: string;
    name?: string;
    class?: Class;
    maxHealth?: number;
    health?: number;
    shield?: number;
    isAlive: boolean;
};

const UNITS = new Array<Unit>(...[
    {
        unitGUID: 'player-G6E9N6A1',
        class: Class.Monk,
        maxHealth: 12369,
        health: 8956,
        isAlive: true
    },
    {
        unitGUID: 'Player-60-0E495C86',
        name: 'Minimumaddon',
        class: Class.Warrior,
        maxHealth: 80000,
        health: 8,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Carrymoredk',
        class: Class.DeathKnight,
        maxHealth: 100,
        health: 16,
        shield: 50,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Hola',
        class: Class.Priest,
        maxHealth: 15,
        health: 13,
        isAlive: true
    },
    {
        unitGUID: 'player-B6E9R6A4',
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Derp',
        maxHealth: 98,
        health: 41,
        shield: 38,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Rogumem',
        class: Class.Rogue,
        maxHealth: 10,
        health: 10,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Locksmith',
        class: Class.Warlock,
        maxHealth: 10,
        health: 5,
        shield: 2,
        isAlive: false
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'BonPun',
        class: Class.Warlock,
        maxHealth: 10,
        health: 8,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Oonthehunt',
        class: Class.Hunter,
        maxHealth: 12,
        health: 6,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Drood',
        class: Class.Druid,
        maxHealth: 12,
        health: 9,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Shuntheshaman',
        class: Class.Shaman,
        maxHealth: 12,
        health: 11,
        shield: 2,
        isAlive: true
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Query',
        class: Class.DemonHunter,
        maxHealth: 12,
        health: 9,
        isAlive: true
    }
]);

const unitGUID_name = new Map<string, string>();

export default function App() {

    const [units, setUnits] = useState(UNITS);

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
                        && !unitGUID_name.has(sourceGUID as string))
                        unitGUID_name.set(sourceGUID as string, sourceName as string);

                    if (destGUID && destName
                        && !unitGUID_name.has(destGUID as string))
                        unitGUID_name.set(destGUID as string, destName as string);

                    break;

                case EventType.HEALTH_UPDATE:
                    const healthUpdate = event as HealthUpdate;

                    // TODO: extract function
                    setUnits(units => {
                        healthUpdate.units.forEach(u => {
                            const unit = units.find(unit => unit.unitGUID == u.unitGUID);    
                            if (unit) unit.health = u.value;
                        });
                        return [...units];
                    })

                    break;

                case EventType.MAX_HEALTH_UPDATE:
                    const maxHealthUpdate = event as MaxHealthUpdate;

                    // TODO: extract function
                    setUnits(units => {
                        maxHealthUpdate.units.forEach(u => {
                            const unit = units.find(unit => unit.unitGUID == u.unitGUID);    
                            if (unit) unit.maxHealth = u.value;
                        });
                        return [...units];
                    })
                    break;
            }
        })

        connection.start();
    }, []);

    return (
        <div
            className="
                flow-root
                min-w-screen min-h-screen
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
                    {units.map(unit => (
                        <div
                            className="
                                flex
                                w-full h-full
                                relative
                            "
                        >
                            {unit.isAlive && (
                                <div
                                    className={clsx(
                                        `h-full`,
                                        !unit.class && 'bg-neutral-500',
                                        unit.class && `bg-[${ClassColor[unit.class]}]`
                                    )}
                                    style={{ width: unit.health != undefined && unit.maxHealth ? `${Math.min(unit.health / unit.maxHealth * 100, 100)}%` : '100%' }}
                                />
                            )}
                            {unit.shield && unit.isAlive && (
                                <div
                                    className="
                                        flex-1
                                        h-full
                                        bg-white opacity-80
                                    "
                                    style={{ maxWidth: unit.maxHealth && unit.shield ? `${unit.shield / unit.maxHealth * 100}%` : `` }}
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
                                    !unit.class && 'text-neutral-500',
                                    unit.class && `text-[${ClassColor[unit.class]}]`
                                )}
                            >
                                {unit.name || unit.unitGUID}
                            </div>
                            {!unit.isAlive && (
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
        </div>
    );
};