import clsx from "clsx";
import { Fragment } from "react";
import { UnitGUID } from "../Events";
import { HookedMap } from "../Hooks";
import { Class, ClassColor, CombatRole } from "../wowUtilities";

interface Props {
    nameMap: HookedMap<UnitGUID, string>;
    combatRoleMap: HookedMap<UnitGUID, CombatRole>;
    classMap: HookedMap<UnitGUID, Class>;
    powerMap: HookedMap<UnitGUID, number>;
}

// TODO: move maps to a context?
const HealersMana = ({
    combatRoleMap,
    nameMap,
    classMap,
    powerMap
}: Props) => {
    return (
        <div
        className="
            grid grid-cols-[auto_auto]
            gap-x-3
            text-2xl text-shadow
        "
        >
            {Array.from(combatRoleMap)
                .filter(([unitGUID, combatRole]) => combatRole == CombatRole.Healer)
                .map(([unitGUID]) => (
                <Fragment
                    key={unitGUID}
                >
                    {/* name */}
                    <div
                        className={clsx(
                            `text-right`,
                            classMap.get(unitGUID) == undefined && 'text-neutral-500',
                            // @ts-ignore
                            classMap.get(unitGUID) != undefined && `text-[${ClassColor[Class[classMap.get(unitGUID)]]}]`
                        )}
                    >
                        {nameMap.get(unitGUID) || unitGUID}
                    </div>

                    {/* percent */}
                    <div
                        className="
                            text-right
                            text-white
                        "
                    >
                        {powerMap.get(unitGUID) && (
                            <>{Math.floor(100 * powerMap.get(unitGUID)! / 50000)}</>
                        )}
                    </div>
                </Fragment>
            ))}
        </div>
    );
};

export default HealersMana;