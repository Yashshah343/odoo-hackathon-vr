import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store';
import apiClient from '../api/client';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Globe, 
  Sparkles,
  Compass,
  Star,
  IndianRupee
} from 'lucide-react';

export default function Dashboard() {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real Authentic Regional Selections (prioritizing user country)
  const topRegions = [
    { 
      name: "Ahmedabad", 
      country: "Gujarat, India", 
      desc: "Sabarmati Ashram, Atal Bridge & Heritage Pols", 
      image: "https://images.unsplash.com/photo-1609137144822-44673fb39bf9?w=600&auto=format&fit=crop&q=80",
      cost: "₹15,000 avg",
      rating: 4.9
    },
    { 
      name: "Mumbai", 
      country: "Maharashtra, India", 
      desc: "Marine Drive, Gateway of India & Sea Link", 
      image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80",
      cost: "₹22,000 avg",
      rating: 4.9
    },
    { 
      name: "Jaipur", 
      country: "Rajasthan, India", 
      desc: "Amber Fort, Hawa Mahal & Royal City Palace", 
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80",
      cost: "₹18,000 avg",
      rating: 4.8
    },
    { 
      name: "Goa", 
      country: "Goa, India", 
      desc: "Sun-kissed Beaches, Fort Aguada & Water Sports", 
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
      cost: "₹20,000 avg",
      rating: 4.9
    }
  ];

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await apiClient.get('/trips');
        setTrips(response.data || []);
      } catch (err) {
        console.error("Failed to load user dashboard trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleRegionClick = (regionName) => {
    navigate(`/trips/create?name=${encodeURIComponent('Trip to ' + regionName)}&destination=${encodeURIComponent(regionName)}`);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner (Warm Sunset & Amber Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white shadow-xl p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-amber-100 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" /> Welcome back, {user?.first_name || 'Traveler'}!
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Where to next in India & the World?
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Design multi-day itineraries, add authentic attractions, allocate budgets in ₹ Rupees, and stay organized.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link 
              to="/trips/create" 
              className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-white text-amber-900 font-black text-xs hover:bg-amber-50 shadow-lg transition-all active:scale-95"
            >
              <Plus className="mr-1.5 h-4 w-4 text-rose-600" />
              Plan a New Trip
            </Link>
            <Link 
              to="/trips" 
              className="inline-flex items-center px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition-colors border border-white/20"
            >
              My Itineraries ({trips.length})
            </Link>
          </div>
        </div>
        
        <Globe className="absolute -bottom-16 -right-16 h-80 w-80 text-white/10" />
      </div>

      {/* Top Regional Selections (Real Destinations) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900">Recommended Destinations</h2>
            <p className="text-xs text-gray-500">Curated authentic places tailored to your region. Click to start planning.</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-amber-600 hover:underline flex items-center">
            View All Places <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topRegions.map((region, idx) => (
            <div 
              key={idx}
              onClick={() => handleRegionClick(region.name)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white border border-amber-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={region.image} 
                    alt={region.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center shadow-xs">
                    <Star className="h-3.5 w-3.5 text-amber-500 mr-1 fill-amber-500" /> {region.rating}
                  </span>
                  <span className="absolute bottom-3 left-3 text-white font-black text-lg">
                    {region.name}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 block">{region.country}</span>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{region.desc}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2 text-xs">
                <span className="font-bold text-gray-900 flex items-center">
                  <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-amber-600" /> {region.cost}
                </span>
                <span className="font-bold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center">
                  Plan Trip <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900">Your Recent Itineraries</h2>
          <Link to="/trips" className="text-xs font-bold text-amber-600 hover:underline">
            View All Trips ({trips.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="bg-white border border-dashed border-amber-300 rounded-3xl p-12 text-center space-y-3">
            <Plane className="h-10 w-10 text-amber-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No trips created yet</h3>
            <p className="text-xs text-gray-500">Start by creating your first trip or exploring destination suggestions above.</p>
            <Link 
              to="/trips/create" 
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-xs hover:from-amber-600 hover:to-rose-600"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Create First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trips.slice(0, 3).map((trip) => (
              <Link 
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="group bg-white p-5 rounded-3xl border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate">{trip.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      trip.status === 'upcoming' ? 'bg-amber-100 text-amber-800' :
                      trip.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    {trip.itinerary_sections?.length || 0} Destination Stops
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Open Itinerary</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
