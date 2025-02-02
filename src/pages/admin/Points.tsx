import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { DeliveryPoint, DeliveryPointFormData } from '../../types/types';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGoogleAutocomplete: () => void;
  }
}

export default function Points() {
  const [points, setPoints] = useState<DeliveryPoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<DeliveryPoint | null>(null);
  const [formData, setFormData] = useState<DeliveryPointFormData>({
    shop_code: '',
    name: '',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    is_active: true,
  });
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    fetchPoints();
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isModalOpen && window.google) {
      initAutocomplete();
    }
  }, [isModalOpen]);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      window.initGoogleAutocomplete = initAutocomplete;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    }
  };

  const initAutocomplete = () => {
    if (addressInputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'fr' },
        fields: ['address_components', 'geometry', 'formatted_address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          let city = '';
          place.address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
          });

          setFormData(prev => ({
            ...prev,
            address: place.formatted_address,
            city: city || prev.city,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          }));
        }
      });
    }
  };

  const fetchPoints = async () => {
    const { data, error } = await supabase
      .from('delivery_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching points:', error);
      return;
    }

    setPoints(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPoint) {
      const { error } = await supabase
        .from('delivery_points')
        .update(formData)
        .eq('id', editingPoint.id);

      if (error) {
        console.error('Error updating point:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('delivery_points')
        .insert([formData]);

      if (error) {
        console.error('Error creating point:', error);
        return;
      }
    }

    setIsModalOpen(false);
    setEditingPoint(null);
    resetForm();
    fetchPoints();
  };

  const handleEdit = (point: DeliveryPoint) => {
    setEditingPoint(point);
    setFormData({
      shop_code: point.shop_code,
      name: point.name,
      city: point.city,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      is_active: point.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce point de livraison ?')) {
      return;
    }

    const { error } = await supabase
      .from('delivery_points')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting point:', error);
      return;
    }

    fetchPoints();
  };

  const resetForm = () => {
    setFormData({
      shop_code: '',
      name: '',
      city: '',
      address: '',
      latitude: 0,
      longitude: 0,
      is_active: true,
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Points de livraison</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingPoint(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Ajouter un point
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ville</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actif</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id} className="border-t">
                <td className="px-6 py-4">{point.shop_code}</td>
                <td className="px-6 py-4">{point.name}</td>
                <td className="px-6 py-4">{point.city}</td>
                <td className="px-6 py-4">
                  {point.is_active ? (
                    <Check className="text-green-500" size={20} />
                  ) : (
                    <X className="text-red-500" size={20} />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(point)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(point.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingPoint ? 'Modifier' : 'Ajouter'} un point de livraison
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code magasin
                  </label>
                  <input
                    type="text"
                    value={formData.shop_code}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_code: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                    placeholder="Commencez à taper une adresse..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Point actif</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingPoint ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}