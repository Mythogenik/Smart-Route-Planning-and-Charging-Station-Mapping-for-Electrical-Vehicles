using EvRoutePlanner.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/location")]
    public class LocationController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var result = await _locationService.SearchLocationAsync(query);
            return Ok(result);
        }
    }
}
