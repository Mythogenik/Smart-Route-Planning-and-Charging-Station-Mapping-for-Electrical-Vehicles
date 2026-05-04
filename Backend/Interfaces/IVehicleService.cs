using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IVehicleService
    {
        Task<VehicleResponseDto> CreateVehicle(int userId, CreateVehicleDto dto);
        Task<IEnumerable<VehicleResponseDto>> GetUserVehicles(int userId);
        Task<VehicleResponseDto?> GetVehicleById(int vehicleId, int userId);
        Task<VehicleResponseDto?> UpdateVehicle(int vehicleId, int userId, UpdateVehicleDto dto);
        Task<bool> DeleteVehicle(int vehicleId, int userId);
    }
}
