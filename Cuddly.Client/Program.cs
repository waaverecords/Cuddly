using Microsoft.AspNetCore.SignalR.Client;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;

var events = new HashSet<Event>();

var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5015/combatLog/publish")
    .WithAutomaticReconnect()
    .Build();
connection.StartAsync();

var anchor = new Point(1920 + 1920 / 2, 0);

using (var bitmap = new Bitmap(170, 80, PixelFormat.Format24bppRgb))
{
    while (true)
    {
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        using (var graphics = Graphics.FromImage(bitmap))
            graphics.CopyFromScreen(anchor, new Point(0, 0), new Size(bitmap.Width, bitmap.Height));

        var bytesPerPixel = 3;
        var bytesPerLine = bitmap.Height * bytesPerPixel;
        var rgbValues = new byte[bytesPerLine * bitmap.Width];
        for (var x = 0; x < bitmap.Width; x++)
            for (var y = 0; y < bitmap.Height; y++)
            {
                var pixel = bitmap.GetPixel(x, y);
                rgbValues[x * bytesPerLine + y * bytesPerPixel] = pixel.R;
                rgbValues[x * bytesPerLine + y * bytesPerPixel + 1] = pixel.G;
                rgbValues[x * bytesPerLine + y * bytesPerPixel + 2] = pixel.B;
            }

        for (var x = 0; x < bitmap.Width; x++)
        {
            var byteIndex = x * bytesPerLine;

            if (rgbValues[byteIndex] == 255)
                // no event
                continue;

            var nextByte = () => rgbValues[byteIndex++];

            var nextInteger = () => (int)(nextByte() * Math.Pow(256, 2) + nextByte() * 256 + nextByte());

            var nextTimestamp = () =>
            {
                // 6 bytes
                var i = nextByte() * Math.Pow(256, 3) + nextByte() * Math.Pow(256, 2) + nextByte() * 256 + nextByte();
                var f = nextByte() * 256 + nextByte();
                return string.Format("{0}.{1}", i, f.ToString("000"));
            };

            var nextString = () =>
            {
                // utf8 bytes terminated w/ 0
                byte b;
                var stringBytes = new List<byte>();
                while ((b = nextByte()) != 0)
                {

                    stringBytes.Add(b);

                    if (b >> 7 == 0)
                        continue;

                    stringBytes.Add(nextByte());

                    if (b >> 5 == 0b110)
                        continue;

                    stringBytes.Add(nextByte());

                    if (b >> 4 == 0b1110)
                        continue;

                    // b >> 3 == 0b11110
                    stringBytes.Add(nextByte());
                }

                return Encoding.UTF8.GetString(stringBytes.ToArray());
            };

            var nextFlag = () => nextByte();

            var @event = new Event();
            @event.Id = nextInteger();
            @event.Timestamp = nextTimestamp();

            if (events.Contains(@event))
                continue;

            @event.Type = (EventType)nextByte();

            switch (@event.Type)
            {
                case EventType.COMBAT_LOG_EVENT:
                    var combatLogEvent = new CombatLogEvent();
                    @event = combatLogEvent.Set(@event);

                    combatLogEvent.Parameters = new Dictionary<string, object>();
                    var parameters = combatLogEvent.Parameters;

                    var subEvent = nextString();

                    parameters.Add("subEvent", subEvent);
                    parameters.Add("sourceGUID", nextString());
                    parameters.Add("sourceName", nextString());
                    parameters.Add("destGUID", nextString());
                    parameters.Add("destName", nextString());
                    parameters.Add("sourceRaidFlags", nextFlag());
                    parameters.Add("destRaidFlags", nextFlag());

                    // prefixes

                    if (subEvent.StartsWith("RANGE")
                        || subEvent.StartsWith("SPELL")
                        || subEvent.StartsWith("SPELL_PERIODIC")
                        || subEvent.StartsWith("SPELL_BUILDING"))
                    {
                        parameters.Add("spellId", nextInteger());
                        parameters.Add("spellName", nextString());
                    }

                    // suffixes

                    if (subEvent.EndsWith("_DAMAGE"))
                    {
                        parameters.Add("amount", nextInteger());
                        parameters.Add("overkill", nextInteger());
                        parameters.Add("resisted", nextInteger());
                        parameters.Add("blocked", nextInteger());
                        parameters.Add("asbsorbed", nextInteger());
                    }

                    break;

                case EventType.HEALTH_UPDATE:
                    var healthUpdate = new HealthUpdate();
                    @event = healthUpdate.Set(@event);

                    nextByte();// unit count
                    healthUpdate.UnitGUID = nextString();
                    healthUpdate.Health = nextInteger();
                    break;
            }

            if (events.Add(@event))
            {
                Console.WriteLine("{0}\t{1}", @event.Timestamp, @event.Type);
                try
                {
                    connection.SendAsync("OnEvent", @event);
                }
                catch (Exception ex) { }
            }
        }

        // TODO only keep eventCount events

        stopwatch.Stop();
        Console.WriteLine("{0} ms", stopwatch.ElapsedMilliseconds);
    }
}