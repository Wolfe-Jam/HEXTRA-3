// Sort by index (1-63 default order)
export const sortByIndex = (colors) => {
  return [...colors].slice(0, 63); // Ensure we only have 63 colors
};

// Sort alphabetically by name
export const sortByName = (colors) => {
  return [...new Set([...colors])] // Remove any duplicates
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 63); // Ensure we only have 63 colors
};

// Sort by color family
export const sortByFamily = (colors) => {
  const familyOrder = [
    'neutral',
    'grey',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'pink',
    'brown'
  ];

  return [...new Set([...colors])] // Remove any duplicates
    .sort((a, b) => {
      const familyA = familyOrder.indexOf(a.family);
      const familyB = familyOrder.indexOf(b.family);
      if (familyA === familyB) {
        return a.name.localeCompare(b.name);
      }
      return familyA - familyB;
    })
    .slice(0, 63); // Ensure we only have 63 colors
};

// Sort by popularity (Top 10 first, then alphabetical)
export const sortByPopularity = (colors) => {
  const topColors = [
    'Black',
    'White',
    'Navy',
    'Dark Heather Grey',
    'Military Green',
    'Sand',
    'Royal',
    'Red',
    'Daisy',
    'Ice Grey'
  ];

  return [...new Set([...colors])] // Remove any duplicates
    .sort((a, b) => {
      const indexA = topColors.indexOf(a.name);
      const indexB = topColors.indexOf(b.name);
      
      // If both colors are in top 10
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      }
      // If only a is in top 10
      if (indexA >= 0) {
        return -1;
      }
      // If only b is in top 10
      if (indexB >= 0) {
        return 1;
      }
      // If neither is in top 10, sort alphabetically
      return a.name.localeCompare(b.name);
    })
    .slice(0, 63); // Ensure we only have 63 colors
};
