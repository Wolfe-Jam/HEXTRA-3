// Base catalog data
const GILDAN_64 = [
  // Neutrals & Whites
  { hex: '#FFFFFF', name: 'White', family: 'neutral' },
  { hex: '#F5F5F5', name: 'Ash Grey', family: 'neutral' },
  { hex: '#EDECEA', name: 'Antique White', family: 'neutral', tags: ['antique'] },
  { hex: '#25282A', name: 'Black', family: 'neutral' },
  { hex: '#CABFAD', name: 'Sand', family: 'neutral' },
  { hex: '#BFB3A2', name: 'Natural', family: 'neutral' },
  { hex: '#D4C8B9', name: 'Prairie Dust', family: 'neutral' },
  
  // Greys
  { hex: '#97999B', name: 'Sport Grey', family: 'grey' },
  { hex: '#D7D2CB', name: 'Ice Grey', family: 'grey' },
  { hex: '#75787B', name: 'Graphite Heather', family: 'grey', tags: ['heather'] },
  { hex: '#425563', name: 'Dark Heather', family: 'grey', tags: ['heather'] },
  { hex: '#66676C', name: 'Charcoal', family: 'grey' },
  { hex: '#8B8B8B', name: 'Gravel', family: 'grey' },
  { hex: '#A6A6A6', name: 'RS Sport Grey', family: 'grey' },
  
  // Reds
  { hex: '#D50032', name: 'Red', family: 'red' },
  { hex: '#BC243C', name: 'Cardinal Red', family: 'red' },
  { hex: '#D50149', name: 'Cherry Red', family: 'red' },
  { hex: '#B91C4E', name: 'Antique Cherry Red', family: 'red', tags: ['antique'] },
  { hex: '#A94D64', name: 'Heather Cardinal', family: 'red', tags: ['heather'] },
  { hex: '#FF4D6B', name: 'Neon Red', family: 'red', tags: ['neon'] },
  { hex: '#C41E3A', name: 'Cardinal', family: 'red' },
  { hex: '#D73B3E', name: 'Rusty Red', family: 'red' },
  
  // Oranges
  { hex: '#FF4400', name: 'Orange', family: 'orange' },
  { hex: '#FF6B35', name: 'Safety Orange', family: 'orange', tags: ['safety'] },
  { hex: '#E95C42', name: 'Coral Silk', family: 'orange' },
  { hex: '#D06B53', name: 'Heather Orange', family: 'orange', tags: ['heather'] },
  { hex: '#FF7F50', name: 'Coral', family: 'orange' },
  { hex: '#FF9966', name: 'Sunset', family: 'orange' },
  { hex: '#FFB347', name: 'Tangerine', family: 'orange' },
  
  // Yellows
  { hex: '#D4AF37', name: 'Gold', family: 'yellow' },
  { hex: '#FED141', name: 'Daisy', family: 'yellow' },
  { hex: '#FFD100', name: 'Yellow', family: 'yellow' },
  { hex: '#F7C846', name: 'Vegas Gold', family: 'yellow' },
  { hex: '#FFE5B4', name: 'Cornsilk', family: 'yellow' },
  { hex: '#FFD700', name: 'Safety Yellow', family: 'yellow', tags: ['safety'] },
  { hex: '#FFDB58', name: 'Mustard', family: 'yellow' },
  { hex: '#F0E68C', name: 'Khaki', family: 'yellow' },
  
  // Greens
  { hex: '#00805E', name: 'Kelly Green', family: 'green' },
  { hex: '#006B54', name: 'Forest Green', family: 'green' },
  { hex: '#4B5F54', name: 'Military Green', family: 'green' },
  { hex: '#7E7F74', name: 'Heather Military Green', family: 'green', tags: ['heather'] },
  { hex: '#00A776', name: 'Irish Green', family: 'green' },
  { hex: '#00B388', name: 'Jade Dome', family: 'green' },
  { hex: '#93C6B7', name: 'Mint Green', family: 'green' },
  { hex: '#39FF14', name: 'Neon Green', family: 'green', tags: ['neon'] },
  { hex: '#90EE90', name: 'Light Green', family: 'green' },
  { hex: '#228B22', name: 'Deep Forest', family: 'green' },
  
  // Blues
  { hex: '#224D8F', name: 'Royal', family: 'blue' },
  { hex: '#1B365D', name: 'Navy', family: 'blue' },
  { hex: '#4D6995', name: 'Heather Indigo', family: 'blue', tags: ['heather'] },
  { hex: '#333F48', name: 'Heather Navy', family: 'blue', tags: ['heather'] },
  { hex: '#00A3E0', name: 'Sapphire', family: 'blue' },
  { hex: '#0085CA', name: 'Carolina Blue', family: 'blue' },
  { hex: '#5C8AB1', name: 'Indigo Blue', family: 'blue' },
  { hex: '#A5C6D7', name: 'Light Blue', family: 'blue' },
  { hex: '#1E90FF', name: 'Dodger Blue', family: 'blue' },
  { hex: '#4169E1', name: 'Royal Blue', family: 'blue' },
  { hex: '#00BFFF', name: 'Deep Sky Blue', family: 'blue' },
  
  // Purples
  { hex: '#4B286D', name: 'Purple', family: 'purple' },
  { hex: '#663399', name: 'Dark Purple', family: 'purple' },
  { hex: '#9B4F96', name: 'Lilac', family: 'purple' },
  { hex: '#C1A7D6', name: 'Orchid', family: 'purple' },
  { hex: '#E0B0FF', name: 'Heather Purple', family: 'purple', tags: ['heather'] },
  { hex: '#9370DB', name: 'Medium Purple', family: 'purple' },
  { hex: '#BA55D3', name: 'Medium Orchid', family: 'purple' },
  { hex: '#DDA0DD', name: 'Plum', family: 'purple' },
  
  // Pinks
  { hex: '#E31C79', name: 'Heliconia', family: 'pink' },
  { hex: '#DE3D83', name: 'Azalea', family: 'pink' },
  { hex: '#FFB6C1', name: 'Light Pink', family: 'pink' },
  { hex: '#FFC0CB', name: 'Safety Pink', family: 'pink', tags: ['safety'] },
  { hex: '#FF69B4', name: 'Hot Pink', family: 'pink' },
  { hex: '#FF1493', name: 'Deep Pink', family: 'pink' },
  { hex: '#FF77FF', name: 'Neon Pink', family: 'pink', tags: ['neon'] },
  
  // Browns
  { hex: '#4E3629', name: 'Dark Chocolate', family: 'brown' },
  { hex: '#6E4C3D', name: 'Brown', family: 'brown' },
  { hex: '#8B7355', name: 'Light Brown', family: 'brown' },
  { hex: '#C3A6A0', name: 'Heather Brown', family: 'brown', tags: ['heather'] },
  { hex: '#D2B48C', name: 'Tan', family: 'brown' },
  { hex: '#DEB887', name: 'Burlywood', family: 'brown' },
  { hex: '#A0522D', name: 'Sienna', family: 'brown' }
];

export default GILDAN_64;
