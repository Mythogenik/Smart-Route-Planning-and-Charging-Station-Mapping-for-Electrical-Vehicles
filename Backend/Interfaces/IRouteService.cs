
namespace EvRoutePlanner.Api.Interfaces
{
    public interface IRouteService
    {
        Task<Models.Route> SaveRouteAsync(Models.Route route, int userId);
        Task<IEnumerable<Models.Route>> GetUserRoutesAsync(int userId);
        Task<bool> DeleteRouteAsync(int id, int userId);
        Task<Models.Route?> GetRouteByIdAsync(int id, int userId);
    }
}