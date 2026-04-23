namespace EvRoutePlanner.Api.DTOs
{
    public class ChargingStationDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public required string Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public required string ConnectorType { get; set; }
        public double PowerOutput { get; set; }
        public bool IsOperational { get; set; }
        public string? OcmId { get; set; }
    }
}