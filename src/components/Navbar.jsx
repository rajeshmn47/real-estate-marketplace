import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FaHome, FaMapMarkerAlt, FaChevronDown, FaDownload, FaUserCircle, FaBars, FaTimes, FaPlus } from 'react-icons/fa';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-blue-900 shadow-lg px-3 md:px-5 py-2 md:py-3 flex items-center justify-between gap-2 flex-nowrap whitespace-nowrap">
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 md:gap-1.5 cursor-pointer" onClick={() => navigate('/') }>
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
        <Link to="#" className="hover:text-white transition">For Buyers</Link>
        <Link to="#" className="hover:text-white transition">For Tenants</Link>
        <Link to="#" className="hover:text-white transition">For Sellers</Link>
        <Link to="#" className="hover:text-white transition">Services</Link>
        <Link to="#" className="hover:text-white transition">News & Guide</Link>
      </div>

      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <button className="hidden md:flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-blue-200 hover:text-white transition">
          <FaDownload className="text-sm md:text-base" />
          <span className="hidden xl:inline">Download App</span>
        </button>
        <button
          onClick={() => navigate('/post-property')}
          className="px-2 md:px-3 py-1 md:py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-lg text-[10px] md:text-sm font-bold transition shadow-md flex items-center gap-1 md:gap-1.5"
        >
          Post Property
          <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-extrabold px-1 md:px-1.5 py-0.5 rounded-sm uppercase leading-none">Free</span>
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
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden bg-blue-800 text-white p-4 space-y-3 text-sm shadow-lg border-t border-blue-700/50 absolute left-0 right-0 top-full">
          <Link to="#" className="block hover:text-yellow-300">For Buyers</Link>
          <Link to="#" className="block hover:text-yellow-300">For Tenants</Link>
          <Link to="#" className="block hover:text-yellow-300">For Sellers</Link>
          <Link to="#" className="block hover:text-yellow-300">Services</Link>
          <Link to="#" className="block hover:text-yellow-300">News & Guide</Link>
          <hr className="border-blue-700/50" />
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => navigate('/post-property')}>
            <FaPlus /> Post Property
          </button>
          <button className="flex items-center gap-2 text-blue-200 hover:text-white" onClick={() => user ? logout() : navigate('/login')}>
            <FaUserCircle /> {user ? 'Logout' : 'Login'}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
