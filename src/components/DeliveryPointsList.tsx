import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Search, Clock } from 'lucide-react';
import { DeliveryPoint } from '../types/types';

interface Props {
  points: DeliveryPoint[];
}

export default function DeliveryPointsList({ points }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredPoints = points.filter(point => 
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.shop_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id: string) => {
    navigate(`/point/${id}`);
  };

  return (
    <div className="w-full">
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Rechercher par nom ou code..."
          className="w-full p-2 pl-10 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ville</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Horaires</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actif</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoints.map((point) => (
              <tr 
                key={point.id} 
                onClick={() => handleRowClick(point.id)}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-sm">{point.shop_code}</td>
                <td className="px-6 py-4 text-sm">
                  {point.point_type === 'locker' ? 'Casier' : 'Point Relais'}
                </td>
                <td className="px-6 py-4 text-sm">{point.name}</td>
                <td className="px-6 py-4 text-sm">{point.city}</td>
                <td className="px-6 py-4 text-sm">
                  {point.opening_timeframe ? (
                    <button 
                      className="flex items-center text-blue-500 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(point.opening_timeframe);
                      }}
                    >
                      <Clock size={16} className="mr-1" />
                      Voir les horaires
                    </button>
                  ) : (
                    <span className="text-gray-400">Non renseigné</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {point.is_active ? (
                    <Check className="text-green-500" size={20} />
                  ) : (
                    <X className="text-red-500" size={20} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}