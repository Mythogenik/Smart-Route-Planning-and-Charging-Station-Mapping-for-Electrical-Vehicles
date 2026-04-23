using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using System.Text.Json;

namespace EvRoutePlanner.Api.Services
{
    public class LocationService : ILocationService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public LocationService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<List<LocationResult>> SearchLocationAsync(string query)
        {
            var client = _httpClientFactory.CreateClient("Nominatim");

            var response = await client.GetAsync(
                $"search?q={query}&format=json&limit=3");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<List<LocationResult>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<LocationResult>();
        }
    }
}
