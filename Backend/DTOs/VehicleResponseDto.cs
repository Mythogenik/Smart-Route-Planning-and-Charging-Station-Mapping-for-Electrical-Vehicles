namespace EvRoutePlanner.Api.DTOs
{
    public class VehicleResponseDto
    {
        public int Id { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public double BatteryCapacity { get; set; }
        public double CurrentSoc { get; set; }
        public double AverageConsumption { get; set; }
        public int UserId { get; set; }
    }
}