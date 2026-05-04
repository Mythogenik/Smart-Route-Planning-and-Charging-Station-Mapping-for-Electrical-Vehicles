public interface IFuelEconomyService
{
    Task<double?> GetAverageConsumptionAsync(string brand, string model, double batteryCapacityKwh);
}