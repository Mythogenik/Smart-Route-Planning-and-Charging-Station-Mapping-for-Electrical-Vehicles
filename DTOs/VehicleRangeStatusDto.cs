namespace EvRoutePlanner.Api.DTOs
{
    public class VehicleRangeStatusDto
    {
        public double RemainingRangeKm { get; set; }
        public bool IsSufficient { get; set; }
        public double DistanceToTargetKm { get; set; }
        public double SafetyMarginKm { get; set; }
    }
}