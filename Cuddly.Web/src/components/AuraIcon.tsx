import { useEffect, useState, useRef } from 'react';
import { v4 } from 'uuid';

interface Props {
    spellId: number;
    stacks?: number;
    duration?: number;
    timeLeft?: number;
}

const AuraIcon = ({ 
    spellId,
    stacks,
    duration = 1,
    timeLeft = 1
}: Props) => {
    const maskId = useRef(`mask-${v4()}`);
    const [imageUrl, setImageUrl] = useState<string>();

    const getImageUrl = async (spellId: number) => {
        const response = await fetch(`http://localhost:5015/media-urls/spells/${spellId}`);
        return await response.text();
    };

    useEffect(() => {
        if (!spellId)
            return;

        getImageUrl(spellId).then(setImageUrl);
    }, [spellId]);

    const width = 70;
    const halfWidth = width / 2;
    const radius = Math.sqrt(Math.pow(halfWidth, 2) * 2);
    const halfMargin = radius - halfWidth;

    const degree = 360 - timeLeft / duration * 359.99
    const radiant = degree * Math.PI / 180;
    const x1 = radius + Math.sin(radiant) * radius;
    const y1 = radius - Math.cos(radiant) * radius;

    return (
        <div
            className="
                flex
                relative
                bg-lime-400
                overflow-hidden
            "
            style={{
                width: width,
                height: width
            }}
        >
            {/* back image */}
            <img
                className="
                    absolute
                    w-full h-full
                    brightness-45
                "
                src={imageUrl}
            />

            {/* front image */}
            <svg
                className="
                    absolute
                    left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2
                "
                style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                }}
            >
                <mask
                    id={maskId.current}
                >
                    <path
                        fill='#ffffff'
                        d={`M ${radius},0 A ${radius},${radius} 0 ${radiant > Math.PI ? 0 : 1} 0 ${x1},${y1} L ${radius},${radius} Z`}
                    />
                </mask>
                <image
                    x={halfMargin}
                    y={halfMargin}
                    style={{
                        width: width,
                        height: width
                    }}
                    mask={`url(#${maskId.current})`}
                    xlinkHref={imageUrl}
                />
            </svg>
            {duration != timeLeft && (
                <>
                    {/* progress circle yellow bar */}
                    <div
                        className="
                            absolute
                            w-1
                            left-[calc(50%_-_0.125rem)] bottom-1/2
                            origin-bottom
                            bg-yellow-500
                        "
                        style={{
                            height: radius,
                            rotate: `${degree}deg`
                        }}
                    />

                    {/* time left */}
                    <div
                        className="
                            absolute
                            text-3xl font-bold
                            left-1/2 top-1/2
                            -translate-x-1/2 -translate-y-1/2
                            text-white text-shadow
                        "
                    >
                        {timeLeft}
                    </div>
                </>
            )}

            {/* stacks */}
            {(stacks || 0) > 1 && (
                <div
                    className="
                        absolute
                        bottom-0 right-0
                        text-3xl font-bold
                        text-white text-shadow
                    "
                >
                    {stacks}
                </div>
            )}
        </div>
    );
};

export default AuraIcon;