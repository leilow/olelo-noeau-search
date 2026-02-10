/**
 * Moon phase and weather for Daily Pull / Random phrase.
 * Weather: Open-Meteo (free, no key). Moon: improved local calculation or optional API.
 */

const HONOLULU_LAT = 21.3069;
const HONOLULU_LON = -157.8583;

// WMO weather codes → short description
const WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Snow',
  77: 'Snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

export async function getWeather(): Promise<string> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${HONOLULU_LAT}&longitude=${HONOLULU_LON}&current=temperature_2m,weather_code`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // 15 min
    if (!res.ok) return fallbackWeather();
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code ?? 0;
    const desc = WEATHER_CODES[code] ?? 'Clear';
    const tempF = temp != null ? Math.round((temp * 9) / 5 + 32) : null;
    return tempF != null ? `${desc}, ${tempF}°F` : desc;
  } catch {
    return fallbackWeather();
  }
}

function fallbackWeather(): string {
  return 'Sunny, 78°F';
}

// Known new moon (UTC) for calculation; cycle ~29.53 days
const NEW_MOON_REF = new Date('2024-01-11T11:57:00Z').getTime();
const LUNAR_MS = 29.530588 * 24 * 60 * 60 * 1000;

const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

/** Moon phase from lunar cycle (no API key). Optional MOON_API_KEY can be used for a future API. */
export async function getMoonPhase(): Promise<string> {
  const now = Date.now();
  const daysSince = (now - NEW_MOON_REF) / (24 * 60 * 60 * 1000);
  const cyclePos = ((daysSince % 29.530588) + 29.530588) % 29.530588;
  const index = Math.floor((cyclePos / 29.530588) * 8) % 8;
  return MOON_PHASES[index];
}
