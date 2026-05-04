namespace EvRoutePlanner.Api.DTOs
{
    public class SaveRouteDto
    {
        public int VehicleId { get; set; }
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
        public double TotalDistance { get; set; }
        public double TotalDuration { get; set; }
        public double SafeRange { get; set; }
    }
}