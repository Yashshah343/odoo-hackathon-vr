import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import useStore from '../store';
import { Globe2, User, Mail, Lock, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);
  
  // Clear any past session when opening registration page
  useEffect(() => {
    logout();
  }, [logout]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: 'India', // Default to user country
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', formData);
      // Automatically navigate to login page upon success
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Please check your input fields. Password must be at least 6 characters.');
      } else {
        setError(err.response?.data?.detail || 'Failed to register.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-amber-100">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 mb-3 shadow-inner">
            <Globe2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Create Your GlobeTrotter Account</h2>
          <p className="mt-2 text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">First Name *</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  placeholder="e.g. Yash"
                  onChange={handleChange}
                  className="pl-9 block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name *</label>
              <input 
                type="text" 
                name="last_name" 
                required 
                placeholder="e.g. Shah"
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address *</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="name@example.com"
                  onChange={handleChange}
                  className="pl-9 block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="+91 98765 43210"
                  onChange={handleChange}
                  className="pl-9 block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Password * (Min 6 chars)</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  minLength={6} 
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="pl-9 block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="e.g. Ahmedabad"
                  onChange={handleChange}
                  className="pl-9 block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Country</label>
              <input 
                type="text" 
                name="country" 
                value={formData.country}
                placeholder="e.g. India"
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/50" 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 focus:outline-none shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
