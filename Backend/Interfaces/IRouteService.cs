using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IRouteService
    {
        Task<Models.Route> SaveRouteAsync(SaveRouteDto dto, int userId);
        Task<IEnumerable<Models.Route>> GetUserRoutesAsync(int userId);
        Task<bool> DeleteRouteAsync(int id, int userId);
        Task<Models.Route?> GetRouteByIdAsync(int id, int userId);
    }
}