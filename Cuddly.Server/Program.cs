using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddSingleton<BattleNetClient>();
builder.Services.AddSingleton<WowheadClient>();
builder.Services.AddMemoryCache();

var app = builder.Build();
app.UseCors(builder => {
    builder
    .AllowAnyHeader()
    .WithOrigins(
        "http://localhost:3000",
        "http://localhost:5015",
        "http://127.0.0.1:5173",
        "http://cuddly.gg"
    )
    .AllowAnyMethod()
    .AllowCredentials()
    .SetIsOriginAllowed((host) => true)
    .SetIsOriginAllowedToAllowWildcardSubdomains();
});
app.UseResponseCaching();

app.MapGet("/", () => "Cuddly is running!");

app.MapGet(
    "/media-urls/spells/{spellId}", 
    async (
        int spellId,
        IMemoryCache memoryCache,
        BattleNetClient battleNetClient,
        WowheadClient wowheadClient
    ) =>
    {
        var key = $"/media-urls/spells/{spellId}";
        string url;
        if (!memoryCache.TryGetValue(key, out url))
        {
            try
            {
                var medias = await battleNetClient.GetSpellMedia(spellId);
                url = medias.First().Value;
            }
            catch (HttpRequestException)
            {
                url = null;
            }

            if (string.IsNullOrEmpty(url))
                url = await wowheadClient.GetSpellImageUrl(spellId);
            
            memoryCache.Set(
                key,
                url,
                new MemoryCacheEntryOptions { AbsoluteExpiration = DateTime.Now.AddDays(7) }
            );
        }

        return url;
    }
).WithMetadata(new ResponseCacheMetaData { Duration = 60 * 1 * 60 * 24 * 7 });

app.MapHub<CombatLogPublisherHub>("/events/publish");
app.MapHub<CombatLogConsumerHub>("/events/consume");

app.Run();