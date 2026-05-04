using EvRoutePlanner.Api.DTOs;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Services;

namespace EvRoutePlanner.Api.Services
{
    public class RouteOptimizationService : IRouteOptimizationService
    {
        private readonly IVehicleService _vehicleService;
        private readonly IRangeService _rangeService;
        private readonly IOpenChargeMapService _ocmService;
        private readonly IFuelEconomyService _fuelEconomyService;

        public RouteOptimizationService(
            IVehicleService vehicleService,
            IRangeService rangeService,
            IOpenChargeMapService ocmService,
            IFuelEconomyService fuelEconomyService)
        {
            _vehicleService = vehicleService;
            _rangeService = rangeService;
            _ocmService = ocmService;
            _fuelEconomyService = fuelEconomyService;
        }

        public async Task<RouteOptimizationResultDto> OptimizeRoute(double startLat, double startLon, double endLat, double endLon, int vehicleId)
        {
            // 1. Aracı ve güncel menzilini al
            var vehicle = await _vehicleService.GetVehicleById(vehicleId, 1); // UserId kontrolünü controllerda yapabiliriz
            if (vehicle == null) throw new Exception("Araç bulunamadı.");

            double? avgConsumption = await _fuelEconomyService
               .GetAverageConsumptionAsync(vehicle.Brand, vehicle.Model, vehicle.BatteryCapacity);

            double currentRange = _rangeService.CalculateRemainingRange(vehicle.BatteryCapacity, vehicle.CurrentSoc, avgConsumption);

            // 2. Mesafeyi hesapla (Google API gelene kadar Haversine + %25 Yol Sapması)
            double birdsEyeDistance = CalculateHaversineDistance(startLat, startLon, endLat, endLon);
            double estimatedRoadDistance = birdsEyeDistance * 1.25;

            var result = new RouteOptimizationResultDto
            {
                TotalDistanceKm = Math.Round(estimatedRoadDistance, 2),
                CurrentRangeKm = Math.Round(currentRange, 2)
            };

            // 3. Menzil kontrolü (%10 emniyet payı ile)
            if (currentRange * 0.9 >= estimatedRoadDistance)
            {
                result.NeedsChargingStop = false;
                result.Message = "Menziliniz hedef noktaya ulaşmak için yeterli.";
                return result;
            }

            // 4. Menzil yetmiyorsa: Güvenli menzil içindeki istasyonları tara
            // Güvenli menzil: Mevcut menzilin %80'i (Yolda kalmamak için)
            double safeSearchRadius = currentRange * 0.8;

            double effectiveRadius = Math.Clamp(safeSearchRadius, 20, 150);

            var nearbyStations = await _ocmService.GetChargingStationsNearby(startLat, startLon, effectiveRadius);

            if (nearbyStations != null && nearbyStations.Any())
            {
                // Hedef noktaya en yakın olan istasyonu seç (Yolumuza devam etmek istiyoruz)
                var bestStation = nearbyStations
                    .OrderBy(s => CalculateHaversineDistance(s.Latitude, s.Longitude, endLat, endLon))
                    .First();

                result.NeedsChargingStop = true;
                result.RecommendedStation = bestStation;
                result.Message = $"Menziliniz yetersiz. Lütfen {bestStation.Name} istasyonunda şarj edin.";
            }
            else
            {
                result.NeedsChargingStop = true;
                result.Message = "Güvenli menziliniz içinde uygun şarj istasyonu bulunamadı! Hızınızı düşürmeniz önerilir.";
            }

            return result;
        }

        // Yardımcı mesafe hesaplama (Kuş uçuşu)
        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double angle) => angle * Math.PI / 180;
    }
}