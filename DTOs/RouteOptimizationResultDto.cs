using EvRoutePlanner.Api.Models;

namespace EvRoutePlanner.Api.DTOs
{
    public class RouteOptimizationResultDto
    {
        public bool NeedsChargingStop { get; set; }
        public double TotalDistanceKm { get; set; }
        public double CurrentRangeKm { get; set; }
        public ChargingStationDto? RecommendedStation { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<ChargingStationDto> Stops { get; set; } = new();
    }
}