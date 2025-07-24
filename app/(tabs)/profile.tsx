import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { User, MapPin, Crop, Bell, Globe, Settings, CircleHelp as HelpCircle, Shield, CreditCard as Edit3, Save, Phone, Mail, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface FarmInfo {
  location: string;
  size: number;
  crops: string[];
  experience: number;
}

interface NotificationSettings {
  weather: boolean;
  planting: boolean;
  market: boolean;
  tips: boolean;
}

export default function Profile() {
  const { profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguage] = useState('English');
  
  const [farmInfo, setFarmInfo] = useState<FarmInfo>({
    location: 'Nairobi, Kenya',
    size: 2.5,
    crops: ['Maize', 'Beans', 'Vegetables'],
    experience: 8
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    weather: true,
    planting: true,
    market: false,
    tips: true
  });

  const [userInfo, setUserInfo] = useState({
    name: profile?.name || 'John Mwangi',
    phone: profile?.phone || '+254 712 345 678',
    email: `${profile?.phone || '+254712345678'}@agro-shield.app`,
    joinDate: 'March 2024'
  });

  useEffect(() => {
    if (profile) {
      setUserInfo({
        name: profile.name,
        phone: profile.phone,
        email: `${profile.phone}@agro-shield.app`,
        joinDate: new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
      setFarmInfo({
        location: profile.location,
        size: profile.farm_size,
        crops: profile.main_crops,
        experience: 8 // This could be calculated from join date
      });
      setLanguage(profile.preferred_language);
    }
  }, [profile]);

  const handleSave = () => {
    if (profile) {
      updateProfile({
        name: userInfo.name,
        location: farmInfo.location,
        farm_size: farmInfo.size,
        main_crops: farmInfo.crops,
        preferred_language: language,
      });
    }
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };

  const ProfileCard = ({ icon, title, value, onPress }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.profileCard} onPress={onPress}>
      <View style={styles.profileCardIcon}>
        {icon}
      </View>
      <View style={styles.profileCardContent}>
        <Text style={styles.profileCardTitle}>{title}</Text>
        <Text style={styles.profileCardValue}>{value}</Text>
      </View>
      {onPress && <Edit3 size={16} color="#6B7280" />}
    </TouchableOpacity>
  );

  const SettingItem = ({ title, subtitle, value, onValueChange, type = 'switch' }: {
    title: string;
    subtitle?: string;
    value?: boolean | string;
    onValueChange?: (value: any) => void;
    type?: 'switch' | 'text';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
          thumbColor={(value as boolean) ? '#22C55E' : '#9CA3AF'}
        />
      )}
      {type === 'text' && (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userPhone}>{userInfo.phone}</Text>
            <Text style={styles.joinDate}>Farmer since {userInfo.joinDate}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={20} color="white" /> : <Edit3 size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Farm Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Information</Text>
        
        <ProfileCard
          icon={<MapPin size={20} color="#22C55E" />}
          title="Location"
          value={farmInfo.location}
        />
        
        <ProfileCard
          icon={<Crop size={20} color="#3B82F6" />}
          title="Farm Size"
          value={`${farmInfo.size} acres`}
        />
        
        <ProfileCard
          icon={<Calendar size={20} color="#F59E0B" />}
          title="Farming Experience"
          value={`${farmInfo.experience} years`}
        />
        
        <View style={styles.cropsSection}>
          <Text style={styles.cropsTitle}>Primary Crops</Text>
          <View style={styles.cropsContainer}>
            {farmInfo.crops.map((crop, index) => (
              <View key={index} style={styles.cropTag}>
                <Text style={styles.cropTagText}>{crop}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <SettingItem
          title="Weather Alerts"
          subtitle="Get notified about severe weather conditions"
          value={notifications.weather}
          onValueChange={(value) => setNotifications(prev => ({ ...prev, weather: value }))}
        />
        
        <SettingItem
          title="Planting Reminders"
          subtitle="Optimal planting window notifications"
          value={notifications.planting}
          onValueChange={(value) => setNotifications(prev => ({ ...prev, planting: value }))}
        />
        
        <SettingItem
          title="Market Updates"
          subtitle="Crop prices and market information"
          value={notifications.market}
          onValueChange={(value) => setNotifications(prev => ({ ...prev, market: value }))}
        />
        
        <SettingItem
          title="Farming Tips"
          subtitle="Weekly agricultural tips and advice"
          value={notifications.tips}
          onValueChange={(value) => setNotifications(prev => ({ ...prev, tips: value }))}
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Globe size={20} color="#6B7280" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingSubtitle}>Choose your preferred language</Text>
            </View>
          </View>
          <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Shield size={20} color="#6B7280" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingSubtitle}>Manage your data and privacy settings</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <HelpCircle size={20} color="#6B7280" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingSubtitle}>Get help and contact support</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <View style={styles.settingContent}>
            <User size={20} color="#EF4444" />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: '#EF4444' }]}>Sign Out</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Agro-Shield AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            AI-powered farming assistant for Kenyan smallholder farmers
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {isEditing && (
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileCardContent: {
    flex: 1,
  },
  profileCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cropsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropTag: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cropTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  appInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});