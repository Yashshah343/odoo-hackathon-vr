import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Globe, Heart, MessageCircle, MapPin } from 'lucide-react';

export default function Community() {
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicTrips = async () => {
      try {
        const response = await apiClient.get('/trips/community');
        setPublicTrips(response.data);
      } catch (err) {
        console.error("Failed to load community trips");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrips();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center">
        <Globe className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900">Community Inspiration</h1>
        <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
          Discover incredible itineraries crafted by the GlobeTrotter community. Find inspiration for your next journey and see where others are traveling.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading public trips...</div>
      ) : publicTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicTrips.map((trip) => (
            <div key={trip._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-200 flex items-center justify-center relative">
                {/* Fallback image style since we don't store actual images yet */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-80"></div>
                <h3 className="relative z-10 text-xl font-bold text-white px-4 text-center">{trip.name}</h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {trip.status}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">By {trip.user_id.slice(-6)}</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {trip.itinerary_sections?.length || 0} stops included
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex space-x-4 text-gray-400">
                    <button className="hover:text-red-500 transition-colors"><Heart className="h-5 w-5" /></button>
                    <button className="hover:text-blue-500 transition-colors"><MessageCircle className="h-5 w-5" /></button>
                  </div>
                  <Link 
                    to={`/trips/${trip._id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg">No public trips found. Be the first to share your itinerary with the community!</p>
        </div>
      )}
    </div>
  );
}
