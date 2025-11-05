import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

interface Clan {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  avgSteps: number;
  avgWater: number;
  isJoined: boolean;
}

type JoinClanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'JoinClan'
>;

const JoinClanScreen: React.FC = () => {
  const navigation = useNavigation<JoinClanScreenNavigationProp>();
  const [clanCode, setClanCode] = useState('');
  const [clans, setClans] = useState<Clan[]>([
    {
      id: '1',
      name: 'Hydration Heroes',
      emoji: '💧',
      memberCount: 12,
      avgSteps: 8542,
      avgWater: 2400,
      isJoined: false,
    },
    {
      id: '2',
      name: 'Step Titans',
      emoji: '🔥',
      memberCount: 8,
      avgSteps: 12450,
      avgWater: 2800,
      isJoined: false,
    },
    {
      id: '3',
      name: 'Fitness Fanatics',
      emoji: '💪',
      memberCount: 15,
      avgSteps: 7200,
      avgWater: 2200,
      isJoined: false,
    },
    {
      id: '4',
      name: 'Wellness Warriors',
      emoji: '🌟',
      memberCount: 6,
      avgSteps: 9800,
      avgWater: 2600,
      isJoined: true,
    },
  ]);

  const handleJoinClan = () => {
    if (!clanCode.trim()) {
      Alert.alert('Error', 'Please enter a clan code');
      return;
    }
    Alert.alert('Success', `Joined clan with code: ${clanCode}`);
    setClanCode('');
  };

  const handleJoinClanById = (id: string) =>
    setClans(prev =>
      prev.map(c => (c.id === id ? { ...c, isJoined: true } : c)),
    );

  const handleClanPress = (clan: Clan) => {
    if (clan.isJoined) {
      navigation.navigate('Leaderboard');
    } else {
      Alert.alert('Join Clan', `Would you like to join ${clan.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => handleJoinClanById(clan.id) },
      ]);
    }
  };

  const renderClan = ({ item }: { item: Clan }) => (
    <View style={styles.clanCard}>
      <View style={styles.clanHeader}>
        <Text style={styles.clanName}>
          {item.emoji} {item.name}
        </Text>
        <Text style={styles.memberCount}>{item.memberCount} Members</Text>
      </View>
      <View style={styles.clanStats}>
        <Text style={styles.statText}>
          Avg: {item.avgSteps.toLocaleString()} steps
        </Text>
        <Text style={styles.statText}>Avg: {item.avgWater}ml water</Text>
      </View>
      <View style={styles.joinButtonContainer}>
        <TouchableOpacity
          style={[styles.joinButton, item.isJoined && styles.joinedButton]}
          onPress={() => handleClanPress(item)}
        >
          <Text
            style={[
              styles.joinButtonText,
              item.isJoined && styles.joinedButtonText,
            ]}
          >
            {item.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.gradient}>
        <FlatList
          data={clans}
          keyExtractor={item => item.id}
          renderItem={renderClan}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Join a Clan</Text>
                <Text style={styles.subtitle}>
                  Compete with others, climb the leaderboard, and stay
                  motivated!
                </Text>
              </View>

              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={clanCode}
                    onChangeText={setClanCode}
                    placeholder="Enter Clan Code"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                  <TouchableOpacity
                    style={styles.joinButtonSmall}
                    onPress={handleJoinClan}
                  >
                    <Text style={styles.joinButtonTextSmall}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Available Clans</Text>
            </>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>Syncs every 24 hours</Text>
              <TouchableOpacity style={styles.leaveButton}>
                <Text style={styles.leaveButtonText}>Leave Clan</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, backgroundColor: '#121212' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 5,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },
  joinButtonSmall: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
  },
  joinButtonTextSmall: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  clanCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  clanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clanName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  memberCount: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  clanStats: { marginBottom: 15 },
  statText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 5 },
  joinButtonContainer: { alignItems: 'flex-end' },
  joinButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  joinedButton: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  joinButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  joinedButtonText: { color: '#667eea' },
  footer: { alignItems: 'center', paddingTop: 10 },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 15,
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  leaveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#f44336' },
});

export default JoinClanScreen;
