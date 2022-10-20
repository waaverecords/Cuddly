export enum Class {
    Warrior,
    Paladin,
    Hunter,
    Rogue,
    Priest,
    DeathKnight,
    Shaman,
    Mage,
    Warlock,
    Monk,
    Druid,
    DemonHunter,
    Evoker
}

export enum ClassColor {
    // bg-[#C41E3A] text-[#C41E3A]
    DeathKnight = '#C41E3A',

    // bg-[#A330C9] text-[#A330C9]
    DemonHunter = '#A330C9',

    // bg-[#FF7C0A] text-[#FF7C0A]
    Druid = '#FF7C0A',

    // bg-[#33937F] text-[#33937F]
    Evoker = '#33937F',

    // bg-[#AAD372] text-[#AAD372]
    Hunter = '#AAD372',

    // bg-[#3FC7EB] text-[#3FC7EB]
    Mage = '#3FC7EB',

    // bg-[#00FF98] text-[#00FF98]
    Monk = '#00FF98',

    // bg-[#F48CBA] text-[#F48CBA]
    Paladin = '#F48CBA',

    // bg-[#FFFFFF] text-[#FFFFFF]
    Priest = '#FFFFFF',

    // bg-[#FFF468] text-[#FFF468]
    Rogue = '#FFF468',

    // bg-[#0070DD] text-[#0070DD]
    Shaman = '#0070DD',

    // bg-[#8788EE] text-[#8788EE]
    Warlock = '#8788EE',

    // bg-[#C69B6D] text-[#C69B6D]
    Warrior = '#C69B6D'
}

export enum RaidFlag {
    Star = 1,
    Circle = 2,
    Diamond = 4,
    Triangle = 8,
    Moon = 16,
    Square = 32,
    Cross = 64,
    Skull = 128
}

export const RaidFlagImageUrlMap = new Map<RaidFlag, string>([
    [RaidFlag.Star, '/media/raidFlags/star.png'],
    [RaidFlag.Circle, '/media/raidFlags/circle.png'],
    [RaidFlag.Diamond, '/media/raidFlags/diamond.png'],
    [RaidFlag.Triangle, '/media/raidFlags/triangle.png'],
    [RaidFlag.Moon, '/media/raidFlags/moon.png'],
    [RaidFlag.Square, '/media/raidFlags/square.png'],
    [RaidFlag.Cross, '/media/raidFlags/cross.png'],
    [RaidFlag.Skull, '/media/raidFlags/skull.png'],
]);

export enum CombatRole {
    None,
    Damager,
    Tank,
    Healer
}

export enum CombatLogEvent {
    SPELL_CAST_SUCCESS = "SPELL_CAST_SUCCESS"
}

export enum RaidDifficultyId {
    Normal = 14,
    Heroic = 15,
    Mythic = 16
}