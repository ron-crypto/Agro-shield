import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Sun, Cloud, CloudRain, Thermometer, Droplets, Wind, Eye, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  rainfall: number;
  icon: 'sun' | 'cloud' | 'rain';
}

interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  rainfall: number;
}

export default function Weather() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [currentWeather, setCurrentWeather] = useState<{
    temp: number;
    condition: string;
    icon: 'sun' | 'cloud' | 'rain';
  } | null>(null);

  const getWeatherIcon = (icon: string, size: number = 24, color: string = '#374151') => {
    switch (icon) {
      case 'sun':
        return <Sun size={size} color={color} />;
      case 'cloud':
        return <Cloud size={size} color={color} />;
      case 'rain':
        return <CloudRain size={size} color={color} />;
      default:
        return <Sun size={size} color={color} />;
    }
  };

  const getConditionColor = (condition: string) => {
    if (condition.includes('Rain')) return '#3B82F6';
    if (condition.includes('Cloud')) return '#6B7280';
    return '#F59E0B';
  };

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = 'b3238bac3937383640e8a803becee1fd';
      const location = 'Nairobi, Kenya';
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if (!response.ok || !data.list) {
          console.log('API Error:', data.message || 'No data received');
          return;
        }

        // Current weather
        const current = {
          temp: data.list[0].main.temp,
          condition: data.list[0].weather[0].description,
          icon: data.list[0].weather[0].main.toLowerCase().includes('rain') ? 'rain' :
                data.list[0].weather[0].main.toLowerCase().includes('cloud') ? 'cloud' : 'sun',
        };
        setCurrentWeather(current);

        // 7-day forecast
        const dailyForecast = data.list.reduce((acc: DailyForecast[], item, index) => {
          const date = new Date(item.dt * 1000);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (!acc.find(f => f.date === dayDate) && acc.length < 7) {
            acc.push({
              day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayName,
              date: dayDate,
              high: item.main.temp_max,
              low: item.main.temp_min,
              condition: item.weather[0].description,
              rainfall: item.rain?.['3h'] ? Math.round(item.rain['3h'] / 3) : 0,
              icon: item.weather[0].main.toLowerCase().includes('rain') ? 'rain' :
                    item.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' : 'sun',
            });
          }
          return acc;
        }, []);
        setForecast(dailyForecast);

        // Hourly forecast (first 6 entries as an example)
        const hourly = data.list.slice(0, 6).map(item => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temperature: item.main.temp,
          condition: item.weather[0].description,
          rainfall: item.rain?.['3h'] ? Math.round(item.rain['3h'] / 3) : 0,
        }));
        setHourlyForecast(hourly);
      } catch (error) {
        console.log('Fetch Error:', error.message);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Weather Header */}
      <LinearGradient
        colors={['#38BDF8', '#0EA5E9']}
        style={styles.currentWeatherHeader}
      >
        <Text style={styles.currentLocation}>Nairobi, Kenya</Text>
        <View style={styles.currentWeatherContent}>
          <View style={styles.temperatureSection}>
            <Text style={styles.currentTemp}>{currentWeather ? Math.round(currentWeather.temp) : 28}°</Text>
            <Text style={styles.condition}>{currentWeather ? currentWeather.condition : 'Partly Cloudy'}</Text>
            <Text style={styles.feelsLike}>Feels like {currentWeather ? Math.round(currentWeather.temp + 3) : 31}°</Text>
          </View>
          {currentWeather && getWeatherIcon(currentWeather.icon, 80, 'white')}
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Droplets size={20} color="white" />
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>65%</Text>
          </View>
          <View style={styles.detailItem}>
            <Wind size={20} color="white" />
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>12 km/h</Text>
          </View>
          <View style={styles.detailItem}>
            <Eye size={20} color="white" />
            <Text style={styles.detailLabel}>Visibility</Text>
            <Text style={styles.detailValue}>10 km</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 7-Day Forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
        <View style={styles.forecastList}>
          {forecast.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.forecastItem,
                selectedDay === index && styles.selectedForecastItem
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <View style={styles.forecastDay}>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              
              <View style={styles.forecastIcon}>
                {getWeatherIcon(day.icon, 32)}
              </View>
              
              <View style={styles.forecastTemp}>
                <View style={styles.tempRow}>
                  <ArrowUp size={14} color="#EF4444" />
                  <Text style={styles.highTemp}>{Math.round(day.high)}°</Text>
                </View>
                <View style={styles.tempRow}>
                  <ArrowDown size={14} color="#3B82F6" />
                  <Text style={styles.lowTemp}>{Math.round(day.low)}°</Text>
                </View>
              </View>
              
              <View style={styles.rainfallContainer}>
                <Droplets size={16} color="#06B6D4" />
                <Text style={styles.rainfallText}>{day.rainfall}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hourly Forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Hourly Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
          {hourlyForecast.map((hour, index) => (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.hourTime}>{hour.time}</Text>
              {getWeatherIcon('cloud', 24, '#374151')}
              <Text style={styles.hourTemp}>{Math.round(hour.temperature)}°</Text>
              <View style={styles.hourRainfall}>
                <Droplets size={12} color="#06B6D4" />
                <Text style={styles.hourRainfallText}>{hour.rainfall}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Weather Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Smart Farming Insights</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Droplets size={20} color="#22C55E" />
            <Text style={styles.insightTitle}>Resource Optimization Alert</Text>
          </View>
          <Text style={styles.insightText}>
            Your maize is entering vegetative stage. Based on 5-day forecast, 
            this weekend is optimal for top-dressing with fertilizer. Rain expected 
            Monday will help nutrient uptake.
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Thermometer size={20} color="#F59E0B" />
            <Text style={styles.insightTitle}>Irrigation Advisory</Text>
          </View>
          <Text style={styles.insightText}>
            No rain forecast for 7 days and soil moisture is low. Consider 
            irrigating your tomatoes within 48 hours to avoid water stress.
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.insightTitle}>Pest Alert</Text>
          </View>
          <Text style={styles.insightText}>
            High humidity and warm temperatures create favorable conditions for 
            fungal diseases. Monitor crops closely and ensure good air circulation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  currentWeatherHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  currentLocation: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
  },
  currentWeatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  temperatureSection: {
    alignItems: 'flex-start',
  },
  currentTemp: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 80,
  },
  condition: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginTop: -8,
  },
  feelsLike: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 2,
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
  forecastList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedForecastItem: {
    backgroundColor: '#F0FDF4',
  },
  forecastDay: {
    flex: 2,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  forecastIcon: {
    flex: 1,
    alignItems: 'center',
  },
  forecastTemp: {
    flex: 2,
    alignItems: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  lowTemp: {
    fontSize: 14,
    color: '#6B7280',
  },
  rainfallContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rainfallText: {
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '500',
  },
  hourlyScroll: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  hourTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  hourRainfall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hourRainfallText: {
    fontSize: 10,
    color: '#06B6D4',
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});