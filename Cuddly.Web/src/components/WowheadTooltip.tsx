import { ReactNode } from "react";
import { RaidDifficultyId } from "../wowUtilities";

interface Props {
    spellId: number;
    raidDifficulty?: RaidDifficultyId;
    children: ReactNode;
}

// https://www.wowhead.com/tooltips#related-advanced-usage

const WowheadTooltip = ({
    spellId,
    raidDifficulty,
    children
}: Props) =>  {

    const params = new URLSearchParams();

    // difficulty
    raidDifficulty && params.append('dd', raidDifficulty.toString());

    return (
        <a
            href={`https://wowhead.com/spell=${spellId}`}
            target="_blank"
            data-wowhead={params.toString()}
            draggable={false}
        >
            {children}
        </a>
    );
};

export default WowheadTooltip;