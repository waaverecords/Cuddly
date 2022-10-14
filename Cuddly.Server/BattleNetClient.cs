using System.Net.Http.Headers;
using System.Text;

class BattleNetClient
{
    private readonly IConfiguration _configuration;
    private string _token;
    private DateTime _tokenExpiration;

    public BattleNetClient(
        IConfiguration configuration
    )
    {
        _configuration = configuration;
    }

    private string BasicAuthToken()
    {
        var battleNetConfig = _configuration.GetSection("BattleNet");
        var isoEncoded = Convert.ToBase64String(
            Encoding.GetEncoding("ISO-8859-1")
                .GetBytes($"{battleNetConfig.GetValue<string>("clientId")}:{battleNetConfig.GetValue<string>("clientSecret")}")
            );
        return $"Basic {isoEncoded}";
    }

    protected async Task<string> GetToken()
    {
        if (DateTime.Now < _tokenExpiration)
            return _token;
            
        var client = new HttpClient();
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Post,
            RequestUri = new Uri("https://oauth.battle.net/token"),
            Headers = {{ "Authorization", BasicAuthToken() }},
            Content = new MultipartFormDataContent
            {
                new StringContent("client_credentials")
                {
                    Headers = { ContentDisposition = new ContentDispositionHeaderValue("form-data") {  Name = "grant_type" } }
                },
            },
        };
        using var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<TokenResponse>();
        _tokenExpiration = new DateTime().AddSeconds(data.expires_in);
        _token = data.access_token;

        return _token;
    }

    public async Task<IList<SpellMedia>> GetSpellMedia(int spellId)
    {
        var client = new HttpClient();
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri($"https://us.api.blizzard.com/data/wow/media/spell/{spellId}?namespace=static-us&locale=en_US&access_token={await GetToken()}"),
        };
        using var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<SpellMediaResponse>();
        return data.assets;
    }
}

record TokenResponse(
    string access_token,
    string token_type,
    int expires_in,
    string sub
);

record SpellMediaResponse(
    dynamic _links,
    IList<SpellMedia> assets,
    int id
);

record SpellMedia(
    string Key,
    string Value,
    int FileDataId
);