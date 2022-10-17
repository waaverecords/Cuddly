using System.Text.RegularExpressions;

class WowheadClient
{

    public WowheadClient() {}

    public async Task<string> GetSpellImageUrl(int spellId)
    {
        var client = new HttpClient();
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri($"https://wowhead.com/spell={spellId}"),
        };
        using var response = await client.SendAsync(request);

        var html = await response.Content.ReadAsStringAsync();
        
        try {
            foreach (Match match in Regex.Matches(html, @$"WH\.ge\('ic{spellId}'\)\.appendChild\(Icon\.create\(""(.*)"",", RegexOptions.IgnoreCase | RegexOptions.Multiline))
            {
                var imageName = match.Groups[1].Value;
                if (!string.IsNullOrEmpty(imageName))
                    return $"https://wow.zamimg.com/images/wow/icons/large/{imageName}.jpg";
            }
        }
        catch (Exception) {}

        return null;
    }
}