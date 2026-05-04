using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EvRoutePlanner.Api.Services
{
    public class EvModelService : IEvModelService
    {
        private readonly AppDbContext _context;

        public EvModelService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EvModelDto>> GetAllEvModels()
        {
            var models = await _context.EvModels.ToListAsync();
            return models.Select(MapToDto);
        }

        public async Task<EvModelDto?> GetEvModelById(int id)
        {
            var model = await _context.EvModels.FindAsync(id);
            return model == null ? null : MapToDto(model);
        }

        public async Task<IEnumerable<EvModelDto>> SearchEvModels(string brand, string model)
        {
            var results = await _context.EvModels
                .Where(e => e.Brand.Contains(brand) && e.Model.Contains(model))
                .ToListAsync();

            return results.Select(MapToDto);
        }

        public async Task<EvModelDto> CreateEvModel(EvModelDto dto)
        {
            var evModel = new EvModel
            {
                Brand = dto.Brand,
                Model = dto.Model,
                Year = dto.Year,
                BatteryCapacity = dto.BatteryCapacity,
                Range = dto.Range,
                ChargingSpeed = dto.ChargingSpeed
            };

            await _context.EvModels.AddAsync(evModel);
            await _context.SaveChangesAsync();

            return MapToDto(evModel);
        }

        private static EvModelDto MapToDto(EvModel evModel)
        {
            return new EvModelDto
            {
                Id = evModel.Id,
                Brand = evModel.Brand,
                Model = evModel.Model,
                Year = evModel.Year,
                BatteryCapacity = evModel.BatteryCapacity,
                Range = evModel.Range,
                ChargingSpeed = evModel.ChargingSpeed
            };
        }
    }
}