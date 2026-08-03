// src/pages/PostPropertyWizard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBed, FaBath, FaImage, FaCheckCircle,
  FaArrowLeft, FaArrowRight, FaWhatsapp, FaPhone,
  FaBuilding, FaMapMarkerAlt, FaTimesCircle, FaSpinner,
  FaUtensils, FaUsers, FaPlus, FaTrash, FaRegCheckCircle,
  FaClock, FaExclamationCircle, FaShieldAlt, FaCouch,
  FaWifi, FaDumbbell, FaCar, FaPlug, FaTint, FaSnowflake,
  FaTv, FaCoffee, FaRupeeSign
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PostPropertyWizard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Listing type mapping
  const listingTypeMap = {
    'Sell': 'Buy',
    'Rent': 'Rent',
    'PG/Co-living': 'PG/Co-Living',
  };

  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    propertyType: 'Residential',
    lookingTo: 'Rent',
    city: '',
    locality: '',

    // Step 2: Property Details
    propertyTypeDetail: 'Apartment',
    buildingName: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'sq.ft',
    furnishing: 'Semi Furnished',

    // PG Details (conditional)
    pgName: '',
    totalBeds: '',
    pgGender: 'Girls',
    bestSuitedFor: 'Students',
    mealsAvailable: 'Yes',
    mealOfferings: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },

    // PG Rooms (dynamic)
    rooms: [{ type: 'Private Room', rent: '', deposit: '' }],

    // Step 3: Price Details
    price: '',
    securityDeposit: '',
    maintenance: '',
    constructionStatus: 'Ready to Move',
    availability: 'Immediate',

    // Step 4: Amenities
    amenities: {
      cctv: false,
      gatedCommunity: false,
      security: false,
      biometric: false,
      fridge: false,
      washingMachine: false,
      microwave: false,
      waterPurifier: false,
      ttTable: false,
      tv: false,
      coffeeMachine: false,
      snacksMachine: false,
      laundry: false,
      housekeeping: false,
      wifi: false,
      gym: false,
      lift: false,
      regularWaterSupply: false,
      swimmingPool: false,
      reservedParking: false,
      powerBackup: false,
      parkingTwoWheeler: false,
      parkingFourWheeler: false,
      ac: false,
    },

    // Step 5: Photos
    images: [],
    imagePreviews: [],
  });

  const [errors, setErrors] = useState({});

  // City autocomplete
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.city || formData.city.length < 2) {
        setCitySuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/properties/cities`, {
          params: { search: formData.city },
        });
        setCitySuggestions(res.data);
        setShowCityDropdown(res.data.length > 0);
      } catch (err) {
        console.error('Failed to fetch cities');
      }
    };
    fetchCities();
  }, [formData.city]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === 'file') {
      const fileArray = Array.from(files);
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArray],
        imagePreviews: [...prev.imagePreviews, ...previews],
      }));
      return;
    }

    if (name.startsWith('meal_')) {
      const mealKey = name.replace('meal_', '');
      setFormData((prev) => ({
        ...prev,
        mealOfferings: {
          ...prev.mealOfferings,
          [mealKey]: checked,
        },
      }));
      return;
    }

    if (name.startsWith('amenity_')) {
      const amenityKey = name.replace('amenity_', '');
      setFormData((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [amenityKey]: checked,
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Room handlers
  const handleRoomChange = (index, field, value) => {
    const updated = [...formData.rooms];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, rooms: updated }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, { type: 'Private Room', rent: '', deposit: '' }]
    }));
  };

  const removeRoom = (index) => {
    if (formData.rooms.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city: city.name }));
    setShowCityDropdown(false);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ============================================================
  // FIXED VALIDATION – handles both PG and regular property flows
  // ============================================================

  // --- Validation (no state updates) ---
  const isStepValid = (step) => {
    if (step === 1) {
      if (!formData.lookingTo) return false;
      if (!formData.city) return false;
      if (!formData.locality) return false;
      return true;
    }
    if (step === 2) {
      if (formData.lookingTo === 'PG/Co-living') {
        // PG validation
        if (!formData.pgName) return false;
        if (!formData.totalBeds) return false;
        if (!formData.bestSuitedFor) return false;
        if (formData.mealsAvailable === 'Yes') {
          const hasMeal = Object.values(formData.mealOfferings).some(v => v === true);
          if (!hasMeal) return false;
        }
        if (formData.rooms.length === 0) return false;
        for (const room of formData.rooms) {
          if (!room.type) return false;
          if (!room.rent || Number(room.rent) <= 0) return false;
          if (!room.deposit || Number(room.deposit) <= 0) return false;
        }
        return true;
      } else {
        // Regular property validation
        if (!formData.propertyTypeDetail) return false;
        if (!formData.bedrooms) return false;
        if (!formData.area) return false;
        if (!formData.furnishing) return false;
        return true;
      }
    }
    if (step === 3) {
      if (!formData.price) return false;
      if (!formData.constructionStatus) return false;
      return true;
    }
    if (step === 4) {
      return true; // Amenities optional
    }
    if (step === 5) {
      if (formData.images.length === 0) return false;
      return true;
    }
    return true;
  };

  // --- Validate with error setting (for navigation) ---
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.lookingTo) newErrors.lookingTo = 'Please select an option';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.locality) newErrors.locality = 'Locality is required';
    }
    if (step === 2) {
      if (formData.lookingTo === 'PG/Co-living') {
        // PG validation
        if (!formData.pgName) newErrors.pgName = 'PG Name is required';
        if (!formData.totalBeds) newErrors.totalBeds = 'Total beds is required';
        if (!formData.bestSuitedFor) newErrors.bestSuitedFor = 'Best suited for is required';
        if (formData.mealsAvailable === 'Yes') {
          const hasMeal = Object.values(formData.mealOfferings).some(v => v === true);
          if (!hasMeal) {
            newErrors.mealOfferings = 'Please select at least one meal offering';
          }
        }
        if (formData.rooms.length === 0) {
          newErrors.rooms = 'At least one room is required';
        }
        formData.rooms.forEach((room, idx) => {
          if (!room.type) newErrors[`room_${idx}_type`] = 'Room type required';
          if (!room.rent || Number(room.rent) <= 0) newErrors[`room_${idx}_rent`] = 'Valid rent required';
          if (!room.deposit || Number(room.deposit) <= 0) newErrors[`room_${idx}_deposit`] = 'Valid deposit required';
        });
      } else {
        // Regular property validation
        if (!formData.propertyTypeDetail) newErrors.propertyTypeDetail = 'Property type is required';
        if (!formData.bedrooms) newErrors.bedrooms = 'Bedrooms is required';
        if (!formData.area) newErrors.area = 'Area is required';
        if (!formData.furnishing) newErrors.furnishing = 'Furnishing type is required';
      }
    }
    if (step === 3) {
      if (!formData.price) newErrors.price = 'Price is required';
      if (!formData.constructionStatus) newErrors.constructionStatus = 'Construction status is required';
    }
    if (step === 5) {
      if (formData.images.length === 0) {
        newErrors.images = 'Please upload at least one image';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getSelectedAmenities = () => {
    const selected = [];
    const amenityMap = {
      cctv: 'CCTV',
      gatedCommunity: 'Gated Community',
      security: 'Security',
      biometric: 'Biometric',
      fridge: 'Fridge',
      washingMachine: 'Washing Machine',
      microwave: 'Microwave',
      waterPurifier: 'Water Purifier',
      ttTable: 'TT Table',
      tv: 'TV',
      coffeeMachine: 'Coffee Machine',
      snacksMachine: 'Snacks Machine',
      laundry: 'Laundry',
      housekeeping: 'Housekeeping',
      wifi: 'Internet/Wi-Fi',
      gym: 'Gym',
      lift: 'Lift',
      regularWaterSupply: 'Regular Water Supply',
      swimmingPool: 'Swimming Pool',
      reservedParking: 'Reserved Parking',
      powerBackup: 'Power Backup',
      parkingTwoWheeler: '2 Wheeler Parking',
      parkingFourWheeler: '4 Wheeler Parking',
      ac: 'AC Support',
    };
    Object.keys(formData.amenities).forEach(key => {
      if (formData.amenities[key]) {
        selected.push(amenityMap[key] || key);
      }
    });
    return selected;
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    setSubmitError('');

    try {
      const formDataToSend = new FormData();

      const features = [
        formData.furnishing,
        formData.availability,
        formData.constructionStatus,
      ];

      if (formData.securityDeposit) features.push(`Security Deposit: ₹${Number(formData.securityDeposit).toLocaleString('en-IN')}`);
      if (formData.maintenance) features.push(`Maintenance: ₹${Number(formData.maintenance).toLocaleString('en-IN')}`);
      if (formData.bathrooms) features.push(`Bathrooms: ${formData.bathrooms}`);

      const selectedAmenities = getSelectedAmenities();
      if (selectedAmenities.length > 0) {
        features.push(`Amenities: ${selectedAmenities.join(', ')}`);
      }

      // PG fields
      if (formData.lookingTo === 'PG/Co-living') {
        features.push(`PG Name: ${formData.pgName}`);
        features.push(`Total Beds: ${formData.totalBeds}`);
        features.push(`PG Gender: ${formData.pgGender}`);
        features.push(`Best Suited For: ${formData.bestSuitedFor}`);
        features.push(`Meals Available: ${formData.mealsAvailable}`);
        if (formData.mealsAvailable === 'Yes') {
          const mealList = [];
          if (formData.mealOfferings.breakfast) mealList.push('Breakfast');
          if (formData.mealOfferings.lunch) mealList.push('Lunch');
          if (formData.mealOfferings.dinner) mealList.push('Dinner');
          if (mealList.length > 0) {
            features.push(`Meals: ${mealList.join(', ')}`);
          }
        }
        formData.rooms.forEach((room, idx) => {
          features.push(`Room ${idx+1}: ${room.type}, Rent: ₹${Number(room.rent).toLocaleString('en-IN')}, Deposit: ₹${Number(room.deposit).toLocaleString('en-IN')}`);
        });
      }

      const mappedListingType = listingTypeMap[formData.lookingTo] || formData.lookingTo;

      const title = formData.lookingTo === 'PG/Co-living' 
        ? `${formData.pgName} - PG in ${formData.locality}`
        : `${formData.bedrooms} BHK ${formData.propertyTypeDetail} in ${formData.locality}`;

      const description = formData.lookingTo === 'PG/Co-living'
        ? `${formData.pgName} PG in ${formData.locality}, ${formData.city}. ${formData.totalBeds} beds, for ${formData.pgGender}. Best suited for ${formData.bestSuitedFor}.`
        : `${formData.bedrooms} BHK ${formData.propertyTypeDetail} ${formData.furnishing} in ${formData.locality}, ${formData.city}. Available for ${formData.lookingTo}. ${formData.buildingName ? `Located in ${formData.buildingName}.` : ''}`;

      const data = {
        title,
        description,
        price: Number(formData.price),
        area: Number(formData.area),
        bedrooms: formData.lookingTo === 'PG/Co-living' ? Number(formData.totalBeds) : Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms) || 0,
        propertyType: formData.lookingTo === 'PG/Co-living' ? 'PG' : formData.propertyTypeDetail,
        listingType: mappedListingType,
        location: `${formData.locality}, ${formData.city}`,
        city: formData.city,
        state: '',
        zipCode: '',
        features: features.filter(Boolean),
      };

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          if (Array.isArray(data[key])) {
            data[key].forEach((item) => formDataToSend.append(key, item));
          } else {
            formDataToSend.append(key, data[key]);
          }
        }
      });

      formData.images.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const res = await axios.post(`${API_BASE}/properties`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201) {
        navigate(`/property/${res.data._id}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      if (err.response?.data?.error) {
        setSubmitError(err.response.data.error);
      } else {
        setSubmitError('Failed to post property. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    let completed = 0;
    if (isStepValid(1)) completed += 1;
    if (isStepValid(2)) completed += 1;
    if (isStepValid(3)) completed += 1;
    if (isStepValid(4)) completed += 1;
    if (isStepValid(5)) completed += 1;
    return (completed / 5) * 100;
  };

  const getStepStatus = (step) => {
    if (step === 1) {
      return isStepValid(1) ? { text: 'Completed', icon: <FaRegCheckCircle className="text-green-500" /> } 
        : { text: 'In progress', icon: <FaClock className="text-yellow-500" /> };
    }
    if (step === 2) {
      if (isStepValid(1) && isStepValid(2)) return { text: 'Completed', icon: <FaRegCheckCircle className="text-green-500" /> };
      if (isStepValid(1)) return { text: 'In progress', icon: <FaClock className="text-yellow-500" /> };
      return { text: 'Pending', icon: <FaExclamationCircle className="text-gray-400" /> };
    }
    if (step === 3) {
      if (isStepValid(1) && isStepValid(2) && isStepValid(3)) 
        return { text: 'Completed', icon: <FaRegCheckCircle className="text-green-500" /> };
      if (isStepValid(1) && isStepValid(2)) return { text: 'In progress', icon: <FaClock className="text-yellow-500" /> };
      return { text: 'Pending', icon: <FaExclamationCircle className="text-gray-400" /> };
    }
    if (step === 4) {
      if (isStepValid(1) && isStepValid(2) && isStepValid(3)) 
        return { text: 'In progress', icon: <FaClock className="text-yellow-500" /> };
      return { text: 'Pending', icon: <FaExclamationCircle className="text-gray-400" /> };
    }
    if (step === 5) {
      if (isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && isStepValid(5)) 
        return { text: 'Completed', icon: <FaRegCheckCircle className="text-green-500" /> };
      if (isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4)) 
        return { text: 'In progress', icon: <FaClock className="text-yellow-500" /> };
      return { text: 'Pending', icon: <FaExclamationCircle className="text-gray-400" /> };
    }
    return { text: 'Pending', icon: <FaExclamationCircle className="text-gray-400" /> };
  };

  // ===== STEP 1: BASIC DETAILS =====
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Add Basic Details</h2>
      <p className="text-sm text-gray-500">Tell us about your property</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {['Residential', 'Commercial'].map((type) => (
            <button
              key={type}
              type="button"
              className={`p-3 rounded-lg border-2 transition ${
                formData.propertyType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleChange({ target: { name: 'propertyType', value: type } })}
            >
              <div className="flex items-center gap-2">
                {type === 'Residential' ? <FaHome /> : <FaBuilding />}
                {type}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">You're looking to... *</label>
        <div className="grid grid-cols-3 gap-2">
          {['Rent', 'Sell', 'PG/Co-living'].map((option) => (
            <button
              key={option}
              type="button"
              className={`p-2 rounded-lg border-2 transition text-sm ${
                formData.lookingTo === option
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleChange({ target: { name: 'lookingTo', value: option } })}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.lookingTo && <p className="text-red-500 text-xs mt-1">{errors.lookingTo}</p>}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="Enter city"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {showCityDropdown && citySuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {citySuggestions.map((city) => (
              <button
                key={city._id}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                onClick={() => handleCitySelect(city)}
              >
                {city.name}, {city.state}
              </button>
            ))}
          </div>
        )}
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        <p className="text-xs text-green-600 mt-1">High demand, low supply, your property is likely to get noticed faster.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Locality *</label>
        <input
          type="text"
          name="locality"
          value={formData.locality}
          onChange={handleChange}
          placeholder="Enter locality"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.locality && <p className="text-red-500 text-xs mt-1">{errors.locality}</p>}
      </div>
    </div>
  );

  // ===== STEP 2: PROPERTY DETAILS =====
  const renderStep2 = () => {
    if (formData.lookingTo === 'PG/Co-living') {
      // PG Flow: Show PG details + Rooms
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">PG Details</h2>
          <p className="text-sm text-gray-500">Tell us about your PG</p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
            <div>
              <label className="block text-sm text-gray-600">PG Name *</label>
              <input
                type="text"
                name="pgName"
                value={formData.pgName}
                onChange={handleChange}
                placeholder="Enter PG name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.pgName && <p className="text-red-500 text-xs mt-1">{errors.pgName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600">Total Beds *</label>
                <input
                  type="number"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleChange}
                  placeholder="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.totalBeds && <p className="text-red-500 text-xs mt-1">{errors.totalBeds}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600">PG is for</label>
                <select
                  name="pgGender"
                  value={formData.pgGender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Girls">Girls</option>
                  <option value="Boys">Boys</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Best suited for *</label>
              <div className="grid grid-cols-3 gap-3">
                {['Students', 'Professionals', 'Both'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition text-sm ${
                      formData.bestSuitedFor === option
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'bestSuitedFor', value: option } })}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaUsers className="text-sm" /> {option}
                    </div>
                  </button>
                ))}
              </div>
              {errors.bestSuitedFor && <p className="text-red-500 text-xs mt-1">{errors.bestSuitedFor}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Meals Available *</label>
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition text-sm ${
                      formData.mealsAvailable === option
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'mealsAvailable', value: option } })}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaUtensils className="text-sm" /> {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {formData.mealsAvailable === 'Yes' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm text-gray-600 mb-2">Meal Offerings *</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                    const mealKey = meal.toLowerCase();
                    return (
                      <label
                        key={meal}
                        className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition ${
                          formData.mealOfferings[mealKey]
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={`meal_${mealKey}`}
                          checked={formData.mealOfferings[mealKey] || false}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="text-sm font-medium">{meal}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.mealOfferings && (
                  <p className="text-red-500 text-xs mt-2">{errors.mealOfferings}</p>
                )}
              </div>
            )}
          </div>

          {/* Rooms Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Rooms</h3>
              {errors.rooms && <p className="text-red-500 text-sm">{errors.rooms}</p>}
            </div>

            {formData.rooms.map((room, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Room {idx + 1}</h4>
                  {formData.rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(idx)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600">Room Type *</label>
                    <select
                      value={room.type}
                      onChange={(e) => handleRoomChange(idx, 'type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Private Room">Private Room</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                      <option value="3+ Sharing">3+ Sharing</option>
                    </select>
                    {errors[`room_${idx}_type`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`room_${idx}_type`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Rent (₹) *</label>
                    <input
                      type="number"
                      placeholder="10,000"
                      value={room.rent}
                      onChange={(e) => handleRoomChange(idx, 'rent', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors[`room_${idx}_rent`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`room_${idx}_rent`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Security Deposit (₹) *</label>
                    <input
                      type="number"
                      placeholder="5,000"
                      value={room.deposit}
                      onChange={(e) => handleRoomChange(idx, 'deposit', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors[`room_${idx}_deposit`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`room_${idx}_deposit`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRoom}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <FaPlus className="text-sm" /> Add Another Room
            </button>
          </div>
        </div>
      );
    }

    // Regular Property (Non-PG)
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Add Property Details</h2>
        <p className="text-sm text-gray-500">Tell us about your property</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {['Apartment', 'Independent House', 'Duplex', 'Independent Floor', 'Villa', 'Penthouse', 'Studio', 'Plot', 'Farm House', 'Agricultural Land'].map((type) => (
              <button
                key={type}
                type="button"
                className={`p-2 rounded-lg border-2 transition text-xs ${
                  formData.propertyTypeDetail === type
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'propertyTypeDetail', value: type } })}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.propertyTypeDetail && <p className="text-red-500 text-xs mt-1">{errors.propertyTypeDetail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Building/Project/Society (Optional)</label>
          <input
            type="text"
            name="buildingName"
            value={formData.buildingName}
            onChange={handleChange}
            placeholder="Enter building/project/society name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">15 owners in this locality listed their properties this week</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">BHK *</label>
            <select
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select BHK</option>
              <option value="1">1 RK</option>
              <option value="1">1 BHK</option>
              <option value="1.5">1.5 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="3+">3+ BHK</option>
            </select>
            {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Bathrooms</label>
            <select
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Built Up Area *</label>
          <div className="flex gap-3">
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="2000"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              name="areaUnit"
              value={formData.areaUnit}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sq.ft">sq. ft.</option>
              <option value="sq.m">sq. m.</option>
              <option value="acres">acres</option>
              <option value="sq.yards">sq. yards</option>
            </select>
          </div>
          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Furnish Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map((option) => (
              <button
                key={option}
                type="button"
                className={`p-2 rounded-lg border-2 transition text-sm ${
                  formData.furnishing === option
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'furnishing', value: option } })}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.furnishing && <p className="text-red-500 text-xs mt-1">{errors.furnishing}</p>}
        </div>

        <button
          type="button"
          className="text-blue-600 hover:text-blue-700 transition text-sm font-medium flex items-center gap-1"
          onClick={() => setCurrentStep(4)}
        >
          + Add Furnishings / Amenities
        </button>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="shareWithAgents"
              className="w-4 h-4 text-blue-600 rounded"
              onChange={handleChange}
            />
            Share listing information with agents
          </label>
        </div>
      </div>
    );
  };

  // ===== STEP 3: PRICE DETAILS =====
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Add Price Details</h2>
      <p className="text-sm text-gray-500">Set the price and other details</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
        <div className="relative">
          <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="30000000"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        <p className="text-xs text-gray-500 mt-1">{formData.price ? `₹${Number(formData.price).toLocaleString('en-IN')}` : '3 Cr'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Security Deposit (Optional)</label>
          <input
            type="number"
            name="securityDeposit"
            value={formData.securityDeposit}
            onChange={handleChange}
            placeholder="50000"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Maintenance (Optional)</label>
          <input
            type="number"
            name="maintenance"
            value={formData.maintenance}
            onChange={handleChange}
            placeholder="2000"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Construction Status *</label>
        <div className="grid grid-cols-2 gap-2">
          {['Ready to Move', 'Under Construction'].map((option) => (
            <button
              key={option}
              type="button"
              className={`p-2 rounded-lg border-2 transition text-sm ${
                formData.constructionStatus === option
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleChange({ target: { name: 'constructionStatus', value: option } })}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.constructionStatus && <p className="text-red-500 text-xs mt-1">{errors.constructionStatus}</p>}
      </div>

      <div>
        <label className="block text-sm text-gray-600">Availability</label>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="Immediate">Immediate</option>
          <option value="1 Month">1 Month</option>
          <option value="2 Months">2 Months</option>
          <option value="3 Months">3 Months</option>
        </select>
      </div>
    </div>
  );

  // ===== STEP 4: AMENITIES =====
  const renderStep4 = () => {
    const amenities = formData.amenities;

    const AmenityGroup = ({ title, icon, items }) => (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          {icon} {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition ${
                amenities[key]
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                name={`amenity_${key}`}
                checked={amenities[key] || false}
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add Amenities</h2>
          <p className="text-sm text-gray-500">Select the amenities available</p>
        </div>

        <div className="space-y-4">
          <AmenityGroup
            title="Security Amenities"
            icon={<FaShieldAlt className="text-blue-500" />}
            items={[
              { key: 'cctv', label: 'CCTV' },
              { key: 'gatedCommunity', label: 'Gated Community' },
              { key: 'security', label: 'Security' },
              { key: 'biometric', label: 'Biometric' },
            ]}
          />

          <AmenityGroup
            title="Furnishings in Property"
            icon={<FaCouch className="text-blue-500" />}
            items={[
              { key: 'fridge', label: 'Fridge' },
              { key: 'washingMachine', label: 'Washing Machine' },
              { key: 'microwave', label: 'Microwave' },
              { key: 'waterPurifier', label: 'Water Purifier' },
              { key: 'ttTable', label: 'TT Table' },
              { key: 'tv', label: 'TV' },
              { key: 'coffeeMachine', label: 'Coffee Machine' },
              { key: 'snacksMachine', label: 'Snacks Machine' },
            ]}
          />

          <AmenityGroup
            title="Services"
            icon={<FaPlug className="text-blue-500" />}
            items={[
              { key: 'laundry', label: 'Laundry' },
              { key: 'housekeeping', label: 'Housekeeping' },
              { key: 'wifi', label: 'Internet/Wi-Fi' },
            ]}
          />

          <AmenityGroup
            title="Top Amenities"
            icon={<FaDumbbell className="text-blue-500" />}
            items={[
              { key: 'gym', label: 'Gym' },
              { key: 'lift', label: 'Lift' },
              { key: 'regularWaterSupply', label: 'Regular Water Supply' },
              { key: 'swimmingPool', label: 'Swimming Pool' },
              { key: 'reservedParking', label: 'Reserved Parking' },
              { key: 'powerBackup', label: 'Power Backup' },
            ]}
          />

          <AmenityGroup
            title="Parking"
            icon={<FaCar className="text-blue-500" />}
            items={[
              { key: 'parkingTwoWheeler', label: '2 Wheeler' },
              { key: 'parkingFourWheeler', label: '4 Wheeler' },
            ]}
          />

          <AmenityGroup
            title="Other Amenities"
            icon={<FaSnowflake className="text-blue-500" />}
            items={[
              { key: 'ac', label: 'Supports AC' },
            ]}
          />
        </div>
      </div>
    );
  };

  // ===== STEP 5: PHOTOS =====
  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Upload Photos</h2>
      <p className="text-sm text-gray-500">Upload photos of your property</p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <FaImage className="text-4xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Upload up to 10 images</p>
        <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max 5MB each)</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
      </div>

      {formData.imagePreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {formData.imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Property ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FaTimesCircle />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ===== STEP 6: REVIEW =====
  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Review & Post</h2>
      <p className="text-sm text-gray-500">Review your property details before posting</p>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {submitError}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Property Type</span>
          <span className="font-medium">{formData.propertyType}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Looking to</span>
          <span className="font-medium">{formData.lookingTo}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Location</span>
          <span className="font-medium">{formData.locality}, {formData.city}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Property Type</span>
          <span className="font-medium">{formData.propertyTypeDetail}</span>
        </div>
        {formData.buildingName && (
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Building</span>
            <span className="font-medium">{formData.buildingName}</span>
          </div>
        )}
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">BHK</span>
          <span className="font-medium">{formData.bedrooms} BHK</span>
        </div>
        {formData.bathrooms && (
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Bathrooms</span>
            <span className="font-medium">{formData.bathrooms}</span>
          </div>
        )}
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Area</span>
          <span className="font-medium">{formData.area} {formData.areaUnit}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Furnishing</span>
          <span className="font-medium">{formData.furnishing}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Price</span>
          <span className="font-medium">₹{Number(formData.price).toLocaleString('en-IN')}</span>
        </div>
        {formData.securityDeposit && (
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Security Deposit</span>
            <span className="font-medium">₹{Number(formData.securityDeposit).toLocaleString('en-IN')}</span>
          </div>
        )}
        {formData.maintenance && (
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Maintenance</span>
            <span className="font-medium">₹{Number(formData.maintenance).toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Construction Status</span>
          <span className="font-medium">{formData.constructionStatus}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">Availability</span>
          <span className="font-medium">{formData.availability}</span>
        </div>
        {formData.lookingTo === 'PG/Co-living' && (
          <>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">PG Name</span>
              <span className="font-medium">{formData.pgName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Total Beds</span>
              <span className="font-medium">{formData.totalBeds}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">PG Gender</span>
              <span className="font-medium">{formData.pgGender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Best Suited For</span>
              <span className="font-medium">{formData.bestSuitedFor}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Meals Available</span>
              <span className="font-medium">{formData.mealsAvailable}</span>
            </div>
            {formData.mealsAvailable === 'Yes' && (
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-600">Meal Offerings</span>
                <span className="font-medium">
                  {Object.entries(formData.mealOfferings)
                    .filter(([, val]) => val === true)
                    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                    .join(', ') || 'None'}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Rooms</span>
              <span className="font-medium">{formData.rooms.length}</span>
            </div>
            {formData.rooms.map((room, idx) => (
              <div key={idx} className="flex justify-between py-1 border-b border-gray-200 pl-4">
                <span className="text-gray-600 text-xs">Room {idx+1}</span>
                <span className="text-xs">
                  {room.type} – ₹{Number(room.rent).toLocaleString('en-IN')} rent, ₹{Number(room.deposit).toLocaleString('en-IN')} deposit
                </span>
              </div>
            ))}
          </>
        )}
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Amenities</span>
          <span className="font-medium">{getSelectedAmenities().length || 'None selected'}</span>
        </div>
        {getSelectedAmenities().length > 0 && (
          <div className="py-1 flex flex-wrap gap-1">
            {getSelectedAmenities().map((amenity, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {amenity}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Images</span>
          <span className="font-medium">{formData.images.length} uploaded</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaWhatsapp className="text-green-500 text-xl mt-1" />
          <div>
            <p className="text-sm text-gray-700">Need help? Now you can directly post property via WhatsApp</p>
            <button className="text-green-600 font-medium text-sm mt-1 hover:underline">
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaPhone className="text-blue-500 text-xl mt-1" />
          <div>
            <p className="text-sm text-gray-700">Get a callback from our team</p>
            <button className="text-blue-600 font-medium text-sm mt-1 hover:underline">
              Request Callback
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  if (!token) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please login to post a property</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post your property</h1>
            <p className="text-sm text-gray-500">Sell or rent your property</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 hover:underline"
          >
            Return to dashboard
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Basic Details</span>
            <span>Property Details</span>
            <span>Price Details</span>
            <span>Amenities</span>
            <span>Photos</span>
            <span>Review</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Progress {Math.round(getStepProgress())}%</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 mb-6 text-xs">
          {[1, 2, 3, 4, 5, 6].map((step) => {
            const status = getStepStatus(step);
            return (
              <div
                key={step}
                className={`flex items-center gap-1 p-1 rounded-lg ${
                  currentStep === step ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                {status.icon}
                <span className={step === currentStep ? 'font-medium text-blue-600 truncate' : 'text-gray-500 truncate'}>
                  {status.text}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">{renderStep()}</div>

        <div className="flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FaArrowLeft className="text-sm" /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next <FaArrowRight className="text-sm" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 bg-yellow-400 text-gray-800 font-bold rounded-lg transition ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-300'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Post Property
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            Need help? <button className="text-blue-600 font-medium hover:underline">Contact support</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostPropertyWizard;