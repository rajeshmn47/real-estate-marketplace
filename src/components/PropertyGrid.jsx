// src/components/PropertyGrid.jsx
import PropertyCard from './PropertyCard';

const sampleProperties = [
  { id: 1, image: 'https://via.placeholder.com/300x200', price: 8500000, title: '3 BHK Apartment', location: 'Andheri East, Mumbai', beds: 3, baths: 2 },
  { id: 2, image: 'https://via.placeholder.com/300x200', price: 12000000, title: '4 BHK Villa', location: 'Whitefield, Bangalore', beds: 4, baths: 3 },
  // add more...
];

function PropertyGrid() {
  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Featured Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProperties.map((prop) => (
          <PropertyCard key={prop.id} {...prop} />
        ))}
      </div>
    </section>
  );
}
export default PropertyGrid;