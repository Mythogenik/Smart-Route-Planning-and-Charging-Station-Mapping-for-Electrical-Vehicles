using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EvRoutePlanner.Api.Services
{
    public class ChargingStationService : IChargingStationService
    {
        private readonly AppDbContext _context;

        public ChargingStationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChargingStationDto>> GetAllStations()
        {
            var stations = await _context.ChargingStations.ToListAsync();
            return stations.Select(MapToDto);
        }

        public async Task<ChargingStationDto?> GetStationById(int id)
        {
            var station = await _context.ChargingStations.FindAsync(id);
            return station == null ? null : MapToDto(station);
        }

        public async Task<IEnumerable<ChargingStationDto>> GetNearbyStations(double latitude, double longitude, double radiusKm = 10)
        {
            var allStations = await _context.ChargingStations.ToListAsync();

            var nearby = allStations
                .Where(s => CalculateDistance(latitude, longitude, s.Latitude, s.Longitude) <= radiusKm)
                .Select(MapToDto)
                .ToList();

            return nearby;
        }

        public async Task<ChargingStationDto> CreateStation(ChargingStationDto dto)
        {
            var station = new ChargingStation
            {
                Name = dto.Name,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                ConnectorType = dto.ConnectorType,
                PowerOutput = dto.PowerOutput,
                IsOperational = dto.IsOperational
            };

            await _context.ChargingStations.AddAsync(station);
            await _context.SaveChangesAsync();

            return MapToDto(station);
        }

        public async Task<ChargingStationDto?> UpdateStation(int id, ChargingStationDto dto)
        {
            var station = await _context.ChargingStations.FindAsync(id);
            if (station == null) return null;

            station.Name = dto.Name;
            station.Latitude = dto.Latitude;
            station.Longitude = dto.Longitude;
            station.Address = dto.Address;
            station.City = dto.City;
            station.Country = dto.Country;
            station.ConnectorType = dto.ConnectorType;
            station.PowerOutput = dto.PowerOutput;
            station.IsOperational = dto.IsOperational;
            station.UpdatedAt = DateTime.UtcNow;

            _context.ChargingStations.Update(station);
            await _context.SaveChangesAsync();

            return MapToDto(station);
        }

        public async Task<bool> DeleteStation(int id)
        {
            var station = await _context.ChargingStations.FindAsync(id);
            if (station == null) return false;

            _context.ChargingStations.Remove(station);
            await _context.SaveChangesAsync();

            return true;
        }

        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private static ChargingStationDto MapToDto(ChargingStation station)
        {
            return new ChargingStationDto
            {
                Id = station.Id,
                Name = station.Name,
                Latitude = station.Latitude,
                Longitude = station.Longitude,
                Address = station.Address,
                City = station.City,
                Country = station.Country,
                ConnectorType = station.ConnectorType,
                PowerOutput = station.PowerOutput,
                IsOperational = station.IsOperational
            };
        }
    }
}