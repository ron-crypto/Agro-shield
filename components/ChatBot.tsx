import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MessageSquare, Send, Mic, X, Bot, User } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatBot({ visible, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Habari! I\'m your farming assistant. Ask me anything about crops, pests, weather, or farming techniques. You can type in English or Swahili.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const farmingKnowledge = {
    'sukuma wiki': {
      spacing: 'Plant sukuma wiki 30cm apart in rows that are 45cm apart.',
      care: 'Water regularly and harvest outer leaves when they reach 15-20cm long.',
      pests: 'Watch out for aphids and cutworms. Use neem oil for organic control.'
    },
    'fall armyworm': {
      signs: 'Look for irregular holes in leaves, brown frass near feeding sites, and damaged growing points.',
      control: 'Use neem oil spray, hand picking in early morning, or plant trap crops like Napier grass.',
      prevention: 'Rotate crops, maintain field hygiene, and use resistant maize varieties.'
    },
    'maize': {
      planting: 'Plant maize at the onset of rains, 75cm between rows and 25cm between plants.',
      fertilizer: 'Apply DAP at planting and top-dress with CAN 3-4 weeks after germination.',
      harvest: 'Harvest when moisture content is 20-25% for proper storage.'
    },
    'beans': {
      planting: 'Plant beans 10cm apart in rows 30cm apart. Can intercrop with maize.',
      care: 'Beans fix nitrogen, so minimal fertilizer needed. Weed regularly.',
      harvest: 'Harvest when pods are dry and rattle when shaken.'
    },
    'tomatoes': {
      planting: 'Start in nursery, transplant after 4-6 weeks. Space 60cm apart.',
      care: 'Stake plants, prune suckers, and water consistently to prevent blossom end rot.',
      diseases: 'Common diseases include blight and bacterial wilt. Use resistant varieties.'
    }
  };

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for greetings
    if (message.includes('habari') || message.includes('hello') || message.includes('hi')) {
      return 'Habari! How can I help you with your farming today? You can ask about crops, pests, planting, or any farming techniques.';
    }
    
    // Check for specific topics
    for (const [topic, info] of Object.entries(farmingKnowledge)) {
      if (message.includes(topic)) {
        if (message.includes('space') || message.includes('spacing') || message.includes('plant')) {
          return info.spacing || info.planting || `For ${topic}, ensure proper spacing for optimal growth.`;
        }
        if (message.includes('pest') || message.includes('disease') || message.includes('problem')) {
          return info.pests || info.diseases || info.control || `Common issues with ${topic} can be managed with integrated pest management.`;
        }
        if (message.includes('care') || message.includes('maintain') || message.includes('grow')) {
          return info.care || info.fertilizer || `Proper care for ${topic} includes regular monitoring and appropriate inputs.`;
        }
        if (message.includes('harvest') || message.includes('when')) {
          return info.harvest || `Harvest ${topic} at the right maturity stage for best quality.`;
        }
        // Default response for the topic
        return Object.values(info)[0] || `I can help you with ${topic}. What specifically would you like to know?`;
      }
    }
    
    // Weather-related questions
    if (message.includes('weather') || message.includes('rain') || message.includes('drought')) {
      return 'Check the Weather tab for detailed forecasts. Generally, plant at the onset of rains and prepare for dry spells with drought-resistant varieties.';
    }
    
    // Fertilizer questions
    if (message.includes('fertilizer') || message.includes('manure')) {
      return 'Use organic manure as base fertilizer. For maize, apply DAP at planting (50kg/acre) and top-dress with CAN after 3-4 weeks. Soil testing helps determine exact needs.';
    }
    
    // Market questions
    if (message.includes('price') || message.includes('market') || message.includes('sell')) {
      return 'Check the Market tab for current prices at nearby markets. Prices vary by season and quality. Consider value addition and direct sales for better margins.';
    }
    
    // Default response
    return 'I\'m here to help with farming questions! You can ask about:\n• Crop planting and spacing\n• Pest and disease management\n• Fertilizer application\n• Harvest timing\n• Weather and market information\n\nWhat would you like to know?';
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <View style={styles.messageHeader}>
        {message.sender === 'bot' ? (
          <Bot size={16} color="#22C55E" />
        ) : (
          <User size={16} color="white" />
        )}
        <Text style={[
          styles.messageText,
          message.sender === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[
        styles.messageTime,
        message.sender === 'user' ? styles.userMessageTime : styles.botMessageTime
      ]}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bot size={24} color="#22C55E" />
            <View>
              <Text style={styles.headerTitle}>Farming Assistant</Text>
              <Text style={styles.headerSubtitle}>AI-powered agricultural support</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <View style={styles.messageHeader}>
                <Bot size={16} color="#22C55E" />
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about farming, crops, pests..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageBubble: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#22C55E',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 4,
  },
  micButton: {
    padding: 4,
  },
  sendButton: {
    backgroundColor: '#22C55E',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});