# TruVida - Wellness Tracking App 🌿

A comprehensive React Native wellness application that helps users track their daily water intake, steps, and maintain healthy habits. Built with modern React Native architecture and beautiful UI design.

## Features ✨

### 🎨 **Beautiful Splash Screen**
- Inspiring wellness theme with soothing colors
- Water ripple animations and gradient backgrounds
- Auto-navigation to appropriate screen based on user state

### 🔐 **Authentication System**
- **Login Screen**: Secure username/password authentication
- **Register Screen**: Complete profile setup including:
  - Personal information (name, age, height, weight)
  - Username and password creation
  - Input validation and error handling
  - Secure local storage of user credentials

### 🏠 **Home Dashboard**
- Personalized greeting based on time of day
- Real-time progress tracking for water and steps
- Beautiful progress cards with visual indicators
- Quick action buttons for common tasks
- Motivational quotes to inspire healthy living

### 💧 **Water Tracking**
- Customizable daily water intake goals
- Multiple glass size options (150ml, 250ml, 350ml, 500ml)
- Visual progress tracking with percentage completion
- Quick add/remove water functionality
- Hydration tips and reminders
- Goal achievement celebrations

### 👟 **Steps Tracking**
- Daily step counting and goal tracking
- Activity level indicators (Light, Moderate, Active, Very Active)
- Distance and calorie calculations
- Progress visualization with bars and percentages
- Walking tips and motivation
- Simulated step counting for demo purposes

### 👤 **Profile & Settings**
- Comprehensive profile management
- Editable personal information and goals
- Notification preferences
- Water reminder interval settings
- Data management options
- Secure data storage

### 💾 **Local Storage**
- All data stored securely using AsyncStorage
- User profiles, daily progress, and preferences
- Offline functionality
- Data persistence across app sessions

## Tech Stack 🛠️

- **React Native 0.81.1** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation 6** - Navigation and routing
- **AsyncStorage** - Local data persistence
- **React Native Linear Gradient** - Beautiful gradient backgrounds
- **React Native Gesture Handler** - Smooth gesture interactions
- **React Native Screens** - Optimized screen management
- **React Native Reanimated** - Smooth animations

## Getting Started 🚀

### Prerequisites

Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd truvida
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS
```bash
npm run ios
```

## Project Structure 📁

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx # Main navigation setup
├── screens/            # Application screens
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── WaterScreen.tsx
│   ├── StepsScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # Business logic and services
│   └── storage.ts      # AsyncStorage service
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    └── dateUtils.ts
```

## Key Features Implementation 🔧

### Authentication Flow
- Splash screen checks for existing user
- Redirects to login if no user found
- Secure password validation
- Profile creation with comprehensive validation

### Data Management
- AsyncStorage for local data persistence
- Structured data models for users and daily progress
- CRUD operations for all data types
- Data validation and error handling

### UI/UX Design
- Modern gradient backgrounds
- Smooth animations and transitions
- Responsive design for different screen sizes
- Intuitive navigation with tab-based structure
- Visual feedback for user interactions

### Progress Tracking
- Real-time updates for water and steps
- Visual progress indicators
- Goal-based achievements
- Historical data storage

## Future Enhancements 🚀

- [ ] Push notifications for water reminders
- [ ] Integration with device health APIs
- [ ] Social features and challenges
- [ ] Data export functionality
- [ ] Dark mode support
- [ ] Workout tracking
- [ ] Nutrition logging
- [ ] Sleep tracking

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

For support, email support@truvida.app or join our Slack channel.

---

**TruVida** - Live Your Best Life 🌟
