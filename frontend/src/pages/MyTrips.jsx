import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  MapPin, 
  Plus, 
  ArrowRight, 
  Plane, 
  Filter, 
  Calendar, 
  Trash2, 
  Edit3, 
  Eye, 
  Copy,
  DollarSign
} from 'lucide-react';

export default function MyTrips() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = searchParams.get('status');
  const sortBy = searchParams.get('sort');

  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const response = await apiClient.get('/trips');
      setAllTrips(response.data || []);
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (e, tripId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) return;
    
    try {
      await apiClient.delete(`/trips/${tripId}`);
      setAllTrips(prev => prev.filter(t => t._id !== tripId));
    } catch (err) {
      alert("Failed to delete trip");
    }
  };

  // Filter trips based on query param
  let displayedTrips = allTrips;
  if (statusFilter && statusFilter !== 'all') {
    displayedTrips = displayedTrips.filter(t => t.status === statusFilter);
  }

  // Sort trips
  if (sortBy === 'name') {
    displayedTrips = [...displayedTrips].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'status') {
    displayedTrips = [...displayedTrips].sort((a, b) => a.status.localeCompare(b.status));
  }

  // Categorize for grouped view
  const categorized = { ongoing: [], upcoming: [], completed: [] };
  displayedTrips.forEach(trip => {
    if (trip.status === 'ongoing') categorized.ongoing.push(trip);
    else if (trip.status === 'completed') categorized.completed.push(trip);
    else categorized.upcoming.push(trip);
  });

  const TripCard = ({ trip }) => {
    const stopsCount = trip.itinerary_sections?.length || 0;
    const totalBudget = (trip.itinerary_sections || []).reduce((acc, s) => acc + (parseFloat(s.budget_allocated) || 0), 0);

    return (
      <div className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {trip.name}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
              trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              trip.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {trip.status}
            </span>
          </div>

          {trip.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{trip.description}</p>
          )}

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-2 text-blue-500 flex-shrink-0" />
              <span>{stopsCount} Destination Stop{stopsCount !== 1 ? 's' : ''}</span>
            </div>

            {(trip.start_date || trip.end_date) && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span>{trip.start_date || 'TBD'} {trip.end_date ? `→ ${trip.end_date}` : ''}</span>
              </div>
            )}

            {totalBudget > 0 && (
              <div className="flex items-center text-emerald-600 font-semibold">
                <DollarSign className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                <span>${totalBudget.toLocaleString()} Total Budget</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: View, Edit, Delete (Feature 4 in PDF) */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 gap-2">
          <div className="flex space-x-2">
            <Link
              to={`/trips/${trip._id}`}
              className="inline-flex items-center px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              title="View Itinerary"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Link>
            <Link
              to={`/trips/${trip._id}/builder`}
              className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg text-xs font-bold transition-colors"
              title="Edit in Builder"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
            </Link>
          </div>

          <button
            onClick={(e) => handleDelete(e, trip._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Itinerary"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-16 text-center text-gray-500">Loading your itineraries...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Trips</h1>
          <p className="text-gray-500 text-sm mt-1">Manage, edit, and organize all your travel itineraries.</p>
        </div>
        <Link 
          to="/trips/create" 
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-xs font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Create New Trip
        </Link>
      </div>

      {statusFilter && statusFilter !== 'all' && (
        <div className="bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-blue-600" />
            <span>Showing only <strong className="capitalize">{statusFilter}</strong> trips ({displayedTrips.length} found)</span>
          </div>
          <Link to="/trips" className="text-xs font-bold text-blue-600 hover:underline">Show All</Link>
        </div>
      )}

      {displayedTrips.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center space-y-3">
          <Plane className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No trips found</h3>
          <p className="text-sm text-gray-500">Plan your first multi-city trip or adjust your status filters.</p>
          <Link to="/trips/create" className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> Create Trip
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {statusFilter && statusFilter !== 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTrips.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          ) : (
            <>
              {/* Ongoing */}
              {categorized.ongoing.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                    Ongoing Adventures ({categorized.ongoing.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorized.ongoing.map(trip => <TripCard key={trip._id} trip={trip} />)}
                  </div>
                </section>
              )}

              {/* Upcoming */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                  Upcoming Trips ({categorized.upcoming.length})
                </h2>
                {categorized.upcoming.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorized.upcoming.map(trip => <TripCard key={trip._id} trip={trip} />)}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-xs">No upcoming trips planned.</p>
                )}
              </section>

              {/* Completed */}
              {categorized.completed.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                    Past Memories ({categorized.completed.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90">
                    {categorized.completed.map(trip => <TripCard key={trip._id} trip={trip} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
