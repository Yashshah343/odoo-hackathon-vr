import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, List, ArrowUpDown, Globe2, LogOut } from 'lucide-react';
import useStore from '../store';

export default function Navbar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Globe2 className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl tracking-tight text-gray-900">GlobeTrotter</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  {user.first_name}
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Toolbar (Search/Filter/Group/Sort) */}
      {user && (
        <div className="border-t border-gray-100 bg-gray-50 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cities, activities, or trips..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                Filter
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <List className="h-4 w-4 mr-2 text-gray-500" />
                Group By
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                Sort By
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
