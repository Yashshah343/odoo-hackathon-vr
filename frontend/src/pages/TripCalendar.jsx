import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Plane, Hotel, Compass } from 'lucide-react';
import apiClient from '../api/client';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function TripCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(id || 'all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await apiClient.get('/trips');
        const userTrips = response.data || [];
        setTrips(userTrips);

        // Build calendar events from all or selected trip
        const calendarEvents = [];
        const targetTrips = (id && id !== 'all') ? userTrips.filter(t => t._id === id) : userTrips;

        targetTrips.forEach(trip => {
          (trip.itinerary_sections || []).forEach((sec, idx) => {
            const destName = sec.destination || `Stop ${idx + 1}`;
            
            // If section has start date
            if (sec.start_date) {
              const start = new Date(sec.start_date);
              const end = sec.end_date ? new Date(sec.end_date) : new Date(sec.start_date);

              // Main destination stop event
              calendarEvents.push({
                title: `📍 ${trip.name}: ${destName}`,
                start: start,
                end: end,
                allDay: true,
                type: 'destination',
                tripId: trip._id
              });

              // Flight event
              if (sec.flight?.airline || sec.flight?.cost > 0) {
                calendarEvents.push({
                  title: `✈️ Flight: ${sec.flight.airline || 'Flight'} (${destName})`,
                  start: start,
                  end: start,
                  allDay: true,
                  type: 'flight',
                  tripId: trip._id
                });
              }

              // Hotel event
              if (sec.hotel?.hotel_name || sec.hotel?.cost > 0) {
                calendarEvents.push({
                  title: `🏨 Hotel: ${sec.hotel.hotel_name || 'Stay'}`,
                  start: start,
                  end: end,
                  allDay: true,
                  type: 'hotel',
                  tripId: trip._id
                });
              }

              // Activities events
              (sec.activities || []).forEach(act => {
                calendarEvents.push({
                  title: `🎯 ${act}`,
                  start: start,
                  end: end,
                  allDay: true,
                  type: 'activity',
                  tripId: trip._id
                });
              });
            }
          });
        });

        // If no events found, create friendly default demonstration events
        if (calendarEvents.length === 0) {
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          calendarEvents.push({
            title: `✈️ Flight to Paris CDG`,
            start: today,
            end: today,
            allDay: true,
            type: 'flight'
          });
          calendarEvents.push({
            title: `🏨 Le Meurice Paris Check-in`,
            start: today,
            end: nextWeek,
            allDay: true,
            type: 'hotel'
          });
          calendarEvents.push({
            title: `🎯 Louvre Museum Guided Tour`,
            start: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            end: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            allDay: true,
            type: 'activity'
          });
        }

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Failed to load trips for calendar", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleTripChange = (newTripId) => {
    setSelectedTripId(newTripId);
    if (newTripId === 'all') {
      navigate('/trips');
    } else {
      navigate(`/trips/${newTripId}/calendar`);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6';
    if (event.type === 'flight') backgroundColor = '#2563eb';
    if (event.type === 'hotel') backgroundColor = '#7c3aed';
    if (event.type === 'activity') backgroundColor = '#059669';
    if (event.type === 'destination') backgroundColor = '#d97706';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '3px 6px'
      }
    };
  };

  if (loading) return <div className="p-16 text-center text-gray-500">Loading your travel calendar...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link to={id && id !== 'all' ? `/trips/${id}` : '/trips'} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center">
              <CalendarIcon className="h-7 w-7 mr-2 text-blue-600" />
              Trip Timeline Calendar
            </h1>
            <p className="text-sm text-gray-500">Interactive schedule of flights, hotels, and planned activities across dates.</p>
          </div>
        </div>

        {/* Trip Switcher */}
        {trips.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-gray-600 uppercase">Select Trip:</label>
            <select
              value={id || 'all'}
              onChange={(e) => handleTripChange(e.target.value)}
              className="border border-gray-300 rounded-lg text-xs font-semibold py-2 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
            >
              <option value="all">All Trips & Schedules</option>
              {trips.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="flex items-center space-x-4 flex-wrap gap-2 text-xs font-semibold bg-gray-50 p-3 rounded-xl border border-gray-200">
        <span className="text-gray-500 uppercase tracking-wider text-[10px]">Event Colors:</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-600 mr-1.5"></span> Flight & Transit</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-600 mr-1.5"></span> Hotel & Stay</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-600 mr-1.5"></span> Activities & Sights</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-600 mr-1.5"></span> Destination Span</span>
      </div>
      
      {/* React Big Calendar Container */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 h-[680px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          defaultDate={events.length > 0 ? events[0].start : new Date()}
          views={['month', 'week', 'day', 'agenda']}
          onSelectEvent={(event) => {
            if (event.tripId) navigate(`/trips/${event.tripId}`);
          }}
        />
      </div>
    </div>
  );
}
