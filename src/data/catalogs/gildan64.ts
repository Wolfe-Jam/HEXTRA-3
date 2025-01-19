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

// Base catalog data
export const GILDAN_64: CoreColorMetadata[] = [
  { hex: '#FFFFFF', name: 'White', family: ColorFamily.NEUTRAL },
  { hex: '#97999B', name: 'Sport Grey', family: ColorFamily.GREY },
  { hex: '#D7D2CB', name: 'Ice Grey', family: ColorFamily.GREY },
  { hex: '#7E7F74', name: 'Heather Military Green', family: ColorFamily.GREEN, tags: ['heather'] },
  { hex: '#75787B', name: 'Graphite Heather', family: ColorFamily.GREY, tags: ['heather'] },
  { hex: '#425563', name: 'Dark Heather', family: ColorFamily.GREY, tags: ['heather'] },
  { hex: '#4D6995', name: 'Heather Indigo', family: ColorFamily.BLUE, tags: ['heather'] },
  { hex: '#333F48', name: 'Heather Navy', family: ColorFamily.BLUE, tags: ['heather'] },
  { hex: '#66676C', name: 'Charcoal', family: ColorFamily.GREY },
  { hex: '#25282A', name: 'Black', family: ColorFamily.NEUTRAL },
  { hex: '#971B2F', name: 'Antique Cherry Red', family: ColorFamily.RED, tags: ['antique'] },
  { hex: '#AC2B37', name: 'Cherry Red', family: ColorFamily.RED },
  { hex: '#BF0D3E', name: 'Heather Red', family: ColorFamily.RED, tags: ['heather'] },
  { hex: '#D50032', name: 'Red', family: ColorFamily.RED },
  { hex: '#382F2D', name: 'Dark Chocolate', family: ColorFamily.BROWN },
  { hex: '#672E45', name: 'Heather Maroon', family: ColorFamily.RED, tags: ['heather'] },
  { hex: '#5B2B42', name: 'Maroon', family: ColorFamily.RED },
  { hex: '#8A1538', name: 'Cardinal Red', family: ColorFamily.RED },
  { hex: '#9B2743', name: 'Heather Cardinal', family: ColorFamily.RED, tags: ['heather'] },
  { hex: '#E7CEB5', name: 'Natural', family: ColorFamily.NEUTRAL },
  { hex: '#F4633A', name: 'Orange', family: ColorFamily.ORANGE },
  { hex: '#EEAD1A', name: 'Gold', family: ColorFamily.YELLOW },
  { hex: '#FED141', name: 'Daisy', family: ColorFamily.YELLOW },
  { hex: '#F0EC74', name: 'Cornsilk', family: ColorFamily.YELLOW },
  { hex: '#A9C47F', name: 'Pistachio', family: ColorFamily.GREEN },
  { hex: '#89A84F', name: 'Kiwi', family: ColorFamily.GREEN },
  { hex: '#92BF55', name: 'Lime', family: ColorFamily.GREEN },
  { hex: '#A0CFA8', name: 'Mint Green', family: ColorFamily.GREEN },
  { hex: '#00A74A', name: 'Irish Green', family: ColorFamily.GREEN },
  { hex: '#00805E', name: 'Kelly Green', family: ColorFamily.GREEN },
  { hex: '#5E7461', name: 'Military Green', family: ColorFamily.GREEN },
  { hex: '#273B33', name: 'Forest Green', family: ColorFamily.GREEN },
  { hex: '#5CAA7F', name: 'Heather Irish Green', family: ColorFamily.GREEN, tags: ['heather'] },
  { hex: '#008E85', name: 'Jade Dome', family: ColorFamily.GREEN },
  { hex: '#00859B', name: 'Tropical Blue', family: ColorFamily.BLUE },
  { hex: '#006A8E', name: 'Antique Sapphire', family: ColorFamily.BLUE, tags: ['antique'] },
  { hex: '#0076A8', name: 'Sapphire', family: ColorFamily.BLUE },
  { hex: '#0076A8', name: 'Heather Sapphire', family: ColorFamily.BLUE, tags: ['heather'] },
  { hex: '#486D87', name: 'Indigo Blue', family: ColorFamily.BLUE },
  { hex: '#7E93A7', name: 'Stone Blue', family: ColorFamily.BLUE },
  { hex: '#464E7E', name: 'Metro Blue', family: ColorFamily.BLUE },
  { hex: '#A4C8E1', name: 'Light Blue', family: ColorFamily.BLUE },
  { hex: '#7BA4DB', name: 'Carolina Blue', family: ColorFamily.BLUE },
  { hex: '#0093B2', name: 'Heather Galapagos Blue', family: ColorFamily.BLUE, tags: ['heather'] },
  { hex: '#3975B7', name: 'Iris', family: ColorFamily.BLUE },
  { hex: '#307FE2', name: 'Heather Royal', family: ColorFamily.BLUE, tags: ['heather'] },
  { hex: '#307FE2', name: 'Royal', family: ColorFamily.BLUE },
  { hex: '#263147', name: 'Navy', family: ColorFamily.BLUE },
  { hex: '#948794', name: 'Paragon', family: ColorFamily.PURPLE },
  { hex: '#A15A95', name: 'Heather Radiant Orchid', family: ColorFamily.PURPLE, tags: ['heather'] },
  { hex: '#614B79', name: 'Heather Purple', family: ColorFamily.PURPLE, tags: ['heather'] },
  { hex: '#464E7E', name: 'Purple', family: ColorFamily.PURPLE },
  { hex: '#E4C6D4', name: 'Light Pink', family: ColorFamily.PINK },
  { hex: '#994878', name: 'Heather Berry', family: ColorFamily.PINK, tags: ['heather'] },
  { hex: '#AA0061', name: 'Antique Heliconia', family: ColorFamily.PINK, tags: ['antique'] },
  { hex: '#DD74A1', name: 'Azalea', family: ColorFamily.PINK },
  { hex: '#DB3E79', name: 'Heliconia', family: ColorFamily.PINK },
  { hex: '#E24585', name: 'Heather Heliconia', family: ColorFamily.PINK, tags: ['heather'] },
  { hex: '#FF8D6D', name: 'Heather Orange', family: ColorFamily.ORANGE, tags: ['heather'] },
  { hex: '#FB637E', name: 'Coral Silk', family: ColorFamily.PINK }
];

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

// Helper to get colors by family
export const getColorsByFamily = (family: ColorFamily): CoreColorMetadata[] => 
  GILDAN_64.filter(color => color.family === family);

// Helper to get heather variants
export const getHeatherColors = (): CoreColorMetadata[] =>
  GILDAN_64.filter(color => color.tags?.includes('heather'));

// Helper to get antique variants
export const getAntiqueColors = (): CoreColorMetadata[] =>
  GILDAN_64.filter(color => color.tags?.includes('antique'));

// Helper to find similar colors
export const findSimilarColors = (hex: string): CoreColorMetadata[] => {
  // TODO: Implement color similarity algorithm
  return [];
};

export default GILDAN_64;
