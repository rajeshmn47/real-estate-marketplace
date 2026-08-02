import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-2xl font-bold text-blue-600">🏠 Housing</Link>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-700">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/properties" className="hover:text-blue-600">Listings</Link>
          <Link to="/post-property" className="hover:text-blue-600">Post Property</Link>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        {user ? (
          <>
            <Link to="/profile" className="text-sm text-gray-700 hover:text-blue-600">{user.name}</Link>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
