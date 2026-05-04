using System.Text.Json.Serialization;

namespace EvRoutePlanner.Api.Models
{
    public class LocationResult
    {
        [JsonPropertyName("display_name")]
        public required string DisplayName { get; set; }

        [JsonPropertyName("lat")]
        public required string Lat { get; set; }
        [JsonPropertyName("lon")]
        public required string Lon { get; set; }
    }
}
