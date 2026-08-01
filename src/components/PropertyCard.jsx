// src/components/PropertyCard.jsx
function PropertyCard({ image, price, title, location, beds, baths }) {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition">
      <img className="w-full h-48 object-cover" src={image} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl text-gray-800">₹{price.toLocaleString()}</div>
        <p className="text-gray-600 text-sm mt-1">{title}</p>
        <p className="text-gray-500 text-sm">{location}</p>
      </div>
      <div className="px-6 pt-0 pb-4 flex gap-2 text-sm text-gray-600">
        <span>🛏 {beds}</span>
        <span>🛁 {baths}</span>
        <span>📐 1200 sq.ft</span>
      </div>
    </div>
  );
}
export default PropertyCard;