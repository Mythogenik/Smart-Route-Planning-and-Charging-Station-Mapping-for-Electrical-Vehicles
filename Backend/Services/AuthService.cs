using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.Data;
using EvRoutePlanner.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<User?> Register(UserRegisterDto dto)
    {
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email.ToLower()))
            return null;

        CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email.ToLower(),
            PasswordHash = hash,
            PasswordSalt = salt,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Role = "User" // Default role
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<AuthResponseDto?> Login(UserLoginDto dto)
    {
        
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email.ToLower());

        if (user == null || !VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
            return null;

        return _jwtService.GenerateToken(user);
    }

    private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
    {
        using var hmac = new HMACSHA512();
        salt = hmac.Key;
        hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    private bool VerifyPasswordHash(string password, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(hash);
    }
}