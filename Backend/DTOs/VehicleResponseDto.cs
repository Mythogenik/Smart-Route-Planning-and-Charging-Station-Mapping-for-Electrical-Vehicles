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

        public double Range { get; set; }
        public double TopSpeed { get; set; }
        public string Color { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Nickname { get; set; } = string.Empty;
    }
}