import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Plane, Calendar, MapPin, Plus } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState({ ongoing: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await apiClient.get('/trips');
        const data = response.data;
        
        // Categorize trips
        const categorized = { ongoing: [], upcoming: [], completed: [] };
        data.forEach(trip => {
          if (trip.status === 'ongoing') categorized.ongoing.push(trip);
          else if (trip.status === 'completed') categorized.completed.push(trip);
          else categorized.upcoming.push(trip);
        });
        
        setTrips(categorized);
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const TripCard = ({ trip }) => (
    <Link to={`/trips/${trip._id}`} className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 truncate">{trip.name}</h3>
        {trip.is_public && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">Public</span>
        )}
      </div>
      <div className="space-y-2 mt-4 text-sm text-gray-500">
        <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {trip.itinerary_sections?.length || 0} Stops Planned</div>
      </div>
    </Link>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your itineraries...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
        <Link to="/trips/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Create New Trip
        </Link>
      </div>

      <div className="space-y-12">
        {/* Ongoing */}
        {trips.ongoing.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Ongoing Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.ongoing.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Upcoming Trips</h2>
          {trips.upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.upcoming.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          ) : (
            <p className="text-gray-500 italic">No upcoming trips planned.</p>
          )}
        </section>

        {/* Completed */}
        {trips.completed.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Past Memories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {trips.completed.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
