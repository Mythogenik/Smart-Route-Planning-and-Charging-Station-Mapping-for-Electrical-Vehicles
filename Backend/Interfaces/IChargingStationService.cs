using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IChargingStationService
    {
        Task<IEnumerable<ChargingStationDto>> GetAllStations();
        Task<ChargingStationDto?> GetStationById(int id);
        Task<IEnumerable<ChargingStationDto>> GetNearbyStations(double latitude, double longitude, double radiusKm = 10);
        Task<ChargingStationDto> CreateStation(ChargingStationDto dto);
        Task<ChargingStationDto?> UpdateStation(int id, ChargingStationDto dto);
        Task<bool> DeleteStation(int id);
    }
}