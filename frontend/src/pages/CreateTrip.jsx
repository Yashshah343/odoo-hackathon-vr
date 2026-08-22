import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import useStore from '../store';
import { 
  PlaneTakeoff, 
  Sparkles, 
  Globe, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Check,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import PlaceSearchBar from '../components/PlaceSearchBar';

const COVER_PRESETS = [
  { id: 'ahmedabad', title: 'Atal Bridge & Heritage', url: 'https://images.unsplash.com/photo-1662974950392-f0bc88e1e7fa?w=800&auto=format&fit=crop&q=80' },
  { id: 'mumbai', title: 'Marine Drive & Sea Link', url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80' },
  { id: 'jaipur', title: 'Royal Palaces', url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80' },
  { id: 'tropical', title: 'Goa Coastline', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80' }
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const initialName = searchParams.get('name') || (searchParams.get('destination') ? `Trip to ${searchParams.get('destination')}` : '');

  const [formData, setFormData] = useState({
    name: initialName,
    description: '',
    budget_allocated: '', // Ask user explicitly for budget in ₹
    start_date: '',
    end_date: '',
    cover_image: COVER_PRESETS[0].url,
    status: 'upcoming',
    is_public: false
  });

  useEffect(() => {
    if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [initialName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a trip name or choose a destination.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const budgetNum = parseFloat(formData.budget_allocated) || 0;

      const response = await apiClient.post('/trips', {
        name: formData.name,
        description: formData.description,
        cover_image: formData.cover_image,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
        is_public: formData.is_public
      });
      const newTripId = response.data._id;
      
      // If user entered a budget, initialize first section with that budget
      if (budgetNum > 0) {
        await apiClient.put(`/trips/${newTripId}`, {
          itinerary_sections: [{
            section_id: `sec_initial_${Date.now()}`,
            destination: formData.name.replace(/^trip to /i, '') || 'Destination City',
            type: 'destination',
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            budget_allocated: budgetNum,
            flight: null,
            hotel: null,
            activities: [],
            expenses: []
          }]
        });
      }

      // Navigate straight to the itinerary builder
      navigate(`/trips/${newTripId}/builder`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create trip. Please try again.');
      setLoading(false);
    }
  };

  const handleSuggest = () => {
    const isIndia = (user?.country || '').toLowerCase().includes('india') || true;
    const suggestions = isIndia ? [
      "Ahmedabad Heritage & Riverfront Tour",
      "Royal Udaipur & Jaipur Palaces",
      "Goa Beach & Coastal Sunset",
      "Mumbai Marine Drive & Bollywood Trail",
      "Kerala Backwaters & Tea Gardens",
      "Varanasi Ghats & Cultural Discovery"
    ] : [
      "Summer in Paris & Swiss Alps",
      "Tokyo Culinary & Tech Expedition",
      "Rome Classical Antiquity Tour"
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setFormData({ ...formData, name: random });
  };

  const handlePlaceSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      name: `Trip to ${place.title}`
    }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-100">
        
        {/* Header - Warm Sunset & Amber */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-amber-100 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" /> New Journey Planner
            </span>
            <h1 className="text-3xl md:text-4xl font-black flex items-center tracking-tight">
              <PlaneTakeoff className="mr-3 h-8 w-8 text-amber-200" />
              Design Your Next Journey
            </h1>
            <p className="text-amber-100 text-xs md:text-sm">
              Search a destination, specify your travel budget in ₹ Rupees, and begin customizing your itinerary.
            </p>
          </div>
          <Globe className="absolute -bottom-12 -right-12 h-64 w-64 text-white opacity-10" />
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-semibold">
                {error}
              </div>
            )}
            
            {/* Quick Destination Search */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-amber-600" />
                Quick Search Destination
              </label>
              <PlaceSearchBar 
                placeholder="Type a city (e.g. Ahmedabad, Mumbai, Jaipur, Paris)..."
                onSelect={handlePlaceSelect}
                showQuickPlan={false}
                inputClassName="bg-white"
              />
            </div>

            {/* Trip Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Trip Name *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Trip to Ahmedabad"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 block w-full border border-gray-300 rounded-xl shadow-xs py-3 px-4 focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-xs text-xs font-bold rounded-xl text-gray-700 bg-white hover:bg-amber-50 transition-colors"
                  title="Generate Suggestion"
                >
                  <Sparkles className="h-4 w-4 text-amber-500 mr-1" />
                  <span>Idea</span>
                </button>
              </div>
            </div>

            {/* Total Budget in Rupees (₹) - Asked explicitly */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <IndianRupee className="h-3.5 w-3.5 mr-1 text-amber-600" /> Total Trip Budget in ₹ (Rupees)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  placeholder="e.g. 25000 (Enter your allocated budget in ₹)"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                  className="pl-8 block w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-gray-900"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">We won't assume a default budget. Your budget will be used to generate the circular breakdown graph.</p>
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-amber-600" /> Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="block w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-xs bg-gray-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-amber-600" /> End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="block w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-xs bg-gray-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Trip Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1 text-gray-500" /> Trip Description & Notes
              </label>
              <textarea
                rows={2}
                placeholder="Add special occasions, packing priorities, or travel objectives..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full border border-gray-300 rounded-xl py-2 px-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Real Photos Theme Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center">
                <ImageIcon className="h-3.5 w-3.5 mr-1 text-rose-600" /> Choose Authentic Cover Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COVER_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setFormData({ ...formData, cover_image: preset.url })}
                    className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition-all ${
                      formData.cover_image === preset.url ? 'border-amber-600 ring-2 ring-amber-400' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {preset.title}
                    </span>
                    {formData.cover_image === preset.url && (
                      <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 disabled:opacity-50 transition-all active:scale-95"
              >
                <span>{loading ? 'Creating...' : 'Start Building Itinerary'}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
