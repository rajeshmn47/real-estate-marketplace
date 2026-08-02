import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function Profile() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get('/auth/profile')
      .then((response) => setProfile(response.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-xl mx-auto p-6">
          <div className="rounded-xl bg-white p-6 shadow-sm text-center">
            <h1 className="text-2xl font-bold mb-2">Not Signed In</h1>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          {loading ? (
            <div className="text-gray-500">Loading profile…</div>
          ) : (
            <div className="space-y-4 text-gray-700">
              <div>
                <span className="font-semibold">Name:</span> {profile?.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {profile?.email}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {profile?.phone || 'Not set'}
              </div>
              <div>
                <span className="font-semibold">Role:</span> {profile?.role}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="mt-6 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;
