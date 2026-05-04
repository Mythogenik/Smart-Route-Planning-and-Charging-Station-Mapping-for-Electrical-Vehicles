using System;
using System.Collections.Generic;
using System.Text;

namespace EvRoutePlanner.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
        public string Role { get; set; } = "User"; // "User" or "Admin"
        public List<Vehicle> Vehicles { get; set; } = new();
    }
}
