import * as signalR from '@microsoft/signalr';
import { useEffect, useState } from 'react';

const cache = {};

const useSpellMediaUrl = (spellId: number) => {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        if (spellId == undefined) return;
        if (spellId in cache) {
            // @ts-ignore
            setUrl(cache[spellId]);
            return;
        }

        fetch(`https://us.api.blizzard.com/data/wow/media/spell/${spellId}?namespace=static-us&locale=en_US&access_token=USw5rw1R2b9ODQThHyYIgQ32fdJZLWNHxs`)
            .then(async response => {
                const data = await response.json();
                // @ts-ignore
                cache[spellId] = data.assets[0].value;
                // @ts-ignore
                setUrl(cache[spellId]);
            });
    }, [spellId]);

    return url;
};

const SpellImage = ({ 
    spellId 
} : {
    spellId: number
}) => {
    const mediaUrl = useSpellMediaUrl(spellId);

    return (
        <img
            src={mediaUrl}
        />
    );
};

export default function App() {

    const [events, setEvents] = useState(new Array<any>());

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5015/combatLog/consume')
            .build();

        connection.on('event', event => {
            console.log(event);
            //setEvents(events => events.concat(event));
        })

        connection.start();
    }, []);

    useEffect(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, [events]);

    return (
        <div
            id="app"
        >
            {events.map((event, i) => (
                <div
                    key={`${event.timestamp}.${event.subEvent}.${event.sourceGUID}.${i}`}
                    style={{
                        display: 'flex',
                        gap: 20
                    }}
                >
                    <div>
                        {event.timestamp}
                    </div>
                    <div>
                        {event.subEvent}
                    </div>
                    <div>
                        {event.sourceName}
                    </div>
                    <div>
                        {event.destName}
                    </div>
                    {event.spellId && (
                        <SpellImage 
                            spellId={event.spellId as number}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};