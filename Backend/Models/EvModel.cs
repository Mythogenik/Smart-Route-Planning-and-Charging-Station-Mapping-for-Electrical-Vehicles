namespace EvRoutePlanner.Api.Models
{
    public class EvModel
    {
        public int Id { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public int Year { get; set; }
        public double BatteryCapacity { get; set; } // kWh
        public double Range { get; set; } // km (WLTP standart)
        public double ChargingSpeed { get; set; } // kW (DC fast charging)
        public string? ExternalUrl { get; set; } // Ýsteðe baðlý: kaynak linki

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}