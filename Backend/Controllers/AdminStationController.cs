using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvRoutePlanner.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/stations")]
    public class AdminStationController : ControllerBase
    {
        private readonly IChargingStationService _stationService;

        public AdminStationController(IChargingStationService stationService)
        {
            _stationService = stationService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(ChargingStationDto dto)
        {
            var result = await _stationService.CreateStation(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var station = await _stationService.GetStationById(id);
            if (station == null) return NotFound();
            return Ok(station);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _stationService.DeleteStation(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}