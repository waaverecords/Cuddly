using Microsoft.AspNetCore.SignalR;

public class CombatLogPublisherHub : Hub
{
    private readonly IHubContext<CombatLogConsumerHub> _hubContext;

    public CombatLogPublisherHub(IHubContext<CombatLogConsumerHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task OnEvent(Dictionary<string, object> @event)
    {
        await _hubContext.Clients.All.SendAsync("event", @event);
    }
}