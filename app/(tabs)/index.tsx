import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { MapPin, Thermometer, Droplets, Wind, TriangleAlert as AlertTriangle, TrendingUp, Calendar, Sprout, MessageSquare, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import ChatBot from '@/components/ChatBot';
import FarmJournal from '@/components/FarmJournal';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

interface Alert {
  id: string;
  type: 'weather' | 'planting' | 'general';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Dashboard() {
  const [location, setLocation] = useState<string>('Loading...');
  const [chatBotVisible, setChatBotVisible] = useState(false);
  const [journalVisible, setJournalVisible] = useState(false);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    humidity: 65,
    rainfall: 85,
    windSpeed: 12,
    condition: 'Partly Cloudy'
  });
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'weather',
      message: 'Heavy rainfall expected in 2 days. Prepare drainage.',
      priority: 'high'
    },
    {
      id: '2',
      type: 'planting',
      message: 'Optimal planting window for maize starts in 5 days.',
      priority: 'medium'
    }
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location access denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address[0]) {
        setLocation(`${address[0].city || address[0].region}, ${address[0].country}`);
      }
    } catch (error) {
      setLocation('Unable to get location');
    }
  };

  const WeatherCard = ({ icon, label, value, unit }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
  }) => (
    <View style={styles.weatherCard}>
      {icon}
      <Text style={styles.weatherLabel}>{label}</Text>
      <Text style={styles.weatherValue}>
        {value}
        <Text style={styles.weatherUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <TouchableOpacity 
      style={[
        styles.alertCard,
        alert.priority === 'high' ? styles.highPriorityAlert : styles.mediumPriorityAlert
      ]}
      onPress={() => Alert.alert('Alert Details', alert.message)}
    >
      <View style={styles.alertHeader}>
        <AlertTriangle 
          size={20} 
          color={alert.priority === 'high' ? '#EF4444' : '#F59E0B'} 
        />
        <Text style={[
          styles.alertType,
          alert.priority === 'high' ? styles.highPriorityText : styles.mediumPriorityText
        ]}>
          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
        </Text>
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Good morning, Farmer</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color="white" />
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <WeatherCard
            icon={<Thermometer size={24} color="#EF4444" />}
            label="Temperature"
            value={weather.temperature}
            unit="°C"
          />
          <WeatherCard
            icon={<Droplets size={24} color="#3B82F6" />}
            label="Humidity"
            value={weather.humidity}
            unit="%"
          />
          <WeatherCard
            icon={<Droplets size={24} color="#06B6D4" />}
            label="Rainfall"
            value={weather.rainfall}
            unit="%"
          />
          <WeatherCard
            icon={<Wind size={24} color="#64748B" />}
            label="Wind"
            value={weather.windSpeed}
            unit="km/h"
          />
        </View>
      </View>

      {/* Active Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Alerts</Text>
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <TrendingUp size={32} color="#22C55E" />
            <Text style={styles.actionLabel}>View Forecast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Calendar size={32} color="#3B82F6" />
            <Text style={styles.actionLabel}>Planting Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Sprout size={32} color="#8B5CF6" />
            <Text style={styles.actionLabel}>Crop Advisory</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setChatBotVisible(true)}
          >
            <MessageSquare size={32} color="#06B6D4" />
            <Text style={styles.actionLabel}>Ask Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setJournalVisible(true)}
          >
            <BookOpen size={32} color="#8B5CF6" />
            <Text style={styles.actionLabel}>Farm Journal</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ChatBot 
        visible={chatBotVisible} 
        onClose={() => setChatBotVisible(false)} 
      />
      
      <FarmJournal 
        visible={journalVisible} 
        onClose={() => setJournalVisible(false)} 
      />
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
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  weatherCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  weatherUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  alertCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  highPriorityAlert: {
    borderLeftColor: '#EF4444',
  },
  mediumPriorityAlert: {
    borderLeftColor: '#F59E0B',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
  },
  highPriorityText: {
    color: '#EF4444',
  },
  mediumPriorityText: {
    color: '#F59E0B',
  },
  alertMessage: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});