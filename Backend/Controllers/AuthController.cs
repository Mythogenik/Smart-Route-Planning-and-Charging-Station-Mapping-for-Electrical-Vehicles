using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            var user = await _authService.Register(dto);
            if (user == null) return BadRequest("Email already registered.");
            return Ok("Registration successful.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var response = await _authService.Login(dto);
            if (response == null) return Unauthorized("Wrong email or password");
            return Ok(response);
        }
    }
}