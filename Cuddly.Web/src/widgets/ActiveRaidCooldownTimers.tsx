import clsx from "clsx";
import AuraIconTimer from "../components/AuraIconTimer";
import { CombatLogEvent, EventType, UnitGUID } from "../Events";
import { HookedMap, useArray, useEvents, useInterval } from "../Hooks";
import { Timer } from "../utilities";
import { Class, ClassColor, CombatLogEvent as CombatLogEventType, SpellInfoMap } from "../wowUtilities";

interface ActiveRaidCooldownTimer extends Timer {
    spellId: number;
    caster: UnitGUID;
}

interface Props {
    nameMap: HookedMap<UnitGUID, string>;
    classMap: HookedMap<UnitGUID, Class>;
}

const ActiveRaidCooldownTimers = ({
    nameMap,
    classMap
}: Props) => {
    const timers = useArray<ActiveRaidCooldownTimer>([
        {
            duration: 1000 * 20,
            timeLeft: 1000 * 15,
            spellId: 108280,
            caster: 'gg',
            key: 1
        },
        {
            duration: 1000 * 10,
            timeLeft: 1000 * 2.5,
            spellId: 740,
            caster: 'druidmr',
            key: 2
        }
    ]);

    useEvents(event => {
        if (event.type != EventType.COMBAT_LOG_EVENT)
            return;

        const combatLogEvent = event as CombatLogEvent;
        const { subEvent, spellId, sourceGUID } = combatLogEvent.parameters;

        if (subEvent != CombatLogEventType.SPELL_CAST_SUCCESS)
            return;

        if (![
                740, 31821, 64843, 62618, 115310, 108280, 16191, 16191,
                98008, 2825, 32182, 196718, 97462, 51052, 80353, 390386
            ].includes(spellId as number))
            return;

        const duration = SpellInfoMap.get(spellId as number)?.duration || 10;

        const timer = {
            key: `${event.id}-${event.timestamp}`,
            duration: 1000 * duration,
            timeLeft: 1000 * duration,
            spellId,
            caster: sourceGUID
        } as ActiveRaidCooldownTimer;

        timers.hPush(timer);
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
                            classMap.get(timer.caster) == undefined && 'text-neutral-500',
                            // @ts-ignore
                            classMap.get(timer.caster) != undefined && `text-[${ClassColor[Class[classMap.get(timer.caster)]]}]`
                        )}
                    >
                        {nameMap.get(timer.caster) || timer.caster}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveRaidCooldownTimers;