export interface Keyed {
    key?: string | number;
}

export interface Timer extends Keyed {
    duration: number;
    timeLeft: number;
}