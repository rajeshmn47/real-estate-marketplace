// src/pages/Homepage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch, FaMapMarkerAlt, FaHeart, FaBed, FaBath,
  FaHome, FaChevronDown, FaDownload, FaUserCircle,
  FaBars, FaTimes, FaSpinner, FaPlus, FaTimesCircle
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Homepage() {
  const navigate = useNavigate();
  const { user, token, login, register, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('Buy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    listingType: 'Buy',
  });

  // Auth modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  // Post Property modal
  const [showPostProperty, setShowPostProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '', description: '', price: '', area: '', bedrooms: '', bathrooms: '',
    propertyType: 'Apartment', listingType: 'Buy', location: '', city: '', state: '', zipCode: '',
  });
  const [images, setImages] = useState([]);

  // Favorites
  const [favorites, setFavorites] = useState([]);

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.listingType) params.append('listingType', filters.listingType);

      const url = `${API_BASE}/properties?${params.toString()}`;
      const response = await axios.get(url);
      setProperties(response.data.properties || []);
    } catch (err) {
      setError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/users/me/favorites`);
      setFavorites(data.map(p => p._id));
    } catch (err) {
      console.error('Failed to fetch favorites');
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, [filters, token]);

  // Toggle favorite
  const toggleFavorite = async (propertyId) => {
    if (!token) {
      setShowLogin(true);
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

  // Handle search
  const fetchCitySuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    setCityLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/properties/cities`, {
        params: { search: query.trim() },
      });
      setCitySuggestions(response.data || []);
    } catch (err) {
      console.error('City autocomplete failed', err);
      setCitySuggestions([]);
    } finally {
      setCityLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, city: searchQuery }));
    setCitySuggestions([]);
  };

  const handleCitySuggestionClick = (city) => {
    setSearchQuery(city.name);
    setFilters(prev => ({ ...prev, city: city.name }));
    setCitySuggestions([]);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, listingType: tab }));
  };

  const handleLocalityClick = (locality) => {
    setSearchQuery(locality);
    setFilters(prev => ({ ...prev, city: locality }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => {
    fetchCitySuggestions(searchQuery);
  }, [searchQuery]);

  // Post property
  const handlePostProperty = async (e) => {
    e.preventDefault();
    if (!token) {
      setShowLogin(true);
      return;
    }
    const formData = new FormData();
    for (const key in newProperty) {
      formData.append(key, newProperty[key]);
    }
    images.forEach(file => formData.append('images', file));

    try {
      await axios.post(`${API_BASE}/properties`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowPostProperty(false);
      fetchProperties();
      // reset form
      setNewProperty({
        title: '', description: '', price: '', area: '', bedrooms: '', bathrooms: '',
        propertyType: 'Apartment', listingType: activeTab, location: '', city: '', state: '', zipCode: '',
      });
      setImages([]);
    } catch (err) {
      alert('Failed to post property. Check your inputs.');
    }
  };

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      setShowLogin(false);
      fetchFavorites();
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(registerData.name, registerData.email, registerData.password);
      setShowRegister(false);
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-blue-900 shadow-lg px-3 md:px-5 py-2 md:py-3 flex items-center justify-between gap-2 flex-nowrap whitespace-nowrap">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 md:gap-1.5">
            <FaHome className="text-xl md:text-2xl text-blue-300" />
            <span className="text-sm sm:text-base md:text-lg font-bold text-white">Housing.com</span>
          </div>
          <div className="hidden md:flex items-center bg-blue-800/60 px-2 md:px-3 py-1 md:py-1.5 rounded-md cursor-pointer hover:bg-blue-700/60 transition border border-blue-400/30 text-xs md:text-sm">
            <FaMapMarkerAlt className="text-yellow-300 mr-1 md:mr-1.5 text-xs md:text-sm" />
            <span className="font-medium text-white">Bengaluru</span>
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
            onClick={() => setShowPostProperty(true)}
            className="px-2 md:px-3 py-1 md:py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-lg text-[10px] md:text-sm font-bold transition shadow-md flex items-center gap-1 md:gap-1.5"
          >
            Post Property
            <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-extrabold px-1 md:px-1.5 py-0.5 rounded-sm uppercase leading-none">Free</span>
          </button>
          <button
            onClick={() => (user ? logout() : setShowLogin(true))}
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
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => setShowPostProperty(true)}>
            <FaPlus /> Post Property
          </button>
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => user ? logout() : setShowLogin(true)}>
            <FaUserCircle /> {user ? 'Logout' : 'Login'}
          </button>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-8 md:py-12 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Text Section */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
              Properties for rent in <span className="text-yellow-300">Bengaluru</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 mt-1">
              7K+ listings added daily and 71K+ total verified
            </p>
          </div>

          {/* ===== FIX: overflow-hidden → overflow-visible ===== */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm p-1 md:p-1.5 max-w-full mx-auto">
              {['Buy', 'Rent', 'Commercial', 'PG/Co-Living', 'Plots'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-lg scale-105'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Simplified Search Form – only Location + Search button */}
            <div className="bg-white shadow-2xl flex flex-col sm:flex-row gap-2 md:gap-3 text-gray-700 p-2 md:p-3 mt-0">
              <div className="relative flex-1 flex items-center rounded-lg px-3 md:px-4 py-2">
                <FaMapMarkerAlt className="text-blue-500 mr-2 text-sm md:text-base" />
                <input
                  type="text"
                  placeholder="Enter city, locality, or project"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {(citySuggestions.length > 0 || cityLoading) && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    {cityLoading ? (
                      <div className="p-3 text-center text-sm text-slate-500">Loading cities...</div>
                    ) : (
                      citySuggestions.map((city) => (
                        <button
                          key={`${city.name}-${city.state}`}
                          type="button"
                          onClick={() => handleCitySuggestionClick(city)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-100 transition text-sm text-slate-700"
                        >
                          {city.name}{city.state ? `, ${city.state}` : ''}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-6 md:px-8 py-2.5 md:py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md text-sm md:text-base"
                onClick={handleSearch}
              >
                <FaSearch className="text-sm md:text-base" /> <span>Search</span>
              </button>
            </div>
          </div>

          {/* Popular Localities */}
          <div className="mt-4 md:mt-5 text-center flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            <span className="text-xs sm:text-sm text-blue-100 font-medium">Popular Localities:</span>
            {['HSR Layout', 'Koramangala', 'Whitefield', 'JP Nagar', 'BTM Layout'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocalityClick(loc)}
                className="px-2.5 md:px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full text-[10px] sm:text-xs md:text-sm text-white transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROPERTY GRID ===== */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Properties</h2>
            <p className="text-gray-500 text-sm md:text-base">
              {loading ? 'Loading...' : `${properties.length} listings found`}
            </p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm md:text-base"
          >
            View All →
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300 pt-8 md:pt-12 pb-6 mt-8 md:mt-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h4 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3">Housing</h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3">For Buyers</h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Search Properties</a></li>
              <li><a href="#" className="hover:text-white">Loan Calculator</a></li>
              <li><a href="#" className="hover:text-white">Legal Advisory</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3">For Sellers</h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">List a Property</a></li>
              <li><a href="#" className="hover:text-white">Advertise</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3">Support</h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Help Centre</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Use</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 text-center text-xs md:text-sm text-gray-500">
          © {new Date().getFullYear()} Housing Clone. Built with React & Tailwind. For educational purposes only.
        </div>
      </footer>

      {/* ===== LOGIN MODAL ===== */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowLogin(false)}>
              <FaTimesCircle />
            </button>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
              <input type="password" placeholder="Password" className="w-full border rounded-lg px-4 py-2" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Login</button>
            </form>
            <p className="mt-4 text-sm text-center">
              Don't have an account? <button className="text-blue-600 hover:underline" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Register</button>
            </p>
          </div>
        </div>
      )}

      {/* ===== REGISTER MODAL ===== */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowRegister(false)}>
              <FaTimesCircle />
            </button>
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" placeholder="Name" className="w-full border rounded-lg px-4 py-2" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} required />
              <input type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
              <input type="password" placeholder="Password" className="w-full border rounded-lg px-4 py-2" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Register</button>
            </form>
            <p className="mt-4 text-sm text-center">
              Already have an account? <button className="text-blue-600 hover:underline" onClick={() => { setShowRegister(false); setShowLogin(true); }}>Login</button>
            </p>
          </div>
        </div>
      )}

      {/* ===== POST PROPERTY MODAL ===== */}
      {showPostProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowPostProperty(false)}>
              <FaTimesCircle />
            </button>
            <h2 className="text-2xl font-bold mb-4">Post a Property</h2>
            <form onSubmit={handlePostProperty} className="space-y-3">
              <input type="text" placeholder="Title" className="w-full border rounded-lg px-4 py-2" value={newProperty.title} onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })} required />
              <textarea placeholder="Description" className="w-full border rounded-lg px-4 py-2" rows="3" value={newProperty.description} onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })} required />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Price (₹)" className="border rounded-lg px-4 py-2" value={newProperty.price} onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })} required />
                <input type="number" placeholder="Area (sq.ft)" className="border rounded-lg px-4 py-2" value={newProperty.area} onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })} required />
                <input type="number" placeholder="Bedrooms" className="border rounded-lg px-4 py-2" value={newProperty.bedrooms} onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })} />
                <input type="number" placeholder="Bathrooms" className="border rounded-lg px-4 py-2" value={newProperty.bathrooms} onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })} />
              </div>
              <select className="w-full border rounded-lg px-4 py-2" value={newProperty.propertyType} onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })}>
                {['Apartment', 'Villa', 'PG', 'Plot', 'Commercial'].map(type => <option key={type}>{type}</option>)}
              </select>
              <select className="w-full border rounded-lg px-4 py-2" value={newProperty.listingType} onChange={(e) => setNewProperty({ ...newProperty, listingType: e.target.value })}>
                {['Buy', 'Rent', 'Commercial', 'PG/Co-Living', 'Plots'].map(type => <option key={type}>{type}</option>)}
              </select>
              <input type="text" placeholder="Location" className="w-full border rounded-lg px-4 py-2" value={newProperty.location} onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })} required />
              <input type="text" placeholder="City" className="w-full border rounded-lg px-4 py-2" value={newProperty.city} onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })} required />
              <input type="text" placeholder="State" className="w-full border rounded-lg px-4 py-2" value={newProperty.state} onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })} />
              <input type="text" placeholder="Zip Code" className="w-full border rounded-lg px-4 py-2" value={newProperty.zipCode} onChange={(e) => setNewProperty({ ...newProperty, zipCode: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <input type="file" multiple accept="image/*" className="w-full border rounded-lg px-4 py-2" onChange={(e) => setImages([...e.target.files])} />
              </div>
              <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold py-2 rounded-lg transition">Submit Property</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;