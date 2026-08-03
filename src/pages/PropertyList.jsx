// src/pages/PropertyList.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch, FaMapMarkerAlt, FaHeart, FaBed, FaBath,
  FaHome, FaChevronDown, FaDownload, FaUserCircle,
  FaBars, FaTimes, FaSpinner, FaCheckCircle, FaStar,
  FaFilter, FaTimesCircle
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ===== NORMALIZE LISTING TYPE =====
const normalizeListingType = (type) => {
  if (!type) return '';
  const map = {
    'buy': 'Buy',
    'rent': 'Rent',
    'commercial': 'Commercial',
    'plots': 'Plots',
    'plot': 'Plots',
    'pg/co-living': 'PG/Co-living',
    'pg': 'PG/Co-living',
  };
  return map[type.toLowerCase()] || type;
};

// ===== DYNAMIC PROPERTY TYPES =====
const propertyTypeOptions = {
  Buy: [
    'Apartment',
    'Independent House',
    'Independent Floor',
    'Plot',
    'Studio',
    'Duplex',
    'Penthouse',
    'Villa',
  ],
  Rent: [
    'Apartment',
    'Independent House',
    'Independent Floor',
    'Studio',
    'Duplex',
    'Penthouse',
    'Villa',
    'PG',
    'Farm House',
  ],
  Commercial: [
    'Commercial',
    'Office Space',
    'Shop',
    'Showroom',
  ],
  Plots: [
    'Plot',
    'Agricultural Land',
  ],
  'PG/Co-living': [],
};

// All types (fallback)
const allPropertyTypes = [
  'Apartment',
  'Independent House',
  'Independent Floor',
  'Plot',
  'Studio',
  'Duplex',
  'Penthouse',
  'Villa',
  'PG',
  'Farm House',
  'Commercial',
  'Office Space',
  'Shop',
  'Showroom',
  'Agricultural Land',
];

// ===== DYNAMIC PRICE RANGES =====
const priceRanges = {
  Buy: [
    { label: 'Any', min: '', max: '' },
    { label: 'Under ₹50 Lakhs', min: 0, max: 5000000 },
    { label: '₹50 Lakhs - ₹1 Crore', min: 5000000, max: 10000000 },
    { label: '₹1 Crore - ₹2 Crores', min: 10000000, max: 20000000 },
    { label: '₹2 Crores - ₹5 Crores', min: 20000000, max: 50000000 },
    { label: '₹5 Crores+', min: 50000000, max: '' },
  ],
  Rent: [
    { label: 'Any', min: '', max: '' },
    { label: 'Under ₹20,000', min: 0, max: 20000 },
    { label: '₹20,000 - ₹40,000', min: 20000, max: 40000 },
    { label: '₹40,000 - ₹60,000', min: 40000, max: 60000 },
    { label: '₹60,000 - ₹1 Lakh', min: 60000, max: 100000 },
    { label: '₹1 Lakh+', min: 100000, max: '' },
  ],
  Commercial: [
    { label: 'Any', min: '', max: '' },
    { label: 'Under ₹50,000', min: 0, max: 50000 },
    { label: '₹50,000 - ₹1 Lakh', min: 50000, max: 100000 },
    { label: '₹1 Lakh - ₹2 Lakhs', min: 100000, max: 200000 },
    { label: '₹2 Lakhs+', min: 200000, max: '' },
  ],
  Plots: [
    { label: 'Any', min: '', max: '' },
    { label: 'Under ₹50 Lakhs', min: 0, max: 5000000 },
    { label: '₹50 Lakhs - ₹1 Crore', min: 5000000, max: 10000000 },
    { label: '₹1 Crore - ₹2 Crores', min: 10000000, max: 20000000 },
    { label: '₹2 Crores+', min: 20000000, max: '' },
  ],
  'PG/Co-living': [
    { label: 'Any', min: '', max: '' },
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: '₹10,000 - ₹15,000', min: 10000, max: 15000 },
    { label: '₹15,000 - ₹20,000', min: 15000, max: 20000 },
    { label: '₹20,000+', min: 20000, max: '' },
  ],
};

// ===== SORT OPTIONS =====
const sortOptions = [
  { label: 'Relevance', value: 'createdAt', order: 'desc' },
  { label: 'Price: Low to High', value: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price', order: 'desc' },
  { label: 'Newest', value: 'createdAt', order: 'desc' },
];

function PropertyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [filters, setFilters] = useState({
    city: '',
    listingType: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    furnishing: '',
  });
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPriceRange] = useState('Any');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [sortLabel, setSortLabel] = useState('Relevance');
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/users/me/favorites`);
      setFavorites(data.map(p => p._id));
    } catch (err) {
      console.error('Failed to fetch favorites');
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      const q = new URLSearchParams(location.search);

      const urlListingType = normalizeListingType(q.get('listingType') || '');
      const city = q.get('city') || filters.city;
      const propertyType = q.get('propertyType') || filters.propertyType;
      const minPrice = q.get('minPrice') || filters.minPrice;
      const maxPrice = q.get('maxPrice') || filters.maxPrice;
      const bedrooms = q.get('bedrooms') || filters.bedrooms;
      const furnishing = q.get('furnishing') || filters.furnishing;

      if (urlListingType) {
        setFilters(prev => ({ ...prev, listingType: urlListingType }));
      }

      if (city) params.append('city', city);
      if (urlListingType) params.append('listingType', urlListingType);
      if (propertyType) params.append('propertyType', propertyType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (bedrooms) params.append('bedrooms', bedrooms);
      if (furnishing) params.append('furnishing', furnishing);
      if (roomType) params.append('roomType', roomType);
      // Sort
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);
      // Pagination
      params.append('page', page);
      params.append('limit', limit);

      const response = await axios.get(`${API_BASE}/properties?${params.toString()}`);
      setProperties(response.data.properties || []);
      setTotal(response.data.total || 0);
      setPage(response.data.page || 1);
      setLimit(response.data.limit || 12);
    } catch (err) {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    fetchFavorites();
  }, [location.search, token, roomType, sortBy, order, page]);

  const toggleFavorite = async (propertyId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.post(`${API_BASE}/properties/${propertyId}/favorite`);
      setFavorites(prev =>
        prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
      );
    } catch (err) {
      console.error('Error toggling favorite', err);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.listingType) params.append('listingType', filters.listingType);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.furnishing) params.append('furnishing', filters.furnishing);
    if (roomType) params.append('roomType', roomType);
    navigate(`/properties?${params.toString()}`);
    // Close modal after applying filters
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      listingType: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      furnishing: '',
    });
    setRoomType('');
    setPriceRange('Any');
    setSortBy('createdAt');
    setOrder('desc');
    setSortLabel('Relevance');
    setShowFilterModal(false);
    navigate('/properties');
  };

  const handlePriceRangeChange = (selected) => {
    setPriceRange(selected);
    const range = priceRanges[filters.listingType]?.find(r => r.label === selected);
    if (range) {
      setFilters(prev => ({
        ...prev,
        minPrice: range.min.toString(),
        maxPrice: range.max.toString(),
      }));
    }
  };

  const handleManualPriceChange = (field, value) => {
    setPriceRange('Custom');
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (label, value, order) => {
    setSortLabel(label);
    setSortBy(value);
    setOrder(order);
  };

  const getAvailablePropertyTypes = () => {
    if (!filters.listingType) {
      return allPropertyTypes;
    }
    const types = propertyTypeOptions[filters.listingType];
    return types || allPropertyTypes;
  };

  const availablePropertyTypes = getAvailablePropertyTypes();

  // Build results title
  const getResultsTitle = () => {
    const city = filters.city || '';
    const listing = filters.listingType || '';
    let title = '';
    if (listing === 'Rent') title = 'Flats for Rent';
    else if (listing === 'Buy') title = 'Properties for Buy';
    else if (listing === 'Commercial') title = 'Commercial Properties';
    else if (listing === 'Plots') title = 'Plots';
    else if (listing === 'PG/Co-living') title = 'PG/Co-Living';
    else title = 'Properties';
    if (city) title += ` in ${city}`;
    return title;
  };

  // Compute start and end for "Showing X - Y of Z"
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // ===== FILTER CONTENT (shared between sidebar and modal) =====
  const FilterContent = () => (
    <div className="space-y-4">
      {/* City */}
      <div>
        <label className="block text-sm text-gray-700 font-medium">City</label>
        <input
          className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          placeholder="e.g. Bengaluru"
        />
      </div>

      {/* Property Type – dynamic */}
      {availablePropertyTypes.length > 0 && (
        <div>
          <label className="block text-sm text-gray-700 font-medium">Property Type</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            value={filters.propertyType}
            onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
          >
            <option value="">Any</option>
            {availablePropertyTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      {/* BHK / Total Beds */}
      <div>
        <label className="block text-sm text-gray-700 font-medium">
          {filters.listingType === 'PG/Co-living' ? 'Total Beds' : 'BHK'}
        </label>
        <select
          className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Room Type – only for PG/Co-living */}
      {filters.listingType === 'PG/Co-living' && (
        <div>
          <label className="block text-sm text-gray-700 font-medium">Room Type</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="">Any</option>
            <option value="Private Room">Private Room</option>
            <option value="Double Sharing">Double Sharing</option>
            <option value="Triple Sharing">Triple Sharing</option>
            <option value="3+ Sharing">3+ Sharing</option>
          </select>
        </div>
      )}

      {/* Furnishing */}
      <div>
        <label className="block text-sm text-gray-700 font-medium">Furnishing</label>
        <select
          className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          value={filters.furnishing}
          onChange={(e) => setFilters({ ...filters, furnishing: e.target.value })}
        >
          <option value="">Any</option>
          <option value="Fully Furnished">Fully Furnished</option>
          <option value="Semi Furnished">Semi Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm text-gray-700 font-medium">Price Range</label>
        <select
          className="w-full rounded-lg border border-gray-200 px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          value={priceRange}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
        >
          {(priceRanges[filters.listingType] || priceRanges.Rent).map((range, idx) => (
            <option key={idx} value={range.label}>{range.label}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            type="number"
            className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleManualPriceChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleManualPriceChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={applyFilters}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-blue-900 shadow-lg px-3 md:px-5 py-2 md:py-3 flex items-center justify-between gap-2 flex-nowrap whitespace-nowrap">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 md:gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
            <FaHome className="text-xl md:text-2xl text-blue-300" />
            <span className="text-sm sm:text-base md:text-lg font-bold text-white">Housing.com</span>
          </div>
          <div className="hidden md:flex items-center bg-blue-800/60 px-2 md:px-3 py-1 md:py-1.5 rounded-md cursor-pointer hover:bg-blue-700/60 transition border border-blue-400/30 text-xs md:text-sm">
            <FaMapMarkerAlt className="text-yellow-300 mr-1 md:mr-1.5 text-xs md:text-sm" />
            <span className="font-medium text-white">{filters.city || 'Bengaluru'}</span>
            <FaChevronDown className="ml-1 md:ml-1.5 text-[8px] md:text-xs text-blue-300" />
          </div>
        </div>
        <div className="hidden xl:flex items-center gap-x-3 xl:gap-x-4 text-xs xl:text-sm font-medium text-blue-100">
          <a href="#" className="hover:text-white transition">For Buyers</a>
          <a href="#" className="hover:text-white transition">For Tenants</a>
          <a href="#" className="hover:text-white transition">For Sellers</a>
          <a href="#" className="hover:text-white transition">Services</a>
          <a href="#" className="hover:text-white transition">News & Guide</a>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button className="hidden md:flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-blue-200 hover:text-white transition">
            <FaDownload className="text-sm md:text-base" />
            <span className="hidden xl:inline">Download App</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-lg text-[10px] md:text-sm font-bold transition shadow-md flex items-center gap-1 md:gap-1.5"
          >
            <FaSearch className="text-sm" /> Home
          </button>
          <button
            onClick={() => (user ? logout() : navigate('/login'))}
            className="text-gray-200 hover:text-white transition text-xl md:text-2xl hidden sm:block"
            title={user ? 'Logout' : 'Login'}
          >
            <FaUserCircle />
          </button>
          <button
            className="block sm:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-blue-800 text-white p-4 space-y-3 text-sm shadow-lg border-t border-blue-700/50">
          <a href="#" className="block hover:text-yellow-300">For Buyers</a>
          <a href="#" className="block hover:text-yellow-300">For Tenants</a>
          <a href="#" className="block hover:text-yellow-300">For Sellers</a>
          <a href="#" className="block hover:text-yellow-300">Services</a>
          <a href="#" className="block hover:text-yellow-300">News & Guide</a>
          <hr className="border-blue-700/50" />
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => navigate('/')}>
            <FaSearch /> Home
          </button>
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => user ? logout() : navigate('/login')}>
            <FaUserCircle /> {user ? 'Logout' : 'Login'}
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* ===== FILTER SIDEBAR (DESKTOP) ===== */}
          <aside className="hidden lg:block rounded-2xl bg-white p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear all</button>
            </div>
            <FilterContent />
          </aside>

          {/* ===== RESULTS SECTION ===== */}
          <section className="space-y-6">
            {/* Results Header */}
            {!loading && (
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    {total > 0 ? (
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{start}</span> – <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span> properties
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">0 properties found</p>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">{getResultsTitle()}</h1>
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {/* Mobile Filter Button */}
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaFilter className="text-sm" /> Filters
                    </button>
                    {total > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 whitespace-nowrap">Sort by:</span>
                        <select
                          className="border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={sortLabel}
                          onChange={(e) => {
                            const selected = sortOptions.find(opt => opt.label === e.target.value);
                            if (selected) {
                              handleSortChange(selected.label, selected.value, selected.order);
                            }
                          }}
                        >
                          {sortOptions.map((opt) => (
                            <option key={opt.label} value={opt.label}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin text-blue-600 text-4xl" />
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 group max-w-sm mx-auto w-full cursor-pointer"
                    onClick={() => navigate(`/property/${property._id}`)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={property.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={property.title}
                        className="w-full h-40 sm:h-44 md:h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(property._id); }}
                        className="absolute top-2 right-2 bg-white p-1.5 md:p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                      >
                        <FaHeart
                          className={`transition text-sm md:text-base ${favorites.includes(property._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        />
                      </button>
                      {property.isVerified && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <FaCheckCircle /> Verified
                        </div>
                      )}
                      {property.isPremium && (
                        <div className="absolute top-2 left-20 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <FaStar className="text-white" /> Premium
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full backdrop-blur-sm">
                        {property.area} sq.ft
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="text-lg md:text-xl font-bold text-gray-800">
                        ₹{Number(property.price).toLocaleString('en-IN')}
                      </div>
                      <div className="text-gray-700 font-medium text-sm md:text-base mt-1">{property.title}</div>
                      <div className="text-gray-400 text-xs md:text-sm flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-xs" /> {property.location}
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 mt-2 pt-2 border-t border-gray-100 text-gray-500 text-xs md:text-sm">
                        <span className="flex items-center gap-1"><FaBed className="text-sm" /> {property.bedrooms || 0}</span>
                        <span className="flex items-center gap-1"><FaBath className="text-sm" /> {property.bathrooms || 0}</span>
                        <span className="flex items-center gap-1">📐 {property.area} sq.ft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ===== FILTER MODAL (MOBILE) ===== */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFilterModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle className="text-xl" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
            <div className="flex items-center justify-between mb-2">
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear all</button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyList;