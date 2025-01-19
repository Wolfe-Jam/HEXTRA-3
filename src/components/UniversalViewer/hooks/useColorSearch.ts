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
      results = results.filter(color => 
        color.name.toLowerCase().includes(term) ||
        color.hex.toLowerCase().includes(term) ||
        color.family?.toLowerCase().includes(term) ||
        color.tags?.some(tag => tag.toLowerCase().includes(term))
      );
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
    Array.from(new Set(GILDAN_64.map(color => color.family))),
    []
  );

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    searchResults,
    availableFamilies,
    totalColors: GILDAN_64.length,
    // Helper functions
    getColorsByFamily,
    getHeatherColors,
    getAntiqueColors
  };
};

// Usage example:
/*
const ColorSearch = () => {
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    searchResults,
    availableFamilies
  } = useColorSearch();

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search colors..."
      />
      
      <select
        value={filters.family || ''}
        onChange={(e) => setFilters({ ...filters, family: e.target.value as ColorFamily })}
      >
        <option value="">All Families</option>
        {availableFamilies.map(family => (
          <option key={family} value={family}>{family}</option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={filters.isHeather || false}
          onChange={(e) => setFilters({ ...filters, isHeather: e.target.checked })}
        />
        Heather Only
      </label>

      <div className="results">
        {searchResults.map(color => (
          <div key={color.hex + color.name}>
            {color.name} - {color.hex}
          </div>
        ))}
      </div>
    </div>
  );
};
*/
