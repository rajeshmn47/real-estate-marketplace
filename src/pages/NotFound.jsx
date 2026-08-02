import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl bg-white p-10 shadow-lg text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Sorry, the page you are looking for could not be found.</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
