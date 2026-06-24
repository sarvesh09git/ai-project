import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, ShieldAlert, Navigation, RefreshCw, Layers } from 'lucide-react';

// Fix Leaflet marker icon asset mapping issues under Vite builds
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Leaflet hook to update center dynamically on coordinate sync
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function FinderPage() {
  const { coordinates, language, apiBaseUrl } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mapCenter, setMapCenter] = useState([coordinates.lat, coordinates.lng]);

  // Labels localization
  const labels = {
    en: {
      title: "Nearby Healthcare Locator",
      sub: "Find local Primary Health Centers, hospitals, clinics, and pharmacies. Calculated from your GPS coordinates.",
      filterAll: "All Facilities",
      filterGov: "Govt Centers",
      filterHosp: "Hospitals",
      filterClin: "Clinics",
      filterPhar: "Pharmacies",
      phone: "Call Facility",
      directions: "Get Directions",
      distance: "Distance",
      seedBtn: "Reset / Load Facilities",
      noLoc: "No facilities detected nearby. Click below to load pre-seeded medical centers."
    },
    hi: {
      title: "निकटतम स्वास्थ्य केंद्र खोजें",
      sub: "स्थानीय प्राथमिक स्वास्थ्य केंद्र, अस्पताल, क्लिनिक और दवा की दुकानें खोजें। आपके जीपीएस निर्देशांक से गणना की गई।",
      filterAll: "सभी केंद्र",
      filterGov: "सरकारी केंद्र",
      filterHosp: "अस्पताल",
      filterClin: "क्लिनिक",
      filterPhar: "दवा की दुकानें",
      phone: "कॉल करें",
      directions: "दिशा-निर्देश",
      distance: "दूरी",
      seedBtn: "केंद्र रीसेट / लोड करें",
      noLoc: "आसपास कोई स्वास्थ्य केंद्र नहीं मिला। प्री-सीडेड स्वास्थ्य केंद्रों को लोड करने के लिए नीचे क्लिक करें।"
    },
    mr: {
      title: "जवळचे आरोग्य केंद्र शोधा",
      sub: "स्थानिक प्राथमिक आरोग्य केंद्र, रुग्णालये, दवाखाने आणि औषधांची दुकाने शोधा. तुमच्या जीपीएसच्या सहाय्याने अंतर मोजले गेले आहे.",
      filterAll: "सर्व केंद्रे",
      filterGov: "शासकीय केंद्रे",
      filterHosp: "रुग्णालये",
      filterClin: "दवाखाने",
      filterPhar: "औषधांची दुकाने",
      phone: "संपर्क साधा",
      directions: "दिशा मिळवा",
      distance: "अंतर",
      seedBtn: "केंद्र रीसेट / लोड करा",
      noLoc: "जवळपास कोणतेही आरोग्य केंद्र सापडले नाही. प्री-सीडेड आरोग्य केंद्रे लोड करण्यासाठी खाली क्लिक करा."
    }
  }[language] || labels.en;

  const fetchFacilities = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const url = `${apiBaseUrl}/facilities/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}${filterType ? `&type=${filterType}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load facilities");
      const data = await res.json();
      setFacilities(data.facilities || []);
      setMapCenter([coordinates.lat, coordinates.lng]);
    } catch (err) {
      console.warn("Server facilities load failed, using local in-memory fallback list...");
      
      // Inline mock locations close to Koregaon Bhima coordinates for offline demonstration
      const mockList = [
        { name: "Shirur Primary Health Center (Govt)", type: "Government Health Center", latitude: 18.6298, longitude: 74.3792, address: "Nagar-Pune Road, Shirur Rural, Maharashtra 412210", phone: "+91 2138 222104", services: ["Maternity Care", "Immunization", "General OPD"], distance: 3.2 },
        { name: "Koregaon Bhima Community Clinic", type: "Clinic", latitude: 18.6414, longitude: 74.0815, address: "Gram Panchayat Road, Koregaon Bhima, Pune 412216", phone: "+91 98451 23098", services: ["General Physician", "Vaccinations"], distance: 0.1 },
        { name: "Rural Sub-District Hospital, Shikrapur", type: "Hospital", latitude: 18.6811, longitude: 74.1165, address: "Ch चौक, Shikrapur, Pune District, Maharashtra 412208", phone: "+91 2137 286200", services: ["24/7 Emergency", "Pharmacy", "X-Ray"], distance: 5.4 },
        { name: "Gramin Swasthya Medical & Pharmacy", type: "Pharmacy", latitude: 18.6830, longitude: 74.1190, address: "Market Yard Road, Shikrapur, Maharashtra 412208", phone: "+91 88776 65544", services: ["Generic Medicines"], distance: 5.7 }
      ];

      let filtered = mockList;
      if (filterType) {
        filtered = mockList.filter(f => f.type.toLowerCase().includes(filterType.toLowerCase()));
      }
      setFacilities(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const seedFacilitiesData = async () => {
    setIsLoading(true);
    try {
      await fetch(`${apiBaseUrl}/facilities/seed`, { method: 'POST' });
      await fetchFacilities();
    } catch (err) {
      console.warn("Seeding endpoint offline.");
      await fetchFacilities();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [coordinates, filterType]);

  const handleFacilityClick = (fac) => {
    setMapCenter([fac.latitude, fac.longitude]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-emerald-600" />
            <span>{labels.title}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">{labels.sub}</p>
        </div>

        {/* Database Seeder Button */}
        <button
          onClick={seedFacilitiesData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 rounded-xl transition text-xs cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{labels.seedBtn}</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-16rem)] min-h-[500px]">
        
        {/* Sidebar Filters & List */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
          
          {/* Facility Filter Tabs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterType('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterType === '' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              {labels.filterAll}
            </button>
            <button
              onClick={() => setFilterType('Government')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterType === 'Government' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              {labels.filterGov}
            </button>
            <button
              onClick={() => setFilterType('Hospital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterType === 'Hospital' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              {labels.filterHosp}
            </button>
            <button
              onClick={() => setFilterType('Clinic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterType === 'Clinic' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              {labels.filterClin}
            </button>
            <button
              onClick={() => setFilterType('Pharmacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                filterType === 'Pharmacy' ? 'bg-emerald-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100'
              }`}
            >
              {labels.filterPhar}
            </button>
          </div>

          {/* Location Cards Scroll list */}
          <div className="flex-1 space-y-3 pr-1">
            {isLoading ? (
              <div className="text-center py-10 font-bold text-slate-400">Loading centers...</div>
            ) : facilities.length > 0 ? (
              facilities.map((fac, idx) => (
                <div
                  key={idx}
                  onClick={() => handleFacilityClick(fac)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-3"
                >
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{fac.name}</h3>
                    <span className="inline-block text-[9px] bg-slate-100 font-bold text-slate-500 px-2 py-0.5 rounded-md mt-1 border border-slate-200">
                      {fac.type}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed">{fac.address}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      🚗 {fac.distance} km
                    </span>
                    
                    {fac.phone && (
                      <a
                        href={`tel:${fac.phone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs leading-relaxed text-center">
                {labels.noLoc}
              </div>
            )}
          </div>

        </div>

        {/* Map Panel */}
        <div className="lg:col-span-8 bg-slate-100 border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative min-h-[400px]">
          
          <MapContainer
            center={mapCenter}
            zoom={13}
            className="w-full h-full"
          >
            <ChangeView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Coordinate Marker (Yellow pin) */}
            <Marker 
              position={[coordinates.lat, coordinates.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })}
            >
              <Popup>
                <div className="font-bold text-xs text-slate-800">📍 You Are Here</div>
              </Popup>
            </Marker>

            {/* Facility Markers */}
            {facilities.map((fac, idx) => (
              <Marker
                key={idx}
                position={[fac.latitude, fac.longitude]}
              >
                <Popup>
                  <div className="space-y-1 p-0.5">
                    <h4 className="font-bold text-xs text-emerald-800 leading-snug">{fac.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{fac.address}</p>
                    <div className="text-[10px] flex items-center justify-between pt-1 font-bold">
                      <span className="text-emerald-700">{fac.distance} km away</span>
                      {fac.phone && <a href={`tel:${fac.phone}`} className="text-sky-600 underline">Call Center</a>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

        </div>

      </div>
    </div>
  );
}
