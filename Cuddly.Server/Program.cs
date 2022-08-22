var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.Services.AddSignalR();

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

app.MapGet("/", () => "Cuddly is running!");

app.MapHub<CombatLogPublisherHub>("/events/publish");
app.MapHub<CombatLogConsumerHub>("/events/consume");

app.Run();