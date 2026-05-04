using EvRoutePlanner.Api.Data;
using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EvRoutePlanner.Api.Services
{
    public class RouteService : IRouteService
    {
        private readonly AppDbContext _context;

        public RouteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Models.Route> SaveRouteAsync(SaveRouteDto dto, int userId)
{
    var vehicle = await _context.Vehicles
        .FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.UserId == userId);

    if (vehicle == null)
        throw new InvalidOperationException("Vehicle not found or does not belong to the user");

    var route = new Models.Route
    {
        VehicleId =          dto.VehicleId,
        Vehicle =            vehicle,
        UserId =             userId,
        CreatedAt =          dto.CreatedAt,
        OriginLat =          dto.OriginLat,
        OriginLon =          dto.OriginLon,
        OriginName =         dto.OriginName,
        OriginAddress =      dto.OriginAddress,
        DestinationLat =     dto.DestinationLat,
        DestinationLon =     dto.DestinationLon,
        DestinationName =    dto.DestinationName,
        DestinationAddress = dto.DestinationAddress,
        StopsJson =          dto.StopsJson,
        TotalDistance =      dto.TotalDistance,
        TotalDuration =      dto.TotalDuration,
        safeRange =          dto.SafeRange,
    };

        _context.Routes.Add(route);
        await _context.SaveChangesAsync();
        return route;
    }

        public async Task<IEnumerable<Models.Route>> GetUserRoutesAsync(int userId)
        {
            return await _context.Routes
                .Where(r => r.Vehicle.UserId == userId)
                .Include(r => r.Vehicle)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteRouteAsync(int id, int userId)
        {
            var route = await _context.Routes
                .Include(r => r.Vehicle)
                .FirstOrDefaultAsync(r => r.Id == id && r.Vehicle.UserId == userId);

            if (route == null)
                return false;

            _context.Routes.Remove(route);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Models.Route?> GetRouteByIdAsync(int id, int userId)
        {
            return await _context.Routes
                .Where(r => r.Id == id && r.Vehicle.UserId == userId)
                .Include(r => r.Vehicle)
                .FirstOrDefaultAsync();
        }
    }
}