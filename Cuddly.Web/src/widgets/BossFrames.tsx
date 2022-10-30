import { BossUpdate, EventType, UnitGUID } from "../Events";
import { HookedMap, useEvents, useMap } from "../Hooks";
import { RaidFlag, RaidFlagImageUrlMap, UnitId } from "../wowUtilities";

interface Props {
    nameMap: HookedMap<UnitGUID, string>;
    maxHealthMap: HookedMap<UnitGUID, number>;
    healthMap: HookedMap<UnitGUID, number>;
    raidFlagMap: HookedMap<UnitGUID, RaidFlag>;
}

const BossFrames = ({
    nameMap,
    maxHealthMap,
    healthMap,
    raidFlagMap
}: Props) => {

    const bossUnitIdMap = useMap<UnitId, UnitGUID>();

    useEvents(event => {
        if (event.type != EventType.BOSS_UPDATE)
            return;

        const bossUpdate = event as BossUpdate;
        
        bossUpdate.units.forEach(u => {
            bossUnitIdMap.hSet(u.value, u.unitGUID);
        });
    });

    return (
        <div
            className="
                w-[250px]
                m-2 p-1
                bg-black
            "
        >
            <div
                className="
                    grid grid-cols-1 auto-rows-[65px]
                    gap-y-px
                "
            >
                {Array.from(bossUnitIdMap)
                    .map(([unitId, unitGUID]) => (
                        <div
                            className="relative"
                        >
                            {/* health bar */}
                            <div
                                className="
                                    h-full
                                    bg-red-500
                                "
                                style={{ width: healthMap.get(unitGUID) != undefined && maxHealthMap.get(unitGUID) ? `${Math.min(healthMap.get(unitGUID)! / maxHealthMap.get(unitGUID)! * 100, 100)}%` : '100%' }}
                            />

                            {/* name */}
                            <div
                                className="
                                    absolute
                                    left-0 top-1/2
                                    -translate-y-1/2
                                    ml-0.5

                                    text-white
                                    text-xs text-shadow
                                    font-thin
                                "
                            >
                                {nameMap.get(unitGUID) || unitGUID}
                            </div>

                            {/* health values */}
                            {healthMap.get(unitGUID) != undefined
                                && maxHealthMap.get(unitGUID) != undefined && (
                                <>
                                    {/* value */}
                                    <div
                                        className="
                                            absolute
                                            left-0 top-0
                                            ml-0.5

                                            text-white
                                            text-sm text-shadow
                                            font-bold
                                        "
                                    >
                                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact', compactDisplay: 'short' }).format(healthMap.get(unitGUID)!)}
                                        /
                                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact', compactDisplay: 'short' }).format(maxHealthMap.get(unitGUID)!)}
                                    </div>

                                    {/* percentage */}
                                    <div
                                        className="
                                            absolute
                                            right-0 top-0
                                            mr-0.5

                                            text-white
                                            text-sm text-shadow
                                            font-bold
                                        "
                                    >
                                        {Math.ceil(100 * healthMap.get(unitGUID)! / maxHealthMap.get(unitGUID)!)}%
                                    </div>
                                </>
                            )}

                            {/* raid flag */}
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
    );
};

export default BossFrames;