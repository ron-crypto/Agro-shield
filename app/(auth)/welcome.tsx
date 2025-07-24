import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Globe, Users } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Sprout size={60} color="white" />
            </View>
            <Text style={styles.title}>Agro-Shield AI</Text>
            <Text style={styles.subtitle}>
              Climate-Smart Farming for Kenyan Smallholders
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Globe size={24} color="white" />
              <Text style={styles.featureText}>Hyper-local Weather Forecasts</Text>
            </View>
            <View style={styles.feature}>
              <Sprout size={24} color="white" />
              <Text style={styles.featureText}>AI-Powered Planting Advisory</Text>
            </View>
            <View style={styles.feature}>
              <Users size={24} color="white" />
              <Text style={styles.featureText}>Expert Extension Support</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Language Selector */}
          <TouchableOpacity style={styles.languageButton}>
            <Globe size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.languageText}>English | Kiswahili</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  languageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});