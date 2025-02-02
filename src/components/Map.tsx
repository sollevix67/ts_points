import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DeliveryPoint } from '../types/types';
import 'leaflet/dist/leaflet.css';

interface Props {
  points: DeliveryPoint[];
}

export default function Map({ points }: Props) {
  return (
    <MapContainer
      center={[46.603354, 1.888334]} // Center of France
      zoom={6}
      className="w-full h-[600px]"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{point.name}</h3>
              <p>{point.address}</p>
              <p>{point.city}</p>
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
      ))}
    </MapContainer>
  );
}