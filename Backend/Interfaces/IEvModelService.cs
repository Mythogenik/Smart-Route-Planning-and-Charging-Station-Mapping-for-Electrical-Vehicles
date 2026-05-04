using EvRoutePlanner.Api.DTOs;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IEvModelService
    {
        Task<IEnumerable<EvModelDto>> GetAllEvModels();
        Task<EvModelDto?> GetEvModelById(int id);
        Task<IEnumerable<EvModelDto>> SearchEvModels(string brand, string model);
        Task<EvModelDto> CreateEvModel(EvModelDto dto);
    }
}