using System;
using System.Collections.Generic;
using System.Drawing;
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

        public double Range { get; set; }
        public double TopSpeed { get; set; }
        public string Color { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Nickname { get; set; } = string.Empty;

        public double AverageConsumption { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
