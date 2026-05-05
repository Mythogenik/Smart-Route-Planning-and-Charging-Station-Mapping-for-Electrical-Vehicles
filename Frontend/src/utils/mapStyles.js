export const LIGHT_MAP_STYLES = [
  { featureType: 'poi',           elementType: 'labels',    stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',       elementType: 'labels',    stylers: [{ visibility: 'off' }] },
  { featureType: 'water',         elementType: 'geometry',  stylers: [{ color: '#c9d8f0' }] },
  { featureType: 'landscape',     elementType: 'geometry',  stylers: [{ color: '#f4f5f7' }] },
  { featureType: 'road.highway',  elementType: 'geometry',  stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry',  stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local',    elementType: 'geometry',  stylers: [{ color: '#f0f0f0' }] },
];

export const DARK_MAP_STYLES = [
  { elementType: 'geometry',      stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#8a8a9a' }] },
  { featureType: 'poi',           elementType: 'labels',    stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',       elementType: 'labels',    stylers: [{ visibility: 'off' }] },
  { featureType: 'water',         elementType: 'geometry',  stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'landscape',     elementType: 'geometry',  stylers: [{ color: '#16213e' }] },
  { featureType: 'road.highway',  elementType: 'geometry',  stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'road.highway',  elementType: 'geometry.stroke', stylers: [{ color: '#1a1a3e' }] },
  { featureType: 'road.arterial', elementType: 'geometry',  stylers: [{ color: '#1e1e3a' }] },
  { featureType: 'road.local',    elementType: 'geometry',  stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9a9ab0' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c0c0d0' }] },
];

export function getMapStyles(theme) {
  return theme === 'dark' ? DARK_MAP_STYLES : LIGHT_MAP_STYLES;
}