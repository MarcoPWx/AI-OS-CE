# QuizMentor Storybook Guide

## 📚 Overview

Storybook provides an isolated environment to develop, test, and document UI components for QuizMentor. This guide covers setup, usage, and best practices for maintaining our component library.

## 🚀 Quick Start

### Running Storybook

```bash
# Install dependencies if needed
npm install

# Run Storybook on device/simulator
EXPO_PUBLIC_STORYBOOK=1 npm run ios
# or
EXPO_PUBLIC_STORYBOOK=1 npm run android

# For normal app (without Storybook)
npm run ios
# or
npm run android
```

### Toggle Between App and Storybook

The app uses an environment variable to switch between normal app and Storybook:

- Set `EXPO_PUBLIC_STORYBOOK=1` to launch Storybook
- Leave unset or `EXPO_PUBLIC_STORYBOOK=0` for normal app

## 📂 Project Structure

```
.rnstorybook/
├── index.ts                 # Storybook entry point
├── main.ts                  # Configuration
├── preview.tsx              # Global decorators & parameters
├── storybook.requires.ts   # Auto-generated story registry
└── stories/
    ├── Button.stories.tsx   # Button component stories
    ├── Button.tsx           # Button component
    └── [Component].stories.tsx

src/components/
└── *.stories.tsx           # Component stories co-located
```

## 🎨 Component Stories

### Note on Docs (MDX)

- On-device Storybook for React Native does not render Docs pages (MDX) yet. We include MDX files for web Storybook compatibility and narrative documentation.
- We also add docs descriptions via `parameters.docs.description` in CSF; these are ignored on-device but will be used in a web Storybook.
- Web Storybook (already configured) runs with Vite + react-native-web alias, supports MDX Docs, MSW, Swagger UI, and Chromatic.

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import MyComponent from './MyComponent';

const meta = {
  title: 'Category/ComponentName',
  component: MyComponent,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#0f172a' }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    notes: 'Component documentation here',
  },
  argTypes: {
    // Control types for props
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories
export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Action',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};
```

## Web Storybook enhancements

- Toolbars: WS Scenario, Theme (light/dark), Platform (web/ios/android) — use them to preview mocks and design tokens.
- Docs pages inside Storybook: Docs/Mocking & Scenarios, Docs/Stories How-To.
- Examples to try: API/Playground (per-story MSW overrides), Live/TaskBoard (WS demo), Flows/QuizFlowDemo (play test), Design/PlatformThemePreview.

## 🧩 Component Categories

### Core Components

- **Buttons**: Primary, Secondary, Icon, Floating
- **Inputs**: Text, Password, Search, Select
- **Cards**: Quiz, Achievement, Category, Stats
- **Typography**: Headers, Body, Caption, Links

### Quiz Components

- **QuizQuestion**: Question display with options
- **QuizTimer**: Countdown timer
- **QuizProgress**: Progress bar
- **QuizScore**: Score display

### Navigation Components

- **TabBar**: Bottom navigation
- **Header**: Top navigation bar
- **Drawer**: Side menu

### Feedback Components

- **Toast**: Success/Error messages
- **Modal**: Dialogs and overlays
- **Loading**: Spinners and skeletons
- **Empty**: Empty states

### Gamification Components

- **XPBar**: Experience progress
- **StreakCounter**: Daily streak display
- **AchievementBadge**: Badge display
- **Leaderboard**: Ranking list

## 🎭 Decorators

### Dark Theme Decorator

```typescript
const DarkDecorator = (Story) => (
  <View style={{
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20
  }}>
    <Story />
  </View>
);
```

### Padding Decorator

```typescript
const PaddingDecorator = (Story) => (
  <View style={{ padding: 20 }}>
    <Story />
  </View>
);
```

### Center Decorator

```typescript
const CenterDecorator = (Story) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Story />
  </View>
);
```

## 🔧 Controls & Actions

### Controls

Controls allow interactive prop editing in Storybook:

```typescript
argTypes: {
  color: { control: 'color' },
  text: { control: 'text' },
  number: { control: { type: 'number', min: 0, max: 100 } },
  range: { control: { type: 'range', min: 0, max: 100, step: 10 } },
  select: { control: 'select', options: ['a', 'b', 'c'] },
  radio: { control: 'radio', options: ['a', 'b', 'c'] },
  boolean: { control: 'boolean' },
  date: { control: 'date' },
}
```

### Actions

Track interactions:

```typescript
import { action } from '@storybook/addon-actions';

export const Clickable: Story = {
  args: {
    onPress: action('button-pressed'),
  },
};
```

## 📋 Testing with Storybook

### Visual Testing Checklist

- [ ] Component renders correctly
- [ ] All variants display properly
- [ ] Dark mode compatibility
- [ ] Touch targets are adequate (>44px)
- [ ] Text is readable (contrast)
- [ ] Animations are smooth
- [ ] Loading states work
- [ ] Error states display
- [ ] Empty states are clear

### Interaction Testing

- [ ] Buttons respond to taps
- [ ] Forms validate input
- [ ] Modals open/close
- [ ] Navigation works
- [ ] Gestures respond

## 🎯 Best Practices

### 1. Story Naming

- Use descriptive names
- Group related stories
- Follow naming convention: `Default`, `WithProps`, `StateVariant`

### 2. Documentation

- Add component description
- Document all props
- Include usage examples
- Note accessibility features

### 3. Coverage

- Create stories for all states
- Include edge cases
- Test with real data
- Add loading/error states

### 4. Organization

- One story file per component
- Group by feature/category
- Keep stories close to components
- Use consistent structure

## 🚀 Advanced Usage

### Responsive Stories

```typescript
export const Responsive: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'iPhone X', width: 375, height: 812 },
        tablet: { name: 'iPad', width: 768, height: 1024 },
      },
    },
  },
};
```

### With Mock Data

```typescript
import { mockQuestions } from '../../__mocks__/data';

export const WithData: Story = {
  args: {
    questions: mockQuestions,
  },
};
```

### Animated Stories

```typescript
export const Animated: Story = {
  render: (args) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Component {...args} />
      </Animated.View>
    );
  },
};
```

## 📱 Platform-Specific Stories

```typescript
export const iOSOnly: Story = {
  parameters: {
    platform: 'ios',
  },
  args: {
    // iOS specific props
  },
};

export const AndroidOnly: Story = {
  parameters: {
    platform: 'android',
  },
  args: {
    // Android specific props
  },
};
```

## 🔍 Component Explorer

### Available Stories

#### Core UI

- `Button` - All button variants
- `Input` - Form inputs
- `Card` - Card components
- `Typography` - Text components

#### Quiz Components

- `QuizQuestion` - Question display
- `QuizOption` - Answer options
- `QuizTimer` - Timer component
- `QuizProgress` - Progress indicator

#### Screens

- `HomeScreen` - Dashboard variations
- `QuizScreen` - Quiz interface
- `ResultsScreen` - Results display
- `ProfileScreen` - User profile

#### Gamification

- `XPBar` - Experience bar
- `StreakDisplay` - Streak counter
- `Achievement` - Achievement badges
- `Leaderboard` - Rankings

## 🐛 Troubleshooting

### Common Issues

1. **Storybook not loading**
   - Check EXPO_PUBLIC_STORYBOOK environment variable
   - Clear Metro cache: `npx expo start -c`

2. **Stories not appearing**
   - Check story file naming (\*.stories.tsx)
   - Verify story export structure
   - Check storybook.requires.ts

3. **Controls not working**
   - Ensure argTypes are defined
   - Check prop names match component

4. **Performance issues**
   - Reduce story complexity
   - Use lazy loading for heavy components
   - Limit animation in stories

## 📚 Resources

- [Storybook React Native Docs](https://storybook.js.org/docs/react-native)
- [Expo Storybook Guide](https://docs.expo.dev/guides/storybook/)
- [Component Design Patterns](./DESIGN_SYSTEM_REFINED.md)
- [Testing Strategy](./TESTING_STRATEGY.md)

---

## Summary

Storybook is essential for:

- **Component Development**: Build in isolation
- **Documentation**: Living style guide
- **Testing**: Visual regression testing
- **Collaboration**: Share UI with team
- **Quality**: Ensure consistency

Use Storybook throughout development to maintain UI quality and consistency across the QuizMentor app.
