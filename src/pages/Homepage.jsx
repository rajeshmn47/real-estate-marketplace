// src/pages/Homepage.jsx
import { useState } from 'react';
import {
    FaSearch, FaMapMarkerAlt, FaHeart, FaBed, FaBath,
    FaBuilding, FaHome, FaUserFriends, FaRegBuilding,
    FaChevronDown, FaDownload, FaUserCircle
} from 'react-icons/fa';

// Sample property data (same as before)
const properties = [
    { id: 1, image: 'https://picsum.photos/seed/1/400/300', price: '₹85 Lakhs', title: '3 BHK Apartment', location: 'Andheri East, Mumbai', beds: 3, baths: 2, sqft: 1250 },
    { id: 2, image: 'https://picsum.photos/seed/2/400/300', price: '₹1.2 Crores', title: '4 BHK Villa', location: 'Whitefield, Bangalore', beds: 4, baths: 3, sqft: 2400 },
    { id: 3, image: 'https://picsum.photos/seed/3/400/300', price: '₹65 Lakhs', title: '2 BHK Flat', location: 'Kothrud, Pune', beds: 2, baths: 2, sqft: 980 },
    { id: 4, image: 'https://picsum.photos/seed/4/400/300', price: '₹2.5 Crores', title: '5 BHK Penthouse', location: 'Greater Kailash, Delhi', beds: 5, baths: 4, sqft: 3200 },
    { id: 5, image: 'https://picsum.photos/seed/5/400/300', price: '₹45 Lakhs', title: '1 BHK Studio', location: 'Electronic City, Bangalore', beds: 1, baths: 1, sqft: 550 },
    { id: 6, image: 'https://picsum.photos/seed/6/400/300', price: '₹95 Lakhs', title: '3 BHK Row House', location: 'Powai, Mumbai', beds: 3, baths: 3, sqft: 1800 },
    { id: 7, image: 'https://picsum.photos/seed/7/400/300', price: '₹78 Lakhs', title: '3 BHK Flat', location: 'Hinjewadi, Pune', beds: 3, baths: 2, sqft: 1350 },
    { id: 8, image: 'https://picsum.photos/seed/8/400/300', price: '₹1.5 Crores', title: '4 BHK Duplex', location: 'Jubilee Hills, Hyderabad', beds: 4, baths: 3, sqft: 2800 },
];

function Homepage() {
    const [activeTab, setActiveTab] = useState('Buy');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ===== COMPACT NAVBAR ===== */}
            <nav className="sticky top-0 z-50 bg-blue-900 shadow-lg px-3 md:px-5 py-3 flex items-center justify-between gap-2 flex-nowrap whitespace-nowrap overflow-x-auto">

                {/* LEFT: Logo + Location */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <FaHome className="text-2xl text-blue-300" />
                        <span className="text-lg font-bold text-white">Housing.com</span>
                    </div>
                    <div className="hidden md:flex items-center bg-blue-800/60 px-3 py-1.5 rounded-md cursor-pointer hover:bg-blue-700/60 transition border border-blue-400/30 text-sm">
                        <FaMapMarkerAlt className="text-yellow-300 mr-1.5 text-sm" />
                        <span className="font-medium text-white">Bengaluru</span>
                        <FaChevronDown className="ml-1.5 text-xs text-blue-300" />
                    </div>
                </div>

                {/* CENTER: Nav Links (visible on xl+) */}
                <div className="hidden xl:flex items-center gap-x-4 text-sm font-medium text-blue-100">
                    <a href="#" className="hover:text-white transition">For Buyers</a>
                    <a href="#" className="hover:text-white transition">For Tenants</a>
                    <a href="#" className="hover:text-white transition">For Sellers</a>
                    <a href="#" className="hover:text-white transition">Services</a>
                    <a href="#" className="hover:text-white transition">News & Guide</a>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="hidden md:flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition">
                        <FaDownload className="text-base" />
                        <span className="hidden xl:inline">Download App</span>
                    </button>

                    <button className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-lg text-sm font-bold transition shadow-md flex items-center gap-1.5">
                        Post Property
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase leading-none">
                            Free
                        </span>
                    </button>

                    <button className="text-gray-200 hover:text-white transition text-2xl">
                        <FaUserCircle />
                    </button>
                </div>
            </nav>
            <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-10 px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Text Section */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                            Properties for rent in <span className="text-yellow-300">Bengaluru</span>
                        </h1>
                        <p className="text-sm md:text-base text-blue-100 mt-1">
                            7K+ listings added daily and 71K+ total verified
                        </p>
                    </div>

                    {/* Search Section with Tabs */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">

                        {/* Tabs */}
                        <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb bg-white/10 backdrop-blur-sm p-1.5 max-w-full mx-auto">
                            {['Buy', 'Rent', 'Commercial', 'PG/Co-Living', 'Plots'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-semibold transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-white text-blue-600 shadow-lg scale-105'
                                        : 'text-white hover:bg-white/20'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Simplified Search Form – only Location + Search button */}
                        <div className="bg-white shadow-2xl flex flex-col sm:flex-row gap-3 text-gray-700 p-2">
                            <div className="flex-1 flex items-center rounded-lg px-4 py-2">
                                <FaMapMarkerAlt className="text-blue-500 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Enter city, locality, or project"
                                    className="w-full bg-transparent outline-none text-sm"
                                />
                            </div>
                            <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-8 py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md">
                                <FaSearch /> Search
                            </button>
                        </div>
                    </div>
                    {/* Popular Localities */}
                    <div className="mt-5 text-center flex flex-wrap items-center justify-center gap-2">
                        <span className="text-sm text-blue-100 font-medium">Popular Localities:</span>
                        {['HSR Layout', 'Koramangala', 'Whitefield', 'JP Nagar', 'BTM Layout'].map((loc) => (
                            <button
                                key={loc}
                                className="px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full text-xs md:text-sm text-white transition"
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            {/* ===== PROPERTY GRID ===== */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Featured Properties</h2>
                        <p className="text-gray-500 mt-1">Handpicked listings just for you</p>
                    </div>
                    <button className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                        View All →
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <div key={property.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 group">
                            <div className="relative overflow-hidden">
                                <img src={property.image} alt={property.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition">
                                    <FaHeart className="text-gray-400 hover:text-red-500 transition" />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                    {property.sqft} sq.ft
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="text-xl font-bold text-gray-800">{property.price}</div>
                                <div className="text-gray-700 font-medium mt-1">{property.title}</div>
                                <div className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                    <FaMapMarkerAlt className="text-xs" /> {property.location}
                                </div>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-gray-500 text-sm">
                                    <span className="flex items-center gap-1"><FaBed /> {property.beds}</span>
                                    <span className="flex items-center gap-1"><FaBath /> {property.baths}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-10">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-white font-bold text-lg mb-3">Housing</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">About Us</a></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-3">For Buyers</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Search Properties</a></li>
                            <li><a href="#" className="hover:text-white">Loan Calculator</a></li>
                            <li><a href="#" className="hover:text-white">Legal Advisory</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-3">For Sellers</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">List a Property</a></li>
                            <li><a href="#" className="hover:text-white">Advertise</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg mb-3">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Help Centre</a></li>
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Use</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Housing Clone. Built with React & Tailwind. For educational purposes only.
                </div>
            </footer>
        </div>
    );
}

export default Homepage;