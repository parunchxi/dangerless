import { API_CONFIG, MAP_CONFIG } from '../constants';
import type { NominatimResult, MapError } from '@/types/map';

export class GeocodingService {
  private static instance: GeocodingService;

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async geocode(query: string, limit = MAP_CONFIG.SEARCH_LIMIT): Promise<NominatimResult[]> {
    if (!query.trim()) {
      throw this.createError('Query cannot be empty', 'EMPTY_QUERY', 'search');
    }

    const url = `${API_CONFIG.GEOCODING_ENDPOINT}?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(limit))}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw this.createError(
          `API request failed: ${response.status}`,
          'API_ERROR',
          'api'
        );
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw this.createError(
          'Invalid response format',
          'INVALID_RESPONSE',
          'api'
        );
      }

      const results = this.filterResults(data as NominatimResult[]);
      
      if (results.length === 0) {
        throw this.createError(
          'No suitable results found',
          'NO_RESULTS',
          'search'
        );
      }

      return results;
    } catch (error) {
      if (error instanceof Error && 'type' in error) {
        throw error; // Re-throw our custom errors
      }
      
      console.error('Geocoding error:', error);
      throw this.createError(
        'Failed to search location',
        'NETWORK_ERROR',
        'api'
      );
    }
  }

  private filterResults(results: NominatimResult[]): NominatimResult[] {
    return results.filter((result) => {
      if (!result.address) return false;

        // Prefer results with geojson data and without quarter subdivision
      if (
        result.geojson &&
        result.geojson.coordinates.length == 1 &&
        !result.address.quarter
      ) {
        return true;
      }


      return false;
    });
  }

  private createError(message: string, code: string, type: MapError['type']): MapError {
    return {
      message,
      code,
      type,
    };
  }
}

export const geocodingService = GeocodingService.getInstance();