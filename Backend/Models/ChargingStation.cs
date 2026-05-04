namespace EvRoutePlanner.Api.Models
{
    /// <summary>
    /// Open Charge Map API'sinden çekilen þarj istasyonlarý.
    /// </summary>
    public class ChargingStation
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public required string Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }

        public required string ConnectorType { get; set; } // Type 2, CCS, CHAdeMO, etc.
        public double PowerOutput { get; set; } // kW
        public bool IsOperational { get; set; } = true;

        // Open Charge Map ID
        public string? OcmId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}