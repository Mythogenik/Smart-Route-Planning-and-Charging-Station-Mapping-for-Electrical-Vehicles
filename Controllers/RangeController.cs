using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EvRoutePlanner.Api.Controllers
{
    public class RangeController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly IRangeService _rangeService;
        private readonly IFuelEconomyService _fuelEconomyService;

        public RangeController(IVehicleService vehicleService, IRangeService rangeService, IFuelEconomyService fuelEconomyService)
        {
            _vehicleService = vehicleService;
            _rangeService = rangeService;
            _fuelEconomyService = fuelEconomyService;
        }

        [HttpGet("{id}/range-status")]
        public async Task<IActionResult> GetRangeStatus(int id, [FromQuery] double distance)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var vehicle = await _vehicleService.GetVehicleById(id, userId);

            if (vehicle == null || vehicle.UserId != userId)
                return NotFound("Vehicle not found.");

            double? avgConsumption = await _fuelEconomyService
                .GetAverageConsumptionAsync(vehicle.Brand, vehicle.Model, vehicle.BatteryCapacity);

            double remainingRange = _rangeService.CalculateRemainingRange(
                vehicle.BatteryCapacity,
                vehicle.CurrentSoc,
                avgConsumption);

            bool sufficient = _rangeService.IsRangeSufficient(distance, remainingRange);

            return Ok(new VehicleRangeStatusDto
            {
                RemainingRangeKm = Math.Round(remainingRange, 2),
                IsSufficient = sufficient,
                DistanceToTargetKm = distance,
                SafetyMarginKm = Math.Round(remainingRange * 0.9, 2)
            });
        }

    }
}
