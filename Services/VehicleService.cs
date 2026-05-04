using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EvRoutePlanner.Api.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly AppDbContext _context;
        private readonly IFuelEconomyService _fuelEconomyService;

        public VehicleService(AppDbContext context, IFuelEconomyService fuelEconomyService)
        {
            _context = context;
            _fuelEconomyService = fuelEconomyService;
        }

        public async Task<VehicleResponseDto> CreateVehicle(int userId, CreateVehicleDto dto)
        {
            var consumption = await _fuelEconomyService.GetAverageConsumptionAsync(
                dto.Brand,
                dto.Model,
                dto.BatteryCapacity
            );

            var vehicle = new Vehicle
            {
                Brand = dto.Brand,
                Model = dto.Model,
                BatteryCapacity = dto.BatteryCapacity,
                CurrentSoc = dto.CurrentSoc,
                UserId = userId,
                AverageConsumption = consumption ?? 18.0
            };

            await _context.Vehicles.AddAsync(vehicle);
            await _context.SaveChangesAsync();

            return MapToDto(vehicle);
        }

        public async Task<IEnumerable<VehicleResponseDto>> GetUserVehicles(int userId)
        {
            var vehicles = await _context.Vehicles
                .Where(v => v.UserId == userId)
                .ToListAsync();

            return vehicles.Select(MapToDto);
        }

        public async Task<VehicleResponseDto?> GetVehicleById(int vehicleId, int userId)
        {
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);

            return vehicle == null ? null : MapToDto(vehicle);
        }

        public async Task<VehicleResponseDto?> UpdateVehicle(int vehicleId, int userId, UpdateVehicleDto dto)
        {
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (vehicle == null) return null;

            if (vehicle.Brand != dto.Brand || vehicle.Model != dto.Model)
            {
                var newConsumption = await _fuelEconomyService.GetAverageConsumptionAsync(dto.Brand, dto.Model, dto.BatteryCapacity);
                vehicle.AverageConsumption = newConsumption ?? 18.0;
            }

            vehicle.Brand = dto.Brand;
            vehicle.Model = dto.Model;
            vehicle.BatteryCapacity = dto.BatteryCapacity;
            vehicle.CurrentSoc = dto.CurrentSoc;
            vehicle.AverageConsumption = dto.AverageConsumption;

            _context.Vehicles.Update(vehicle);
            await _context.SaveChangesAsync();

            return MapToDto(vehicle);
        }

        public async Task<bool> DeleteVehicle(int vehicleId, int userId)
        {
            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (vehicle == null) return false;

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return true;
        }

        private static VehicleResponseDto MapToDto(Vehicle vehicle)
        {
            return new VehicleResponseDto
            {
                Id = vehicle.Id,
                Brand = vehicle.Brand,
                Model = vehicle.Model,
                BatteryCapacity = vehicle.BatteryCapacity,
                CurrentSoc = vehicle.CurrentSoc,
                AverageConsumption = vehicle.AverageConsumption,
                UserId = vehicle.UserId
            };
        }
    }
}
