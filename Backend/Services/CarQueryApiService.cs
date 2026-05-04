using EvRoutePlanner.Api.DTOs;
using System.Net.Http.Json;

namespace EvRoutePlanner.Api.Services
{
    public interface ICarQueryApiService
    {
        Task<IEnumerable<EvModelDto>> GetEvModels(string brand = "", string model = "");
    }

    public class CarQueryApiService : ICarQueryApiService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://api.carqueryapi.com/api/0.1";

        public CarQueryApiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<EvModelDto>> GetEvModels(string brand = "", string model = "")
        {
            try
            {
                // Car Query API docs: https://www.carqueryapi.com/
                // Note: Free tier has limitations. Consider scraping or using static data for production.

                var url = $"{BaseUrl}/util/make";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<CarQueryMakesResponse>();

                // simplified
                return result?.Makes?.Select(m => new EvModelDto
                {
                    Brand = m,
                    Model = "Unknown",
                    Year = DateTime.Now.Year,
                    BatteryCapacity = 0,
                    Range = 0,
                    ChargingSpeed = 0
                }).ToList() ?? new List<EvModelDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching EV models from Car Query: {ex.Message}");
                return new List<EvModelDto>();
            }
        }
    }

    public class CarQueryMakesResponse
    {
        public List<string>? Makes { get; set; }
    }
}