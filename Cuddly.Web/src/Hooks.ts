import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Event } from './Events';

type Hooked<T> = T & {
    hReplace(replaceAction: (prevValue: T) => T): void;
}

interface HookedSet<T> extends Hooked<Set<T>> {
    hSet(value: T): void;
}

export function useSet<T>(initialSet = new Set<T>) {
    const [set, setSet] = useState(initialSet);

    return Object.assign(
        set,
        {
            hReplace: setSet,
            hSet: value => setSet(set => new Set(set.add(value)))
        } as HookedSet<T>
    ) as HookedSet<T>;
}

interface HookedMap<K, V> extends Hooked<Map<K, V>> {
    hSet(key: K, value: V): void;
    hDelete(key: K): void;
}

export function useMap<K, V>(initialMap = new Map<K, V>()) {
    const [map, setMap] = useState(initialMap);

    return Object.assign(
        map,
        {
            hReplace: setMap,
            hSet: (key, value) => setMap(map => new Map(map.set(key, value))),
            hDelete: key => setMap(map => {
                map.delete(key);
                return new Map(map);
            })
        } as HookedMap<K, V>
    ) as HookedMap<K, V>;
}

interface HookedArray<T> extends Hooked<Array<T>> {
    hPush(...items: T[]): void;
    hFilter(predicate: (value: T) => boolean): void;
    hSort(compareFn: (a: T, b: T) => number): void;
}

export function useArray<T>(initialArray = new Array<T>()) {
    const [array, setArray] = useState(initialArray);

    return Object.assign(
        array,
        {
            hReplace: setArray,
            hPush: (...items) => setArray(array => {
                array.push(...items);
                return [...array];
            }),
            hFilter: predicate => setArray(array => [...array.filter(predicate)]),
            hSort: compareFn => setArray(array => [...array.sort(compareFn)])
        } as HookedArray<T>
    )  as HookedArray<T>;
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