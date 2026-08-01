// src/components/Hero.jsx
function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Home</h1>
      <p className="text-xl mb-6">Search thousands of properties in your city</p>
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter city, locality, or project"
          className="flex-1 px-4 py-3 rounded text-gray-800 focus:outline-none"
        />
        <button className="px-6 py-3 bg-yellow-400 text-gray-800 font-semibold rounded hover:bg-yellow-300">
          Search
        </button>
      </div>
    </section>
  );
}
export default Hero;