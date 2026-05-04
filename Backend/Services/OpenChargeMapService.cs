using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;

namespace EvRoutePlanner.Api.Services
{
    public class OpenChargeMapService : IOpenChargeMapService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public OpenChargeMapService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<IEnumerable<ChargingStationDto>> GetChargingStationsNearby(double latitude, double longitude, int maxResults = 50)
        {
            try
            {
                var apiKey = _configuration["OpenChargeMap:ApiKey"];

                var url = $"v3/poi?output=json&" +
          $"latitude={latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}&" +
          $"longitude={longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}&" +
          $"distance=50&distanceunit=KM&maxresults={maxResults}&key={apiKey}";  

                if (!_httpClient.DefaultRequestHeaders.Contains("X-API-Key"))
                    _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[OCM Error] Status: {response.StatusCode}, Content: {error}");
                    return new List<ChargingStationDto>();
                }

                var stations = await response.Content.ReadFromJsonAsync<List<OpenChargeMapStation>>();
                return stations?.Select(ConvertToDto).ToList() ?? new List<ChargingStationDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OCM Exception] {ex.Message}");
                return new List<ChargingStationDto>();
            }
        }

        private static ChargingStationDto ConvertToDto(OpenChargeMapStation station)
        {
            var connector = station.Connections?.FirstOrDefault();

            return new ChargingStationDto
            {
                Name = station.OperatorInfo?.Title ?? station.AddressInfo?.Title ?? "Unknown",
                Latitude = station.AddressInfo?.Latitude ?? 0,
                Longitude = station.AddressInfo?.Longitude ?? 0,
                Address = station.AddressInfo?.AddressLine1 ?? "",
                City = station.AddressInfo?.Town,
                Country = station.AddressInfo?.Country?.Title,
                ConnectorType = connector?.ConnectionType?.Title ?? "Unknown",
                PowerOutput = connector?.PowerKW ?? 0,
                IsOperational = station.StatusType?.IsOperational ?? true
            };
        }
            }

    // API Response Models (internal)
    internal class OpenChargeMapStation
    {
        public int ID { get; set; }
        public string? UUID { get; set; }
        public AddressInfo? AddressInfo { get; set; }
        public OperatorInfo? OperatorInfo { get; set; }
        public List<Connection>? Connections { get; set; }
        public StatusType? StatusType { get; set; }
    }

    internal class AddressInfo
    {
        public int ID { get; set; }
        public string? Title { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? Town { get; set; }
        public string? StateOrProvince { get; set; }
        public string? Postcode { get; set; }
        public Country? Country { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    internal class OperatorInfo
    {
        public int ID { get; set; }
        public string? Title { get; set; }
    }

    internal class Connection
    {
        public int ID { get; set; }
        public ConnectionType? ConnectionType { get; set; }
        public double PowerKW { get; set; }
    }

    internal class ConnectionType
    {
        public int ID { get; set; }
        public string? Title { get; set; }
    }

    internal class StatusType
    {
        public int ID { get; set; }
        public string? Title { get; set; }
        public bool IsOperational { get; set; }
    }

    internal class Country
    {
        public int ID { get; set; }
        public string? Title { get; set; }
    }
}