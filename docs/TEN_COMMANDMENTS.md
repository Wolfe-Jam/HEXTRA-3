# The TEN Commandments of HEXTRA Development

This document outlines the essential, non-negotiable rules for maintaining HEXTRA's integrity during development and deployment. These ten principles are foundational to preserving the application's design, functionality, and user experience.

## I. Thou Shalt Preserve Core Image Processing Above All
1. The image processing engine is the VITAL core function of HEXTRA
2. Ability to apply colors/HEX codes to images must never be compromised
3. Image quality and fidelity must be maintained at all times
4. PNG/WebP support and download functionality must be preserved

## II. Thou Shalt Maintain Both Batch Processing and The HEXTRA Color System
1. Batch processing (Section 8.0) functionality must be restored and preserved
2. HEXTRA Color System (Section 9.0) with Color Wheel, Nearest Match, and Catalog must be restored
3. All features must be accessible through proper authentication
4. No core functionality shall be removed without explicit approval

## III. Thou Shalt Support Light and Dark Themes Flawlessly
1. Light/dark theme support is MANDATORY without exception
2. All UI elements must adapt properly to both themes
3. Theme toggle in banner must remain fully functional
4. Custom theme variables must be used consistently throughout the application

## IV. Thou Shalt Not Alter Section Layout Order
1. Sections must remain in their established order (1.0-10.0)
2. Separators must be maintained with consistent tight padding
3. New features must respect the established section boundaries
4. Sections can be collapsed but never reordered or removed

## V. Thou Shalt Design for Mobile and Desktop Equally
1. All interfaces must be fully responsive and mobile-friendly
2. Google-style simplicity must be maintained across all screen sizes
3. Touch targets must be appropriately sized for mobile users
4. Layout must adapt gracefully without compromising functionality

## VI. Thou Shalt Honor the Banner's Sanctity
1. The banner (Section 1.0) must never be altered in core structure
2. Version information must remain visible in the banner
3. Theme toggle and authentication controls must remain accessible
4. Banner height and styling must follow exact specifications

## VII. Thou Shalt Implement Proper Dialog and Input Behaviors
1. All dialog boxes must follow Google-style simplicity principles
2. Dropdown and text entry fields must behave consistently
3. All buttons must have appropriate tooltips for user guidance
4. Glow styling must be preserved across all interactive elements

## VIII. Thou Shalt Keep External Dependencies Isolated
1. Kinde Auth must remain encapsulated according to documentation
2. Stripe payment processing must remain a black box
3. No integration may spread beyond its designated containers
4. Core app functionality must never depend on external services

## IX. Thou Shalt Not Introduce TypeScript or Modify ESLint
1. The codebase shall remain pure JavaScript
2. No TypeScript or JSDoc type annotations shall be introduced
3. ESLint configuration must remain locked to documented settings
4. No automatic formatting shall occur during build or deployment

## X. Thou Shalt Verify Before Deploying
1. Visual comparison must confirm UI integrity against baseline
2. Section structure must be confirmed on multiple devices/screens
3. Both light and dark themes must be verified on all pages
4. Core image processing, batch processing, and HCS must be validated end-to-end

These commandments shall guide all development work on HEXTRA. Any deviation requires explicit approval and thorough documentation of rationale. The integrity of HEXTRA depends on strict adherence to these principles.
