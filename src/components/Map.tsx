import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DeliveryPoint } from '../types/types';
import 'leaflet/dist/leaflet.css';

// Constants for France bounds
const FRANCE_BOUNDS = {
  north: 51.089,
  south: 41.342,
  west: -5.142,
  east: 9.662
};

// Create custom icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bouncingIcon = new L.Icon({
  ...defaultIcon.options,
  className: 'leaflet-marker-bounce'
});

interface Props {
  points: DeliveryPoint[];
  selectedId?: string;
}

// Helper function to validate coordinates
function isValidCoordinate(coord: number): boolean {
  return typeof coord === 'number' && 
         !isNaN(coord) && 
         isFinite(coord) && 
         coord !== null && 
         coord !== undefined;
}

function isValidLatitude(lat: number): boolean {
  return isValidCoordinate(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng: number): boolean {
  return isValidCoordinate(lng) && lng >= -180 && lng <= 180;
}

function parseCoordinate(value: number | string): number {
  if (value === null || value === undefined) {
    console.warn('Received null or undefined coordinate');
    return 0;
  }
  const stringValue = String(value).trim().replace(',', '.');
  const parsed = typeof value === 'string' ? parseFloat(stringValue) : value;
  console.debug('Parsing coordinate:', { input: value, parsed, valid: isFinite(parsed) });
  return isFinite(parsed) ? parsed : 0;
}

// Component to handle map updates
function MapUpdater({ points, selectedId }: Props) {
  const map = useMap();

  // Set max bounds for France
  useEffect(() => {
    map.setMaxBounds([
      [FRANCE_BOUNDS.south - 0.1, FRANCE_BOUNDS.west - 0.1],
      [FRANCE_BOUNDS.north + 0.1, FRANCE_BOUNDS.east + 0.1]
    ]);
    map.on('drag', () => {
      map.panInsideBounds([
        [FRANCE_BOUNDS.south, FRANCE_BOUNDS.west],
        [FRANCE_BOUNDS.north, FRANCE_BOUNDS.east]
      ], { animate: false });
    });
  }, [map]);

  useEffect(() => {
    if (selectedId) {
      const selectedPoint = points.find(p => p.id === selectedId);
      if (selectedPoint) {
        const lat = parseCoordinate(selectedPoint.latitude);
        const lng = parseCoordinate(selectedPoint.longitude);
        
        if (isValidLatitude(lat) && isValidLongitude(lng)) {
          // Center map on selected point's GPS coordinates
          map.setView([lat, lng], 15, { animate: true });
          return;
        }
      }
      
      // Log selected point details for debugging
      console.debug('Selected point details:', {
        point: selectedPoint,
        coordinates: selectedPoint ? { lat: selectedPoint.latitude, lng: selectedPoint.longitude } : null
      });
    }
    
    if (points.length > 0) {
      // Calculate bounds for all points
      const validPoints = points.filter(p => 
        isValidLatitude(parseCoordinate(p.latitude)) && 
        isValidLongitude(parseCoordinate(p.longitude))
        && p.latitude !== null && p.longitude !== null
      );
      const bounds = L.latLngBounds(validPoints.map(p => [
        parseCoordinate(p.latitude),
        parseCoordinate(p.longitude)
      ]));
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true
      });
    }
  }, [map, points, selectedId]);

  // Log any points with invalid coordinates for debugging
  useEffect(() => {
    points.forEach(point => {
      const lat = parseCoordinate(point.latitude);
      const lng = parseCoordinate(point.longitude);
      if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
        console.warn(
          `Invalid coordinates for point ${point.id}:`,
          `lat=${lat} (${typeof point.latitude}), lng=${lng} (${typeof point.longitude})`
        );
      }
    });
  }, [points]);

  return null;
}

export default function Map({ points, selectedId }: Props) {
  const initialCenter = useMemo(() => {
    if (selectedId) {
      const selectedPoint = points.find(p => p.id === selectedId);
      if (selectedPoint) {
        const lat = parseCoordinate(selectedPoint.latitude);
        const lng = parseCoordinate(selectedPoint.longitude);
        if (isValidLatitude(lat) && isValidLongitude(lng)) {
          return [lat, lng];
        }
      }
    }
    
    // Log points array for debugging
    console.debug('Points array:', points.map(p => ({
      id: p.id,
      coordinates: { lat: p.latitude, lng: p.longitude }
    })));

    // Default center for France
    return [48.52797, 7.60425];
  }, [points, selectedId]);

  const initialZoom = useMemo(() => {
    return selectedId ? 15 : 6;
  }, [selectedId]);

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-20px); }
          }
          .leaflet-marker-bounce {
           animation: bounce 1s ease-in-out infinite;
           transform-origin: bottom center;
           z-index: 1000 !important;
          }
         .leaflet-marker-bounce .leaflet-marker-icon {
           transform-origin: bottom center;
         }
        `}
      </style>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-[600px]"
        key={`map-${selectedId || 'all'}`}
        scrollWheelZoom={true}
        minZoom={5}
        maxZoom={18}
        dragging={true}
        doubleClickZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
         className="[&_img]:transition-opacity"
        />
        {points.map((point) => (
          (() => {
            const lat = parseCoordinate(point.latitude);
            const lng = parseCoordinate(point.longitude);
            
            if (!point || !isValidLatitude(lat) || !isValidLongitude(lng)) {
              console.warn(
                `Invalid coordinates for point ${point.id}:`,
                `lat=${lat}, lng=${lng}`
              );
              return null;
            }
            
            return (
              <Marker
                key={point.id}
                icon={point.id === selectedId ? bouncingIcon : defaultIcon}
                position={[lat, lng]}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{point.name}</h3>
                    <p>{point.address}</p>
                    <p>{point.city}</p>
                    <p className="text-sm text-gray-500">
                      GPS: {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                    <a
                      href={`/point/${point.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Voir les détails
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })()
        ))}
        <MapUpdater points={points} selectedId={selectedId} />
      </MapContainer>
    </>
  );
}