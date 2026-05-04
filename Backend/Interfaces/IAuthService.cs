using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Models;


namespace EvRoutePlanner.Api.Interfaces
{
    public interface IAuthService
{
    Task<User?> Register(UserRegisterDto dto);
    Task<AuthResponseDto?> Login(UserLoginDto dto);
}
}
