public static class ResponseCacheExtension
{
    public static IApplicationBuilder UseResponseCaching(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ResponseCacheMiddleware>();
    }
}

public class ResponseCacheMiddleware
{
    private readonly RequestDelegate _next;

    public ResponseCacheMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext)
    {
        if (httpContext.GetEndpoint()?.Metadata.GetMetadata<ResponseCacheMetaData>() is { } responseCacheMetaData)
        {
            if (httpContext.Response.HasStarted)
                throw new InvalidOperationException("Can't mutate response after headers have been sent to client.");

            httpContext.Response.Headers.CacheControl = new[] {
                "public", $"max-age={responseCacheMetaData.Duration}"
            };
        }
        await _next(httpContext);
    }
}

public class ResponseCacheMetaData
{
    public int Duration { get; set; } = 100;
}