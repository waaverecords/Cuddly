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
};

const players = new Array<Player>(...[
    {
        unitGUID: 'player-G6E9N6A1',
        class: Class.Monk,
        maxHealth: 12369,
        health: 8956
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Carrymoredk',
        class: Class.DeathKnight,
        maxHealth: 5654654,
        health: 565465
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Hola',
        class: Class.Priest,
        maxHealth: 15,
        health: 13
    },
    {
        unitGUID: 'player-B6E9R6A4',
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Hola',
        maxHealth: 98,
        health: 41
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Rogumem',
        class: Class.Rogue,
        maxHealth: 10,
        health: 10
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'Locksmith',
        class: Class.Warlock,
        maxHealth: 10,
        health: 9
    },
    {
        unitGUID: 'player-G6E9N6A1',
        name: 'BonPun',
        class: Class.Warlock,
        maxHealth: 10,
        health: 8
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
                                w-full h-full
                                relative
                            "
                        >
                            <div
                                className={clsx(
                                    `h-full`,
                                    !player.class && 'bg-neutral-500',
                                    player.class && `bg-[${ClassColor[player.class]}]`
                                )}
                                style={{ width: player.health && player.maxHealth ? `${Math.min(player.health / player.maxHealth * 100, 100)}%` : '100%' }}
                            />
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};