import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store';
import apiClient from '../api/client';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Camera, 
  Plane, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Trash2,
  Bookmark,
  Languages,
  AlertTriangle
} from 'lucide-react';

export default function Profile() {
  const { user, setAuth, token, logout } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    city: user?.city || '',
    country: user?.country || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    language_preference: user?.language_preference || 'English'
  });
  
  const [userTrips, setUserTrips] = useState({ upcoming: [], completed: [], ongoing: [] });
  const [savedDestinations, setSavedDestinations] = useState([
    { id: '1', name: 'Kyoto, Japan', category: 'Temples & Culture' },
    { id: '2', name: 'Santorini, Greece', category: 'Island & Sunset' },
    { id: '3', name: 'Zermatt, Switzerland', category: 'Matterhorn & Alps' }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await apiClient.get('/trips');
        const upcoming = [];
        const completed = [];
        const ongoing = [];
        (res.data || []).forEach(t => {
          if (t.status === 'completed') completed.push(t);
          else if (t.status === 'ongoing') ongoing.push(t);
          else upcoming.push(t);
        });
        setUserTrips({ upcoming, completed, ongoing });
      } catch (err) {
        console.error("Failed to load user trips", err);
      }
    };
    fetchTrips();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await apiClient.put('/users/me', formData);
      setAuth(response.data, token);
      setMessage('Profile settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      alert("Failed to delete account. Please contact support.");
    }
  };

  const removeSavedDestination = (id) => {
    setSavedDestinations(prev => prev.filter(d => d.id !== id));
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Profile Card */}
      <div className="bg-white shadow-xs rounded-3xl overflow-hidden border border-gray-200">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 h-40 relative">
          <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold capitalize">
            Account Role: {user.role}
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Avatar and User Title */}
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-8 gap-4">
            <div className="flex items-end space-x-4">
              <div className="h-28 w-28 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-white relative group">
                <div className="h-full w-full rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">{user.first_name} {user.last_name}</h1>
                <p className="text-xs text-gray-500 flex items-center mt-0.5">
                  <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" /> {user.email}
                </p>
              </div>
            </div>

            <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              GlobeTrotter Verified Traveler
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center ${
                message.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {message}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">First Name</label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm py-2.5 bg-gray-50/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm py-2.5 px-3 bg-gray-50/50" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">City</label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input 
                    type="text" 
                    name="city" 
                    placeholder="e.g. New York" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm py-2.5 bg-gray-50/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  placeholder="e.g. United States" 
                  value={formData.country} 
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm py-2.5 px-3 bg-gray-50/50" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input 
                    type="text" 
                    name="phone" 
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm py-2.5 bg-gray-50/50" 
                  />
                </div>
              </div>

              {/* Language Preference (Feature 12 in PDF) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <Languages className="h-3.5 w-3.5 mr-1 text-indigo-600" /> Language Preference
                </label>
                <select
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 text-xs sm:text-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  <option value="English">English (United States)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                </select>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Travel Bio & Notes</label>
                <textarea
                  rows={2}
                  name="bio"
                  placeholder="Passionate globe-trotter, photography enthusiast, and mountain hiker..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-xl py-2 px-3 text-xs sm:text-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-wrap gap-4">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(true)}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline flex items-center"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete My Account
              </button>

              <button 
                type="submit" 
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Saved / Bookmarked Destinations List (Feature 12 in PDF) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Bookmark className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
            Saved Destinations & Bucket List ({savedDestinations.length})
          </h2>
          <Link to="/explore" className="text-xs font-bold text-blue-600 hover:underline">
            Explore More Places
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {savedDestinations.map(dest => (
            <div key={dest.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">{dest.name}</p>
                <span className="text-[10px] text-gray-500">{dest.category}</span>
              </div>
              <button 
                onClick={() => removeSavedDestination(dest.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Remove from saved"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preplanned Trips Section (Screen 7 in Excalidraw) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Preplanned & Upcoming Trips ({userTrips.upcoming.length + userTrips.ongoing.length})
          </h2>
          <Link to="/trips/create" className="text-xs font-bold text-blue-600 hover:underline">
            + Plan New
          </Link>
        </div>

        {userTrips.upcoming.length + userTrips.ongoing.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...userTrips.ongoing, ...userTrips.upcoming].map(trip => (
              <Link 
                key={trip._id} 
                to={`/trips/${trip._id}`}
                className="group bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{trip.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" /> {trip.itinerary_sections?.length || 0} Destination Stops
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 flex items-center justify-between">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center text-gray-500 text-xs">
            No upcoming trips planned yet. <Link to="/trips/create" className="text-blue-600 font-semibold hover:underline">Plan your next adventure</Link>
          </div>
        )}
      </div>

      {/* Previous Trips Section (Screen 7 in Excalidraw) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-600" />
          Previous Completed Trips ({userTrips.completed.length})
        </h2>

        {userTrips.completed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {userTrips.completed.map(trip => (
              <Link 
                key={trip._id} 
                to={`/trips/${trip._id}`}
                className="group bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between opacity-90"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{trip.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" /> {trip.itinerary_sections?.length || 0} Destination Stops
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 text-xs font-semibold text-emerald-600 flex items-center justify-between">
                  <span>View Memory</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center text-gray-500 text-xs">
            Completed trips and memories will appear here.
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center">Delete Account Permanently?</h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              This action cannot be undone. All your saved itineraries, stop expenses, and account details in MongoDB will be deleted.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
