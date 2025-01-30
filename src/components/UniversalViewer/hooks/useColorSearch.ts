import { useState, useMemo } from 'react';
import { CoreColorMetadata, ColorFamily } from '../types';
import { GILDAN_64 } from '../../../data/catalogs/gildan64';
import { hexToRgb, findNearestColors } from '../../../utils/colorTheory';

type SearchFilters = {
  family?: ColorFamily;
  isHeather?: boolean;
  isAntique?: boolean;
};

interface ColorSearchResult {
  color: CoreColorMetadata;
  distance: number;
}

export const useColorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const searchResults = useMemo(() => {
    let results = [...GILDAN_64];

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(color => {
        const nameMatch = color.name ? color.name.toLowerCase().includes(term) : false;
        const hexMatch = color.hex.toLowerCase().includes(term);
        const familyMatch = color.family ? color.family.toLowerCase().includes(term) : false;
        const tagMatch = color.tags ? color.tags.some(tag => tag.toLowerCase().includes(term)) : false;
        return nameMatch || hexMatch || familyMatch || tagMatch;
      });
    }

    // Apply filters
    if (filters.family) {
      results = results.filter(color => color.family === filters.family);
    }
    if (filters.isHeather) {
      results = results.filter(color => color.tags?.includes('heather'));
    }
    if (filters.isAntique) {
      results = results.filter(color => color.tags?.includes('antique'));
    }

    return results;
  }, [searchTerm, filters]);

  // Get unique families for filtering
  const availableFamilies = useMemo(() => 
    Array.from(new Set(GILDAN_64.map(color => color.family).filter(Boolean))) as ColorFamily[],
    []
  );

  const findSimilarColors = (targetHex: string): CoreColorMetadata[] => {
    const targetRgb = hexToRgb(targetHex);
    if (!targetRgb) return [];

    const rgbColors = GILDAN_64.map(color => {
      const rgb = hexToRgb(color.hex);
      return rgb ? { color, rgb } : null;
    }).filter((item): item is { color: CoreColorMetadata; rgb: { r: number; g: number; b: number } } => item !== null);

    const distances = findNearestColors(
      targetRgb,
      rgbColors.map(item => item.rgb)
    );

    return distances
      .slice(0, 3)
      .map(distance => {
        const matchingColor = rgbColors.find(item => 
          item.rgb.r === distance.color.r &&
          item.rgb.g === distance.color.g &&
          item.rgb.b === distance.color.b
        );
        return matchingColor ? matchingColor.color : GILDAN_64[0];
      });
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    searchResults,
    availableFamilies,
    totalResults: searchResults.length,
    findSimilarColors
  };
};
