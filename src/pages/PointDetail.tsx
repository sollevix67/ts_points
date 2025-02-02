import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DeliveryPoint } from '../types/types';

export default function PointDetail() {
  const { id } = useParams();
  const [point, setPoint] = useState<DeliveryPoint | null>(null);

  useEffect(() => {
    fetchPoint();
  }, [id]);

  async function fetchPoint() {
    if (!id) return;

    const { data, error } = await supabase
      .from('delivery_points')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching point:', error);
      return;
    }

    setPoint(data);
  }

  if (!point) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{point.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <dl className="space-y-2">
              <dt className="font-medium">Code magasin</dt>
              <dd className="text-gray-600">{point.shop_code}</dd>

              <dt className="font-medium mt-4">Adresse</dt>
              <dd className="text-gray-600">{point.address}</dd>

              <dt className="font-medium mt-4">Ville</dt>
              <dd className="text-gray-600">{point.city}</dd>

              <dt className="font-medium mt-4">Statut</dt>
              <dd className="text-gray-600">
                {point.is_active ? 'Actif' : 'Inactif'}
              </dd>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Street View</h2>
            <iframe
              width="100%"
              height="300"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/streetview?key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }&location=${point.latitude},${point.longitude}`}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
