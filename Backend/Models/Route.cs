
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace EvRoutePlanner.Api.Models
{
    public class Route
    {
        public int Id { get; set; }
        public Vehicle? Vehicle { get; set; }
        public int VehicleId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string CreatedAt { get; set; } = null!;
        public double OriginLat { get; set; }
        public double OriginLon { get; set; }
        public string OriginName { get; set; } = null!;
        public string OriginAddress { get; set; } = null!;

        public double DestinationLat { get; set; }
        public double DestinationLon { get; set; }
        public string DestinationName { get; set; } = null!;
        public string DestinationAddress { get; set; } = null!;
        public string StopsJson { get; set; } = "[]";

        [NotMapped]
        public List<Stop> Stops
        {
            get => JsonSerializer.Deserialize<List<Stop>>(StopsJson) ?? new();
            set => StopsJson = JsonSerializer.Serialize(value);
        }
        public double TotalDistance { get; set; } // in kilometers
        public double TotalDuration { get; set; } // in seonds
        public double safeRange { get; set; } // in kilometers

    }
}
