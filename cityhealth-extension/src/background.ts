import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hozjbchgaucbfqumrhhs.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvempiY2hnYXVjYmZxdW1yaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjM4OTAsImV4cCI6MjA4NzgzOTg5MH0.Sf-TEIxtDfz_liFlPfiP1robvSGpJTK24mcqAGHypwI';

const APP_URL = 'https://id-preview--8d2e14ae-9780-495c-92ff-a09ea8668d86.lovable.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userBloodGroup: string | null = null;

interface NotificationPreferences {
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  maxPerHour: number;
  urgentOnly: boolean;
}

let prefs: NotificationPreferences = {
  soundEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  maxPerHour: 0,
  urgentOnly: false,
};

let notificationsThisHour = 0;
let lastHourReset = Date.now();

function loadPrefs() {
  chrome.storage.local.get(['notificationPrefs'], (result) => {
    if (result.notificationPrefs) prefs = { ...prefs, ...result.notificationPrefs };
  });
}

function isInQuietHours(): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const { quietHoursStart: start, quietHoursEnd: end } = prefs;
  if (start <= end) return hhmm >= start && hhmm < end;
  return hhmm >= start || hhmm < end; // overnight
}

function canNotify(): boolean {
  if (isInQuietHours()) return false;
  if (prefs.maxPerHour > 0) {
    if (Date.now() - lastHourReset > 3600000) {
      notificationsThisHour = 0;
      lastHourReset = Date.now();
    }
    if (notificationsThisHour >= prefs.maxPerHour) return false;
  }
  return true;
}

// Read blood group from storage
function loadBloodGroup() {
  chrome.storage.local.get(['bloodGroup'], (result) => {
    userBloodGroup = result.bloodGroup || null;
    console.log('[CityHealth BG] Blood group loaded:', userBloodGroup);
  });
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.bloodGroup) {
      userBloodGroup = changes.bloodGroup.newValue || null;
    }
    if (changes.notificationPrefs) {
      prefs = { ...prefs, ...changes.notificationPrefs.newValue };
    }
  }
});

// Subscribe to blood emergencies via realtime
function subscribeToEmergencies() {
  supabase
    .channel('ext-blood-emergencies')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'blood_emergencies',
        filter: 'status=eq.active',
      },
      (payload) => {
        const emergency = payload.new as any;
        if (!userBloodGroup) return;
        if (prefs.urgentOnly && emergency.urgency_level !== 'critical') return;
        if (emergency.blood_type_needed !== userBloodGroup) return;
        if (!canNotify()) return;

        notificationsThisHour++;
        chrome.notifications.create(`blood-emergency-${emergency.id}`, {
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: `🚨 Urgence Sang ${emergency.blood_type_needed}`,
          message: `Urgence Sang ${emergency.blood_type_needed} : Besoin vital détecté. Cliquez pour aider.`,
          priority: 2,
          requireInteraction: true,
          silent: !prefs.soundEnabled,
        });
      }
    )
    .subscribe();
}

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('blood-emergency-')) {
    chrome.tabs.create({ url: `${APP_URL}/don-de-sang` });
    chrome.notifications.clear(notificationId);
  }
});

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  loadBloodGroup();
  loadPrefs();
  subscribeToEmergencies();
});

chrome.runtime.onStartup.addListener(() => {
  loadBloodGroup();
  loadPrefs();
  subscribeToEmergencies();
});

loadBloodGroup();
loadPrefs();
subscribeToEmergencies();
