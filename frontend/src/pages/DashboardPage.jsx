import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Trash2, Bell, Heart, User, Clipboard, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, login, register, logout, updateProfile, token, apiBaseUrl, language } = useAuth();
  
  // Auth Form State
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reminders lists
  const [reminders, setReminders] = useState([]);
  const [remType, setRemType] = useState('medicine');
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('08:00 AM');
  const [remDosage, setRemDosage] = useState('');
  const [remDate, setRemDate] = useState('');

  // Emergency Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  // Localization labels
  const labels = {
    en: {
      remindersHeader: "Active Health Alarms & Reminders",
      addReminder: "Add Reminder",
      meds: "Medicine",
      appoint: "Appointment",
      vaccin: "Vaccination",
      profileHeader: "Medical Profile Card",
      contactsHeader: "Emergency SOS Contacts",
      addContact: "Add Emergency Contact",
      savedReports: "Saved Health Reports"
    },
    hi: {
      remindersHeader: "सक्रिय स्वास्थ्य अलार्म और अनुस्मारक",
      addReminder: "अनुस्मारक जोड़ें",
      meds: "दवा",
      appoint: "अपॉइंटमेंट",
      vaccin: "टीकाकरण",
      profileHeader: "मेडिकल प्रोफाइल कार्ड",
      contactsHeader: "आपातकालीन SOS संपर्क",
      addContact: "आपातकालीन संपर्क जोड़ें",
      savedReports: "सहेजे गए स्वास्थ्य रिपोर्ट"
    },
    mr: {
      remindersHeader: "सक्रिय आरोग्य अलार्म आणि रिमाइंडर",
      addReminder: "रिमाइंडर जोडा",
      meds: "औषध",
      appoint: "अपॉइंटमेंट",
      vaccin: "लसीकरण",
      profileHeader: "वैद्यकीय प्रोफाइल कार्ड",
      contactsHeader: "आपातकालीन SOS संपर्क",
      addContact: "आपातकालीन संपर्क जोडा",
      savedReports: "जतन केलेले आरोग्य अहवाल"
    }
  }[language] || labels.en;

  const fetchReminders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (e) {
      console.warn("Server reminders fetch failed, utilizing localStorage backup.");
      const cached = localStorage.getItem('local_reminders') || '[]';
      setReminders(JSON.parse(cached));
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    if (isLoginView) {
      const res = await login(username, password);
      if (!res.success) setAuthError(res.error || 'Login credentials incorrect');
    } else {
      const res = await register({
        username,
        password,
        name,
        age: parseInt(age),
        location: locationStr,
        primaryLanguage: language,
        medicalHistory: { allergies: [], medications: [], conditions: [] },
        emergencyContacts: []
      });
      if (!res.success) setAuthError(res.error || 'Registration failed');
    }
    setIsSubmitting(false);
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    const payload = {
      type: remType,
      title: remTitle,
      time: remTime,
      date: remDate || '',
      dosage: remDosage || ''
    };

    try {
      const res = await fetch(`${apiBaseUrl}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setRemTitle('');
        setRemDosage('');
        setRemDate('');
        fetchReminders();
      } else {
        throw new Error();
      }
    } catch (err) {
      // Local fallback
      const mockId = 'rem_lcl_' + Math.random().toString(36).substr(2, 9);
      const newRem = {
        _id: mockId,
        userId: user?.id || 'mock',
        type: remType,
        title: remTitle,
        time: remTime,
        date: remDate || '',
        dosage: remDosage || '',
        active: true,
        createdAt: new Date()
      };

      const updated = [newRem, ...reminders];
      setReminders(updated);
      localStorage.setItem('local_reminders', JSON.stringify(updated));
      setRemTitle('');
      setRemDosage('');
      setRemDate('');
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/reminders/${id}/deactivate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReminders();
      } else {
        throw new Error();
      }
    } catch (err) {
      // Local fallback deactivation
      const updated = reminders.filter(r => r._id !== id);
      setReminders(updated);
      localStorage.setItem('local_reminders', JSON.stringify(updated));
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const newContact = {
      name: contactName,
      phone: contactPhone,
      relation: contactRelation || 'Family Member'
    };

    const currentContacts = user.emergencyContacts || [];
    const updatedContacts = [...currentContacts, newContact];

    const result = await updateProfile({
      emergencyContacts: updatedContacts
    });

    if (result.success) {
      setContactName('');
      setContactPhone('');
      setContactRelation('');
    }
  };

  const handleDeleteContact = async (idx) => {
    const currentContacts = user.emergencyContacts || [];
    const updatedContacts = currentContacts.filter((_, i) => i !== idx);

    await updateProfile({
      emergencyContacts: updatedContacts
    });
  };

  // 1. Auth Forms rendering if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6">
          <div className="text-center">
            <Heart className="h-10 w-10 text-emerald-600 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-800">
              {isLoginView ? "Welcome to SwasthyaAI" : "Create Health Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Create an account to manage medication alarms, save clinical triages, and configure emergency SOS circles.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-semibold">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {!isLoginView && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ram Patil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 62"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">District / City</label>
                    <input
                      type="text"
                      required
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      placeholder="e.g. Pune Rural"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile / Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-md cursor-pointer text-sm"
            >
              {isSubmitting ? "Processing..." : isLoginView ? "Log In" : "Sign Up"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. Active Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 rounded-3xl shadow-md mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Patient Dashboard</span>
          <h1 className="text-3xl font-extrabold">{user.name}</h1>
          <p className="text-xs text-emerald-100/90 mt-1">Age: {user.age} | Location: {user.location || 'Pune District'} | Lang: {user.primaryLanguage.toUpperCase()}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Reminders scheduler */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Reminder Creator & list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="h-5 w-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 text-base">{labels.remindersHeader}</h2>
            </div>

            {/* Reminder Builder Form */}
            <form onSubmit={handleAddReminder} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                <select
                  value={remType}
                  onChange={(e) => setRemType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="medicine">{labels.meds}</option>
                  <option value="appointment">{labels.appoint}</option>
                  <option value="vaccination">{labels.vaccin}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reminder Name</label>
                <input
                  type="text"
                  required
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    value={remDosage}
                    onChange={(e) => setRemDosage(e.target.value)}
                    placeholder="1 pill"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-xs h-9"
              >
                <Plus className="h-4 w-4" />
                <span>{labels.addReminder}</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {reminders.length > 0 ? (
                reminders.map((rem) => (
                  <div
                    key={rem._id}
                    className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs">{rem.title}</span>
                        <div className="text-[10px] text-slate-400 font-semibold space-x-2">
                          <span className="uppercase text-emerald-600 font-bold">{rem.type}</span>
                          <span>⏰ {rem.time}</span>
                          {rem.dosage && <span>💊 {rem.dosage}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(rem._id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">No active reminders configured.</div>
              )}
            </div>
          </div>

          {/* Saved Reports Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clipboard className="h-5 w-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 text-base">{labels.savedReports}</h2>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Symptom check: headache, fever (June 2026)</span>
                Triage guidance: Urgency classified as "Doctor consultation recommended". Suggested general wellness instructions: Hydrate, do not self-medicate, and consult Wagholi Government Sub-Center.
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Medical History & Emergency Contacts */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Medical profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 text-sm">{labels.profileHeader}</h2>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Documented Allergies</span>
                <div className="flex flex-wrap gap-1">
                  {user.medicalHistory?.allergies?.length > 0 ? (
                    user.medicalHistory.allergies.map((all, i) => (
                      <span key={i} className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-bold">{all}</span>
                    ))
                  ) : (
                    <span className="text-slate-400">None documented</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Active Medications</span>
                <div className="flex flex-wrap gap-1">
                  {user.medicalHistory?.medications?.length > 0 ? (
                    user.medicalHistory.medications.map((med, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">{med}</span>
                    ))
                  ) : (
                    <span className="text-slate-400">None documented</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency SOS contacts manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="h-5 w-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 text-sm">{labels.contactsHeader}</h2>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {user.emergencyContacts?.length > 0 ? (
                user.emergencyContacts.map((contact, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{contact.name} ({contact.relation})</span>
                      <span className="text-slate-400 font-mono text-[10px]">{contact.phone}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(i)}
                      className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 italic text-[11px]">No contacts configured. Default helplines will be notified.</div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleAddContact} className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">{labels.addContact}</span>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Mobile"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="Relation (Son/Brother)"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-[11px] cursor-pointer"
              >
                Add Contact
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
