import { useEffect } from 'react';
import { useArray, useEvents, useInterval, useSpellImageUrl } from '../Hooks';
import { EncounterTimer as EncounterTimerEvent, EventType } from '../Events';
import { Timer } from '../utilities';

interface EncounterTimer extends Timer {
    spellId?: number;
    text: string;
};

const EncounterTimers = () => {
    const timers = useArray<EncounterTimer>([
        {
            key: 1,
            duration: 33 * 1000,
            timeLeft: 33 * 1000,
            text: 'Adds (1)'
        },
        {
            key: 2,
            duration: 12 * 1000,
            timeLeft: 12 * 1000,
            text: 'Sins',
            spellId: 196718
        },
        {
            key: 3,
            duration: 88 * 1000,
            timeLeft: 88 * 1000,
            text: 'Focus Anima: Bottles (2)'
        },
        {
            key: 4,
            duration: 22 * 1000,
            timeLeft: 22 * 1000,
            text: 'Bottles',
            spellId: 196718
        }
    ]);

    const sort = (a: EncounterTimer, b: EncounterTimer) => a.timeLeft > b.timeLeft ? 0 : -1;

    useEffect(() => timers.hSort(sort), []);

    useEvents(event => {
        if (event.type != EventType.ENCOUNTER_TIMER)
            return;

        const encounterTimerEvent = event as EncounterTimerEvent;
        const { duration, spellId, text } = encounterTimerEvent;

        const timer = {
            key: `${event.id}-${event.timestamp}`,
            duration: 1000 * duration,
            timeLeft: 1000 * duration,
            spellId,
            text
        } as EncounterTimer;

        timers.hPush(timer);
        timers.hSort(sort);
    });

    const ms = 1000 / 60;
    useInterval(() => {
        timers.hReplace(timers => {
            timers.forEach(timer => {
                timer.timeLeft -= ms;
            });
            return timers;
        });
        timers.hFilter(timer => timer.timeLeft > 0);
    }, ms);

    return (
        <div
            className="
                grid
                gap-x-1 gap-y-px
                w-[300px]
                m-2
            "
        >
            {timers.map(timer => (
                <Bar
                    key={timer.key}
                    encounterTimer={timer}
                />
            ))}
        </div>
    );
};

const Bar = ({
    encounterTimer
}: {
    encounterTimer: EncounterTimer
}) => {
    const imageUrl = useSpellImageUrl(encounterTimer.spellId!);

    return (
        <div
            className="
                relative
                flex
            "
        >
            <img
                className="
                    min-h-full aspect-square
                    bg-lime-400
                "
                src={imageUrl}
                style={{ height: 0 }}
            />
            <div
                className="
                    relative
                    flex-1
                "
            >
                <div
                    className="
                        absolute
                        h-full
                        bg-[#35478f]
                    "
                    style={{ width: `${encounterTimer.timeLeft * 100 / encounterTimer.duration}%` }}
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
                        {Math.ceil(encounterTimer.timeLeft / 1000)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncounterTimers;