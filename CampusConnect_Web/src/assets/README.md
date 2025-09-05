# Assets Folder

This folder contains all static assets for the CampusConnect web application.

## Structure

```
src/assets/
├── images/          # General images (backgrounds, UI elements, etc.)
├── icons/           # Icon files (SVG, PNG icons)
├── logos/           # Brand logos and branding assets
└── README.md        # This documentation file
```

## Usage

### Importing Images in React Components

```typescript
// Import images using relative paths
import backgroundImage from '@/assets/images/background.jpg';
import logo from '@/assets/logos/campus-connect-logo.png';
import userIcon from '@/assets/icons/user.svg';

// Use in JSX
<img src={backgroundImage} alt="Background" />
<img src={logo} alt="CampusConnect Logo" />
<img src={userIcon} alt="User Icon" />
```

### Supported Formats

- **Images**: JPG, PNG, WebP, GIF
- **Icons**: SVG (preferred), PNG
- **Logos**: SVG (preferred), PNG

## Organization Guidelines

### `/images/`
- Background images
- Hero images
- Placeholder images
- UI graphics
- Photo assets

### `/icons/`
- UI icons
- Action icons
- Status icons
- Navigation icons

### `/logos/`
- Main CampusConnect logo
- University logos
- Partner logos
- Brand assets

## Naming Conventions

- Use kebab-case for file names: `user-profile-icon.svg`
- Be descriptive: `login-background-image.jpg`
- Include size if relevant: `logo-small-32x32.png`
- Use semantic names: `success-icon.svg` instead of `green-checkmark.svg`

## Best Practices

1. **Optimize images** before adding them to the assets folder
2. **Use SVG** for icons when possible for scalability
3. **Provide multiple sizes** for logos if needed
4. **Use WebP format** for better compression when supported
5. **Keep file sizes reasonable** for web performance

## Path Alias

The project uses `@/assets/` as an alias for `src/assets/` to simplify imports. 