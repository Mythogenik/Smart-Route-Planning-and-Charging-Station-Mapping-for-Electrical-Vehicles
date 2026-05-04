namespace EvRoutePlanner.Api.DTOs
{
    public class CreateVehicleDto
    {
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public double BatteryCapacity { get; set; } // kWh
        public double CurrentSoc { get; set; } = 100; // Default full charge
    }
}