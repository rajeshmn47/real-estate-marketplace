// src/components/Navbar.jsx
function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="text-2xl font-bold text-blue-600">🏠 Housing</div>
      <div className="flex-1 mx-8">
        <input
          type="text"
          placeholder="Search for properties..."
          className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex space-x-4">
        <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Login</button>
        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Sign Up</button>
      </div>
    </nav>
  );
}
export default Navbar;