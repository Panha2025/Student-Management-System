import { FALLBACK_COUNTRIES } from '../data/studentOptions.js';
import { requestJson } from './http.js';

export async function fetchCountries() {
  try {
    const data = await requestJson('https://restcountries.com/v3.1/all?fields=name', { timeout: 8000 });
    if (!Array.isArray(data)) throw new Error('Invalid country collection');
    const countries = data.map((country) => country?.name?.common)
      .filter((name) => typeof name === 'string' && name.trim());
    if (!countries.length) throw new Error('No country names returned');
    return [...new Set(countries)].sort((first, second) => first.localeCompare(second));
  } catch {
    return [...FALLBACK_COUNTRIES];
  }
}
