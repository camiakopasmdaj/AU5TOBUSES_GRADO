
const config = {
  updateInterval: 1000,
  smoothMovement: true,
  movementThreshold: 0.00001,
  maxHistoryPoints: 10,
  notificationDistance: 0.2,
  defaultZoom: 15,
  userZoom: 16,
  busInactivityTimeout: 30000, 
  retainedMessages: true,
  autoCenterOnBus: false
};

// Variables de estado globales
let map;
let buses = {};
let notificacionesActivas = {};
let lastKnownPositions = {};
let busPositionHistory = {};
let busTrazados = {};
let busesNotificados = new Set();
let lastNotificationTime = {};
let activeBusId = null;
let userZoomInteracted = false;
let lastUpdateTime = null;
let userCoords = null;
let userMarker = null;
let notificationCount = 0;
let audioEnabled = false;
let geolocationWatchId = null;
let routePolyline = null;
let routeMarkers = [];
let mostrarRuta = false;
let gpsPermissionModal;
let bellIcon;
let notificationPanel;
let notificationCountEl;
let connectionStatus;
let connectionIcon;
let updateStatus;
let locateMeBtn;
let zoomInBtn;
let zoomOutBtn;
let centerActiveBusBtn;
let allowGpsBtn;
let denyGpsBtn;
let verBusesBtn;
let verTrazadoBtn;
let trackingInfo;
let trackingBuses;
let userMenu;
let userButton;
let userDropdown;
let logoutButton;

// Icono personalizado para autobuses
const busIcon = L.icon({
  iconUrl: 'imagenes/image.png?v=1',
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -40],
  className: 'bus-logo'
});

// Iconos personalizados para inicio y fin de ruta
const inicioIcon = L.divIcon({
  className: 'icono-inicio',
  html: '<div style="width: 20px; height: 20px; background: #2ecc71; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const finIcon = L.divIcon({
  className: 'icono-fin',
  html: '<div style="width: 20px; height: 20px; background: #e74c3c; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
  initializeUIElements();
  initializeMap();
  setTimeout(requestGeolocationPermission, 1000);
});

// Inicializar elementos de la UI
function initializeUIElements() {
  gpsPermissionModal = document.getElementById('gpsPermissionModal');
  bellIcon = document.getElementById('bell');
  notificationPanel = document.getElementById('notificationPanel');
  notificationCountEl = document.getElementById('notificationCount');
  connectionStatus = document.getElementById('connection-status');
  connectionIcon = document.getElementById('connection-icon');
  updateStatus = document.getElementById('update-status');
  locateMeBtn = document.getElementById('locateMe');
  zoomInBtn = document.getElementById('zoomIn');
  zoomOutBtn = document.getElementById('zoomOut');
  centerActiveBusBtn = document.getElementById('centerActiveBus');
  allowGpsBtn = document.getElementById('allowGps');
  denyGpsBtn = document.getElementById('denyGps');
  verBusesBtn = document.getElementById('verBuses');
  verTrazadoBtn = document.getElementById('verTrazado');
  trackingInfo = document.getElementById('trackingInfo');
  trackingBuses = document.getElementById('trackingBuses');
  userMenu = document.getElementById('userMenu');
  userButton = document.getElementById('userButton');
  userDropdown = document.getElementById('userDropdown');
  logoutButton = document.getElementById('logoutButton');
}

// Inicializar mapa
function initializeMap() {
  map = L.map('map', {
    zoomControl: false,
    preferCanvas: true
  }).setView([2.4369, -76.6131], config.defaultZoom);

  // Añadir control de zoom
  L.control.zoom({
    position: 'topleft'
  }).addTo(map);

  // Capa del mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Detectar interacción de zoom del usuario
  map.on('zoomstart', function() {
    userZoomInteracted = true;
    config.autoCenterOnBus = false;
  });
}