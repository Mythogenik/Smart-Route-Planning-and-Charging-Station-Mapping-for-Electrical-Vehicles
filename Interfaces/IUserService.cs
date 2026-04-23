using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Models;

namespace EvRoutePlanner.Api.Interfaces
{
    public interface IUserService
    {
        Task<User?> RegisterAsync(UserRegisterDto dto);
        Task<string?> LoginAsync(UserLoginDto dto);
    }
}
