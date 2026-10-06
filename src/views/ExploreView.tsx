import React, { useState } from 'react';
import type { Place, Language } from '../types';
import { SEED_PLACES } from '../data/seedData';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { SuitabilityBadges } from '../components/common/Badge';
import { Search, MapPin, Hospital, Accessibility, Utensils, Plus, Check, Map as MapIcon, Grid } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


// Custom Leaflet marker icon fix for React Leaflet
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ExploreViewProps {
  onAddPlaceToTrip: (place: Place) => void;
  lang: Language;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onAddPlaceToTrip, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [filterHospital, setFilterHospital] = useState(false);
  const [filterPureVeg, setFilterPureVeg] = useState(false);
  const [addedPlaceIds, setAddedPlaceIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredPlaces = SEED_PLACES.filter(place => {
    if (search && !place.name.toLowerCase().includes(search.toLowerCase()) && !place.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && place.category !== selectedCategory) {
      return false;
    }
    if (filterAccessible && !place.suitability.accessible) return false;
    if (filterHospital && place.hospitalDistanceKm > 2.0) return false;
    if (filterPureVeg && !place.suitability.pureVeg) return false;
    return true;
  });

  const handleAdd = (place: Place) => {
    onAddPlaceToTrip(place);
    setAddedPlaceIds([...addedPlaceIds, place.id]);
  };

  const categories = [
    { id: 'all', label: t.allPlaces },
    { id: 'beach', label: t.beaches },
    { id: 'temple', label: t.templesSpiritual },
    { id: 'culture', label: t.cultureHeritage },
    { id: 'nature', label: t.natureParks },
    { id: 'adventure', label: t.adventureSports },
    { id: 'nightlife', label: t.nightlifeClubs },
    { id: 'shopping', label: t.shoppingMarkets },
    { id: 'wellness', label: t.wellnessSpa },
    { id: 'dining', label: t.vegDining },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
            >
              {viewMode === 'grid' ? (
                <>
                  <MapIcon className="w-4 h-4 text-teal-600" /> Map Pins
                </>
              ) : (
                <>
                  <Grid className="w-4 h-4 text-teal-600" /> Card Grid
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accessibility & Safety Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-extrabold">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Quick Filters:</span>
          
          <button
            onClick={() => setFilterHospital(!filterHospital)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              filterHospital
                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" /> {t.nearHospital}
          </button>

          <button
            onClick={() => setFilterAccessible(!filterAccessible)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              filterAccessible
                ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" /> {t.accessibility}
          </button>

          <button
            onClick={() => setFilterPureVeg(!filterPureVeg)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              filterPureVeg
                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> {t.pureVeg}
          </button>
        </div>
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 h-[600px]">
          <MapContainer center={[15.498, 73.826]} zoom={11} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPlaces.map((pl) => (
              <Marker key={pl.id} position={[pl.lat, pl.lng]} icon={customMarkerIcon}>
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <strong className="text-sm font-bold text-slate-900">{pl.name}</strong>
                    <p className="text-slate-600">{pl.location}</p>
                    <p className="font-extrabold text-teal-600">Hospital: {pl.hospitalDistanceKm}km</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* Card Grid View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => {
            const isAdded = addedPlaceIds.includes(place.id);
            return (
              <div
                key={place.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-extrabold rounded-lg uppercase">
                        {place.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-900 dark:text-white text-xs font-black rounded-lg">
                        ★ {place.rating} ({place.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {place.name}
                      </h3>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-400 shrink-0">
                        {place.approxCost > 0 ? formatINR(place.approxCost) : 'Free'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{place.location}</span>
                    </div>

                    {/* Suitability Badges */}
                    <SuitabilityBadges
                      suitability={place.suitability}
                      hospitalDistanceKm={place.hospitalDistanceKm}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAdd(place)}
                    disabled={isAdded}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> {t.addedToItinerary}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> {t.addToTripItinerary}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
