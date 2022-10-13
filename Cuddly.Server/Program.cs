var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddSingleton<BattleNetClient>();

var app = builder.Build();
app.UseCors(builder => {
    builder
    .AllowAnyHeader()
    .WithOrigins(
        "http://localhost:3000",
        "http://localhost:5015"
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
        BattleNetClient battleNetClient
    ) =>
    {
        var medias = await battleNetClient.GetSpellMedia(spellId);
        return medias.First().Value;
    }
).WithMetadata(new ResponseCacheMetaData { Duration = 60 * 1 * 60 * 24 * 7 });

app.MapHub<CombatLogPublisherHub>("/events/publish");
app.MapHub<CombatLogConsumerHub>("/events/consume");

app.Run();