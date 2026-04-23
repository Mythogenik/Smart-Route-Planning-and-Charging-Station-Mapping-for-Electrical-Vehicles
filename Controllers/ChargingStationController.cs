using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/stations")]
    public class ChargingStationController : ControllerBase
    {
        private readonly IChargingStationService _stationService;
        private readonly IOpenChargeMapService _ocmService;

        public ChargingStationController(IChargingStationService stationService, IOpenChargeMapService ocmService)
        {
            _stationService = stationService;
            _ocmService = ocmService;
        }

        
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearby([FromQuery] double lat, [FromQuery] double lon, [FromQuery] double radius = 10)
        {
            var stations = await _stationService.GetNearbyStations(lat, lon, radius);
            return Ok(stations);
        }

        
        [HttpGet("external/nearby")]
        public async Task<IActionResult> GetExternalNearby([FromQuery] double lat, [FromQuery] double lon)
        {
            var stations = await _ocmService.GetChargingStationsNearby(lat, lon);
            return Ok(stations);
        }
    }
}