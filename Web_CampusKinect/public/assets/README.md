# Assets Directory Structure

This directory contains all static assets for the CampusConnect Web frontend.

## Directory Structure

```
public/assets/
├── images/          # General images, photos, backgrounds
├── icons/           # UI icons, navigation icons, action icons
├── logos/           # Brand logos, app icons, university logos
└── README.md        # This file
```

## Usage

### In Next.js Components
```tsx
// Import images
import logo from '@/public/assets/logos/logo.png'
import background from '@/public/assets/images/background.jpg'
import icon from '@/public/assets/icons/home.svg'

// Use in components
<Image src="/assets/logos/logo.png" alt="Logo" />
<img src="/assets/images/background.jpg" alt="Background" />
```

### File Naming Convention
- Use kebab-case: `user-profile.png`, `home-icon.svg`
- Include dimensions in filename for images: `logo-256x256.png`
- Use descriptive names: `campus-background.jpg`, `navigation-menu.svg`

## Supported Formats
- **Images**: PNG, JPG, JPEG, WebP, AVIF
- **Icons**: SVG, PNG (for complex icons)
- **Logos**: PNG, SVG (SVG preferred for scalability)

## Optimization
- Use WebP format for photos when possible
- Optimize SVG files by removing unnecessary metadata
- Compress PNG/JPG files for web use
- Consider using Next.js Image component for automatic optimization 