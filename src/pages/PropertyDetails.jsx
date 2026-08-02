import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/properties/${id}`)
      .then((response) => setProperty(response.data))
      .catch(() => setError('Unable to load property details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <div className="rounded-xl bg-white p-8 shadow-sm">Loading…</div>
        </main>
      </div>
    );
  }

  if (!property || error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <div className="rounded-xl bg-white p-8 shadow-sm text-red-600">{error || 'Property not found.'}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="text-blue-600 font-semibold text-xl mb-4">₹{property.price?.toLocaleString()}</div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                <span>{property.area} sq.ft</span>
                <span>{property.listingType}</span>
                <span>{property.propertyType}</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <h2 className="font-semibold mb-2">Location</h2>
                  <p>{property.location}</p>
                  <p>{property.city?.name || property.city}</p>
                  <p>{property.state}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <h2 className="font-semibold mb-2">Posted by</h2>
                  <p>{property.postedBy?.name}</p>
                  <p>{property.postedBy?.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 p-6 border-l border-slate-200">
              <h2 className="text-xl font-bold mb-4">Gallery</h2>
              <div className="space-y-4">
                {(property.images || []).map((src, idx) => (
                  <img key={idx} src={src} alt={`Property ${idx + 1}`} className="w-full rounded-2xl object-cover h-48" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PropertyDetails;
