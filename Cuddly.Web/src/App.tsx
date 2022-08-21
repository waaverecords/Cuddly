import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { Class, ClassColor } from './utilities';
import { clsx } from 'clsx';

interface Player {
    unitGUID: string;
    name?: string;
    class?: Class;
    maxHealth?: number;
    health?: number;
    shield?: number;
    isAlive: boolean;
};

const players = new Array<Player>(...[
    {
        unitGUID: 'player-G6E9N6A1',
        class: Class.Monk,
        maxHealth: 12369,
        health: 8956,
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
    },
]);

export default function App() {

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5015/combatLog/consume')
            .build();

        connection.on('event', event => {
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
                    {players.map(player => (
                        <div
                            className="
                                flex
                                w-full h-full
                                relative
                            "
                        >
                            {player.isAlive && (
                                <div
                                    className={clsx(
                                        `h-full`,
                                        !player.class && 'bg-neutral-500',
                                        player.class && `bg-[${ClassColor[player.class]}]`
                                    )}
                                    style={{ width: player.health != undefined && player.maxHealth ? `${Math.min(player.health / player.maxHealth * 100, 100)}%` : '100%' }}
                                />
                            )}
                            {player.shield && player.isAlive && (
                                <div
                                    className="
                                        flex-1
                                        h-full
                                        bg-white opacity-80
                                    "
                                    style={{ maxWidth: player.maxHealth && player.shield ? `${player.shield / player.maxHealth * 100}%` : `` }}
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
                                    !player.class && 'text-neutral-500',
                                    player.class && `text-[${ClassColor[player.class]}]`
                                )}
                            >
                                {player.name || player.unitGUID}
                            </div>
                            {!player.isAlive && (
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