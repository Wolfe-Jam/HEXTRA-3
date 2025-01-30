import { useState, useMemo } from 'react';
import { CoreColorMetadata, ColorFamily } from '../types';
import { GILDAN_64, getColorsByFamily, getHeatherColors, getAntiqueColors } from '../../../data/catalogs/gildan64';

type SearchFilters = {
  family?: ColorFamily;
  isHeather?: boolean;
  isAntique?: boolean;
};

export const useColorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const searchResults = useMemo(() => {
    let results = [...GILDAN_64];

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(color => {
        const nameMatch = color.name.toLowerCase().includes(term);
        const hexMatch = color.hex.toLowerCase().includes(term);
        const familyMatch = color.family && color.family.toLowerCase().includes(term);
        const tagMatch = color.tags && color.tags.some(tag => tag.toLowerCase().includes(term));
        return nameMatch || hexMatch || familyMatch || tagMatch;
      });
    }

    // Apply filters
    if (filters.family) {
      results = results.filter(color => color.family === filters.family);
    }
    if (filters.isHeather) {
      results = results.filter(color => color.tags && color.tags.includes('heather'));
    }
    if (filters.isAntique) {
      results = results.filter(color => color.tags && color.tags.includes('antique'));
    }

    return results;
  }, [searchTerm, filters]);

  // Get unique families for filtering
  const availableFamilies = useMemo(() => 
    Array.from(new Set(GILDAN_64.map(color => color.family).filter(Boolean))),
    []
  );

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    searchResults,
    availableFamilies,
    totalResults: searchResults.length
  };
};
