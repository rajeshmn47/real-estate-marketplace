import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { FaSearch, FaHeart, FaBed, FaBath } from 'react-icons/fa';

function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', listingType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  const [error, setError] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.listingType) params.append('listingType', filters.listingType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);

      const response = await api.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties || []);
    } catch (err) {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Explore properties</h1>
          <p className="text-gray-600 mt-2">Filter and browse all available listings.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
            <div className="space-y-4">
              <label className="block text-sm text-gray-700">City</label>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2"
                value={filters.city}
                onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Bengaluru"
              />
              <label className="block text-sm text-gray-700">Listing Type</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-2"
                value={filters.listingType}
                onChange={(e) => setFilters((prev) => ({ ...prev, listingType: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Commercial">Commercial</option>
                <option value="PG/Co-Living">PG/Co-Living</option>
                <option value="Plots">Plots</option>
              </select>
              <label className="block text-sm text-gray-700">Price Range</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  className="rounded-xl border border-gray-200 px-4 py-2"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                />
                <input
                  type="number"
                  className="rounded-xl border border-gray-200 px-4 py-2"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>
              <label className="block text-sm text-gray-700">Bedrooms</label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 px-4 py-2"
                placeholder="Any"
                value={filters.bedrooms}
                onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
              />
              <button
                type="button"
                onClick={loadProperties}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </aside>
          <section className="space-y-6">
            {error && <div className="rounded-xl bg-red-100 p-4 text-red-700">{error}</div>}
            {loading ? (
              <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading listings…</div>
            ) : properties.length === 0 ? (
              <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">No listings found.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <button
                    key={property._id}
                    type="button"
                    onClick={() => navigate(`/properties/${property._id}`)}
                    className="group rounded-3xl overflow-hidden bg-white shadow-sm text-left border border-gray-200 hover:shadow-lg transition"
                  >
                    <img
                      className="h-52 w-full object-cover"
                      src={property.images?.[0] || 'https://via.placeholder.com/420x320?text=No+Image'}
                      alt={property.title}
                    />
                    <div className="p-5">
                      <div className="text-lg font-semibold text-gray-900">{property.title}</div>
                      <div className="mt-1 text-blue-600 font-semibold">₹{Number(property.price).toLocaleString('en-IN')}</div>
                      <div className="mt-2 text-sm text-gray-500">{property.location}</div>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><FaBed /> {property.bedrooms || 0}</span>
                        <span className="inline-flex items-center gap-1"><FaBath /> {property.bathrooms || 0}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PropertyList;
