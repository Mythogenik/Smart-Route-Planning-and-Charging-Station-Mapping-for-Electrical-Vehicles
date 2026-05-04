
namespace EvRoutePlanner.Api.Models
{
    public class Route
    {
        public int Id { get; set; }
        public required Vehicle Vehicle { get; set; }
        public string CreatedAt { get; set; } = null!;
        public required Stop origin { get; set; }
        public required Stop destination { get; set; }
        public Stop[] stops { get; set; } = Array.Empty<Stop>();
        public double TotalDistance { get; set; } // in kilometers
        public double TotalDuration { get; set; } // in seonds
        public double safeRange { get; set; } // in kilometers

    }
}
