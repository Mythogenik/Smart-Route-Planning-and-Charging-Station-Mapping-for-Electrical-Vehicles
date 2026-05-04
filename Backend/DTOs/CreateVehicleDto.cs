namespace EvRoutePlanner.Api.DTOs
{
    public class CreateVehicleDto
    {
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public double BatteryCapacity { get; set; } // kWh
        public double CurrentSoc { get; set; } = 100; // Default full charge

        public double Range { get; set; }
        public double TopSpeed { get; set; }
        public string Color { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Nickname { get; set; } = string.Empty;
    }
}