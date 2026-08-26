export interface AddressLookupResult {
  pinCode: string;
  cityArea: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
  landmark?: string;
  category?: 'Metro Central' | 'Suburban' | 'Regional City' | 'Rural / Town' | 'Other';
}

export const POPULAR_ADDRESS_DATABASE: AddressLookupResult[] = [
  // Kolkata Core & Suburbs
  {
    pinCode: '700001',
    cityArea: 'BBD Bagh / Dalhousie',
    postOffice: 'Kolkata GPO',
    policeStation: 'Hare Street PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700004',
    cityArea: 'Shyambazar / Hatibagan',
    postOffice: 'Shyambazar SO',
    policeStation: 'Shyampukur PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700009',
    cityArea: 'College Square / Bowbazar / Amherst St',
    postOffice: 'Amherst Street SO',
    policeStation: 'Amherst Street PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700019',
    cityArea: 'Ballygunge / Gariahat',
    postOffice: 'Ballygunge SO',
    policeStation: 'Gariahat PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700020',
    cityArea: 'Bhawanipore / Elgin Road',
    postOffice: 'Bhawanipore SO',
    policeStation: 'Bhawanipore PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700026',
    cityArea: 'Kalighat / Rashbehari',
    postOffice: 'Kalighat SO',
    policeStation: 'Kalighat PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700028',
    cityArea: 'Dum Dum / Nagerbazar',
    postOffice: 'Dum Dum SO',
    policeStation: 'Dum Dum PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700032',
    cityArea: 'Jadavpur / Sulekha / Baghajatin',
    postOffice: 'Jadavpur University SO',
    policeStation: 'Jadavpur PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700034',
    cityArea: 'Behala / Taratala / Sakherbazar',
    postOffice: 'Behala SO',
    policeStation: 'Behala PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700047',
    cityArea: 'Naktala / Bansdroni / Garia Crossing',
    postOffice: 'Naktala SO',
    policeStation: 'Netaji Nagar PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700053',
    cityArea: 'New Alipore / Taratala',
    postOffice: 'New Alipore SO',
    policeStation: 'New Alipore PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700064',
    cityArea: 'Salt Lake Sector I & II / City Centre 1',
    postOffice: 'Salt Lake SO',
    policeStation: 'Bidhannagar North PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700091',
    cityArea: 'Salt Lake Sector V / IT Hub / Karunamoyee',
    postOffice: 'Salt Lake Sector V SO',
    policeStation: 'Bidhannagar East PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700098',
    cityArea: 'Salt Lake Sector III / Chingrighata',
    postOffice: 'Salt Lake Sector III SO',
    policeStation: 'Bidhannagar South PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700107',
    cityArea: 'Ruby / Kasba / Anandapur / EM Bypass',
    postOffice: 'Kasba SO',
    policeStation: 'Kasba PS',
    district: 'Kolkata',
    state: 'West Bengal',
    category: 'Metro Central'
  },
  {
    pinCode: '700135',
    cityArea: 'New Town Action Area 1 / Rajarhat',
    postOffice: 'New Town SO',
    policeStation: 'New Town PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700136',
    cityArea: 'Action Area 2 / Akanksha / Eco Park',
    postOffice: 'Rajarhat Gopalpur SO',
    policeStation: 'Eco Park PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700150',
    cityArea: 'Kestopur / VIP Road / Hanapara',
    postOffice: 'Krishnapur SO',
    policeStation: 'Baguiati PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700156',
    cityArea: 'Action Area 3 / Shapoorji / Uniworld',
    postOffice: 'New Town Action Area 3 SO',
    policeStation: 'Techno City PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700084',
    cityArea: 'Garia / Mahamayatala / Kamalgazi',
    postOffice: 'Garia SO',
    policeStation: 'Sonarpur PS',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700144',
    cityArea: 'Sonarpur / Rajpur / Subhasgram',
    postOffice: 'Sonarpur SO',
    policeStation: 'Sonarpur PS',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700124',
    cityArea: 'Barasat / Colony More / Champadali',
    postOffice: 'Barasat HO',
    policeStation: 'Barasat PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700120',
    cityArea: 'Barrackpore / Station Road',
    postOffice: 'Barrackpore HO',
    policeStation: 'Barrackpore PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700114',
    cityArea: 'Madhyamgram / Sodepur Road',
    postOffice: 'Madhyamgram SO',
    policeStation: 'Madhyamgram PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },
  {
    pinCode: '700110',
    cityArea: 'Sodepur / Panihati / BT Road',
    postOffice: 'Sodepur SO',
    policeStation: 'Khardah PS',
    district: 'North 24 Parganas',
    state: 'West Bengal',
    category: 'Suburban'
  },

  // Howrah & Hooghly
  {
    pinCode: '711101',
    cityArea: 'Howrah Station / Golabari / Salkia',
    postOffice: 'Howrah HO',
    policeStation: 'Golabari PS',
    district: 'Howrah',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '711102',
    cityArea: 'Kadamtala / Shibpur / Mandirtala',
    postOffice: 'Shibpur SO',
    policeStation: 'Shibpur PS',
    district: 'Howrah',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '711204',
    cityArea: 'Bally / Belur / Liluah',
    postOffice: 'Bally SO',
    policeStation: 'Bally PS',
    district: 'Howrah',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '712201',
    cityArea: 'Uttarpara / Hindmotor / Kotrung',
    postOffice: 'Uttarpara SO',
    policeStation: 'Uttarpara PS',
    district: 'Hooghly',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '712232',
    cityArea: 'Serampore / Battala / Station Road',
    postOffice: 'Serampore HO',
    policeStation: 'Serampore PS',
    district: 'Hooghly',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '712101',
    cityArea: 'Chinsurah / Hooghly Station / Pipulpati',
    postOffice: 'Chinsurah HO',
    policeStation: 'Chinsurah PS',
    district: 'Hooghly',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '712123',
    cityArea: 'Bandel / Church Road / Kodalia',
    postOffice: 'Bandel SO',
    policeStation: 'Chinsurah PS',
    district: 'Hooghly',
    state: 'West Bengal',
    category: 'Regional City'
  },

  // Regional Hubs of West Bengal
  {
    pinCode: '713101',
    cityArea: 'Burdwan Sadar / Curzon Gate / Station Bazar',
    postOffice: 'Burdwan HO',
    policeStation: 'Burdwan Sadar PS',
    district: 'Purba Bardhaman',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '713216',
    cityArea: 'Durgapur City Centre / Benachity',
    postOffice: 'Durgapur Steel Town SO',
    policeStation: 'Durgapur PS',
    district: 'Paschim Bardhaman',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '713301',
    cityArea: 'Asansol / Burnpur / Court Road',
    postOffice: 'Asansol HO',
    policeStation: 'Asansol North PS',
    district: 'Paschim Bardhaman',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '721101',
    cityArea: 'Midnapore Town / Keranitola / Ring Road',
    postOffice: 'Midnapore HO',
    policeStation: 'Kotwali PS',
    district: 'Paschim Medinipur',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '721301',
    cityArea: 'Kharagpur / IIT Campus / Malancha',
    postOffice: 'Kharagpur Technology SO',
    policeStation: 'Kharagpur Town PS',
    district: 'Paschim Medinipur',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '721631',
    cityArea: 'Haldia Port / Durgachak / City Centre',
    postOffice: 'Durgachak SO',
    policeStation: 'Durgachak PS',
    district: 'Purba Medinipur',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '734001',
    cityArea: 'Siliguri Town / Hill Cart Road / Sevoke Rd',
    postOffice: 'Siliguri HO',
    policeStation: 'Siliguri PS',
    district: 'Darjeeling',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '732101',
    cityArea: 'Malda Town / English Bazar / Rathbari',
    postOffice: 'Malda HO',
    policeStation: 'English Bazar PS',
    district: 'Malda',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '742101',
    cityArea: 'Berhampore / Gorabazar / Mohona Bus Stand',
    postOffice: 'Berhampore HO',
    policeStation: 'Berhampore PS',
    district: 'Murshidabad',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '741235',
    cityArea: 'Kalyani / AIIMS Campus / Central Park',
    postOffice: 'Kalyani HO',
    policeStation: 'Kalyani PS',
    district: 'Nadia',
    state: 'West Bengal',
    category: 'Regional City'
  },
  {
    pinCode: '741101',
    cityArea: 'Krishnanagar / Court Road / Nediarpara',
    postOffice: 'Krishnanagar HO',
    policeStation: 'Kotwali PS',
    district: 'Nadia',
    state: 'West Bengal',
    category: 'Regional City'
  },

  // Major Indian Metros & Medical Centers
  {
    pinCode: '110001',
    cityArea: 'Connaught Place / Barakhamba Road',
    postOffice: 'New Delhi GPO',
    policeStation: 'Connaught Place PS',
    district: 'Central Delhi',
    state: 'Delhi',
    category: 'Metro Central'
  },
  {
    pinCode: '110029',
    cityArea: 'Ansari Nagar / AIIMS / Safdarjung',
    postOffice: 'Safdarjung Enclave SO',
    policeStation: 'Hauz Khas PS',
    district: 'South Delhi',
    state: 'Delhi',
    category: 'Metro Central'
  },
  {
    pinCode: '400001',
    cityArea: 'Fort / Nariman Point / Churchgate',
    postOffice: 'Mumbai GPO',
    policeStation: 'MRA Marg PS',
    district: 'Mumbai',
    state: 'Maharashtra',
    category: 'Metro Central'
  },
  {
    pinCode: '560001',
    cityArea: 'MG Road / Brigade Road / Shivajinagar',
    postOffice: 'Bengaluru GPO',
    policeStation: 'Cubbon Park PS',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    category: 'Metro Central'
  },
  {
    pinCode: '600001',
    cityArea: 'George Town / Parrys / Beach Road',
    postOffice: 'Chennai GPO',
    policeStation: 'Flower Bazaar PS',
    district: 'Chennai',
    state: 'Tamil Nadu',
    category: 'Metro Central'
  },
  {
    pinCode: '800001',
    cityArea: 'Patna Junction / Fraser Road / Gandhi Maidan',
    postOffice: 'Patna GPO',
    policeStation: 'Kotwali PS',
    district: 'Patna',
    state: 'Bihar',
    category: 'Regional City'
  },
  {
    pinCode: '834001',
    cityArea: 'Ranchi Main Road / Albert Ekka Chowk',
    postOffice: 'Ranchi GPO',
    policeStation: 'Kotwali PS',
    district: 'Ranchi',
    state: 'Jharkhand',
    category: 'Regional City'
  },
  {
    pinCode: '751001',
    cityArea: 'Bhubaneswar Master Canteen / Unit 3',
    postOffice: 'Bhubaneswar GPO',
    policeStation: 'Kharvel Nagar PS',
    district: 'Khurda',
    state: 'Odisha',
    category: 'Regional City'
  }
];

const PIN_CACHE_KEY = 'labmedix_cached_pincodes_v1';

export class AddressLookupService {
  private static getCustomCache(): Record<string, AddressLookupResult[]> {
    try {
      const stored = localStorage.getItem(PIN_CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static saveToCache(pin: string, results: AddressLookupResult[]) {
    try {
      const cache = this.getCustomCache();
      cache[pin] = results;
      localStorage.setItem(PIN_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Ignored
    }
  }

  /**
   * Fast synchronous lookup from curated local database + cached entries
   */
  public static lookupLocal(query: string): AddressLookupResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_ADDRESS_DATABASE.slice(0, 15);

    const isNumeric = /^\d+$/.test(q);

    // Check cached records
    const cache = this.getCustomCache();
    const cachedList: AddressLookupResult[] = [];
    Object.keys(cache).forEach(pin => {
      if (pin.startsWith(q) || q.includes(pin)) {
        cachedList.push(...cache[pin]);
      }
    });

    const combined = [...POPULAR_ADDRESS_DATABASE, ...cachedList];
    const uniqueMap = new Map<string, AddressLookupResult>();

    combined.forEach(item => {
      const key = `${item.pinCode}-${item.cityArea}-${item.postOffice}`;
      if (uniqueMap.has(key)) return;

      if (isNumeric) {
        if (item.pinCode.startsWith(q)) {
          uniqueMap.set(key, item);
        }
      } else {
        if (
          item.cityArea.toLowerCase().includes(q) ||
          item.postOffice.toLowerCase().includes(q) ||
          item.policeStation.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
        ) {
          uniqueMap.set(key, item);
        }
      }
    });

    return Array.from(uniqueMap.values()).slice(0, 20);
  }

  /**
   * Resolves PIN Code with live Indian Postal API fallback if not found locally
   */
  public static async resolvePinCodeAsync(pinCode: string): Promise<AddressLookupResult[]> {
    const pin = pinCode.trim();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return this.lookupLocal(pin);
    }

    // 1. Check local DB
    const local = POPULAR_ADDRESS_DATABASE.filter(a => a.pinCode === pin);
    if (local.length > 0) {
      return local;
    }

    // 2. Check Cache
    const cache = this.getCustomCache();
    if (cache[pin] && cache[pin].length > 0) {
      return cache[pin];
    }

    // 3. Fallback to Indian Postal PIN API
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice)) {
          const poList = data[0].PostOffice;
          const mapped: AddressLookupResult[] = poList.map((po: any) => ({
            pinCode: pin,
            cityArea: po.Name,
            postOffice: `${po.Name} ${po.BranchType || 'PO'}`,
            policeStation: `${po.District || 'City'} Central PS`,
            district: po.District || 'District',
            state: po.State || 'West Bengal',
            category: po.District?.toLowerCase().includes('kolkata') ? 'Metro Central' : 'Regional City'
          }));

          if (mapped.length > 0) {
            this.saveToCache(pin, mapped);
            return mapped;
          }
        }
      }
    } catch {
      // Offline fallback
    }

    return this.lookupLocal(pin);
  }
}
