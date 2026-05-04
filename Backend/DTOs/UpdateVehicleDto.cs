namespace EvRoutePlanner.Api.DTOs
{
    public class UpdateVehicleDto
    {
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public double BatteryCapacity { get; set; }
        public double CurrentSoc { get; set; }
    }
}