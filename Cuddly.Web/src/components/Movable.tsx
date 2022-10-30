import React, { ReactNode, useState } from "react";
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
    const [dragging, setDragging] = useState(false);

    const cookies = new Cookies();
    
    var _defaultPosition = defaultPosition;
    const x = cookies.get(`m-${name}-x`);
    const y = cookies.get(`m-${name}-y`);
    if (x !== undefined && y !== undefined)
        _defaultPosition = { x: Number(x), y: Number(y) };

    const onDrag = (event: DraggableEvent, data: DraggableData) => setDragging(true);

    const onStop = (event: DraggableEvent, data: DraggableData) => {
        setTimeout(() => setDragging(false), 0);
        
        if (!name || isNaN(data.x)) return;
        
        cookies.set(`m-${name}-x`, data.x);
        cookies.set(`m-${name}-y`, data.y);
    };

    const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!dragging) return;
        
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <Draggable
            onDrag={onDrag}
            onStop={onStop}
            defaultPosition={_defaultPosition}
        >
            <div
                className="absolute"
                onClick={onClick}
            >
                {children}
            </div>
        </Draggable>
    );
}

export default Movable;