import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Edit3, 
  MapPin, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  Plane, 
  Hotel, 
  Compass, 
  ArrowLeft, 
  Share2, 
  Copy, 
  Clock, 
  AlertTriangle, 
  List, 
  Check, 
  CheckCircle2,
  X
} from 'lucide-react';

const SUNSET_PALETTE = ['#F59E0B', '#F43F5E', '#D97706', '#FB7185', '#10B981', '#6366F1'];

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/trips/${id}`);
        setTrip(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCloneTrip = async () => {
    try {
      const res = await apiClient.post(`/trips/${id}/clone`);
      setCloneSuccess(true);
      setTimeout(() => {
        setCloneSuccess(false);
        navigate(`/trips/${res.data._id}`);
      }, 1500);
    } catch (err) {
      alert("Failed to clone trip");
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-amber-800">Loading trip itinerary...</div>;
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-3xl border border-amber-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'Could not retrieve itinerary details.'}</p>
        <Link to="/trips" className="inline-flex items-center text-amber-600 font-bold hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Trips
        </Link>
      </div>
    );
  }

  const sections = trip.itinerary_sections || [];

  // Financial calculations in ₹ Rupees
  const totalBudget = sections.reduce((acc, s) => acc + (parseFloat(s.budget_allocated) || 0), 0);
  
  let flightTotal = 0;
  let hotelTotal = 0;
  let activityTotal = 0;
  let otherTotal = 0;

  sections.forEach(s => {
    const fCost = s.flight?.enabled || s.flight?.cost ? (parseFloat(s.flight?.cost) || 0) : 0;
    const hCost = s.hotel?.enabled || s.hotel?.cost ? (parseFloat(s.hotel?.cost) || 0) : 0;
    flightTotal += fCost;
    hotelTotal += hCost;

    (s.expenses || []).forEach(e => {
      if (e.category === 'Activities' || e.category === 'Activity') activityTotal += parseFloat(e.amount) || 0;
      else if (e.category !== 'Flight' && e.category !== 'Hotel') otherTotal += parseFloat(e.amount) || 0;
    });
  });

  const totalExpenses = flightTotal + hotelTotal + activityTotal + otherTotal;
  const isOverbudget = totalBudget > 0 && totalExpenses > totalBudget;

  let totalDays = 1;
  if (trip.start_date && trip.end_date) {
    const sDate = new Date(trip.start_date);
    const eDate = new Date(trip.end_date);
    const diff = Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24));
    if (diff > 0) totalDays = diff;
  } else if (sections.length > 0) {
    totalDays = Math.max(sections.length * 2, 1);
  }
  const avgCostPerDay = totalExpenses > 0 ? (totalExpenses / totalDays) : 0;

  // Breakdown chart data in ₹
  const chartData = [
    { name: 'Flights & Transit', value: flightTotal },
    { name: 'Hotels & Stay', value: hotelTotal },
    { name: 'Activities & Sights', value: activityTotal || (sections.reduce((acc, s) => acc + (s.activities?.length || 0) * 250, 0)) },
    { name: 'Dining & Meals', value: otherTotal || 1000 }
  ].filter(item => item.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-3">
          <Link to="/trips" className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-amber-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h1 className="text-3xl font-black text-gray-900">{trip.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                trip.status === 'upcoming' ? 'bg-amber-100 text-amber-900' :
                trip.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                'bg-rose-100 text-rose-900'
              }`}>
                {trip.status}
              </span>
              {trip.is_public && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  Public Itinerary
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 text-amber-600" /> {sections.length} Destination Stop(s)</span>
              {(trip.start_date || trip.end_date) && (
                <span className="flex items-center"><CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-400" /> {trip.start_date} → {trip.end_date} ({totalDays} Days)</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 p-1 rounded-2xl mr-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center transition-all ${
                viewMode === 'list' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="h-3.5 w-3.5 mr-1" /> List View
            </button>
            <button
              onClick={() => navigate(`/trips/${id}/calendar`)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center text-gray-500 hover:text-gray-900 transition-all"
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Calendar
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-amber-50 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> Share
          </button>

          <button
            onClick={handleCloneTrip}
            className="inline-flex items-center px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-rose-50 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5 text-rose-600" /> Copy Trip
          </button>

          <Link 
            to={`/trips/${id}/builder`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl shadow-xs text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Builder
          </Link>
        </div>
      </div>

      {/* Overbudget Alert Banner */}
      {isOverbudget && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600 flex-shrink-0" />
            <span>Overbudget Notice: Estimated expenses (₹{totalExpenses.toLocaleString()}) exceed your allocated budget (₹{totalBudget.toLocaleString()}) by ₹{(totalExpenses - totalBudget).toLocaleString()}.</span>
          </div>
          <Link to={`/trips/${id}/builder`} className="underline ml-4 text-amber-950 font-bold hover:text-amber-800">Adjust in Builder</Link>
        </div>
      )}

      {cloneSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-xs flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
          Trip successfully cloned into your account! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Structured Timeline / Itinerary Stops */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Itinerary Schedule & Stops</h2>
            <span className="text-xs text-gray-400 font-medium">Day-wise Timeline Layout</span>
          </div>

          {sections.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-3">
              <MapPin className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-900">No destination stops in this itinerary yet.</p>
              <Link to={`/trips/${id}/builder`} className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700">
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Open Builder to Add Stops
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {sections.map((section, idx) => (
                <div key={section.section_id || idx} className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-4">
                  {/* City Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        Day {idx * 2 + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{section.destination || 'Destination Stop'}</h3>
                        {(section.start_date || section.end_date) && (
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {section.start_date} {section.end_date ? `→ ${section.end_date}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Allocated Stop Budget</span>
                      <span className="text-base font-black text-gray-900">₹{(section.budget_allocated || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Components (Flight & Hotel inside the stop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    {section.flight && (section.flight.airline || section.flight.cost > 0) && (
                      <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-xl bg-amber-600 text-white">
                            <Plane className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-950">{section.flight.airline || 'Air Travel'}</p>
                            <p className="text-[11px] text-amber-700">{section.flight.flight_number || 'Confirmed Departure'}</p>
                          </div>
                        </div>
                        <span className="font-black text-amber-900">₹{section.flight.cost || 0}</span>
                      </div>
                    )}

                    {section.hotel && (section.hotel.hotel_name || section.hotel.cost > 0) && (
                      <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-xl bg-rose-600 text-white">
                            <Hotel className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-rose-950">{section.hotel.hotel_name || 'Accommodations'}</p>
                            <p className="text-[11px] text-rose-700">{section.hotel.nights || 1} Night(s) Stay</p>
                          </div>
                        </div>
                        <span className="font-black text-rose-900">₹{section.hotel.cost || 0}</span>
                      </div>
                    )}
                  </div>

                  {/* Activity Blocks */}
                  {section.activities && section.activities.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <Compass className="h-3.5 w-3.5 mr-1 text-amber-600" /> Planned Activities & Sights
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.activities.map((act, aIdx) => (
                          <div key={aIdx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-950 flex items-center truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 flex-shrink-0"></span>
                              {act}
                            </span>
                            <span className="text-[11px] font-bold text-amber-800 ml-2">Planned</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Financial & Cost Breakdown in ₹ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-xs rounded-3xl border border-amber-200 p-6 sticky top-24 space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center">
                <IndianRupee className="h-5 w-5 mr-1.5 text-amber-600" />
                Budget & Cost Breakdown
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Automated financial estimation in ₹</p>
            </div>
            
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Allocated Trip Budget:</span>
                <span className="font-bold text-gray-900">₹{totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Estimated Total Cost:</span>
                <span className="font-bold text-amber-600">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Average Cost / Day:</span>
                <span className="font-bold text-rose-600">₹{Math.round(avgCostPerDay).toLocaleString()} / day</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-black">
                <span className="text-gray-900">Remaining Balance:</span>
                <span className={totalBudget - totalExpenses >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  ₹{(totalBudget - totalExpenses).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recharts Pie Chart in Sunset Amber */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SUNSET_PALETTE[index % SUNSET_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Sharing Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-amber-600" /> Share Itinerary
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Share your customized trip plan with friends, family, or the travel community.
            </p>

            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="bg-transparent text-xs text-gray-600 flex-1 outline-none px-2 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors flex items-center"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
