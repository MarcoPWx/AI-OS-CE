// src/screens/MultiplayerLobbyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MultiplayerService, { MultiplayerRoom } from '../services/multiplayerService';
import { useAuth } from '../hooks/useAuth';
import { MockLoginPanel } from '../components/MockLoginPanel';
import MockAuthService from '../services/mockAuth';

const GAME_MODES = [
  { id: 'speed', name: 'Speed Quiz', icon: '⚡', description: 'Fast-paced questions' },
  { id: 'accuracy', name: 'Accuracy Challenge', icon: '🎯', description: 'Precision matters' },
  { id: 'survival', name: 'Survival Mode', icon: '💀', description: "One mistake and you're out" },
  { id: 'tournament', name: 'Tournament', icon: '🏆', description: 'Bracket-style competition' },
];

const CATEGORIES = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'CSS', 'HTML', 'Git'];

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export default function MultiplayerLobbyScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Create room form state
  const [roomName, setRoomName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('JavaScript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'easy' | 'medium' | 'hard' | 'expert'
  >('medium');
  const [selectedGameMode, setSelectedGameMode] = useState<
    'speed' | 'accuracy' | 'survival' | 'tournament'
  >('speed');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      connectToMultiplayer();
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (isConnected) {
      loadRooms();

      // Set up real-time room updates
      MultiplayerService.on('room_created', handleRoomUpdate);
      MultiplayerService.on('room_updated', handleRoomUpdate);
      MultiplayerService.on('room_deleted', handleRoomUpdate);

      return () => {
        MultiplayerService.off('room_created', handleRoomUpdate);
        MultiplayerService.off('room_updated', handleRoomUpdate);
        MultiplayerService.off('room_deleted', handleRoomUpdate);
      };
    }
  }, [isConnected]);

  const connectToMultiplayer = async () => {
    if (!auth.user) return;

    setConnecting(true);

    try {
      const connected = await MultiplayerService.connect(auth.user.id, 'mock-token');
      setIsConnected(connected);

      if (!connected) {
        Alert.alert(
          'Connection Failed',
          'Unable to connect to multiplayer server. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Failed to connect to multiplayer:', error);
      Alert.alert('Error', 'Failed to connect to multiplayer service');
    } finally {
      setConnecting(false);
    }
  };

  const handleRoomUpdate = () => {
    loadRooms();
  };

  const loadRooms = async () => {
    try {
      const roomList = await MultiplayerService.getRooms();
      setRooms(roomList);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    try {
      const room = await MultiplayerService.createRoom({
        name: roomName,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        gameMode: selectedGameMode,
        maxPlayers,
        timeLimit,
        questionCount,
        isPrivate,
      });

      if (room) {
        setShowCreateRoom(false);
        navigation.navigate('MultiplayerRoom' as never, { roomId: room.id } as never);
      } else {
        Alert.alert('Error', 'Failed to create room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      Alert.alert('Error', 'Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const success = await MultiplayerService.joinRoom(roomId);

      if (success) {
        navigation.navigate('MultiplayerRoom' as never, { roomId } as never);
      } else {
        Alert.alert('Error', 'Failed to join room');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      Alert.alert('Error', 'Failed to join room');
    }
  };

  const resetCreateRoomForm = () => {
    setRoomName('');
    setSelectedCategory('JavaScript');
    setSelectedDifficulty('medium');
    setSelectedGameMode('speed');
    setMaxPlayers(4);
    setTimeLimit(30);
    setQuestionCount(10);
    setIsPrivate(false);
  };

  const getGameModeInfo = (mode: string) => {
    return GAME_MODES.find((m) => m.id === mode) || GAME_MODES[0];
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return '#4CAF50';
      case 'starting':
        return '#FF9800';
      case 'active':
        return '#F44336';
      case 'finished':
        return '#9E9E9E';
      default:
        return '#4CAF50';
    }
  };

  // Show mock login if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.authPrompt}>
            <MaterialCommunityIcons name="account-multiple" size={80} color="#fff" />
            <Text style={styles.authTitle}>Join Multiplayer</Text>
            <Text style={styles.authSubtitle}>
              Sign in to compete with other players in real-time quizzes
            </Text>
            <TouchableOpacity style={styles.mockLoginButton} onPress={() => setShowMockLogin(true)}>
              <Text style={styles.mockLoginText}>🎭 Mock Login (Dev)</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {showMockLogin && <MockLoginPanel onClose={() => setShowMockLogin(false)} />}
      </SafeAreaView>
    );
  }

  // Show connecting state
  if (connecting || !isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.connectingContainer}>
            <MaterialCommunityIcons name="wifi" size={60} color="#fff" />
            <Text style={styles.connectingTitle}>
              {connecting ? 'Connecting...' : 'Connection Failed'}
            </Text>
            <Text style={styles.connectingSubtitle}>
              {connecting
                ? 'Establishing connection to multiplayer server'
                : 'Unable to connect to multiplayer server'}
            </Text>
            {!connecting && (
              <TouchableOpacity style={styles.retryButton} onPress={connectToMultiplayer}>
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Multiplayer Lobby</Text>
            <Text style={styles.headerSubtitle}>
              {rooms.length} active rooms • {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowCreateRoom(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Room List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="gamepad-variant-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Active Rooms</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to create a multiplayer quiz room!
            </Text>
            <TouchableOpacity
              style={styles.createFirstRoomButton}
              onPress={() => setShowCreateRoom(true)}
            >
              <Text style={styles.createFirstRoomText}>Create Room</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rooms.map((room) => {
            const gameModeInfo = getGameModeInfo(room.gameMode);
            return (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() => handleJoinRoom(room.id)}
                disabled={room.status === 'active' || room.currentPlayers >= room.maxPlayers}
              >
                <View style={styles.roomHeader}>
                  <View style={styles.roomTitleContainer}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getRoomStatusColor(room.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{room.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  {room.isPrivate && <Ionicons name="lock-closed" size={16} color="#FF9800" />}
                </View>

                <View style={styles.roomInfo}>
                  <View style={styles.roomDetail}>
                    <Text style={styles.roomDetailIcon}>{gameModeInfo.icon}</Text>
                    <Text style={styles.roomDetailText}>{gameModeInfo.name}</Text>
                  </View>
                  <View style={styles.roomDetail}>
                    <Ionicons name="library-outline" size={16} color="#666" />
                    <Text style={styles.roomDetailText}>{room.category}</Text>
                  </View>
                  <View style={styles.roomDetail}>
                    <Ionicons name="speedometer-outline" size={16} color="#666" />
                    <Text style={styles.roomDetailText}>{room.difficulty}</Text>
                  </View>
                </View>

                <View style={styles.roomFooter}>
                  <View style={styles.playerCount}>
                    <Ionicons name="people" size={16} color="#667eea" />
                    <Text style={styles.playerCountText}>
                      {room.currentPlayers}/{room.maxPlayers} players
                    </Text>
                  </View>
                  <View style={styles.roomStats}>
                    <Text style={styles.roomStatText}>{room.questionCount}Q</Text>
                    <Text style={styles.roomStatText}>{room.timeLimit}s</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Create Room Modal */}
      <Modal
        visible={showCreateRoom}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateRoom(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateRoom(false);
                  resetCreateRoomForm();
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Room</Text>
              <TouchableOpacity onPress={handleCreateRoom}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {/* Room Name */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Room Name</Text>
              <TextInput
                style={styles.textInput}
                value={roomName}
                onChangeText={setRoomName}
                placeholder="Enter room name..."
                maxLength={30}
              />
            </View>

            {/* Game Mode */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Game Mode</Text>
              <View style={styles.optionGrid}>
                {GAME_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.optionCard,
                      selectedGameMode === mode.id && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedGameMode(mode.id as any)}
                  >
                    <Text style={styles.optionIcon}>{mode.icon}</Text>
                    <Text style={styles.optionName}>{mode.name}</Text>
                    <Text style={styles.optionDescription}>{mode.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category & Difficulty */}
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[styles.chip, selectedCategory === category && styles.chipSelected]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedCategory === category && styles.chipTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Difficulty</Text>
                <View style={styles.chipContainer}>
                  {DIFFICULTIES.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.chip,
                        selectedDifficulty === difficulty && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedDifficulty(difficulty as any)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedDifficulty === difficulty && styles.chipTextSelected,
                        ]}
                      >
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Settings */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Settings</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Players</Text>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    onPress={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="remove" size={20} color="#667eea" />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{maxPlayers}</Text>
                  <TouchableOpacity
                    onPress={() => setMaxPlayers(Math.min(8, maxPlayers + 1))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Time per Question</Text>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    onPress={() => setTimeLimit(Math.max(10, timeLimit - 5))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="remove" size={20} color="#667eea" />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{timeLimit}s</Text>
                  <TouchableOpacity
                    onPress={() => setTimeLimit(Math.min(60, timeLimit + 5))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Number of Questions</Text>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    onPress={() => setQuestionCount(Math.max(5, questionCount - 5))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="remove" size={20} color="#667eea" />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{questionCount}</Text>
                  <TouchableOpacity
                    onPress={() => setQuestionCount(Math.min(50, questionCount + 5))}
                    style={styles.numberButton}
                  >
                    <Ionicons name="add" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPrivate(!isPrivate)}>
                <Text style={styles.settingLabel}>Private Room</Text>
                <View style={[styles.toggle, isPrivate && styles.toggleActive]}>
                  {isPrivate && <View style={styles.toggleThumb} />}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  mockLoginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mockLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  connectingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  connectingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstRoomButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstRoomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  roomInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  roomDetailIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  roomDetailText: {
    fontSize: 12,
    color: '#666',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerCountText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
  },
  roomStats: {
    flexDirection: 'row',
  },
  roomStatText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  formHalf: {
    flex: 1,
    marginRight: 12,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
  },
  optionCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  numberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#667eea',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});
