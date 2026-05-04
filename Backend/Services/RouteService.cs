using EvRoutePlanner.Api.Data;
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

        public async Task<Models.Route> SaveRouteAsync(Models.Route route, int userId)
        {
            if (route == null)
                throw new ArgumentNullException(nameof(route));

            // Verify that the vehicle belongs to the user
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == route.Vehicle.Id && v.UserId == userId);

            if (vehicle == null)
                throw new InvalidOperationException("Vehicle not found or does not belong to the user");

            route.Vehicle = vehicle;
            route.CreatedAt = DateTime.UtcNow.ToString("o");

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