using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EvRoutePlanner.Api.Models
{
    public class Stop
    {
        public string name { get; set; } = null!;
        public string address { get; set; } = null!;
        public required double lat { get; set; }
        public required double lon { get; set; }
        public string placeId { get; set; } = null!;

    }
}
