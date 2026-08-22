import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { PlaneTakeoff, Sparkles, Globe } from 'lucide-react';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'upcoming',
    is_public: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/trips', formData);
      const newTripId = response.data._id;
      // Navigate straight to the itinerary builder for the new trip
      navigate(`/trips/${newTripId}/builder`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create trip. Please try again.');
      setLoading(false);
    }
  };

  const handleSuggest = () => {
    // A playful AI suggestion feature
    const suggestions = ["Summer in Amalfi", "Tokyo Tech Tour", "Backpacking the Andes", "Weekend in Rome"];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setFormData({ ...formData, name: random });
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Header */}
        <div className="bg-blue-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold flex items-center">
              <PlaneTakeoff className="mr-3 h-8 w-8" />
              Design Your Next Journey
            </h1>
            <p className="mt-2 text-blue-100 text-lg">
              Give your adventure a name and decide if you want to share it with the world.
            </p>
          </div>
          <Globe className="absolute -bottom-12 -right-12 h-64 w-64 text-blue-500 opacity-30" />
        </div>

        {/* Form */}
        <div className="px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer in Paris"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                  title="Generate AI Suggestion"
                >
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </button>
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_public ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_public ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-4">
                  <span className="block text-sm font-semibold text-gray-900">Make this trip public</span>
                  <span className="block text-sm text-gray-500">Allow other travelers in the community to view your itinerary.</span>
                </div>
              </label>
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Start Building Itinerary'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
