import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Event } from './Events';

export function useSet<T>(initialSet = new Set<T>) {
    const [set, setSet] = useState(initialSet);

    return [
        set,
        (value: T) => setSet(set => new Set(set.add(value)))
    ] as const;
}

export function useMap<K, V>(initialMap = new Map<K, V>()) {
    const [map, setMap] = useState(initialMap);

    return [
        map,
        (key: K, value: V) => setMap(map => new Map(map.set(key, value)))
    ] as const;
}

export function useArray<T>(initialArray = new Array<T>()) {
    const [array, setArray] = useState(initialArray);

    // TODO: return object with all functions?
    return [
        array,
        (value: T) => setArray(array => [...array, value]),
        (predicate: (value: T) => boolean) => setArray(array => [...array.filter(predicate)]),
        (compareFn: (a: T, b:T) => number) => setArray(array => [...array.sort(compareFn)])
    ] as const;
};

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {

        if (!delay)
            return;

        const interval = setInterval(() => savedCallback.current!(), delay);
        return () => clearInterval(interval);
    }, [delay]);
}

var connection: signalR.HubConnection | null = null;
export function useEvents(onEvent: (event: Event) => void) {
    // TODO: use ref perhaps?
    useEffect(() => {
        if (connection) {
            connection.on('event', onEvent);
            return;
        }

        connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5015/events/consume')
            .withAutomaticReconnect()
            .build();
        connection.on('event', onEvent);
        connection.start();

        return () => { 
            connection!.stop();
            connection = null;
         };
    }, []);
};