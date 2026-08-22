import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Landmark, 
  Plane, 
  Compass, 
  X, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  PlusCircle,
  Loader2
} from 'lucide-react';
import apiClient from '../api/client';

export default function PlaceSearchBar({ 
  placeholder = "Search cities, landmarks, activities, or trips...", 
  onSelect,
  className = "",
  inputClassName = "",
  autoFocus = false,
  showQuickPlan = true
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Curated instant fallback destinations
  const FALLBACK_TRENDING = [
    { title: "Paris", subtitle: "Île-de-France, France", type: "city", badge: "City", flag: "🇫🇷" },
    { title: "Tokyo", subtitle: "Kanto, Japan", type: "city", badge: "City", flag: "🇯🇵" },
    { title: "Rome", subtitle: "Lazio, Italy", type: "city", badge: "City", flag: "🇮🇹" },
    { title: "Eiffel Tower", subtitle: "Paris, France", type: "landmark", badge: "Landmark", flag: "🇫🇷" },
    { title: "Bali", subtitle: "Indonesia", type: "city", badge: "Island", flag: "🇮🇩" },
    { title: "New York City", subtitle: "New York, USA", type: "city", badge: "City", flag: "🇺🇸" },
    { title: "Santorini", subtitle: "Greece", type: "city", badge: "Island", flag: "🇬🇷" },
    { title: "Kyoto", subtitle: "Japan", type: "city", badge: "Culture", flag: "🇯🇵" }
  ];

  // Fetch trending places on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await apiClient.get('/places/popular');
        if (res.data?.trending) {
          setTrending(res.data.trending.map(t => ({
            title: t.name,
            subtitle: `${t.region ? t.region + ', ' : ''}${t.country}`,
            type: t.type,
            badge: t.badge || 'Place',
            flag: t.flag || '📍'
          })));
        }
      } catch (e) {
        setTrending(FALLBACK_TRENDING);
      }
    };
    fetchTrending();
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/places/search?q=${encodeURIComponent(query.trim())}&limit=8`);
        if (response.data?.results) {
          setResults(response.data.results);
        }
      } catch (err) {
        // Local filtering fallback
        const q = query.toLowerCase();
        const localMatches = FALLBACK_TRENDING.filter(item => 
          item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        );
        setResults(localMatches);
      } finally {
        setLoading(false);
        setSelectedIndex(-1);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = (item) => {
    if (onSelect) {
      onSelect(item);
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    if (item.type === 'trip' && item.url) {
      navigate(item.url);
    } else {
      // Navigate to explore with the destination selected
      navigate(`/explore?destination=${encodeURIComponent(item.title)}`);
    }
  };

  const handlePlanTrip = (e, item) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate(`/trips/create?name=${encodeURIComponent('Trip to ' + item.title)}`);
  };

  // Keyboard navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = (e) => {
    const activeList = query.trim() ? results : trending;
    if (!isOpen || activeList.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < activeList.length) {
        handleSelectPlace(activeList[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Helper to render matching highlight text
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-semibold text-blue-600 underline decoration-blue-300 underline-offset-2">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'landmark':
        return <Landmark className="h-4 w-4 text-amber-500" />;
      case 'trip':
        return <Plane className="h-4 w-4 text-indigo-500" />;
      case 'activity':
        return <Compass className="h-4 w-4 text-emerald-500" />;
      default:
        return <MapPin className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative z-50 w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-2 text-sm bg-white border border-gray-300 rounded-lg placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputClassName}`}
        />

        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-[9999] mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-gray-200 py-2 max-h-[420px] overflow-y-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Query Results */}
          {query.trim() ? (
            results.length > 0 ? (
              <div className="divide-y divide-gray-50">
                <div className="px-3.5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Place Suggestions</span>
                  <span className="text-[10px] lowercase font-normal text-gray-400">Press ↑↓ to navigate, ↵ to select</span>
                </div>

                {results.map((item, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={item.id || index}
                      onClick={() => handleSelectPlace(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                          {item.flag ? (
                            <span className="text-base leading-none">{item.flag}</span>
                          ) : (
                            getIcon(item.type)
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {renderHighlightedText(item.title, query)}
                            </span>
                            {item.badge && (
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                                item.type === 'landmark' ? 'bg-amber-100 text-amber-800' :
                                item.type === 'trip' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {renderHighlightedText(item.subtitle, query)}
                            </p>
                          )}
                        </div>
                      </div>

                      {showQuickPlan && item.type !== 'trip' && (
                        <button
                          type="button"
                          onClick={(e) => handlePlanTrip(e, item)}
                          className="ml-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 px-2 py-1 rounded-md transition-colors"
                          title={`Plan trip to ${item.title}`}
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          <span>Plan Trip</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              !loading && (
                <div className="p-6 text-center text-gray-500">
                  <Compass className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No places found matching "{query}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for a city, landmark, country or activity.</p>
                </div>
              )
            )
          ) : (
            /* Trending & Popular Places (When input is empty & focused) */
            <div>
              <div className="px-3.5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                <span>Popular Destinations & Sights</span>
              </div>

              <div className="mt-1 divide-y divide-gray-50">
                {(trending.length > 0 ? trending : FALLBACK_TRENDING).slice(0, 6).map((item, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectPlace(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gray-100 text-sm">
                          {item.flag || <MapPin className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900 truncate">{item.title}</span>
                            <span className="px-1.5 py-0.2 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
