import React, { useState } from 'react';
import { Search, Map, Tent, Compass, Star } from 'lucide-react';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data representing Global Collections 
  const mockActivities = [
    { id: 1, name: "Scuba Diving in Great Barrier Reef", category: "Adventure", popularity: 9.8, cost: "$$$", location: "Australia" },
    { id: 2, name: "Colosseum Guided Tour", category: "History", popularity: 9.5, cost: "$$", location: "Rome, Italy" },
    { id: 3, name: "Mount Fuji Hike", category: "Nature", popularity: 9.2, cost: "$", location: "Japan" },
    { id: 4, name: "Louvre Museum Access", category: "Culture", popularity: 9.7, cost: "$$", location: "Paris, France" },
  ];

  const filtered = mockActivities.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Destinations & Activities</h1>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city or activity name..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="h-40 bg-gray-100 flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 relative">
              <Compass className="h-10 w-10 text-white opacity-50 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{item.category}</span>
                <span className="flex items-center text-sm font-medium text-gray-900">
                  <Star className="h-4 w-4 text-amber-400 mr-1 fill-current" /> {item.popularity}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center">
                <Map className="h-4 w-4 mr-1 text-gray-400" /> {item.location}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-green-600">{item.cost}</span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Tent className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            No destinations or activities found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
