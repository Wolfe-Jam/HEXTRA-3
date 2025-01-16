# IconTextField Component

A styled text input component that supports both start and end icons, with consistent theming and optional reset functionality.

## Visual Specifications

### Dimensions & Spacing
- Height: 48px
- Font: Inter, 0.875rem (14px)
- Icon Sizes:
  - Start Icon: 20px
  - Reset Icon: 22px
- Padding: Follows MUI TextField defaults

### Colors
- Background: var(--input-bg)
- Text: var(--text-primary)
- Border: var(--border-color)
- Icons: var(--text-secondary)
- Hover Border: var(--border-hover)
- Focus Glow: var(--glow-color) with var(--glow-subtle)

### Interactive States
- Hover: Border color changes
- Focus: Border color changes + subtle glow effect
- Icon Hover: Color changes to glow color + drop shadow

## Usage

Basic usage:
```jsx
import IconTextField from './components/IconTextField';
import { SearchRounded as SearchIcon } from '@mui/icons-material';

<IconTextField
  value={value}
  onChange={handleChange}
  placeholder="Search..."
  startIcon={<SearchIcon />}
/>
```

With reset button:
```jsx
<IconTextField
  value={value}
  onChange={handleChange}
  placeholder="Enter text..."
  hasReset
  onReset={handleReset}
/>
```

Full feature example:
```jsx
<IconTextField
  value={value}
  onChange={handleChange}
  onKeyDown={handleKeyDown}
  placeholder="Enter URL"
  startIcon={<LinkIcon />}
  hasReset
  onReset={handleReset}
  sx={{ width: '300px' }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Input value |
| onChange | function | required | Change handler |
| onKeyDown | function | - | Key down handler |
| placeholder | string | - | Input placeholder |
| sx | object | {} | Additional styles |
| startIcon | element | - | Icon to show at start |
| hasReset | boolean | false | Show reset button |
| onReset | function | - | Reset handler |
| InputProps | object | {} | Additional MUI InputProps |

## Common Use Cases

1. **URL Input**
   ```jsx
   <IconTextField
     startIcon={<LinkIcon />}
     hasReset
     placeholder="Enter URL"
   />
   ```

2. **Search Box**
   ```jsx
   <IconTextField
     startIcon={<SearchIcon />}
     hasReset
     placeholder="Search..."
   />
   ```

3. **HEX Color Input**
   ```jsx
   <IconTextField
     hasReset
     placeholder="Enter HEX"
     sx={{ width: '200px' }}
   />
   ```

## Best Practices

1. **Icon Selection**
   - Use rounded variants of icons for consistency
   - Start icons should be relevant to input type
   - Keep reset icon for inputs that benefit from quick clearing

2. **Width**
   - Use fixed width for specific inputs (e.g., HEX: 200px)
   - Use flex: 1 for inputs that should expand
   - Consider mobile responsiveness

3. **Validation**
   - Add error states through standard MUI error prop
   - Consider adding helper text for validation messages

4. **Accessibility**
   - Include meaningful placeholder text
   - Consider adding aria-label when needed
   - Ensure keyboard navigation works properly
