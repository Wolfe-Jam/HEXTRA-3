# HEXTRA-3 Version Control Policy

## Semantic Versioning (MAJOR.MINOR.PATCH)

### MAJOR Version (X.0.0)
Breaking changes that require user adaptation:
- Complete redesigns
- API changes
- Framework updates
Example: `2.0.0` - Migration to React 18

### MINOR Version (1.X.0)
New features (backward compatible):
- New functionality
- Major UI improvements
- Feature additions
Example: `1.2.0` - New color modes feature

### PATCH Version (1.1.X)
Bug fixes and minor improvements:
- Bug fixes
- UI tweaks
- Performance optimizations
Example: `1.1.2` - Fix color picker accuracy

## Version Documentation

### 1. Package.json
```json
{
  "name": "hextra-3",
  "version": "1.2.0"  // Update BEFORE committing
}
```

### 2. Git Commit Message
```
v1.2.0: Add color modes with tooltips

Version Updates:
- FEATURE: Natural/Vibrant/Balanced color modes
- IMPROVE: UI layout with separators
- FIX: Color application accuracy

Technical Details:
- Added LUMINANCE_METHODS constant
- Updated colorize function
- Improved error handling
```

### 3. CHANGELOG.md Updates
```markdown
## [1.2.0] - 2025-01-15
### Added
- Feature details
### Improved
- Improvement details
### Fixed
- Fix details
```

## Version History
- v1.0.0: Initial Release
- v1.1.0: Enhanced Features
- v1.1.1: Bug Fixes
- v1.1.2: Performance Improvements
- v1.2.0: Color Modes
