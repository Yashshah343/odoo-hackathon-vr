import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { GripVertical, Plus, Plane, Hotel, Map, Save, Trash2 } from 'lucide-react';
import useStore from '../store';

// Helper component for Sortable Item
function SortableSection({ id, section, onUpdate, onRemove }) {
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

  const getIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane className="h-5 w-5 text-blue-500" />;
      case 'hotel': return <Hotel className="h-5 w-5 text-indigo-500" />;
      case 'activity': return <Map className="h-5 w-5 text-green-500" />;
      default: return <Map className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 flex overflow-hidden">
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="bg-gray-50 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-gray-200">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getIcon(section.type)}
            <span className="font-semibold text-gray-700 capitalize">{section.type}</span>
          </div>
          <button onClick={() => onRemove(id)} className="text-gray-400 hover:text-red-500">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Destination / Name</label>
            <input
              type="text"
              value={section.destination}
              onChange={(e) => onUpdate(id, 'destination', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Paris City Center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Allocated Budget ($)</label>
            <input
              type="number"
              value={section.budget_allocated}
              onChange={(e) => onUpdate(id, 'budget_allocated', parseFloat(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Start Date</label>
            <input
              type="date"
              value={section.start_date}
              onChange={(e) => onUpdate(id, 'start_date', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">End Date</label>
            <input
              type="date"
              value={section.end_date}
              onChange={(e) => onUpdate(id, 'end_date', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryBuilder() {
  const { id } = useParams(); // Trip ID
  
  const [sections, setSections] = useState([]);

  React.useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await apiClient.get(`/trips/${id}`);
        if (response.data.itinerary_sections) {
          // Give them a unique id for dnd-kit if they don't have one
          const loadedSections = response.data.itinerary_sections.map((sec, idx) => ({
            ...sec,
            id: sec.id || `db-${idx}-${Date.now()}`
          }));
          setSections(loadedSections);
        }
      } catch (err) {
        console.error("Failed to fetch trip", err);
      }
    };
    fetchTrip();
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(sec => 
      sec.id === id ? { ...sec, [field]: value } : sec
    ));
  };

  const removeSection = (id) => {
    setSections(sections.filter(sec => sec.id !== id));
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type: type,
      destination: '',
      start_date: '',
      end_date: '',
      budget_allocated: 0
    };
    setSections([...sections, newSection]);
  };

  const handleSave = async () => {
    try {
      // Send the updated sections to the FastAPI backend to save in MongoDB
      await apiClient.put(`/trips/${id}`, {
        itinerary_sections: sections.map(sec => ({
          section_id: sec.id, // Include section_id which is required by the backend schema
          type: sec.type,
          destination: sec.destination,
          start_date: sec.start_date || null,
          end_date: sec.end_date || null,
          budget_allocated: parseFloat(sec.budget_allocated) || 0,
          activities: [],
          expenses: []
        }))
      });
      alert('Itinerary saved successfully to MongoDB!');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message;
      alert(`Failed to save itinerary: ${errorMsg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Itinerary Builder</h1>
          <p className="text-gray-500 mt-1">Drag and drop sections to reorder your trip timeline.</p>
        </div>
        <button 
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Itinerary
        </button>
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
            {sections.map(section => (
              <SortableSection 
                key={section.id} 
                id={section.id} 
                section={section} 
                onUpdate={updateSection}
                onRemove={removeSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Section Buttons */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">Add an item to your itinerary</h3>
        <div className="flex space-x-4">
          <button onClick={() => addSection('flight')} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Plane className="h-4 w-4 mr-2 text-blue-500" />
            Add Flight
          </button>
          <button onClick={() => addSection('hotel')} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Hotel className="h-4 w-4 mr-2 text-indigo-500" />
            Add Hotel
          </button>
          <button onClick={() => addSection('activity')} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Map className="h-4 w-4 mr-2 text-green-500" />
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
