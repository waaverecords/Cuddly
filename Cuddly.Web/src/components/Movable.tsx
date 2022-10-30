import { ReactNode } from "react";
import Draggable from "react-draggable";

interface Props {
    children: ReactNode;
}

const Movable = ({
    children
}: Props) => {
    return (
        <Draggable>
            <div
                className="
                    aboslute
                    left-0 top-0
                "
            >
                {children}
            </div>
        </Draggable>
    );
}

export default Movable;