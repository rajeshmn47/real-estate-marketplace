// src/pages/PropertyDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaHeart, FaBed, FaBath, FaMapMarkerAlt, FaBuilding,
  FaRulerCombined, FaRupeeSign, FaUserCircle, FaPhone,
  FaWhatsapp, FaShareAlt, FaArrowLeft, FaSpinner,
  FaCheckCircle, FaTimes, FaImages, FaRegHeart,
  FaStar, FaStarHalfAlt
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  // Fetch property
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/properties/${id}`);
        setProperty(res.data);
        // Check if property is in user's favorites
        if (token && user) {
          const favRes = await axios.get(`${API_BASE}/users/me/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const favIds = favRes.data.map(p => p._id);
          setIsFavorite(favIds.includes(id));
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Property not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, token, user]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/properties/${id}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(prev => !prev);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Format price in Indian number system
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Parse features from array (some may be key: value)
  const parseFeature = (feat) => {
    if (feat.includes(':')) {
      const [key, ...val] = feat.split(':');
      return { key: key.trim(), value: val.join(':').trim() };
    }
    return { key: feat, value: null };
  };

  // Group features by category (if they contain ':' we treat as detail)
  const getDetails = () => {
    if (!property?.features) return { details: [], amenities: [] };
    const details = [];
    const amenities = [];
    property.features.forEach(feat => {
      const parsed = parseFeature(feat);
      if (parsed.value) {
        details.push(parsed);
      } else {
        amenities.push(parsed.key);
      }
    });
    return { details, amenities };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg mb-4">{error || 'Property not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { details, amenities } = getDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="relative aspect-[16/9] bg-gray-100">
                <img
                  src={property.images?.[selectedImage] || 'https://via.placeholder.com/1200x675?text=No+Image'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
                >
                  {isFavorite ? (
                    <FaHeart className="text-red-500 text-xl" />
                  ) : (
                    <FaRegHeart className="text-gray-500 text-xl hover:text-red-500" />
                  )}
                </button>
                {property.images?.length > 1 && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-black/70 transition flex items-center gap-2"
                  >
                    <FaImages /> View all
                  </button>
                )}
              </div>
              {/* Thumbnails */}
              {property.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{property.location}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  ₹{formatPrice(property.price)}
                </span>
                {property.listingType && (
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {property.listingType}
                  </span>
                )}
                {property.isVerified && (
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Key Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <FaBuilding className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium">{property.propertyType || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <FaBed className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <FaBath className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <FaRulerCombined className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="font-medium">{property.area || 0} sq.ft</p>
                  </div>
                </div>
                {property.views !== undefined && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <FaUserCircle className="text-blue-500 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="font-medium">{property.views}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Amenities */}
            {(details.length > 0 || amenities.length > 0) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>
                {details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {details.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">{item.key}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Contact & Info */}
          <div className="space-y-6">
            {/* Posted By */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Posted By</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
                  {property.postedBy?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.postedBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    {property.postedBy?.role === 'agent' ? 'Agent' : 'Owner'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Listed on {new Date(property.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <FaPhone /> Contact
                </button>
                <button className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Listing Type</span>
                <span className="font-medium">{property.listingType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Property Type</span>
                <span className="font-medium">{property.propertyType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Posted</span>
                <span className="font-medium">
                  {new Date(property.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Views</span>
                <span className="font-medium">{property.views || 0}</span>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FaShareAlt /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {showAllImages && property.images?.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowAllImages(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
          >
            <FaTimes />
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Property ${idx}`}
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;