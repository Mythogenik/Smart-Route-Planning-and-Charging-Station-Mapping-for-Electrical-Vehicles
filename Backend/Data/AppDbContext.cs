using Microsoft.EntityFrameworkCore;
using EvRoutePlanner.Api.Models;

namespace EvRoutePlanner.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Vehicle> Vehicles { get; set; } = null!;
        public DbSet<EvModel> EvModels { get; set; } = null!;
        public DbSet<ChargingStation> ChargingStations { get; set; } = null!;
        public DbSet<Models.Route> Routes { get; set; } = null!;
    }
}

