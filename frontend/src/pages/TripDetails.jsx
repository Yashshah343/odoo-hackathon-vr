import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Edit3, MapPin, Calendar, DollarSign } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function TripDetails() {
  const { id } = useParams();

  // Mock data representing what would be fetched from /api/v1/trips/{id}
  const tripData = {
    name: "Summer in Paris",
    status: "upcoming",
    is_public: true,
    totalBudget: 2200,
    sections: [
      { id: '1', type: 'flight', destination: 'JFK to CDG', budget: 850, date: 'June 15, 2027' },
      { id: '2', type: 'hotel', destination: 'Le Meurice', budget: 1000, date: 'June 16-20, 2027' },
      { id: '3', type: 'activity', destination: 'Louvre Tour', budget: 150, date: 'June 17, 2027' },
      { id: '4', type: 'activity', destination: 'Seine Cruise', budget: 200, date: 'June 18, 2027' },
    ]
  };

  const chartData = tripData.sections.map(sec => ({
    name: sec.destination,
    value: sec.budget
  }));

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Itinerary Timeline */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tripData.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Paris, France</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> June 15-20, 2027</span>
            </div>
          </div>
          <Link 
            to={`/trips/${id}/builder`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit3 className="h-4 w-4 mr-2 text-gray-500" />
            Edit Itinerary
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {tripData.sections.map((section, idx) => (
              <li key={section.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white
                      ${section.type === 'flight' ? 'bg-blue-500' : 
                        section.type === 'hotel' ? 'bg-indigo-500' : 'bg-green-500'}`}
                    >
                      {idx + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{section.destination}</p>
                      <p className="text-sm text-gray-500 capitalize">{section.type} • {section.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ${section.budget}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Column: Budget Breakdown */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow rounded-lg border border-gray-200 p-6 sticky top-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
            Budget Breakdown
          </h2>
          
          <div className="text-3xl font-bold text-gray-900 mb-6">
            ${tripData.totalBudget.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 block mt-1">Total Estimated Cost</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
