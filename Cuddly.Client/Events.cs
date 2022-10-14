enum EventType
{
    COMBAT_LOG_EVENT,
    HEALTH_UPDATE,
    MAX_HEALTH_UPDATE,
    CLASS_UPDATE,
    ENCOUNTER_TIMER,
    COMBAT_ROLE_UPDATE
}

class Event
{
    public int Id { get; set; }
    public string Timestamp { get; set; }
    public EventType Type { get; set; }

    public override bool Equals(Object obj)
    {
        return obj is Event @event
            && this.Id == @event.Id;
    }

    public Event Set(Event @event)
    {
        this.Id = @event.Id;
        this.Timestamp = @event.Timestamp;
        this.Type = @event.Type;

        return this;
    }
}

class CombatLogEvent : Event
{
    public Dictionary<string, object> Parameters { get; set; }
}

class EncounterTimer : Event
{
    public string Text { get; set; }
    public int Duration { get; set; }
}

class UnitGUID_Value<T>
{
    public string UnitGUID { get; set; }
    public T Value { get; set; }
}

class EventForUnits<T> : Event
{
    public List<UnitGUID_Value<T>> Units { get; set; }
}

class HealthUpdate : EventForUnits<int> { }

class MaxHealthUpdate : EventForUnits<int> { }

class ClassUpdate : EventForUnits<int> { }

class CombatRoleUpdate : EventForUnits<int> { }