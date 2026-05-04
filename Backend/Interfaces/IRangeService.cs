using EvRoutePlanner.Api.Models;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IRangeService
    {
        double CalculateRemainingRange(double batteryCapacity, double currentSoc, double? averageConsumption = null);
        bool IsRangeSufficient(double distanceKm, double rangeKm);
    }
}
