import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  MapPin, 
  Plane, 
  Activity, 
  Shield, 
  Search, 
  Eye, 
  DollarSign, 
  Calendar, 
  X,
  Compass,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 4 Tabs matching mockup (Screen 12 in Excalidraw)
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'cities', 'activities', 'trends'
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Trips Inspector modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingUserTrips, setLoadingUserTrips] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/admin/analytics');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError("Failed to load admin analytics. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: nextRole });
      fetchAnalytics();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleInspectUserTrips = async (user) => {
    setSelectedUser(user);
    setLoadingUserTrips(true);
    try {
      const res = await apiClient.get(`/admin/users/${user.id}/trips`);
      setUserTrips(res.data.trips || []);
    } catch (err) {
      console.error("Failed to load user trips", err);
    } finally {
      setLoadingUserTrips(false);
    }
  };

  if (loading) return <div className="p-16 text-center text-gray-500">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-16 text-center text-red-500">{error}</div>;

  const usersList = (stats?.users || []).filter(u => 
    !searchQuery || 
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 mb-2">
            <Shield className="h-3.5 w-3.5 mr-1" /> Admin Panel Screen (Mockup Screen 12)
          </span>
          <h1 className="text-3xl font-black text-gray-900">Admin & Analytics Control Center</h1>
          <p className="text-gray-500 text-xs mt-1">Track platform adoption, inspect user-created trips, and analyze travel trends.</p>
        </div>

        {/* Global Stats Overview */}
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-xs text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Users</span>
            <p className="text-xl font-black text-blue-600">{stats?.total_users || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-xs text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Trips</span>
            <p className="text-xl font-black text-indigo-600">{stats?.total_trips || 0}</p>
          </div>
        </div>
      </div>

      {/* 4 Mockup Tabs Navigation (Screen 12) */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gray-100 p-1.5 rounded-2xl">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'users' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 mr-1.5" /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'cities' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="h-4 w-4 mr-1.5" /> Popular Cities
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'activities' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="h-4 w-4 mr-1.5" /> Popular Activities
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center transition-all ${
              activeTab === 'trends' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-1.5" /> User Trends & Analytics
          </button>
        </div>

        {/* Quick Filter/Search inside admin */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* 🌟 CIRCULAR GRAPH: Total Money Divided in Various Areas */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Platform Financial Flow</span>
          <h2 className="text-xl font-black text-gray-900">Total Money Divided in Various Areas</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Macro breakdown of all travel spending across the platform into Flights, Accommodations, Activities, and Dining.
          </p>
        </div>
        <div className="md:col-span-7 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats?.budget_distribution || [
                  { name: 'Flights', value: 35 },
                  { name: 'Hotels', value: 40 },
                  { name: 'Activities', value: 15 },
                  { name: 'Dining', value: 10 }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {(stats?.budget_distribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}% of total spending`} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TAB 1: Manage Users Section with Trips Inspector (Mockup Screen 12) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900">Registered Users Management ({usersList.length})</h2>
            <p className="text-xs text-gray-500">Click "Inspect Trips" on any user to view all trips created by that user.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Created Trips</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{u.first_name} {u.last_name || '(No name)'}</div>
                      <div className="text-gray-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {u.city ? `${u.city}, ${u.country || ''}` : 'Location not set'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-600">{u.trips_count} Trip(s)</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleInspectUserTrips(u)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Inspect Trips
                      </button>
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Popular Cities Section */}
      {activeTab === 'cities' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Popular Destination Cities</h2>
            <p className="text-xs text-gray-500">Top visited cities and regions based on user itinerary trends.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.popular_cities || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Popular Activities Section */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Popular Planned Activities</h2>
            <p className="text-xs text-gray-500">Most scheduled excursions, museum tours, and sights across all trips.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.popular_activities || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="activity" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: User Trends and Analytics */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">User Growth & Itinerary Creation Trends</h2>
            <p className="text-xs text-gray-500">Monthly trajectories for user registration and itinerary planning.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.user_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={3} name="Total Trips Created" />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} name="Registered Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* USER TRIPS INSPECTOR MODAL (Requested in User Mockup Screenshot) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Trips Created by {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <p className="text-xs text-gray-500">{selectedUser.email} · {userTrips.length} Itinerary(s) found</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingUserTrips ? (
                <div className="p-10 text-center text-xs text-gray-500">Loading user itineraries...</div>
              ) : userTrips.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500">
                  This user has not created any trips yet.
                </div>
              ) : (
                userTrips.map(trip => (
                  <div key={trip._id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-900 text-sm">{trip.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {trip.itinerary_sections?.length || 0} Destination Stops
                        {(trip.start_date || trip.end_date) && (
                          <span className="ml-2 flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {trip.start_date} → {trip.end_date}
                          </span>
                        )}
                      </p>
                    </div>

                    <Link
                      to={`/trips/${trip._id}`}
                      target="_blank"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      <span>View Itinerary</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
