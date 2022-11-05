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
    SPELL_CAST_SUCCESS = 'SPELL_CAST_SUCCESS',
    SPELL_AURA_APPLIED = 'SPELL_AURA_APPLIED',
    SPELL_AURA_REMOVED = 'SPELL_AURA_REMOVED'
}

export enum RaidDifficultyId {
    Normal = 14,
    Heroic = 15,
    Mythic = 16
}

export enum UnitId {
    Boss1,
    Boss2,
    Boss3,
    Boss4,
    Boss5
}

export interface SpellInfo {
    name: string;
    duration?:  number;
}

export const SpellInfoMap = new Map<number, SpellInfo>();

// Druid
SpellInfoMap.set(740, {
    name: 'Tranquility',
    duration: 8
});

// Paladin
SpellInfoMap.set(31821, {
    name: 'Aura Mastery',
    duration: 8
});

// Priest
SpellInfoMap.set(64843, {
    name: 'Divine Hymm',
    duration: 8
});
SpellInfoMap.set(62618, {
    name: 'Power Word: Barrier',
    duration: 10
});

// Monk
SpellInfoMap.set(115310, {
    name: 'Revival'
});

// Shaman
SpellInfoMap.set(108280, {
    name: 'Healing Tide Totem',
    duration: 10
});
SpellInfoMap.set(16191, {
    name: 'Mana Tide Totem',
    duration: 8
});
SpellInfoMap.set(98008, {
    name: 'Spirit Link Totem',
    duration: 6
});
SpellInfoMap.set(2825, {
    name: 'Bloodlust',
    duration: 40
});
SpellInfoMap.set(32182, {
    name: 'Heroism',
    duration: 40
});

// Demon Hunter
SpellInfoMap.set(196718, {
    name: 'Darkness',
    duration: 8
});

// Warrior
SpellInfoMap.set(97462, {
    name: 'Rallying Cry',
    duration: 10
});

// Death Knight
SpellInfoMap.set(51052, {
    name: 'Anti-Magic Zone',
    duration: 11
});

// Mage
SpellInfoMap.set(80353, {
    name: 'Time Warp',
    duration: 40
});

// Evoker
SpellInfoMap.set(390386, {
    name: 'Fury of the Aspects',
    duration: 40
});



// Eranog
SpellInfoMap.set(390715, {
    name: 'Flamerift',
    duration: 6
});
SpellInfoMap.set(370597, {
    name: 'Kill Order'
});

// Eranog mythic
SpellInfoMap.set(396094, {
    name: 'Greater Flamerift',
    duration: 6
});