import { useArray, useEvents, useInterval } from '../Hooks';
import { EncounterTimer, EventType } from '../Events';

const EncounterTimers = () => {
    const [timerArray, addToTimerArray, filterTimerArray] = useArray<EncounterTimer>([
        {
            id: 1,
            timestamp: '166565556',
            duration: 12 * 1000,
            timeLeft: 12 * 1000,
            text: 'Sins',
            type: EventType.ENCOUNTER_TIMER
        },
        {
            id: 2,
            timestamp: '166565556',
            duration: 22 * 1000,
            timeLeft: 22 * 1000,
            text: 'Bottles',
            type: EventType.ENCOUNTER_TIMER
        },
        {
            id: 3,
            timestamp: '166565556',
            duration: 33 * 1000,
            timeLeft: 33 * 1000,
            text: 'Adds (1)',
            type: EventType.ENCOUNTER_TIMER
        },
        {
            id: 4,
            timestamp: '166565556',
            duration: 88 * 1000,
            timeLeft: 88 * 1000,
            text: 'Focus Anima: Bottles (2)',
            type: EventType.ENCOUNTER_TIMER
        }
    ]);

    useEvents(event => {
        if (event.type == EventType.ENCOUNTER_TIMER) {
            
            const encounterTimerEvent = event as EncounterTimer;
            encounterTimerEvent.duration *= 1000;
            encounterTimerEvent.timeLeft = encounterTimerEvent.duration;

            addToTimerArray(encounterTimerEvent);
        }
    });

    const ms = 1000 / 60;
    useInterval(() => {
        timerArray.forEach(timer => {
            timer.timeLeft -= ms;
        });
        filterTimerArray(timer => timer.timeLeft > 0);
    }, ms);

    return (
        <div
            className="
                grid
                gap-x-1 gap-y-px
                w-[375px]
                m-2
            "
        >
            {timerArray.map(encounterTimer => (
                <Bar
                    key={`${encounterTimer.id}-${encounterTimer.timestamp}`}
                    encounterTimer={encounterTimer}
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
    return (
        <div
            className="relative"
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
    );
};

export default EncounterTimers;