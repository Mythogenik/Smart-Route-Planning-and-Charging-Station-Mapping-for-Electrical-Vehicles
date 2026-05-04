using EvRoutePlanner.Api.Interfaces;

public class RangeService : IRangeService
{
    private const double DefaultConsumption = 0.2;

    public double CalculateRemainingRange(double batteryCapacity, double currentSoc, double? averageConsumption = null)
    {
        double consumption = averageConsumption ?? DefaultConsumption;
        double usableEnergy = batteryCapacity * (currentSoc / 100.0);
        return usableEnergy / consumption;
    }

    public bool IsRangeSufficient(double distanceKm, double rangeKm)
    {
        double safetyMargin = 0.90; // %10 Range anxiety
        return rangeKm * safetyMargin >= distanceKm;
    }
}