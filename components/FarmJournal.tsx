import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { BookOpen, Plus, Calendar, Droplets, Sprout, Bug, TrendingUp, Save, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JournalEntry {
  id: string;
  date: Date;
  activity: string;
  crop: string;
  notes: string;
  category: 'planting' | 'irrigation' | 'fertilizer' | 'pest' | 'harvest' | 'other';
  quantity?: string;
  cost?: number;
}

interface FarmJournalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FarmJournal({ visible, onClose }: FarmJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    activity: '',
    crop: '',
    notes: '',
    category: 'other',
    quantity: '',
    cost: 0
  });

  const categories = [
    { key: 'planting', label: 'Planting', icon: Sprout, color: '#22C55E' },
    { key: 'irrigation', label: 'Irrigation', icon: Droplets, color: '#3B82F6' },
    { key: 'fertilizer', label: 'Fertilizer', icon: TrendingUp, color: '#F59E0B' },
    { key: 'pest', label: 'Pest Control', icon: Bug, color: '#EF4444' },
    { key: 'harvest', label: 'Harvest', icon: Calendar, color: '#8B5CF6' },
    { key: 'other', label: 'Other', icon: BookOpen, color: '#6B7280' }
  ];

  useEffect(() => {
    if (visible) {
      loadEntries();
    }
  }, [visible]);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('farmJournalEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setEntries(parsedEntries.sort((a: JournalEntry, b: JournalEntry) => 
          b.date.getTime() - a.date.getTime()
        ));
      } else {
        // Load sample entries
        const sampleEntries: JournalEntry[] = [
          {
            id: '1',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            activity: 'Planted maize seeds',
            crop: 'Maize',
            notes: 'Used H516 variety, planted in rows 75cm apart',
            category: 'planting',
            quantity: '2 kg seeds',
            cost: 800
          },
          {
            id: '2',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            activity: 'Applied DAP fertilizer',
            crop: 'Maize',
            notes: 'Applied 50kg DAP per acre at planting',
            category: 'fertilizer',
            quantity: '50 kg',
            cost: 3500
          }
        ];
        setEntries(sampleEntries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const saveEntries = async (updatedEntries: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem('farmJournalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const addEntry = () => {
    if (!newEntry.activity || !newEntry.crop) {
      Alert.alert('Missing Information', 'Please fill in the activity and crop fields.');
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      activity: newEntry.activity!,
      crop: newEntry.crop!,
      notes: newEntry.notes || '',
      category: newEntry.category as JournalEntry['category'],
      quantity: newEntry.quantity,
      cost: newEntry.cost
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    saveEntries(updatedEntries);
    
    setNewEntry({
      activity: '',
      crop: '',
      notes: '',
      category: 'other',
      quantity: '',
      cost: 0
    });
    setAddModalVisible(false);
    Alert.alert('Success', 'Journal entry added successfully!');
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.key === category) || categories[categories.length - 1];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCost = (cost?: number) => {
    if (!cost) return '';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(cost);
  };

  const EntryCard = ({ entry }: { entry: JournalEntry }) => {
    const categoryInfo = getCategoryInfo(entry.category);
    const IconComponent = categoryInfo.icon;

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryIcon}>
            <IconComponent size={20} color={categoryInfo.color} />
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entryActivity}>{entry.activity}</Text>
            <Text style={styles.entryCrop}>{entry.crop}</Text>
            <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
          </View>
          {entry.cost && entry.cost > 0 && (
            <Text style={styles.entryCost}>{formatCost(entry.cost)}</Text>
          )}
        </View>
        
        {entry.notes && (
          <Text style={styles.entryNotes}>{entry.notes}</Text>
        )}
        
        {entry.quantity && (
          <View style={styles.entryQuantity}>
            <Text style={styles.quantityLabel}>Quantity: </Text>
            <Text style={styles.quantityValue}>{entry.quantity}</Text>
          </View>
        )}
      </View>
    );
  };

  const CategorySelector = () => (
    <View style={styles.categorySelector}>
      <Text style={styles.inputLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = newEntry.category === category.key;
          
          return (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: category.color }
              ]}
              onPress={() => setNewEntry(prev => ({ ...prev, category: category.key as JournalEntry['category'] }))}
            >
              <IconComponent 
                size={16} 
                color={isSelected ? 'white' : category.color} 
              />
              <Text style={[
                styles.categoryChipText,
                isSelected && { color: 'white' }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BookOpen size={24} color="#8B5CF6" />
            <View>
              <Text style={styles.headerTitle}>Farm Journal</Text>
              <Text style={styles.headerSubtitle}>Track your farming activities</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Entries List */}
        <ScrollView style={styles.entriesList} showsVerticalScrollIndicator={false}>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No journal entries yet</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your farming activities</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Entry Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.addModalContainer}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Add Journal Entry</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setAddModalVisible(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.addModalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Planted maize seeds"
                  value={newEntry.activity}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, activity: text }))}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Maize, Beans, Tomatoes"
                  value={newEntry.crop}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, crop: text }))}
                />
              </View>
              
              <CategorySelector />
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 2 kg seeds, 50 kg fertilizer"
                  value={newEntry.quantity}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, quantity: text }))}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cost (KES)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={newEntry.cost?.toString()}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, cost: parseFloat(text) || 0 }))}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Additional details about this activity..."
                  value={newEntry.notes}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, notes: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <TouchableOpacity style={styles.saveButton} onPress={addEntry}>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 8,
  },
  entriesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryActivity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  entryCrop: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  entryCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  entryNotes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  entryQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  quantityValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  addModalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 8,
  },
  addModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginBottom: 20,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});