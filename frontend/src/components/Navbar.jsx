import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Layers, 
  ArrowUpDown, 
  Globe2, 
  LogOut, 
  Calendar, 
  Shield, 
  User, 
  Compass 
} from 'lucide-react';
import useStore from '../store';
import PlaceSearchBar from './PlaceSearchBar';

export default function Navbar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterSelect = (status) => {
    setFilterOpen(false);
    navigate(`/trips?status=${status}`);
  };

  const handleSortSelect = (sortBy) => {
    setSortOpen(false);
    navigate(`/trips?sort=${sortBy}`);
  };

  const handleGroupSelect = (groupBy) => {
    setGroupOpen(false);
    navigate(`/trips?group=${groupBy}`);
  };

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Globe2 className="h-8 w-8 text-blue-600" />
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">GlobeTrotter</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link to="/explore" className="text-sm font-semibold text-gray-700 hover:text-blue-600 hidden md:inline-block">
                  Explore Places
                </Link>
                <Link to="/community" className="text-sm font-semibold text-gray-700 hover:text-blue-600 hidden md:inline-block">
                  Community
                </Link>
                <Link to="/trips" className="text-sm font-semibold text-gray-700 hover:text-blue-600">
                  My Trips
                </Link>
                <Link to="/calendar" className="text-sm font-semibold text-gray-700 hover:text-blue-600 hidden sm:inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Calendar
                </Link>
                
                <Link to="/admin" className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1.5 rounded-xl hover:bg-purple-200 inline-flex items-center transition-colors">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Admin Panel
                </Link>

                <Link to="/profile" className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{user.first_name || 'Profile'}</span>
                </Link>

                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="space-x-3">
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Toolbar (Screen 3, 6, 8, 10 in Excalidraw: Search / Group By / Filter / Sort By) */}
      {user && (
        <div className="border-t border-gray-100 bg-gray-50/95 py-2.5 backdrop-blur relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Google-like Place Search Bar */}
            <div className="flex-1 max-w-xl relative z-50">
              <PlaceSearchBar 
                placeholder="Search cities, landmarks, activities, or trips..."
                inputClassName="bg-white shadow-xs"
              />
            </div>
            
            {/* Filter / Sort / Group Toolbars matching Excalidraw */}
            <div className="flex items-center space-x-2 relative flex-wrap">
              {/* Group by Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setGroupOpen(!groupOpen); setFilterOpen(false); setSortOpen(false); }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-xs text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  Group by
                </button>

                {groupOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <button onClick={() => handleGroupSelect('status')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">By Status</button>
                    <button onClick={() => handleGroupSelect('destination')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">By Destination</button>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); setGroupOpen(false); }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-xs text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  Filter
                </button>

                {filterOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <button onClick={() => handleFilterSelect('all')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">All Trips</button>
                    <button onClick={() => handleFilterSelect('upcoming')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Upcoming Only</button>
                    <button onClick={() => handleFilterSelect('ongoing')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Ongoing Only</button>
                    <button onClick={() => handleFilterSelect('completed')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Completed Only</button>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); setGroupOpen(false); }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-xs text-xs font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  Sort by...
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <button onClick={() => handleSortSelect('name')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Alphabetical (A-Z)</button>
                    <button onClick={() => handleSortSelect('status')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">By Status</button>
                    <button onClick={() => handleSortSelect('recent')} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Recently Created</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
