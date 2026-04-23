using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehicleController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        private int GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userId ?? "0");
        }

        [HttpPost]
        public async Task<IActionResult> CreateVehicle(CreateVehicleDto dto)
        {
            var userId = GetUserId();
            var vehicle = await _vehicleService.CreateVehicle(userId, dto);
            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserVehicles()
        {
            var userId = GetUserId();
            var vehicles = await _vehicleService.GetUserVehicles(userId);
            return Ok(vehicles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            var userId = GetUserId();
            var vehicle = await _vehicleService.GetVehicleById(id, userId);

            if (vehicle == null)
                return NotFound("Vehicle not found.");

            return Ok(vehicle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, UpdateVehicleDto dto)
        {
            var userId = GetUserId();
            var vehicle = await _vehicleService.UpdateVehicle(id, userId, dto);

            if (vehicle == null)
                return NotFound("Vehicle not found.");

            return Ok(vehicle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var userId = GetUserId();
            var success = await _vehicleService.DeleteVehicle(id, userId);

            if (!success)
                return NotFound("Vehicle not found.");

            return NoContent();
        }
    }
}
