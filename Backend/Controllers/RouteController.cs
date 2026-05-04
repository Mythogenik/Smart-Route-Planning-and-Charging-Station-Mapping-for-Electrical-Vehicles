using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using EvRoutePlanner.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RouteController : ControllerBase
    {
        private readonly IRouteService _routeService;

        public RouteController(IRouteService routeService)
        {
            _routeService = routeService;
        }

        [HttpPost]
        public async Task<IActionResult> SaveRoute([FromBody] SaveRouteDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Route data is required" });

                var userId = GetUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                var savedRoute = await _routeService.SaveRouteAsync(dto, userId);
                return CreatedAtAction(nameof(GetRouteById), new { id = savedRoute.Id }, savedRoute);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while saving the route", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRoutes()
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                var routes = await _routeService.GetUserRoutesAsync(userId);
                return Ok(routes);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving routes", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRouteById(int id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                var route = await _routeService.GetRouteByIdAsync(id, userId);
                if (route == null)
                    return NotFound(new { message = "Route not found" });

                return Ok(route);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving the route", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(int id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                var success = await _routeService.DeleteRouteAsync(id, userId);
                if (!success)
                    return NotFound(new { message = "Route not found or access denied" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while deleting the route", error = ex.Message });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId) ? userId : 0;
        }
    }
}