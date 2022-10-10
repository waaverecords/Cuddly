import { useState, useEffect } from 'react';
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

    return [
        array,
        (value: T) => setArray(array => [...array, value]),
        (array: Array<T>) => setArray([...array])
    ] as const;
}

var connection: signalR.HubConnection | null = null;
export function useEvents(onEvent: (event: Event) => void) {
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
}