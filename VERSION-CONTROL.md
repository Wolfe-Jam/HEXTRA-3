# HEXTRA-3 Version Control

## Version Numbers (MAJOR.MINOR.PATCH)

### MAJOR Version (X.0.0)
Breaking changes:
- Complete redesigns
- API changes
- Framework updates
Example: `2.0.0` - Migration to React 18

### MINOR Version (1.X.0)
New features:
- New functionality
- Major improvements
Example: `1.2.0` - New color modes

### PATCH Version (1.1.X)
Bug fixes and tweaks:
- Bug fixes
- Small improvements
Example: `1.1.2` - Fix color picker

## Workflow

### 1. Update Version
In `package.json`:
```json
{
  "name": "hextra-3",
  "version": "1.2.1"  // Update this
}
```

### 2. Update CHANGELOG.md
```markdown
## [1.2.1] - 2025-01-15
### Added
- New feature details
### Fixed
- Bug fix details
```

### 3. Commit via GitHub Desktop
- Clear, descriptive title
- Add details in description
- Example: "v1.2.1: Add style guide and mobile optimization"

### 4. Push to Main
- Vercel will auto-deploy
- Check deployment status at vercel.com

## Version History
- v1.0.0: Initial Release
- v1.1.0: Enhanced Features
- v1.1.1: Bug Fixes
- v1.1.2: Performance Improvements
- v1.2.0: Color Modes
- v1.2.1: Style Guide & Mobile Optimization
