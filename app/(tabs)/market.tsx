import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { TrendingUp, TrendingDown, Minus, MapPin, Phone, MessageSquare, Search, Filter, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  distance: number;
  currentPrice: number;
  previousPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ExtensionOfficer {
  id: string;
  name: string;
  specialization: string[];
  location: string;
  phone: string;
  rating: number;
  experience: number;
}

export default function Market() {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [extensionOfficers, setExtensionOfficers] = useState<ExtensionOfficer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [officerModalVisible, setOfficerModalVisible] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<ExtensionOfficer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const crops = ['All', 'Maize', 'Beans', 'Tomatoes', 'Sukuma Wiki', 'Potatoes', 'Onions'];

  useEffect(() => {
    loadMarketData();
    loadExtensionOfficers();
  }, []);

  const loadMarketData = () => {
    // Mock market data
    const mockPrices: MarketPrice[] = [
      {
        id: '1',
        crop: 'Maize',
        market: 'Wakulima Market',
        distance: 2.5,
        currentPrice: 3200,
        previousPrice: 3000,
        unit: 'per 90kg bag',
        trend: 'up',
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '2',
        crop: 'Maize',
        market: 'Kangemi Market',
        distance: 5.2,
        currentPrice: 3100,
        previousPrice: 3150,
        unit: 'per 90kg bag',
        trend: 'down',
        lastUpdated: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: '3',
        crop: 'Beans',
        market: 'Wakulima Market',
        distance: 2.5,
        currentPrice: 8500,
        previousPrice: 8500,
        unit: 'per 90kg bag',
        trend: 'stable',
        lastUpdated: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        id: '4',
        crop: 'Tomatoes',
        market: 'Wakulima Market',
        distance: 2.5,
        currentPrice: 45,
        previousPrice: 40,
        unit: 'per kg',
        trend: 'up',
        lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: '5',
        crop: 'Sukuma Wiki',
        market: 'Kangemi Market',
        distance: 5.2,
        currentPrice: 25,
        previousPrice: 30,
        unit: 'per bunch',
        trend: 'down',
        lastUpdated: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: '6',
        crop: 'Potatoes',
        market: 'Githurai Market',
        distance: 8.1,
        currentPrice: 55,
        previousPrice: 55,
        unit: 'per kg',
        trend: 'stable',
        lastUpdated: new Date(Date.now() - 40 * 60 * 1000)
      }
    ];
    setMarketPrices(mockPrices);
  };

  const loadExtensionOfficers = () => {
    // Mock extension officers data
    const mockOfficers: ExtensionOfficer[] = [
      {
        id: '1',
        name: 'Dr. Mary Wanjiku',
        specialization: ['Crop Protection', 'Pest Management', 'Organic Farming'],
        location: 'Nairobi County',
        phone: '+254 712 345 678',
        rating: 4.8,
        experience: 12
      },
      {
        id: '2',
        name: 'James Kiprotich',
        specialization: ['Soil Management', 'Fertilizer Application', 'Maize Production'],
        location: 'Kiambu County',
        phone: '+254 723 456 789',
        rating: 4.6,
        experience: 8
      },
      {
        id: '3',
        name: 'Grace Achieng',
        specialization: ['Vegetable Production', 'Greenhouse Farming', 'Market Linkages'],
        location: 'Nairobi County',
        phone: '+254 734 567 890',
        rating: 4.9,
        experience: 15
      }
    ];
    setExtensionOfficers(mockOfficers);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color="#22C55E" />;
      case 'down':
        return <TrendingDown size={16} color="#EF4444" />;
      default:
        return <Minus size={16} color="#6B7280" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#22C55E';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredPrices = marketPrices.filter(price => 
    (selectedCrop === 'All' || price.crop === selectedCrop) &&
    (searchQuery === '' || price.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
     price.market.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOfficers = extensionOfficers.filter(officer =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const PriceCard = ({ price }: { price: MarketPrice }) => (
    <View style={styles.priceCard}>
      <View style={styles.priceHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{price.crop}</Text>
          <View style={styles.marketInfo}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.marketName}>{price.market}</Text>
            <Text style={styles.distance}>({price.distance}km)</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.currentPrice}>{formatPrice(price.currentPrice)}</Text>
          <Text style={styles.priceUnit}>{price.unit}</Text>
        </View>
      </View>
      
      <View style={styles.priceFooter}>
        <View style={styles.trendContainer}>
          {getTrendIcon(price.trend)}
          <Text style={[styles.trendText, { color: getTrendColor(price.trend) }]}>
            {price.trend === 'up' && '+'}
            {price.trend === 'down' && '-'}
            {price.trend !== 'stable' && formatPrice(Math.abs(price.currentPrice - price.previousPrice))}
            {price.trend === 'stable' && 'No change'}
          </Text>
        </View>
        <Text style={styles.lastUpdated}>Updated {getTimeAgo(price.lastUpdated)}</Text>
      </View>
    </View>
  );

  const OfficerCard = ({ officer }: { officer: ExtensionOfficer }) => (
    <TouchableOpacity
      style={styles.officerCard}
      onPress={() => {
        setSelectedOfficer(officer);
        setOfficerModalVisible(true);
      }}
    >
      <View style={styles.officerHeader}>
        <View style={styles.officerInfo}>
          <Text style={styles.officerName}>{officer.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.officerLocation}>{officer.location}</Text>
          </View>
          <Text style={styles.experience}>{officer.experience} years experience</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {officer.rating}</Text>
        </View>
      </View>
      
      <View style={styles.specializationContainer}>
        {officer.specialization.slice(0, 3).map((spec, index) => (
          <View key={index} style={styles.specializationTag}>
            <Text style={styles.specializationText}>{spec}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Market & Extension</Text>
        <Text style={styles.headerSubtitle}>Real-time prices and expert support</Text>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crops or markets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[
                styles.filterChip,
                selectedCrop === crop && styles.activeFilterChip
              ]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCrop === crop && styles.activeFilterChipText
              ]}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Market Prices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Prices</Text>
        <Text style={styles.sectionSubtitle}>
          Live prices from nearby markets
        </Text>
        {filteredPrices.map((price) => (
          <PriceCard key={price.id} price={price} />
        ))}
      </View>

      {/* Extension Officers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Extension Officers</Text>
        <Text style={styles.sectionSubtitle}>
          Connect with agricultural experts in your area
        </Text>
        {filteredOfficers.map((officer) => (
          <OfficerCard key={officer.id} officer={officer} />
        ))}
      </View>

      {/* Officer Contact Modal */}
      <Modal
        visible={officerModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOfficerModalVisible(false)}
      >
        {selectedOfficer && (
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setOfficerModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedOfficer.name}</Text>
              <View style={styles.officerDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={20} color="#6B7280" />
                  <Text style={styles.detailText}>{selectedOfficer.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={20} color="#6B7280" />
                  <Text style={styles.detailText}>{selectedOfficer.experience} years experience</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.detailText}>{selectedOfficer.rating} rating</Text>
                </View>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Specializations</Text>
                <View style={styles.specializationGrid}>
                  {selectedOfficer.specialization.map((spec, index) => (
                    <View key={index} style={styles.modalSpecializationTag}>
                      <Text style={styles.modalSpecializationText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.callButton}>
                  <Phone size={20} color="white" />
                  <Text style={styles.callButtonText}>Call Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.messageButton}>
                  <MessageSquare size={20} color="#3B82F6" />
                  <Text style={styles.messageButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: 'white',
  },
  priceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketName: {
    fontSize: 14,
    color: '#6B7280',
  },
  distance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  officerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  officerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  officerLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  experience: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specializationTag: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specializationText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  officerDetails: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
  },
  ratingIcon: {
    fontSize: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  specializationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSpecializationTag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalSpecializationText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  contactActions: {
    gap: 12,
  },
  callButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  messageButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});