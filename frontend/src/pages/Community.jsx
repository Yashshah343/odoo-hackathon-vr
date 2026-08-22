import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  Globe, 
  Heart, 
  Copy, 
  MapPin, 
  Search, 
  Share2, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Community() {
  const navigate = useNavigate();
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedTrips, setLikedTrips] = useState({});
  const [clonedMessage, setClonedMessage] = useState('');

  const fetchPublicTrips = async () => {
    try {
      const response = await apiClient.get('/trips/community');
      setPublicTrips(response.data || []);
    } catch (err) {
      console.error("Failed to load community trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicTrips();
  }, []);

  const handleLike = async (tripId) => {
    setLikedTrips(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
    try {
      await apiClient.post(`/trips/${tripId}/like`);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleClone = async (tripId) => {
    try {
      const res = await apiClient.post(`/trips/${tripId}/clone`);
      setClonedMessage('Itinerary copied to your personal trips!');
      setTimeout(() => {
        setClonedMessage('');
        navigate(`/trips/${res.data._id}`);
      }, 1500);
    } catch (err) {
      alert("Failed to clone trip. Please try again.");
    }
  };

  const filteredTrips = publicTrips.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.itinerary_sections || []).some(s => s.destination?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden text-center md:text-left">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur-sm">
            <Globe className="h-3.5 w-3.5 mr-1.5" /> Community Travel Network
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Community Inspiration & Experiences
          </h1>
          <p className="text-blue-100 text-base md:text-lg">
            Explore shared itineraries from fellow travelers worldwide. Copy full trips directly into your builder with a single click.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search community itineraries (e.g. Paris, Tokyo, Alps)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {clonedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm flex items-center shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          {clonedMessage}
        </div>
      )}

      {/* Grid of Community Trips */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading community itineraries...</div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isLiked = likedTrips[trip._id];
            const stopsCount = trip.itinerary_sections?.length || 0;
            const totalBudget = (trip.itinerary_sections || []).reduce((acc, s) => acc + (parseFloat(s.budget_allocated) || 0), 0);

            return (
              <div 
                key={trip._id} 
                className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-36 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md capitalize">
                        {trip.status}
                      </span>
                      <button 
                        onClick={() => handleLike(trip._id)}
                        className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-125 ${
                          isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title="Like this itinerary"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="relative z-10 text-xl font-black text-white truncate drop-shadow-sm">
                      {trip.name}
                    </h3>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center font-medium">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        {stopsCount} Destination Stop{stopsCount !== 1 ? 's' : ''}
                      </span>
                      {totalBudget > 0 && (
                        <span className="flex items-center font-bold text-gray-900">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                          ${totalBudget.toLocaleString()} Est.
                        </span>
                      )}
                    </div>

                    {/* Preview of Stops */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(trip.itinerary_sections || []).slice(0, 3).map((s, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                          {s.destination || `Stop ${idx + 1}`}
                        </span>
                      ))}
                      {stopsCount > 3 && (
                        <span className="text-[11px] text-gray-400 font-medium self-center">
                          +{stopsCount - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleClone(trip._id)}
                    className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl text-xs font-bold transition-colors flex-1 justify-center"
                    title="Copy this itinerary into your trips"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Itinerary
                  </button>

                  <Link 
                    to={`/trips/${trip._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-200 hover:border-gray-400 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <Globe className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No matching community trips</h3>
          <p className="text-sm text-gray-500">Make your personal trips public in the Builder to share them with other travelers!</p>
        </div>
      )}
    </div>
  );
}
