import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Tent, 
  Compass, 
  Star, 
  Plus, 
  Globe, 
  Clock, 
  Bookmark, 
  Check, 
  DollarSign, 
  Building2, 
  Sparkles 
} from 'lucide-react';
import PlaceSearchBar from '../components/PlaceSearchBar';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('destination') || searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' or 'activities'
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    const dest = searchParams.get('destination') || searchParams.get('search') || '';
    if (dest) {
      setSearchQuery(dest);
    }
  }, [searchParams]);

  // Global Cities Catalog (Feature 7 in PDF)
  const cities = [
    { id: 'c1', name: "Paris", country: "France", region: "Europe", costIndex: "$$$", popularity: 9.9, description: "The City of Light, world-renowned for art, gastronomy, fashion, and culture.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80" },
    { id: 'c2', name: "Tokyo", country: "Japan", region: "Asia", costIndex: "$$$", popularity: 9.9, description: "Ultramodern neon skyscrapers juxtaposed with historic temples and unbeatable cuisine.", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80" },
    { id: 'c3', name: "Rome", country: "Italy", region: "Europe", costIndex: "$$", popularity: 9.8, description: "Cradle of the Roman Empire, steeped in three millennia of globally influential art.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80" },
    { id: 'c4', name: "Bali", country: "Indonesia", region: "Asia", costIndex: "$", popularity: 9.7, description: "Tropical Indonesian paradise famous for forested volcanic mountains, rice paddies, and coral reefs.", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80" },
    { id: 'c5', name: "New York", country: "United States", region: "Americas", costIndex: "$$$", popularity: 9.8, description: "Dynamic global hub for theater, art, dining, and endless skyline panoramas.", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80" },
    { id: 'c6', name: "Interlaken", country: "Switzerland", region: "Europe", costIndex: "$$$", popularity: 9.7, description: "Traditional alpine resort town nestled between two turquoise lakes and mountain peaks.", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop&q=80" },
    { id: 'c7', name: "Dubai", country: "United Arab Emirates", region: "Middle East", costIndex: "$$$", popularity: 9.6, description: "Futuristic architecture, luxury shopping, desert safaris, and lively nightlife.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80" },
    { id: 'c8', name: "Cairns", country: "Australia", region: "Oceania", costIndex: "$$", popularity: 9.6, description: "Gateway to the Great Barrier Reef and Daintree Rainforest.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80" }
  ];

  // Activities Catalog (Feature 8 in PDF)
  const activities = [
    { id: 'a1', name: "Eiffel Tower & Seine River Cruise", city: "Paris, France", category: "Culture", duration: "4 Hours", cost: "$$", popularity: 9.9, description: "Ascend the iconic Eiffel tower and glide along the Seine at sunset.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80" },
    { id: 'a2', name: "Colosseum & Roman Forum VIP Tour", city: "Rome, Italy", category: "History", duration: "3 Hours", cost: "$$", popularity: 9.8, description: "Step into ancient gladiator history with skip-the-line access.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80" },
    { id: 'a3', name: "Shibuya Sky & Harajuku Food Walk", city: "Tokyo, Japan", category: "Adventure", duration: "5 Hours", cost: "$$", popularity: 9.9, description: "Observation deck 360-degree panorama followed by street food tastings.", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80" },
    { id: 'a4', name: "Jungfraujoch Top of Europe Train", city: "Interlaken, Switzerland", category: "Nature", duration: "Full Day", cost: "$$$", popularity: 9.8, description: "Ascend Europe's highest railway station surrounded by glaciers.", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop&q=80" },
    { id: 'a5', name: "Scuba Diving in Great Barrier Reef", city: "Cairns, Australia", category: "Adventure", duration: "6 Hours", cost: "$$$", popularity: 9.9, description: "Dive into world's largest coral reef system with certified marine guides.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80" },
    { id: 'a6', name: "Ubud Rice Terraces & Yoga Retreat", city: "Bali, Indonesia", category: "Wellness", duration: "Full Day", cost: "$", popularity: 9.7, description: "Sunrise mindfulness meditation, waterfall bathing, and jungle swings.", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80" },
    { id: 'a7', name: "Burj Khalifa & Desert Dune Bashing", city: "Dubai, UAE", category: "Adventure", duration: "6 Hours", cost: "$$$", popularity: 9.6, description: "Ascend level 148 followed by 4x4 desert safari and bedouin dinner.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80" },
    { id: 'a8', name: "Central Park Walk & Broadway Show", city: "New York, USA", category: "Culture", duration: "5 Hours", cost: "$$$", popularity: 9.8, description: "Guided park tour followed by premier orchestra Broadway theater seats.", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80" }
  ];

  const regions = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Oceania'];
  const categories = ['All', 'Culture', 'History', 'Adventure', 'Nature', 'Wellness'];

  const toggleBookmark = (id) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePlanTripForCity = (city) => {
    navigate(`/trips/create?name=${encodeURIComponent(`Trip to ${city.name}`)}&destination=${encodeURIComponent(city.name + ', ' + city.country)}`);
  };

  const filteredCities = cities.filter(c => {
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const filteredActivities = activities.filter(a => {
    const matchesSearch = !searchQuery || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur-sm">
            <Globe className="h-3.5 w-3.5 mr-1.5" /> Destination Discovery Engine
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Explore Cities & Activities
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Search globally for destination cities, cost indexes, cultural sights, and adventure activities with instant Google-like suggestions.
          </p>

          <div className="pt-2 max-w-xl">
            <PlaceSearchBar 
              placeholder="Search any world city or attraction..."
              inputClassName="py-3 text-sm text-gray-900 shadow-md"
              onSelect={(item) => setSearchQuery(item.title)}
            />
          </div>
        </div>
        <Compass className="absolute -bottom-16 -right-16 h-80 w-80 text-white/10" />
      </div>

      {/* City Search vs Activity Search Mode Tabs (Features 7 & 8 in PDF) */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl space-x-1">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'cities' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="h-4 w-4 mr-1.5" /> 7. City Search
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'activities' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="h-4 w-4 mr-1.5" /> 8. Activity Search
          </button>
        </div>

        {/* Region or Category Filters */}
        {activeTab === 'cities' ? (
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedRegion === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === c ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Display */}
      {activeTab === 'cities' ? (
        /* Feature 7: City Search Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCities.map(city => (
            <div key={city.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center shadow-xs">
                    <Star className="h-3.5 w-3.5 text-amber-400 mr-1 fill-amber-400" /> {city.popularity}
                  </span>
                  <span className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {city.region}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      {city.name}
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg">
                      Cost: {city.costIndex}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{city.country}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{city.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between mt-3">
                <button
                  onClick={() => toggleBookmark(city.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    bookmarked[city.id] ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Bookmark city"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked[city.id] ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => handlePlanTripForCity(city)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add to Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Feature 8: Activity Search Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredActivities.map(act => (
            <div key={act.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img src={act.image} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center shadow-xs">
                    <Star className="h-3.5 w-3.5 text-amber-400 mr-1 fill-amber-400" /> {act.popularity}
                  </span>
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {act.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {act.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-red-500" /> {act.city}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{act.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                <span className="flex items-center text-gray-500 font-semibold">
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" /> {act.duration}
                </span>
                <button
                  onClick={() => navigate(`/trips/create?name=${encodeURIComponent(`Activity: ${act.name}`)}`)}
                  className="inline-flex items-center px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add to Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
