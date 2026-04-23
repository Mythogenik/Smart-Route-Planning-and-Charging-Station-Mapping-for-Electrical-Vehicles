
using EvRoutePlanner.Api.Models;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface ILocationService
    {
        public Task<List<LocationResult>> SearchLocationAsync(string query);
    }
}
