import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft, User, Phone, MapPin, Crop, Globe, Lock, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    farmSize: '',
    mainCrops: [] as string[],
    soilType: '',
    preferredLanguage: 'English',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { signUp } = useAuth();

  const crops = ['Maize', 'Beans', 'Tomatoes', 'Sukuma Wiki', 'Potatoes', 'Onions', 'Carrots', 'Cabbage'];
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Rocky', 'Not Sure'];
  const languages = ['English', 'Kiswahili', 'Kikuyu', 'Luo', 'Luhya'];

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is needed to provide accurate weather forecasts.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const locationString = `${address[0].city || address[0].region}, ${address[0].country}`;
        setFormData(prev => ({ ...prev, location: locationString }));
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get your location. Please enter it manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      mainCrops: prev.mainCrops.includes(crop)
        ? prev.mainCrops.filter(c => c !== crop)
        : [...prev.mainCrops, crop]
    }));
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.startsWith('254')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+254${cleaned.substring(1)}`;
    } else if (cleaned.length > 0) {
      return `+254${cleaned}`;
    }
    return text;
  };

  const handleSignUp = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.password || !formData.location || !formData.farmSize) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (formData.mainCrops.length === 0) {
      Alert.alert('Error', 'Please select at least one crop');
      return;
    }

    const farmSize = parseFloat(formData.farmSize);
    if (isNaN(farmSize) || farmSize <= 0) {
      Alert.alert('Error', 'Please enter a valid farm size');
      return;
    }

    setLoading(true);
    const { error } = await signUp(formData.phone, formData.password, {
      phone: formData.phone,
      name: formData.name,
      location: formData.location,
      farm_size: farmSize,
      main_crops: formData.mainCrops,
      soil_type: formData.soilType || undefined,
      preferred_language: formData.preferredLanguage,
    });
    setLoading(false);

    if (error) {
      if (error.code === 'USER_ALREADY_EXISTS') {
        Alert.alert(
          'Account Already Exists',
          'An account with this phone number already exists. Please sign in instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.replace('/(auth)/login') }
          ]
        );
      } else {
        Alert.alert('Sign Up Failed', error.message || 'Please try again');
      }
    } else {
      Alert.alert(
        'Success!',
        'Your account has been created successfully. You can now sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#22C55E" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of farmers using AI-powered insights</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="+254 XXX XXX XXX"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: formatPhoneNumber(text) }))}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Farm Information */}
            <Text style={styles.sectionTitle}>Farm Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your location"
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                />
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color="#22C55E" />
                  ) : (
                    <Text style={styles.locationButtonText}>GPS</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Size (acres) *</Text>
              <View style={styles.inputContainer}>
                <Crop size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2.5"
                  value={formData.farmSize}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, farmSize: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Main Crops *</Text>
              <View style={styles.cropsContainer}>
                {crops.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    style={[
                      styles.cropChip,
                      formData.mainCrops.includes(crop) && styles.cropChipSelected
                    ]}
                    onPress={() => toggleCrop(crop)}
                  >
                    <Text style={[
                      styles.cropChipText,
                      formData.mainCrops.includes(crop) && styles.cropChipTextSelected
                    ]}>
                      {crop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Type (Optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.soilType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, soilType: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Select soil type" value="" />
                  {soilTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Language</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.preferredLanguage}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                  style={styles.picker}
                >
                  {languages.map((lang) => (
                    <Picker.Item key={lang} label={lang} value={lang} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
  },
  locationButton: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cropChipSelected: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  cropChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cropChipTextSelected: {
    color: 'white',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  actions: {
    marginBottom: 32,
  },
  signupButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '600',
  },
});