//using EvRoutePlanner.Api.Models;
//using EvRoutePlanner.Api.Data;
//using Microsoft.EntityFrameworkCore;
//using System.Security.Cryptography;
//using System.Text;

//namespace EvRoutePlanner.Api.Services
//{
//    public interface ISeedingService
//    {
//        Task EnsureAdminUserExists();
//    }

//    public class SeedingService : ISeedingService
//    {
//        private readonly AppDbContext _context;

//        public SeedingService(AppDbContext context)
//        {
//            _context = context;
//        }

//        public async Task EnsureAdminUserExists()
//        {
//            if (await _context.Users.AnyAsync(u => u.Email == "admin@evrouteplanner.com"))
//                return;

//            var adminPasswordHash = new byte[64];
//            var adminPasswordSalt = new byte[128];

//            using (var hmac = new HMACSHA512())
//            {
//                adminPasswordSalt = hmac.Key;
//                adminPasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Admin@123456"));
//            }

//            var adminUser = new User
//            {
//                Username = "admin",
//                Email = "admin@evrouteplanner.com",
//                PasswordHash = adminPasswordHash,
//                PasswordSalt = adminPasswordSalt,
//                Role = "Admin"
//            };

//            await _context.Users.AddAsync(adminUser);
//            await _context.SaveChangesAsync();
//        }
//    }
//}