using System;
using System.Collections.Generic;
using System.Text;

namespace EvRoutePlanner.Api.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public required string Brand { get; set; } 
        public required string Model { get; set; }
        public double BatteryCapacity { get; set; } // kWh
        public double CurrentSoc { get; set; } // State of Charge

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
