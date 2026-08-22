import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store';
import apiClient from '../api/client';
import { Map, Plane, Compass, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const user = useStore((state) => state.user);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await apiClient.get('/trips');
        setRecentTrips(response.data.slice(0, 3)); // Just show the top 3
      } catch (err) {
        console.error("Failed to fetch trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Where to next, {user?.first_name}?
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Dream, design, and organize your next multi-city adventure with smart budget tracking and seamless drag-and-drop planning.
          </p>
          <Link 
            to="/trips/create" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
          >
            <Plus className="mr-2 h-5 w-5" /> Plan a new trip
          </Link>
        </div>
        <Compass className="absolute -bottom-10 -right-10 h-64 w-64 text-white opacity-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Recent Trips</h2>
            <Link to="/trips" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTrips.map(trip => (
                <Link key={trip._id} to={`/trips/${trip._id}`} className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{trip.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-4">
                    <Plane className="h-4 w-4 mr-2" />
                    <span>View Itinerary Details</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No trips yet</h3>
              <p className="mt-1 text-gray-500">Get started by creating your first travel itinerary.</p>
            </div>
          )}
        </div>

        {/* Top Regional Selections */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Destinations</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-200">
              {['Paris, France', 'Tokyo, Japan', 'Rome, Italy', 'Bali, Indonesia'].map((city, idx) => (
                <li key={idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center">
                  <span className="font-medium text-gray-900">{city}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
