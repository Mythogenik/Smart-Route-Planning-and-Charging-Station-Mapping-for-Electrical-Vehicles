using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IOpenChargeMapService
    {
        Task<IEnumerable<ChargingStationDto>> GetChargingStationsNearby(double latitude, double longitude, int maxResults = 50);
    }
}
