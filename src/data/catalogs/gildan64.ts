import { CoreCatalogMetadata, CoreColorMetadata, RGBColor } from '../../components/UniversalViewer/types';

// Color families for smart grouping
export enum ColorFamily {
  NEUTRAL = 'neutral',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  BROWN = 'brown',
  GREY = 'grey'
}

// Helper to detect color family from name
const detectFamily = (name: string): ColorFamily => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('red') || nameLower.includes('cardinal') || nameLower.includes('cherry')) return ColorFamily.RED;
  if (nameLower.includes('orange') || nameLower.includes('coral')) return ColorFamily.ORANGE;
  if (nameLower.includes('yellow') || nameLower.includes('gold') || nameLower.includes('daisy') || nameLower.includes('cornsilk')) return ColorFamily.YELLOW;
  if (nameLower.includes('green')) return ColorFamily.GREEN;
  if (nameLower.includes('blue') || nameLower.includes('sapphire') || nameLower.includes('navy')) return ColorFamily.BLUE;
  if (nameLower.includes('purple') || nameLower.includes('orchid')) return ColorFamily.PURPLE;
  if (nameLower.includes('pink') || nameLower.includes('heliconia')) return ColorFamily.PINK;
  if (nameLower.includes('brown') || nameLower.includes('chocolate')) return ColorFamily.BROWN;
  if (nameLower.includes('grey') || nameLower.includes('gray') || nameLower.includes('charcoal')) return ColorFamily.GREY;
  
  return ColorFamily.NEUTRAL;
};

// Helper to detect if color is a heather variant
const isHeather = (name: string): boolean => name.toLowerCase().includes('heather');

// Helper to convert hex to RGB
const hexToRgb = (hex: string): RGBColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

// Helper to create color metadata
const createColorMetadata = (hex: string, name: string): CoreColorMetadata => {
  const family = detectFamily(name);
  const tags = isHeather(name) ? ['heather'] : [];
  
  return {
    hex,
    rgb: hexToRgb(hex),
    name,
    family,
    tags
  };
};

// Base catalog data
export const GILDAN_64: CoreColorMetadata[] = [
  createColorMetadata('#FFFFFF', 'White'),
  createColorMetadata('#97999B', 'Sport Grey'),
  createColorMetadata('#D7D2CB', 'Ice Grey'),
  createColorMetadata('#7E7F74', 'Heather Military Green'),
  createColorMetadata('#75787B', 'Graphite Heather'),
  createColorMetadata('#425563', 'Dark Heather'),
  createColorMetadata('#4D6995', 'Heather Indigo'),
  createColorMetadata('#333F48', 'Heather Navy'),
  createColorMetadata('#66676C', 'Charcoal'),
  createColorMetadata('#25282A', 'Black'),
  createColorMetadata('#971B2F', 'Antique Cherry Red'),
  createColorMetadata('#AC2B37', 'Cherry Red'),
  createColorMetadata('#BF0D3E', 'Heather Red'),
  createColorMetadata('#D50032', 'Red'),
  createColorMetadata('#382F2D', 'Dark Chocolate'),
  createColorMetadata('#672E45', 'Heather Maroon'),
  createColorMetadata('#5B2B42', 'Maroon'),
  createColorMetadata('#8A1538', 'Cardinal Red'),
  createColorMetadata('#9B2743', 'Heather Cardinal'),
  createColorMetadata('#E7CEB5', 'Natural'),
  createColorMetadata('#F4633A', 'Orange'),
  createColorMetadata('#EEAD1A', 'Gold'),
  createColorMetadata('#FED141', 'Daisy'),
  createColorMetadata('#F0EC74', 'Cornsilk'),
  createColorMetadata('#A9C47F', 'Pistachio'),
  createColorMetadata('#89A84F', 'Kiwi'),
  createColorMetadata('#92BF55', 'Lime'),
  createColorMetadata('#A0CFA8', 'Mint Green'),
  createColorMetadata('#00A74A', 'Irish Green'),
  createColorMetadata('#00805E', 'Kelly Green'),
  createColorMetadata('#5E7461', 'Military Green'),
  createColorMetadata('#273B33', 'Forest Green'),
  createColorMetadata('#5CAA7F', 'Heather Irish Green'),
  createColorMetadata('#008E85', 'Jade Dome'),
  createColorMetadata('#00859B', 'Tropical Blue'),
  createColorMetadata('#006A8E', 'Antique Sapphire'),
  createColorMetadata('#0076A8', 'Sapphire'),
  createColorMetadata('#0076A8', 'Heather Sapphire'),
  createColorMetadata('#486D87', 'Indigo Blue'),
  createColorMetadata('#7E93A7', 'Stone Blue'),
  createColorMetadata('#464E7E', 'Metro Blue'),
  createColorMetadata('#A4C8E1', 'Light Blue'),
  createColorMetadata('#7BA4DB', 'Carolina Blue'),
  createColorMetadata('#0093B2', 'Heather Galapagos Blue'),
  createColorMetadata('#3975B7', 'Iris'),
  createColorMetadata('#307FE2', 'Heather Royal'),
  createColorMetadata('#307FE2', 'Royal'),
  createColorMetadata('#263147', 'Navy'),
  createColorMetadata('#948794', 'Paragon'),
  createColorMetadata('#A15A95', 'Heather Radiant Orchid'),
  createColorMetadata('#614B79', 'Heather Purple'),
  createColorMetadata('#464E7E', 'Purple'),
  createColorMetadata('#E4C6D4', 'Light Pink'),
  createColorMetadata('#994878', 'Heather Berry'),
  createColorMetadata('#AA0061', 'Antique Heliconia'),
  createColorMetadata('#DD74A1', 'Azalea'),
  createColorMetadata('#DB3E79', 'Heliconia'),
  createColorMetadata('#E24585', 'Heather Heliconia'),
  createColorMetadata('#FF8D6D', 'Heather Orange'),
  createColorMetadata('#FB637E', 'Coral Silk')
];

// Helper functions
export const getColorsByFamily = (family: ColorFamily): CoreColorMetadata[] => {
  return GILDAN_64.filter(color => color.family === family);
};

export const getHeatherColors = (): CoreColorMetadata[] => {
  return GILDAN_64.filter(color => color.tags?.includes('heather'));
};

export const getAntiqueColors = (): CoreColorMetadata[] => {
  return GILDAN_64.filter(color => color.name.toLowerCase().includes('antique'));
};

export const findSimilarColors = (hex: string): CoreColorMetadata[] => {
  const targetRgb = hexToRgb(hex);
  return GILDAN_64
    .map(color => ({
      color,
      distance: Math.sqrt(
        Math.pow(targetRgb.r - hexToRgb(color.hex).r, 2) +
        Math.pow(targetRgb.g - hexToRgb(color.hex).g, 2) +
        Math.pow(targetRgb.b - hexToRgb(color.hex).b, 2)
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(result => result.color);
};

// Create the catalog metadata
export const createGildan64Catalog = (): CoreCatalogMetadata => ({
  id: 'gildan-64-2024',
  type: 'catalog',
  created: new Date(),
  modified: new Date(),
  owner: 'HEXTRA',
  colors: GILDAN_64,
  family: 'Gildan',
  version: '2024.1',
  tags: ['gildan', 'base-catalog', '64-colors']
});

export default GILDAN_64;
