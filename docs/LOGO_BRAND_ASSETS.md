# 🎨 QuizMentor Logo & Brand Assets

## Logo Design Specifications

### Primary Logo Concept

**Brain + Lightning Bolt Fusion**

```
Design Elements:
- Symbol: Abstract brain merged with lightning bolt
- Style: Modern, geometric, minimal
- Inspiration: Neural connections, instant learning, quick thinking
```

### Logo Variations

#### 1. Full Logo (Horizontal)

```
[🧠⚡] QuizMentor
```

- Use: Primary application, website header, app stores
- Minimum size: 120px width
- Clear space: 0.5x logo height on all sides

#### 2. Stacked Logo (Vertical)

```
  [🧠⚡]
QuizMentor
```

- Use: Social media profiles, app icon base
- Minimum size: 80px width
- Clear space: 0.5x logo width on all sides

#### 3. Icon Only

```
[🧠⚡]
```

- Use: App icon, favicon, small spaces
- Minimum size: 32px
- Must maintain 1:1 aspect ratio

#### 4. Wordmark Only

```
QuizMentor
```

- Use: When icon is already present
- Font: SF Pro Display Bold
- Letter spacing: -0.02em

## Color Specifications

### Primary Brand Colors

```css
/* Logo Gradients */
--logo-gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--logo-gradient-2: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
--logo-gradient-3: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);

/* Solid Colors */
--brand-primary: #667eea; /* Electric Blue */
--brand-secondary: #764ba2; /* Royal Purple */
--brand-accent: #fa709a; /* Coral Pink */
--brand-success: #84fab0; /* Mint Green */
```

### Logo Color Variants

#### Light Background

- Primary: Gradient (#667EEA → #764BA2)
- Text: #0A0A0B (Near black)

#### Dark Background

- Primary: Gradient (#667EEA → #764BA2)
- Text: #FFFFFF (White)

#### Monochrome

- Black: #000000
- White: #FFFFFF
- Gray: #71717A

## App Icon Design

### iOS App Icon

```
Sizes Required:
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 152x152 (iPad @2x)
- 76x76 (iPad @1x)
```

### Android App Icon

```
Sizes Required:
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)
```

### Icon Design Specifications

```
Background: Gradient (#667EEA → #764BA2)
Symbol: Simplified brain/lightning bolt
Padding: 20% of icon size
Corner radius: iOS: Superellipse, Android: Circle/Squircle
Shadow: Subtle drop shadow for depth
```

## Brand Typography

### Font Hierarchy

```css
/* Display Font - Headlines */
font-family:
  'SF Pro Display',
  -apple-system,
  sans-serif;
font-weight: 800;
letter-spacing: -0.02em;

/* Body Font - Content */
font-family:
  'Inter',
  -apple-system,
  sans-serif;
font-weight: 400-600;
letter-spacing: -0.01em;

/* Mono Font - Code/Numbers */
font-family: 'JetBrains Mono', 'SF Mono', monospace;
font-weight: 500;
letter-spacing: 0;
```

## Logo Animation Specifications

### Entrance Animation

```javascript
const logoAnimation = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [−180, 20, 0],
    opacity: [0, 1, 1],
  },
  transition: {
    duration: 1.2,
    ease: [0.68, -0.55, 0.265, 1.55], // Elastic easing
  },
};
```

### Hover/Tap Animation

```javascript
const hoverAnimation = {
  scale: 1.05,
  rotate: 5,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
};
```

### Loading Animation

```javascript
const loadingAnimation = {
  rotate: 360,
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
};
```

## Brand Patterns & Graphics

### Gradient Mesh Background

```svg
<svg>
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667EEA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764BA2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient1)" />
</svg>
```

### Neural Network Pattern

```
Used for: Backgrounds, overlays
Style: Connecting dots and lines
Opacity: 10-20% over gradients
Animation: Subtle pulse/flow
```

### Wave Pattern

```
Used for: Section dividers, decorative elements
Style: Smooth sine waves
Colors: Gradient fills
Animation: Horizontal drift
```

## Brand Voice & Personality

### Brand Attributes

- **Smart**: Intelligent without being intimidating
- **Playful**: Fun and engaging, not boring
- **Modern**: Current and trendy
- **Accessible**: Inclusive and welcoming
- **Premium**: High quality and polished

### Logo Usage Guidelines

#### DO's ✅

- Use official logo files
- Maintain minimum clear space
- Use on contrasting backgrounds
- Apply subtle animations
- Keep proportions intact

#### DON'Ts ❌

- Don't stretch or distort
- Don't change colors arbitrarily
- Don't add effects (shadows, outlines)
- Don't rotate (except in animations)
- Don't place on busy backgrounds

## File Formats & Exports

### Vector Formats

- `.svg` - Scalable for web
- `.ai` - Adobe Illustrator source
- `.pdf` - Print-ready vector

### Raster Formats

- `.png` - Transparent background
- `.jpg` - Photographs/social media
- `.webp` - Optimized for web

### Naming Convention

```
quizmentor-logo-[variant]-[color]-[size].[format]

Examples:
- quizmentor-logo-full-gradient-1024.png
- quizmentor-logo-icon-mono-512.svg
- quizmentor-logo-wordmark-white-2048.png
```

## Social Media Assets

### Profile Pictures

- Size: 400x400px minimum
- Format: PNG with transparency
- Content: Icon only with gradient background

### Cover Images

```
Facebook: 1200x630px
Twitter: 1500x500px
LinkedIn: 1128x191px
YouTube: 2560x1440px
```

### Post Templates

```
Square: 1080x1080px (Instagram)
Portrait: 1080x1350px (Instagram)
Landscape: 1200x630px (Facebook/Twitter)
Story: 1080x1920px (Instagram/Facebook)
```

## Motion Design Guidelines

### Logo Reveal

```
Duration: 1.5 seconds
Sequence:
1. Background fade in (0-0.3s)
2. Icon scale + rotate (0.3-0.8s)
3. Text slide in (0.8-1.2s)
4. Shine effect (1.2-1.5s)
```

### Transition Effects

```
Page transitions: 300ms ease-out
Micro-interactions: 200ms ease-in-out
Loading states: 2s infinite loop
Success states: 600ms bounce
```

## Implementation Code

### React Native Logo Component

```tsx
import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path, Text } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const Logo = ({ size = 100, animated = true }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 10 }) }],
  }));

  return (
    <AnimatedSvg width={size} height={size} viewBox="0 0 100 100" style={animated && animatedStyle}>
      <Defs>
        <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#667EEA" />
          <Stop offset="100%" stopColor="#764BA2" />
        </LinearGradient>
      </Defs>

      {/* Brain/Lightning Icon Path */}
      <Path
        d="M50 10 L60 40 H40 L50 70 L40 40 H60 Z"
        fill="url(#logoGradient)"
        stroke="white"
        strokeWidth="2"
      />
    </AnimatedSvg>
  );
};
```

### CSS Logo Animation

```css
@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05) rotate(2deg);
    filter: brightness(1.1);
  }
}

.logo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: logo-pulse 3s ease-in-out infinite;
}

.logo:hover {
  animation-duration: 0.5s;
}
```

## Brand Asset Management

### Folder Structure

```
/assets
  /logo
    /svg
      - logo-full.svg
      - logo-icon.svg
      - logo-wordmark.svg
    /png
      /light
      /dark
      /gradient
    /animation
      - logo-lottie.json
      - logo-rive.riv
  /icons
    /ios
    /android
    /web
  /brand
    /colors
    /typography
    /patterns
```

### Version Control

- Main branch: Production-ready assets
- Dev branch: Work in progress
- Archive: Previous versions with date stamps

## Legal & Trademark

### Copyright Notice

```
© 2024 QuizMentor. All rights reserved.
The QuizMentor logo and brand assets are proprietary.
```

### Trademark Guidelines

- ™ for unregistered marks
- ® for registered marks (after registration)
- Always use on first mention in documents

### Third-Party Usage

- Requires written permission
- Must use official assets
- Subject to brand guidelines
- Include attribution

---

_For logo files and brand assets, contact: brand@quizmentor.app_
