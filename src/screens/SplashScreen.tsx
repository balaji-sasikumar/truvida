import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/storage';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkUserAndNavigate = async () => {
      try {
        const user = await StorageService.getUser();
        setTimeout(() => {
          if (user) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Login');
          }
        }, 3000);
      } catch (error) {
        console.error('Error checking user:', error);
        setTimeout(() => {
          navigation.replace('Login');
        }, 3000);
      }
    };

    checkUserAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.waterDrop}>
              <Text style={styles.dropText}>💧</Text>
            </View>
            <Text style={styles.appName}>TruVida</Text>
            <Text style={styles.tagline}>Live Your Best Life</Text>
          </View>
          
          <View style={styles.rippleContainer}>
            <View style={[styles.ripple, styles.ripple1]} />
            <View style={[styles.ripple, styles.ripple2]} />
            <View style={[styles.ripple, styles.ripple3]} />
          </View>
          
          <View style={styles.bottomContainer}>
            <Text style={styles.loadingText}>Preparing your wellness journey...</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#4facfe',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  waterDrop: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dropText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  rippleContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ripple1: {
    width: 100,
    height: 100,
    opacity: 0.6,
  },
  ripple2: {
    width: 150,
    height: 150,
    opacity: 0.4,
  },
  ripple3: {
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
  },
});

export default SplashScreen;
