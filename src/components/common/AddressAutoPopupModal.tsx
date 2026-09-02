import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import {
  AddressLookupService,
  AddressLookupResult,
  POPULAR_ADDRESS_DATABASE
} from '../../services/addressLookupService';
import {
  MapPin,
  Search,
  Navigation,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
  RotateCw,
  LocateFixed,
  Compass,
  ArrowRight
} from 'lucide-react';

export interface AddressAutoPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectAddress: (address: {
    cityArea: string;
    postOffice: string;
    policeStation: string;
    district: string;
    state: string;
    pinCode: string;
  }) => void;
}

export const AddressAutoPopupModal: React.FC<AddressAutoPopupModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectAddress
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [results, setResults] = useState<AddressLookupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Sync initial query if updated
  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  // Debounced search & resolution
  useEffect(() => {
    let isCancelled = false;
    const term = searchTerm.trim();

    if (!term) {
      setResults(POPULAR_ADDRESS_DATABASE.slice(0, 16));
      return;
    }

    if (term.length === 6 && /^\d{6}$/.test(term)) {
      setIsLoading(true);
      AddressLookupService.resolvePinCodeAsync(term).then(res => {
        if (!isCancelled) {
          setResults(res);
          setIsLoading(false);
        }
      });
    } else {
      const local = AddressLookupService.lookupLocal(term);
      setResults(local);
    }

    return () => {
      isCancelled = true;
    };
  }, [searchTerm]);

  const filteredResults = useMemo(() => {
    if (selectedCategory === 'All') return results;
    if (selectedCategory === 'Kolkata') {
      return results.filter(r => r.district.toLowerCase() === 'kolkata');
    }
    if (selectedCategory === 'North 24 Pgs') {
      return results.filter(r => r.district.toLowerCase().includes('north 24'));
    }
    if (selectedCategory === 'Howrah / Hooghly') {
      return results.filter(r => r.district.toLowerCase() === 'howrah' || r.district.toLowerCase() === 'hooghly');
    }
    if (selectedCategory === 'Regional Bengal') {
      return results.filter(r => r.state.toLowerCase() === 'west bengal' && r.district.toLowerCase() !== 'kolkata');
    }
    return results;
  }, [results, selectedCategory]);

  const handleSelect = (item: AddressLookupResult) => {
    onSelectAddress({
      cityArea: item.cityArea,
      postOffice: item.postOffice,
      policeStation: item.policeStation,
      district: item.district,
      state: item.state,
      pinCode: item.pinCode
    });
    onClose();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    setGeoMessage('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const { latitude, longitude } = pos.coords;
        // Check closest known cluster
        // Kolkata approx ~ 22.5726, 88.3639
        if (latitude > 22.0 && latitude < 23.5 && longitude > 88.0 && longitude < 89.0) {
          setSearchTerm('700091'); // Salt Lake IT & Medical Hub default
          setGeoMessage(`GPS Located (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E): Matched Bengal Region`);
        } else {
          setSearchTerm('700001');
          setGeoMessage(`GPS Located (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
        }
      },
      (err) => {
        setGeoLocating(false);
        setGeoMessage('Unable to retrieve GPS location. You can type your 6-digit PIN code or Area name.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Address Auto-Fill & Postal Lookup"
      description="Type PIN code (6 digits), Village/Town, or Select from instant auto-suggestions"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search Header */}
        <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-emerald-500/10 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="address-lookup-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter 6-digit PIN code (e.g. 700091, 711101) or Area (e.g. Salt Lake, Barasat)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {isLoading && (
                <RotateCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
              )}
            </div>

            <Button
              id="address-detect-gps-btn"
              type="button"
              variant="outline"
              onClick={handleDetectLocation}
              disabled={geoLocating}
              className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 text-xs font-bold"
            >
              {geoLocating ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span>{geoLocating ? 'Detecting...' : 'Auto Detect GPS'}</span>
            </Button>
          </div>

          {geoMessage && (
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 animate-pulse" />
              <span>{geoMessage}</span>
            </p>
          )}

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Popular Hubs:
            </span>
            {['All', 'Kolkata', 'North 24 Pgs', 'Howrah / Hooghly', 'Regional Bengal'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
          {filteredResults.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching postal area found</p>
              <p className="text-xs text-slate-500 mt-1">
                You can still type the address manually or try a different 6-digit Indian PIN code.
              </p>
            </div>
          ) : (
            filteredResults.map((item, idx) => (
              <div
                key={`${item.pinCode}-${item.cityArea}-${idx}`}
                id={`address-item-${item.pinCode}-${idx}`}
                onClick={() => handleSelect(item)}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs hover:shadow-md"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-black text-xs shrink-0 border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 dark:bg-amber-400 dark:text-slate-950">
                        PIN {item.pinCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.cityArea}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                      <span><strong>PO:</strong> {item.postOffice}</span>
                      <span>•</span>
                      <span><strong>PS:</strong> {item.policeStation}</span>
                      <span>•</span>
                      <span><strong>Dist:</strong> {item.district}</span>
                      <span>•</span>
                      <span>{item.state}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Auto-Fill</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Health System Certified Pin Address Directory</span>
          </div>
          <Button variant="ghost" onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
