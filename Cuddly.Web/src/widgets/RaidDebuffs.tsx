import clsx from "clsx";
import AuraIconTimer from "../components/AuraIconTimer";
import { CombatLogEvent, EventType, UnitGUID } from "../Events";
import { HookedMap, useArray, useEvents, useInterval } from "../Hooks";
import { Timer } from "../utilities";
import { Class, ClassColor, CombatLogEvent as CombatLogEventType, SpellInfoMap } from "../wowUtilities";

interface RaidDebuff extends Partial<Timer> {
    spellId: number;
    afflicted: UnitGUID;
}

interface Props {
    nameMap: HookedMap<UnitGUID, string>;
    classMap: HookedMap<UnitGUID, Class>;
}

const RaidDebuffs = ({
    nameMap,
    classMap
}: Props) => {
    const timers = useArray<RaidDebuff>([
        {
            spellId: 370597,
            duration: 1000 * 20,
            timeLeft: 1000 * 15,
            afflicted: 'Player-x6546x4',
            key: 1
        },
        {
            duration: 1000 * 10,
            timeLeft: 1000 * 2.5,
            spellId: 390715,
            afflicted: 'Player-hrt5y7u5',
            key: 2
        }
    ]);

    useEvents(event => {
        if (event.type != EventType.COMBAT_LOG_EVENT)
            return;

        const combatLogEvent = event as CombatLogEvent;
        const { subEvent, spellId, destGUID } = combatLogEvent.parameters;
        console.log(spellId);
        switch (subEvent)
        {
            case CombatLogEventType.SPELL_AURA_APPLIED:
                var duration = SpellInfoMap.get(spellId as number)?.duration;
                duration = duration != undefined ? 1000 * duration : undefined;

                const timer = {
                    key: `${event.id}-${event.timestamp}`,
                    duration,
                    timeLeft: duration,
                    spellId,
                    afflicted: destGUID
                } as RaidDebuff;

                timers.hPush(timer);
            break;

            case CombatLogEventType.SPELL_AURA_REMOVED:
                timers.hFilter(timer =>
                    timer.spellId != spellId
                    && timer.afflicted != destGUID
                );
            break;
        }
    });

    const ms = 1000 / 60;
    useInterval(() => {
        timers.hReplace(timers => {
            timers.forEach(timer => {
                if (!timer.timeLeft)
                    return;

                timer.timeLeft -= ms;
            });
            return timers;
        });
        timers.hFilter(timer => timer.timeLeft == undefined || timer.timeLeft > 0);
    }, ms);

    return (
        <div
            className="flex flex-col gap-2"
        >
            {timers.map(timer => (
                <div
                    className="
                        flex items-center
                        gap-4
                        text-xl
                    "
                    key={timer.key}
                >
                    <AuraIconTimer
                        spellId={timer.spellId}
                        duration={timer.duration}
                        timeLeft={timer.timeLeft}
                    />
                    <div
                        className={clsx(
                            classMap.get(timer.afflicted) == undefined && 'text-neutral-500',
                            // @ts-ignore
                            classMap.get(timer.afflicted) != undefined && `text-[${ClassColor[Class[classMap.get(timer.afflicted)]]}]`
                        )}
                    >
                        {nameMap.get(timer.afflicted) || timer.afflicted}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RaidDebuffs;