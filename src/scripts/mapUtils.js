export function initMap(containerId, initialPosition) {
  const mapEl = document.getElementById(containerId);
  if (!mapEl) return null;
  
  const L = window.L;
  if (!L) {
    console.error('Leaflet is not loaded');
    return null;
  }

  const map = L.map(containerId).setView(initialPosition, 15);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  L.marker(initialPosition)
    .addTo(map)
    .bindPopup('Ölçüm Noktası')
    .openPopup();
    
  return map;
}