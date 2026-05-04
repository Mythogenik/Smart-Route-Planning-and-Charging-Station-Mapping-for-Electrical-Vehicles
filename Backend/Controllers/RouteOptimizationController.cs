using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteOptimizationController : ControllerBase
    {
        private readonly IRouteOptimizationService _routeService;

        public RouteOptimizationController(IRouteOptimizationService routeService)
        {
            _routeService = routeService;
        }

        [HttpGet("plan")]
        public async Task<IActionResult> GetOptimizedRoute(
            [FromQuery] double startLat,
            [FromQuery] double startLon,
            [FromQuery] double endLat,
            [FromQuery] double endLon,
            [FromQuery] int vehicleId)
        {
            try
            {
                // Not: Gerçek bir senaryoda burada UserID kontrolü yapılmalıdır.
                // Şimdilik test kolaylığı için direkt servise gönderiyoruz.

                var result = await _routeService.OptimizeRoute(startLat, startLon, endLat, endLon, vehicleId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Bir hata oluşursa (Araç bulunamaması vb.) kullanıcıya bildiriyoruz
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}