using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.Data;

namespace EvRoutePlanner.Api.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UserService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public Task<string?> LoginAsync(UserLoginDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<User?> RegisterAsync(UserRegisterDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
