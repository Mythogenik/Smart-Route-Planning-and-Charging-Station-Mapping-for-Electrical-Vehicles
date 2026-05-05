using System.Net.Http.Headers;
using System.Text.Json;

public class FuelEconomyService : IFuelEconomyService
{
    private readonly HttpClient _http;

    public FuelEconomyService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://www.fueleconomy.gov/ws/rest/");
        _http.DefaultRequestHeaders.Accept
            .Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<double?> GetAverageConsumptionAsync(string brand, string model, double batteryCapacityKwh)
    {
        var vehicleId = await FindVehicleIdAsync(brand, model);
        if (vehicleId == null) return null;

        var response = await _http.GetAsync($"vehicle/{vehicleId}");
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("range", out var rangeProp)) return null;
        double rangeMiles = rangeProp.ValueKind == JsonValueKind.String
        ? double.Parse(rangeProp.GetString()!)
        : rangeProp.GetDouble();
        double rangeKm = rangeMiles * 1.60934;

        return batteryCapacityKwh / rangeKm;
    }

    //public async Task<double?> GetConsumptionKwhPerKmAsync(string brand, string model)
    //{
    //    var vehicleId = await FindVehicleIdAsync(brand, model);
    //    if (vehicleId == null) return null;

    //    var response = await _http.GetAsync($"vehicle/{vehicleId}");
    //    if (!response.IsSuccessStatusCode) return null;

    //    var json = await response.Content.ReadAsStringAsync();
    //    var doc = JsonDocument.Parse(json);
    //    var root = doc.RootElement;

    //    if (!root.TryGetProperty("kwhPer100Miles", out var kwhProp))
    //        return null;

    //    double kwhPer100Miles = kwhProp.GetDouble();

    //    return kwhPer100Miles / 160.934;
    //}

    private async Task<string?> FindVehicleIdAsync(string brand, string model)
    {
        for (int year = DateTime.Now.Year; year >= DateTime.Now.Year - 5; year--)
        {
            var url = $"vehicle/menu/options?year={year}" +
                      $"&make={Uri.EscapeDataString(brand)}" +
                      $"&model={Uri.EscapeDataString(model)}";

            var response = await _http.GetAsync(url);
            if (!response.IsSuccessStatusCode) continue;

            var json = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(json) || json == "null") continue;

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Null || root.ValueKind != JsonValueKind.Object) continue;

            if (root.TryGetProperty("menuItem", out var items))
            {

                if (items.ValueKind == JsonValueKind.Null) continue;

                if (items.ValueKind == JsonValueKind.Array)
                {
                    var first = items.EnumerateArray().FirstOrDefault();
                    if (first.ValueKind == JsonValueKind.Object && first.TryGetProperty("value", out var val))
                    {
                        return val.GetString();
                    }
                }
                else if (items.ValueKind == JsonValueKind.Object)
                {
                    if (items.TryGetProperty("value", out var val))
                    {
                        return val.GetString();
                    }
                }
            }
        }
        return null;
    }
}