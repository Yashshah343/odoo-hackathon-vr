import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ArrowLeft } from 'lucide-react';

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

  // Mock events derived from itinerary sections
  const events = [
    {
      title: 'Flight: JFK to CDG',
      allDay: false,
      start: new Date(2027, 5, 15, 18, 0), // Note: month is 0-indexed in JS Dates
      end: new Date(2027, 5, 16, 8, 0),
      type: 'flight'
    },
    {
      title: 'Hotel Check-in: Le Meurice',
      allDay: true,
      start: new Date(2027, 5, 16),
      end: new Date(2027, 5, 20),
      type: 'hotel'
    },
    {
      title: 'Louvre Tour',
      allDay: false,
      start: new Date(2027, 5, 17, 10, 0),
      end: new Date(2027, 5, 17, 14, 0),
      type: 'activity'
    }
  ];

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.type === 'flight') backgroundColor = '#3b82f6';
    if (event.type === 'hotel') backgroundColor = '#8b5cf6';
    if (event.type === 'activity') backgroundColor = '#10b981';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="max-w-7xl mx-auto h-screen pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to={`/trips/${id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Itinerary
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Timeline Calendar</h1>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[70vh]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          defaultDate={new Date(2027, 5, 15)}
          views={['month', 'week', 'day']}
        />
      </div>
    </div>
  );
}
