import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Camera, Upload, Scan, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Phone, MessageSquare, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

interface DiagnosisResult {
  id: string;
  disease: string;
  confidence: number;
  description: string;
  symptoms: string[];
  treatments: Treatment[];
  severity: 'low' | 'medium' | 'high';
  imageUri: string;
  timestamp: Date;
}

interface Treatment {
  type: 'organic' | 'chemical' | 'cultural';
  method: string;
  description: string;
  priority: number;
}

export default function Diagnosis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisResult[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Load recent diagnoses from storage
    loadRecentDiagnoses();
  }, []);

  const loadRecentDiagnoses = () => {
    // Mock recent diagnoses data
    const mockDiagnoses: DiagnosisResult[] = [
      {
        id: '1',
        disease: 'Fall Armyworm',
        confidence: 92,
        description: 'Fall armyworm is a destructive pest that feeds on maize leaves and stems.',
        symptoms: ['Irregular holes in leaves', 'Brown frass near feeding sites', 'Damaged growing points'],
        treatments: [
          {
            type: 'organic',
            method: 'Neem oil spray',
            description: 'Apply neem oil solution (20ml per liter) in early morning or evening',
            priority: 1
          },
          {
            type: 'cultural',
            method: 'Hand picking',
            description: 'Remove caterpillars manually during early morning inspection',
            priority: 2
          }
        ],
        severity: 'high',
        imageUri: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        disease: 'Leaf Rust',
        confidence: 88,
        description: 'Fungal disease affecting bean plants, causing orange-brown spots on leaves.',
        symptoms: ['Orange-brown pustules on leaves', 'Yellowing of affected areas', 'Premature leaf drop'],
        treatments: [
          {
            type: 'organic',
            method: 'Copper-based fungicide',
            description: 'Apply copper sulfate solution as preventive measure',
            priority: 1
          }
        ],
        severity: 'medium',
        imageUri: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    setRecentDiagnoses(mockDiagnoses);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos for diagnosis.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const mockResult: DiagnosisResult = {
        id: Date.now().toString(),
        disease: 'Maize Lethal Necrosis Disease',
        confidence: 85,
        description: 'A viral disease that affects maize plants, causing yellowing and necrosis of leaves.',
        symptoms: [
          'Yellow streaking on leaves',
          'Stunted plant growth',
          'Premature plant death',
          'Reduced grain filling'
        ],
        treatments: [
          {
            type: 'cultural',
            method: 'Remove infected plants',
            description: 'Immediately remove and destroy infected plants to prevent spread',
            priority: 1
          },
          {
            type: 'organic',
            method: 'Use resistant varieties',
            description: 'Plant MLND-resistant maize varieties like H516 or DK8031',
            priority: 2
          },
          {
            type: 'cultural',
            method: 'Control thrips vectors',
            description: 'Use reflective mulches and remove weeds that harbor thrips',
            priority: 3
          }
        ],
        severity: 'high',
        imageUri,
        timestamp: new Date()
      };
      
      setDiagnosisResult(mockResult);
      setRecentDiagnoses(prev => [mockResult, ...prev.slice(0, 4)]);
      setIsAnalyzing(false);
      setModalVisible(true);
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'organic': return '🌿';
      case 'chemical': return '🧪';
      case 'cultural': return '🛠️';
      default: return '💡';
    }
  };

  const contactExtensionOfficer = () => {
    Alert.alert(
      'Contact Extension Officer',
      'Would you like to share this diagnosis with a local extension officer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling', 'Connecting to extension officer...') },
        { text: 'Message', onPress: () => Alert.alert('Message Sent', 'Your diagnosis has been shared with the extension officer.') }
      ]
    );
  };

  const DiagnosisCard = ({ diagnosis }: { diagnosis: DiagnosisResult }) => (
    <TouchableOpacity
      style={styles.diagnosisCard}
      onPress={() => {
        setDiagnosisResult(diagnosis);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: diagnosis.imageUri }} style={styles.diagnosisImage} />
      <View style={styles.diagnosisInfo}>
        <Text style={styles.diagnosisDisease}>{diagnosis.disease}</Text>
        <Text style={styles.diagnosisConfidence}>{diagnosis.confidence}% confidence</Text>
        <View style={styles.severityBadge}>
          <View style={[styles.severityDot, { backgroundColor: getSeverityColor(diagnosis.severity) }]} />
          <Text style={[styles.severityText, { color: getSeverityColor(diagnosis.severity) }]}>
            {diagnosis.severity.toUpperCase()} RISK
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Crop Health Diagnosis</Text>
        <Text style={styles.headerSubtitle}>AI-powered pest and disease identification</Text>
      </LinearGradient>

      {/* Camera Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Take a Photo for Diagnosis</Text>
        <Text style={styles.sectionSubtitle}>
          Capture a clear image of the affected plant part (leaf, stem, or fruit)
        </Text>
        
        <View style={styles.cameraActions}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Camera size={32} color="white" />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Upload size={32} color="#EF4444" />
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.analyzingText}>Analyzing image...</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Recent Diagnoses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
        {recentDiagnoses.length > 0 ? (
          recentDiagnoses.map((diagnosis) => (
            <DiagnosisCard key={diagnosis.id} diagnosis={diagnosis} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Scan size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No diagnoses yet</Text>
            <Text style={styles.emptyStateSubtext}>Take a photo to get started</Text>
          </View>
        )}
      </View>

      {/* Diagnosis Result Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {diagnosisResult && (
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
              <Image source={{ uri: diagnosisResult.imageUri }} style={styles.modalImage} />
              
              <View style={styles.diagnosisHeader}>
                <Text style={styles.modalTitle}>{diagnosisResult.disease}</Text>
                <View style={styles.confidenceContainer}>
                  <CheckCircle size={20} color="#22C55E" />
                  <Text style={styles.confidenceText}>{diagnosisResult.confidence}% Confidence</Text>
                </View>
              </View>
              
              <View style={[styles.severityContainer, { backgroundColor: getSeverityColor(diagnosisResult.severity) + '20' }]}>
                <AlertTriangle size={20} color={getSeverityColor(diagnosisResult.severity)} />
                <Text style={[styles.severityLabel, { color: getSeverityColor(diagnosisResult.severity) }]}>
                  {diagnosisResult.severity.toUpperCase()} SEVERITY
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalSectionContent}>{diagnosisResult.description}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Symptoms</Text>
                {diagnosisResult.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.symptomItem}>
                    <View style={styles.symptomBullet} />
                    <Text style={styles.symptomText}>{symptom}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommended Treatments</Text>
                {diagnosisResult.treatments
                  .sort((a, b) => a.priority - b.priority)
                  .map((treatment, index) => (
                    <View key={index} style={styles.treatmentItem}>
                      <View style={styles.treatmentHeader}>
                        <Text style={styles.treatmentIcon}>{getTreatmentIcon(treatment.type)}</Text>
                        <Text style={styles.treatmentMethod}>{treatment.method}</Text>
                        <View style={styles.priorityBadge}>
                          <Text style={styles.priorityText}>#{treatment.priority}</Text>
                        </View>
                      </View>
                      <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                    </View>
                  ))}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.extensionButton} onPress={contactExtensionOfficer}>
                  <Phone size={20} color="white" />
                  <Text style={styles.extensionButtonText}>Contact Extension Officer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton}>
                  <MessageSquare size={20} color="#3B82F6" />
                  <Text style={styles.shareButtonText}>Share Diagnosis</Text>
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
    marginBottom: 20,
  },
  cameraActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  uploadButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 12,
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  diagnosisCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagnosisImage: {
    width: '100%',
    height: 120,
  },
  diagnosisInfo: {
    padding: 16,
  },
  diagnosisDisease: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  diagnosisConfidence: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  diagnosisHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceText: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '600',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: '600',
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
  modalSectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  symptomBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  symptomText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  treatmentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  treatmentIcon: {
    fontSize: 20,
  },
  treatmentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  extensionButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  extensionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
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
  shareButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});