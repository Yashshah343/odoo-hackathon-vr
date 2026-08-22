import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  GripVertical, 
  Plus, 
  Plane, 
  Hotel, 
  MapPin, 
  Save, 
  Trash2, 
  Calendar, 
  IndianRupee, 
  Compass, 
  CheckCircle2, 
  Tag, 
  X,
  ArrowLeft,
  Sparkles,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import PlaceSearchBar from '../components/PlaceSearchBar';

// Warm Sunset & Amber Color Palette for Circular Graph
const SUNSET_PALETTE = ['#F59E0B', '#F43F5E', '#D97706', '#FB7185', '#10B981', '#6366F1'];

// Helper Component for a Unified Destination Stop (combines Flight + Hotel + Activities + Expenses in one object)
function SortableSection({ id, index, section, onUpdate, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [newActivity, setNewActivity] = useState('');
  const [showFlight, setShowFlight] = useState(Boolean(section.flight?.enabled || section.flight?.cost || section.flight?.airline));
  const [showHotel, setShowHotel] = useState(Boolean(section.hotel?.enabled || section.hotel?.cost || section.hotel?.hotel_name));

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;
    const current = section.activities || [];
    onUpdate(id, 'activities', [...current, newActivity.trim()]);
    setNewActivity('');
  };

  const handleRemoveActivity = (actIdx) => {
    const current = section.activities || [];
    onUpdate(id, 'activities', current.filter((_, i) => i !== actIdx));
  };

  const updateFlight = (field, value) => {
    const flightObj = {
      airline: '',
      flight_number: '',
      departure: '',
      cost: 0,
      enabled: showFlight,
      ...(section.flight || {}),
      [field]: value
    };
    onUpdate(id, 'flight', flightObj);
  };

  const updateHotel = (field, value) => {
    const hotelObj = {
      hotel_name: '',
      room_type: '',
      nights: 1,
      cost: 0,
      enabled: showHotel,
      ...(section.hotel || {}),
      [field]: value
    };
    onUpdate(id, 'hotel', hotelObj);
  };

  const toggleFlight = () => {
    const nextState = !showFlight;
    setShowFlight(nextState);
    updateFlight('enabled', nextState);
  };

  const toggleHotel = () => {
    const nextState = !showHotel;
    setShowHotel(nextState);
    updateHotel('enabled', nextState);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white border border-amber-200/80 rounded-3xl shadow-xs hover:shadow-md transition-shadow mb-6 flex overflow-visible relative group"
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="bg-amber-50/50 w-12 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-r border-amber-100 rounded-l-3xl text-gray-400 hover:text-amber-600 hover:bg-amber-100/50 transition-colors"
        title="Drag to reorder destination stops"
      >
        <span className="text-[11px] font-black text-amber-700 mb-2">Day {index * 2 + 1}</span>
        <GripVertical className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header: Destination & Remove */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-800">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Stop {index + 1}: {section.destination || "Unnamed Destination"}
              </h3>
              <p className="text-xs text-gray-400">Flight, hotel, activities & expenses are stored together in this stop.</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => onRemove(id)} 
            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
            title="Remove Destination Stop"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Basic Stop Details (Destination Autocomplete + Dates + Budget) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative z-20">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 text-amber-600" /> Destination City / Place
            </label>
            <PlaceSearchBar 
              placeholder="Search destination (e.g. Ahmedabad, Mumbai, Paris)..."
              onSelect={(place) => onUpdate(id, 'destination', place.title + (place.subtitle ? `, ${place.subtitle}` : ''))}
              showQuickPlan={false}
              inputClassName="bg-gray-50/50"
            />
            {section.destination && (
              <p className="text-xs text-amber-800 font-bold mt-1 truncate">
                Selected: <span className="underline">{section.destination}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-amber-600" /> Start Date
            </label>
            <input
              type="date"
              value={section.start_date || ''}
              onChange={(e) => onUpdate(id, 'start_date', e.target.value)}
              className="block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-gray-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-amber-600" /> End Date
            </label>
            <input
              type="date"
              value={section.end_date || ''}
              onChange={(e) => onUpdate(id, 'end_date', e.target.value)}
              className="block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-gray-50/50"
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
              <IndianRupee className="h-3.5 w-3.5 mr-1 text-amber-600" /> Allocated Stop Budget (₹ INR)
            </label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={section.budget_allocated || ''}
              onChange={(e) => onUpdate(id, 'budget_allocated', parseFloat(e.target.value) || 0)}
              className="block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs font-bold text-gray-900 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Section Toggles: Flight & Hotel Checkboxes */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFlight}
                onChange={toggleFlight}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <span className="text-xs font-bold text-gray-700 flex items-center">
                <Plane className="h-3.5 w-3.5 mr-1 text-amber-600" /> Include Flight & Transit
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHotel}
                onChange={toggleHotel}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="text-xs font-bold text-gray-700 flex items-center">
                <Hotel className="h-3.5 w-3.5 mr-1 text-rose-600" /> Include Hotel & Stay
              </span>
            </label>
          </div>

          {/* ✈️ Flight Details Sub-Form */}
          {showFlight && (
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between text-amber-900 font-bold text-xs uppercase tracking-wider">
                <span className="flex items-center">
                  <Plane className="h-4 w-4 mr-1 text-amber-600" /> Flight & Airfare Details
                </span>
                <span className="text-amber-700 font-bold">₹{section.flight?.cost || 0}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Airline</label>
                  <input
                    type="text"
                    placeholder="e.g. IndiGo, Air India"
                    value={section.flight?.airline || ''}
                    onChange={(e) => updateFlight('airline', e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Flight Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 6E-204"
                    value={section.flight?.flight_number || ''}
                    onChange={(e) => updateFlight('flight_number', e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Departure</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:30 AM"
                    value={section.flight?.departure || ''}
                    onChange={(e) => updateFlight('departure', e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Cost in ₹</label>
                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={section.flight?.cost || ''}
                    onChange={(e) => updateFlight('cost', parseFloat(e.target.value) || 0)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🏨 Hotel Details Sub-Form */}
          {showHotel && (
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3">
              <div className="flex items-center justify-between text-rose-900 font-bold text-xs uppercase tracking-wider">
                <span className="flex items-center">
                  <Hotel className="h-4 w-4 mr-1 text-rose-600" /> Accommodation Details
                </span>
                <span className="text-rose-700 font-bold">₹{section.hotel?.cost || 0}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase mb-1">Hotel / Resort Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ITC Narmada / Hyatt"
                    value={section.hotel?.hotel_name || ''}
                    onChange={(e) => updateHotel('hotel_name', e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase mb-1">Room Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Suite"
                    value={section.hotel?.room_type || ''}
                    onChange={(e) => updateHotel('room_type', e.target.value)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="2"
                    value={section.hotel?.nights || 1}
                    onChange={(e) => updateHotel('nights', parseInt(e.target.value) || 1)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase mb-1">Total Stay Cost in ₹</label>
                  <input
                    type="number"
                    placeholder="e.g. 8000"
                    value={section.hotel?.cost || ''}
                    onChange={(e) => updateHotel('cost', parseFloat(e.target.value) || 0)}
                    className="block w-full border border-gray-300 rounded-xl py-1.5 px-2.5 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🎯 Activities & Experiences Tag List */}
          <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between text-amber-900 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center">
                <Compass className="h-4 w-4 mr-1.5 text-amber-600" /> Day {index * 2 + 1} Planned Sights & Activities
              </span>
              <span className="text-[11px] text-amber-800 font-bold">{(section.activities || []).length} added</span>
            </div>

            {/* Activities Tag Cloud */}
            <div className="flex flex-wrap gap-2">
              {(section.activities || []).map((act, actIdx) => (
                <span 
                  key={actIdx}
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-amber-300 text-amber-950 rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Tag className="h-3 w-3 mr-1 text-amber-600" />
                  {act}
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(actIdx)}
                    className="ml-2 text-gray-400 hover:text-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              
              {(!section.activities || section.activities.length === 0) && (
                <p className="text-xs text-gray-400 italic">No activities added yet for this stop. Click "+ Day {index * 2 + 1}" on any attraction above or type below.</p>
              )}
            </div>

            {/* Add Custom Activity Form */}
            <form onSubmit={handleAddActivity} className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="Type custom sight or activity..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl py-2 px-3 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors flex items-center shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tripName, setTripName] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [totalUserBudget, setTotalUserBudget] = useState(''); // Explicit user budget in ₹
  const [sections, setSections] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [addedFeedback, setAddedFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/trips/${id}`);
        setTripName(response.data.name || 'Your Trip');
        
        let destinationQuery = '';
        if (response.data.name && response.data.name.toLowerCase().includes('trip to ')) {
          destinationQuery = response.data.name.replace(/trip to /i, '').trim();
        } else {
          destinationQuery = response.data.name || 'Ahmedabad';
        }
        setTripDestination(destinationQuery);

        if (response.data.itinerary_sections && response.data.itinerary_sections.length > 0) {
          const loadedSections = response.data.itinerary_sections.map((sec, idx) => ({
            ...sec,
            id: sec.section_id || sec.id || `stop-${idx}-${Date.now()}`
          }));
          setSections(loadedSections);

          // Check if any allocated budget exists
          const existingBudget = loadedSections.reduce((acc, s) => acc + (parseFloat(s.budget_allocated) || 0), 0);
          if (existingBudget > 0) {
            setTotalUserBudget(existingBudget.toString());
          }
        } else {
          setSections([{
            id: `stop-1-${Date.now()}`,
            destination: destinationQuery || 'Ahmedabad',
            start_date: '',
            end_date: '',
            budget_allocated: 0,
            type: 'destination',
            flight: { airline: '', flight_number: '', departure: '', cost: 0, enabled: false },
            hotel: { hotel_name: '', room_type: '', nights: 1, cost: 0, enabled: false },
            activities: [],
            expenses: []
          }]);
        }

        // Fetch real attractions for destination
        fetchAttractions(destinationQuery);
      } catch (err) {
        console.error("Failed to fetch trip", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const fetchAttractions = async (cityName) => {
    try {
      const res = await apiClient.get(`/places/attractions?destination=${encodeURIComponent(cityName || 'ahmedabad')}`);
      setAttractions(res.data.attractions || []);
    } catch (err) {
      console.error("Failed to load attractions", err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (id, field, value) => {
    setSections(prevSections => prevSections.map(sec => 
      sec.id === id ? { ...sec, [field]: value } : sec
    ));
    if (field === 'destination' && value) {
      fetchAttractions(value.split(',')[0]);
    }
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(sec => sec.id !== id));
  };

  const addDestinationStop = () => {
    const newStop = {
      id: `stop-${Date.now()}`,
      destination: tripDestination || 'Next Destination',
      start_date: '',
      end_date: '',
      budget_allocated: 0,
      type: 'destination',
      flight: { airline: '', flight_number: '', departure: '', cost: 0, enabled: false },
      hotel: { hotel_name: '', room_type: '', nights: 1, cost: 0, enabled: false },
      activities: [],
      expenses: []
    };
    setSections(prev => [...prev, newStop]);
  };

  // ✅ GUARANTEED WORKING ADD ATTRACTION TO DAY 1, DAY 2, DAY 3
  const handleAddAttractionToDay = (attractionName, targetDayIndex = 0) => {
    setSections(prevSections => {
      const updated = [...prevSections];
      
      // If target day section doesn't exist, create it automatically!
      while (updated.length <= targetDayIndex) {
        const newDayNum = updated.length + 1;
        updated.push({
          id: `stop-${Date.now()}-${newDayNum}`,
          destination: tripDestination || `Day ${newDayNum} Exploration`,
          start_date: '',
          end_date: '',
          budget_allocated: 0,
          type: 'destination',
          flight: { airline: '', flight_number: '', departure: '', cost: 0, enabled: false },
          hotel: { hotel_name: '', room_type: '', nights: 1, cost: 0, enabled: false },
          activities: [],
          expenses: []
        });
      }

      const targetSec = { ...updated[targetDayIndex] };
      const currentActs = targetSec.activities ? [...targetSec.activities] : [];

      if (!currentActs.includes(attractionName)) {
        targetSec.activities = [...currentActs, attractionName];
        updated[targetDayIndex] = targetSec;
      }

      return updated;
    });

    setAddedFeedback(`Added "${attractionName}" to Day ${targetDayIndex * 2 + 1}!`);
    setTimeout(() => setAddedFeedback(''), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const budgetEntered = parseFloat(totalUserBudget) || 0;

      const formattedSections = sections.map((sec, idx) => {
        const flightCost = sec.flight?.enabled || sec.flight?.cost ? (parseFloat(sec.flight?.cost) || 0) : 0;
        const hotelCost = sec.hotel?.enabled || sec.hotel?.cost ? (parseFloat(sec.hotel?.cost) || 0) : 0;

        const expenses = [];
        if (flightCost > 0) {
          expenses.push({ category: 'Flight', amount: flightCost, currency: 'INR' });
        }
        if (hotelCost > 0) {
          expenses.push({ category: 'Hotel', amount: hotelCost, currency: 'INR' });
        }

        return {
          section_id: sec.id || `sec_${Date.now()}_${idx}`,
          destination: sec.destination || 'Destination Stop',
          type: 'destination',
          start_date: sec.start_date || null,
          end_date: sec.end_date || null,
          budget_allocated: parseFloat(sec.budget_allocated) || (idx === 0 ? budgetEntered : 0),
          flight: sec.flight || null,
          hotel: sec.hotel || null,
          activities: sec.activities || [],
          expenses: expenses
        };
      });

      await apiClient.put(`/trips/${id}`, {
        itinerary_sections: formattedSections
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/trips');
      }, 1200);
    } catch (err) {
      console.error(err);
      alert(`Failed to save itinerary: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-amber-800">Loading trip details...</div>;
  }

  // Financial calculations in INR (₹)
  const userEnteredBudget = parseFloat(totalUserBudget) || sections.reduce((acc, s) => acc + (parseFloat(s.budget_allocated) || 0), 0);
  
  let flightCostTotal = 0;
  let hotelCostTotal = 0;
  let activitiesCount = 0;

  sections.forEach(s => {
    flightCostTotal += (s.flight?.enabled || s.flight?.cost) ? (parseFloat(s.flight?.cost) || 0) : 0;
    hotelCostTotal += (s.hotel?.enabled || s.hotel?.cost) ? (parseFloat(s.hotel?.cost) || 0) : 0;
    activitiesCount += (s.activities || []).length;
  });

  const estimatedActivityCost = activitiesCount * 250; // INR per activity
  const estimatedDiningCost = sections.length * 1000;  // INR per day dining
  const totalExpenses = flightCostTotal + hotelCostTotal + estimatedActivityCost + estimatedDiningCost;
  const remainingBudget = Math.max(userEnteredBudget - totalExpenses, 0);

  // Circular Graph data breakdown
  const circularGraphData = [
    { name: 'Flights / Transit', value: flightCostTotal },
    { name: 'Hotels / Stay', value: hotelCostTotal },
    { name: 'Activities & Sights', value: estimatedActivityCost },
    { name: 'Food & Dining', value: estimatedDiningCost },
    { name: 'Remaining Balance', value: remainingBudget }
  ].filter(i => i.value > 0);

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/trips/${id}`} className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-amber-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">{tripName}</h1>
            <p className="text-gray-500 text-xs mt-0.5">Warm Sunset & Amber Theme · {sections.length} Destination Stop(s)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Saved to MongoDB! Redirecting to My Trips...
            </span>
          )}
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-xs font-bold rounded-xl shadow-xs text-white bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save & Go to My Trips'}
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Notification */}
      {addedFeedback && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center shadow-md animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 mr-2 text-amber-600" />
          {addedFeedback}
        </div>
      )}

      {/* 🌟 USER BUDGET INPUT & CIRCULAR GRAPH (No Assumed Budget) */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center">
              <IndianRupee className="h-3.5 w-3.5 mr-1" /> Budget & Cost Distribution
            </span>
            <h2 className="text-lg font-black text-gray-900">Your Trip Budget in ₹ (Rupees)</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-700">Set Total Budget:</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500 font-bold text-xs">₹</span>
              <input
                type="number"
                placeholder="Enter budget in ₹"
                value={totalUserBudget}
                onChange={(e) => setTotalUserBudget(e.target.value)}
                className="pl-6 pr-3 py-1.5 text-xs font-bold border border-amber-300 rounded-xl bg-amber-50/40 focus:outline-none focus:ring-2 focus:ring-amber-500 w-36 text-gray-900"
              />
            </div>
          </div>
        </div>

        {userEnteredBudget > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Circular graph generated dynamically based on your entered budget of <strong className="text-amber-700">₹{userEnteredBudget.toLocaleString()}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-amber-800 block text-[10px] font-bold uppercase">Allocated Cost</span>
                  <span className="text-base font-black text-amber-950">₹{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-emerald-800 block text-[10px] font-bold uppercase">Remaining Funds</span>
                  <span className="text-base font-black text-emerald-950">₹{remainingBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recharts Circular Donut/Pie Chart */}
            <div className="md:col-span-7 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={circularGraphData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {circularGraphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SUNSET_PALETTE[index % SUNSET_PALETTE.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-amber-50/60 rounded-2xl border border-dashed border-amber-300 text-center space-y-2">
            <AlertCircle className="h-6 w-6 text-amber-600 mx-auto" />
            <p className="text-xs font-bold text-gray-800">No Default Budget Assumed</p>
            <p className="text-xs text-gray-500">Please enter your total travel budget in ₹ above to view your circular spending distribution graph.</p>
          </div>
        )}
      </div>

      {/* 🏛️ FAMOUS PLACES OF CITY / COUNTRY (Real Photos & Working + Day 1 / Day 2 / Day 3 Buttons) */}
      <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white mb-1">
              <Sparkles className="h-3 w-3 mr-1 text-amber-200" /> Must-Visit Authentic Sights
            </span>
            <h2 className="text-lg font-black text-gray-900">Famous Places in {tripDestination}</h2>
            <p className="text-xs text-gray-600">Click any day button to directly add this landmark to your itinerary.</p>
          </div>

          <span className="text-xs font-bold text-amber-800 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-amber-200">
            {attractions.length} Real Places Ready
          </span>
        </div>

        {/* Attractions Real Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {attractions.map((att, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
              <div className="space-y-2">
                <div className="h-32 rounded-xl overflow-hidden relative shadow-inner">
                  <img src={att.image} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {att.category}
                  </span>
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    {att.cost_inr || (att.cost > 0 ? `₹${att.cost}` : 'Free')}
                  </span>
                </div>

                <h3 className="text-xs font-black text-gray-900 line-clamp-2 leading-tight">
                  {att.name}
                </h3>
                <div className="flex items-center text-[11px] text-gray-500">
                  <Clock className="h-3 w-3 mr-1 text-amber-600" />
                  <span>Duration: {att.duration}</span>
                </div>
              </div>

              {/* Day Assignment Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleAddAttractionToDay(att.name, 0)}
                  className="flex-1 py-2 px-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 rounded-xl text-xs font-bold transition-all text-center border border-amber-200 hover:border-transparent active:scale-95 shadow-xs"
                >
                  + Day 1
                </button>

                <button
                  type="button"
                  onClick={() => handleAddAttractionToDay(att.name, 1)}
                  className="flex-1 py-2 px-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 rounded-xl text-xs font-bold transition-all text-center border border-rose-200 hover:border-transparent active:scale-95 shadow-xs"
                >
                  + Day 2
                </button>

                <button
                  type="button"
                  onClick={() => handleAddAttractionToDay(att.name, 2)}
                  className="flex-1 py-2 px-2 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-800 rounded-xl text-xs font-bold transition-all text-center border border-orange-200 hover:border-transparent active:scale-95 shadow-xs"
                >
                  + Day 3
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sortable Destination Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">Itinerary Stops & Schedule</h2>
          <span className="text-xs text-gray-400 font-semibold">Drag handle on left to reorder</span>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section, index) => (
                <SortableSection 
                  key={section.id} 
                  id={section.id} 
                  index={index}
                  section={section} 
                  onUpdate={updateSection}
                  onRemove={removeSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Add New Destination Stop Button */}
      <div className="pt-2 text-center">
        <button 
          type="button"
          onClick={addDestinationStop} 
          className="w-full py-4 border-2 border-dashed border-amber-300 rounded-3xl text-xs font-bold text-amber-900 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-400 transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          <Plus className="h-5 w-5 text-amber-600" />
          <span>Add Another Destination Stop / Day</span>
        </button>
      </div>
    </div>
  );
}
