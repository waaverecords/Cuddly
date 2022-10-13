import { useEffect, useState } from 'react';

interface Props {
    spellId: number;
    stacks?: number;
    duration?: number;
    timeLeft?: number;
}

const AuraIcon = ({ 
    spellId,
    stacks,
    duration,
    timeLeft
}: Props) => {
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

    const _timeLeft = duration ? timeLeft || duration : 1;
    const _duration = duration ? duration : 1;
    
    const degree = 360 - _timeLeft / _duration * 359.99
    const halfWidth = width / 2;
    const radius = Math.sqrt(Math.pow(halfWidth, 2) * 2);
    const radiant = degree * Math.PI / 180;
    const x1 = radius + Math.sin(radiant) * radius;
    const y1 = radius - Math.cos(radiant) * radius;
    const halfMargin = radius - halfWidth;

    return (
        <div
            className="
                flex
                relative
                bg-lime-400
            "
            style={{
                width: width,
                height: width
            }}
        >
            <img
                className="
                    absolute
                    w-full h-full
                    grayscale
                "
                src={imageUrl}
            />
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
                    id="mask"
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
                    mask="url(#mask)"
                    xlinkHref={imageUrl}
                />
            </svg>
            {(stacks || 0) > 1 && (
                <div
                    className="
                        absolute
                        bottom-0 right-0
                        text-3xl font-semibold
                        text-white
                    "
                >
                    {stacks}
                </div>
            )}
        </div>
    );
};

export default AuraIcon;