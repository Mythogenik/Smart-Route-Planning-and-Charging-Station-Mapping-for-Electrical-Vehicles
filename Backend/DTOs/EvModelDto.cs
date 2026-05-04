namespace EvRoutePlanner.Api.DTOs
{
    public class EvModelDto
    {
        public int Id { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public int Year { get; set; }
        public double BatteryCapacity { get; set; }
        public double Range { get; set; }
        public double ChargingSpeed { get; set; }
    }
}