import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { Sprout, Calendar, TrendingUp, Shield, Droplets, Sun, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CropRecommendation {
  id: string;
  name: string;
  variety: string;
  suitability: number;
  plantingWindow: string;
  benefits: string[];
  requirements: string;
  expectedYield: string;
}

interface PlantingAlert {
  id: string;
  crop: string;
  action: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Advisory() {
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const recommendations: CropRecommendation[] = [
    {
      id: '1',
      name: 'Maize',
      variety: 'H516 (Drought Tolerant)',
      suitability: 95,
      plantingWindow: 'March 15 - April 10',
      benefits: ['High drought tolerance', 'Good market price', 'Short maturity (90 days)'],
      requirements: 'Well-drained soil, minimal irrigation needed',
      expectedYield: '25-30 bags per acre'
    },
    {
      id: '2',
      name: 'Beans',
      variety: 'KAT B1 (Early Maturing)',
      suitability: 88,
      plantingWindow: 'March 20 - April 15',
      benefits: ['Nitrogen fixation', 'Ready market', 'Intercropping compatible'],
      requirements: 'Moderate rainfall, organic matter',
      expectedYield: '8-12 bags per acre'
    },
    {
      id: '3',
      name: 'Sorghum',
      variety: 'Gadam (High Yield)',
      suitability: 82,
      plantingWindow: 'March 10 - April 5',
      benefits: ['Extreme drought tolerance', 'Multiple uses', 'Low input costs'],
      requirements: 'Minimal water, sandy-loam soil',
      expectedYield: '15-20 bags per acre'
    }
  ];

  const plantingAlerts: PlantingAlert[] = [
    {
      id: '1',
      crop: 'Maize (H516)',
      action: 'Optimal planting window starts',
      timeframe: 'in 5 days',
      priority: 'high'
    },
    {
      id: '2',
      crop: 'Beans (KAT B1)',
      action: 'Prepare seedbed',
      timeframe: 'this week',
      priority: 'medium'
    },
    {
      id: '3',
      crop: 'Previous season harvest',
      action: 'Post-harvest handling reminder',
      timeframe: 'ongoing',
      priority: 'low'
    }
  ];

  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return '#22C55E';
    if (score >= 80) return '#F59E0B';
    return '#EF4444';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const CropCard = ({ crop }: { crop: CropRecommendation }) => (
    <TouchableOpacity
      style={styles.cropCard}
      onPress={() => {
        setSelectedCrop(crop);
        setModalVisible(true);
      }}
    >
      <View style={styles.cropHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.cropVariety}>{crop.variety}</Text>
        </View>
        <View style={styles.suitabilityBadge}>
          <Text style={[styles.suitabilityText, { color: getSuitabilityColor(crop.suitability) }]}>
            {crop.suitability}%
          </Text>
          <Text style={styles.suitabilityLabel}>Match</Text>
        </View>
      </View>
      
      <View style={styles.cropDetails}>
        <View style={styles.cropDetailItem}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.cropDetailText}>{crop.plantingWindow}</Text>
        </View>
        <View style={styles.cropDetailItem}>
          <TrendingUp size={16} color="#6B7280" />
          <Text style={styles.cropDetailText}>{crop.expectedYield}</Text>
        </View>
      </View>
      
      <View style={styles.benefitsList}>
        {crop.benefits.slice(0, 2).map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <CheckCircle size={12} color="#22C55E" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const AlertCard = ({ alert }: { alert: PlantingAlert }) => (
    <View style={[styles.alertCard, { borderLeftColor: getPriorityColor(alert.priority) }]}>
      <View style={styles.alertHeader}>
        <AlertCircle size={18} color={getPriorityColor(alert.priority)} />
        <View style={styles.alertInfo}>
          <Text style={styles.alertCrop}>{alert.crop}</Text>
          <Text style={styles.alertAction}>{alert.action}</Text>
        </View>
        <View style={styles.timeframeContainer}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.timeframeText}>{alert.timeframe}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Planting Advisory</Text>
        <Text style={styles.headerSubtitle}>Personalized recommendations for your farm</Text>
        <View style={styles.locationInfo}>
          <MapPin size={16} color="white" />
          <Text style={styles.locationText}>Nairobi Region • 2.5 acres</Text>
        </View>
      </LinearGradient>

      {/* Planting Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planting Alerts</Text>
        {plantingAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </View>

      {/* Recommended Crops */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Crops</Text>
        <Text style={styles.sectionSubtitle}>
          AI recommendations based on location, soil, weather, and market data
        </Text>
        {recommendations.map((crop) => (
          <CropCard key={crop.id} crop={crop} />
        ))}
      </View>

      {/* Seasonal Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seasonal Insights</Text>
        <View style={styles.insightGrid}>
          <View style={styles.insightCard}>
            <Sun size={24} color="#F59E0B" />
            <Text style={styles.insightTitle}>Growing Season</Text>
            <Text style={styles.insightValue}>Long Rains</Text>
            <Text style={styles.insightSubtext}>March - June</Text>
          </View>
          <View style={styles.insightCard}>
            <Droplets size={24} color="#3B82F6" />
            <Text style={styles.insightTitle}>Rainfall Outlook</Text>
            <Text style={styles.insightValue}>Normal to Above</Text>
            <Text style={styles.insightSubtext}>85% probability</Text>
          </View>
          <View style={styles.insightCard}>
            <TrendingUp size={24} color="#22C55E" />
            <Text style={styles.insightTitle}>Market Outlook</Text>
            <Text style={styles.insightValue}>Favorable</Text>
            <Text style={styles.insightSubtext}>Good demand expected</Text>
          </View>
        </View>
      </View>

      {/* Crop Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedCrop && (
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedCrop.name}</Text>
              <Text style={styles.modalVariety}>{selectedCrop.variety}</Text>
              
              <View style={styles.modalSuitability}>
                <Text style={styles.modalSuitabilityTitle}>Suitability Score</Text>
                <Text style={[styles.modalSuitabilityScore, { color: getSuitabilityColor(selectedCrop.suitability) }]}>
                  {selectedCrop.suitability}% Match
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Planting Window</Text>
                <Text style={styles.modalSectionContent}>{selectedCrop.plantingWindow}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Expected Yield</Text>
                <Text style={styles.modalSectionContent}>{selectedCrop.expectedYield}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Requirements</Text>
                <Text style={styles.modalSectionContent}>{selectedCrop.requirements}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Key Benefits</Text>
                {selectedCrop.benefits.map((benefit, index) => (
                  <View key={index} style={styles.modalBenefitItem}>
                    <CheckCircle size={16} color="#22C55E" />
                    <Text style={styles.modalBenefitText}>{benefit}</Text>
                  </View>
                ))}
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
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
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
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertAction: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeframeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cropCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cropVariety: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  suitabilityBadge: {
    alignItems: 'center',
  },
  suitabilityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  suitabilityLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  cropDetails: {
    gap: 8,
    marginBottom: 16,
  },
  cropDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cropDetailText: {
    fontSize: 14,
    color: '#374151',
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
    textAlign: 'center',
  },
  insightSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalVariety: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  modalSuitability: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalSuitabilityTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalSuitabilityScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  modalBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalBenefitText: {
    fontSize: 16,
    color: '#374151',
  },
});