using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvRoutePlanner.Api.Controllers
{
    [ApiController]
    [Route("api/sync")]
    [Authorize(Roles = "Admin")]
    public class SyncController : ControllerBase
    {
        private readonly IOpenChargeMapService _openChargeMapService;
        private readonly IChargingStationService _chargingStationService;

        public SyncController(IOpenChargeMapService openChargeMapService, IChargingStationService chargingStationService)
        {
            _openChargeMapService = openChargeMapService;
            _chargingStationService = chargingStationService;
        }

        [HttpPost("charging-stations")]
        public async Task<IActionResult> SyncChargingStations([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double distance = 100, [FromQuery] string? city = null)
        {
            try
            {
                Console.WriteLine($"[SYNC] Starting sync for {city ?? "coordinates"} (lat: {latitude}, lon: {longitude})");

                var stationsFromApi = await _openChargeMapService.GetChargingStationsNearby(latitude, longitude, distance);

                if (!stationsFromApi.Any())
                    return Ok(new { message = "No stations found in the area", city = city ?? "Unknown" });

                var existingOcmIds = (await _chargingStationService.GetAllStations())
                                        .Where(s => !string.IsNullOrEmpty(s.OcmId))
                                        .Select(s => s.OcmId)
                                        .ToHashSet();

                int savedCount = 0;
                var failedStations = new List<string>();

                foreach (var station in stationsFromApi)
                {
                    if (existingOcmIds.Contains(station.OcmId))
                    {
                        Console.WriteLine($"[SYNC] Skipping duplicate: {station.Name}");
                        continue;
                    }

                    try
                    {
                        await _chargingStationService.CreateStation(station);
                        savedCount++;
                        Console.WriteLine($"[SYNC] Saved: {station.Name}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SYNC] Failed to save {station.Name}: {ex.Message}");
                        failedStations.Add($"{station.Name}: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    message = "Synchronization completed",
                    city = city ?? "Unknown",
                    found = stationsFromApi.Count(),
                    newlySaved = savedCount,
                    alreadyExists = stationsFromApi.Count() - savedCount,
                    failed = failedStations.Count,
                    failedDetails = failedStations.Any() ? failedStations : null
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SYNC] Exception: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred during synchronization.", details = ex.Message });
            }
        }

        [HttpDelete("clear-stations")]
        public async Task<IActionResult> ClearStations()
        {
            try
            {
                var allStations = await _chargingStationService.GetAllStations();
                
                foreach (var station in allStations)
                {
                    await _chargingStationService.DeleteStation(station.Id);
                }

                return Ok(new { message = "All stations deleted.", count = allStations.Count() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}