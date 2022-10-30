import clsx from "clsx";
import { UnitGUID } from "../Events";
import { HookedMap, HookedSet } from "../Hooks";
import { Class, RaidFlag, RaidFlagImageUrlMap, ClassColor } from "../wowUtilities";

interface Props {
    unitGUIDs: HookedSet<UnitGUID>;
    nameMap: HookedMap<UnitGUID, string>;
    classMap: HookedMap<UnitGUID, Class>;
    healthMap: HookedMap<UnitGUID, number>;
    maxHealthMap: HookedMap<UnitGUID, number>;
    raidFlagMap: HookedMap<UnitGUID, RaidFlag>;
};

const RaidFrames = ({
    unitGUIDs,
    nameMap,
    classMap,
    maxHealthMap,
    healthMap,
    raidFlagMap
}: Props) => {
    return (
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
                {Array.from(unitGUIDs)
                    .filter(unitGUID => unitGUID.startsWith('Player'))
                    .map(unitGUID => (
                    <div
                        key={unitGUID}
                        className="
                            flex
                            w-full h-full
                            relative
                        "
                    >
                        {/* health bar */}
                        {<div
                            className={clsx(
                                `h-full`,
                                classMap.get(unitGUID) == undefined && 'bg-neutral-500',
                                // @ts-ignore
                                classMap.get(unitGUID) != undefined && `bg-[${ClassColor[Class[classMap.get(unitGUID)]]}]`
                            )}
                            style={{ width: healthMap.get(unitGUID) != undefined && maxHealthMap.get(unitGUID) ? `${Math.min(healthMap.get(unitGUID)! / maxHealthMap.get(unitGUID)! * 100, 100)}%` : '100%' }}
                        />}

                        {/* name */}
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

export default RaidFrames;