using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IRouteOptimizationService
    {
        Task<RouteOptimizationResultDto> OptimizeRoute(double startLat, double startLon, double endLat, double endLon, int vehicleId);
    }
}
