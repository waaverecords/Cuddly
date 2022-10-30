import { ReactNode } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import Cookies from 'universal-cookie';

interface Props {
    children: ReactNode;
    name?: string;
    defaultPosition?: {
        x: number;
        y: number;
    };
}

const Movable = ({
    children,
    name,
    defaultPosition
}: Props) => {
    const cookies = new Cookies();
    
    var _defaultPosition = defaultPosition;
    const x = cookies.get(`m-${name}-x`);
    const y = cookies.get(`m-${name}-y`);
    if (x !== undefined && y !== undefined)
        _defaultPosition = { x: Number(x), y: Number(y) };

    const onStop = (event: DraggableEvent, data: DraggableData) => {
        if (!name || isNaN(data.x)) return;
        
        cookies.set(`m-${name}-x`, data.x);
        cookies.set(`m-${name}-y`, data.y);
    };

    return (
        <Draggable
            onStop={onStop}
            defaultPosition={_defaultPosition}
        >
            <div
                className="absolute"
            >
                {children}
            </div>
        </Draggable>
    );
}

export default Movable;