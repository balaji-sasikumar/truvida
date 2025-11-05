import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

interface User {
  id: string;
  name: string;
  initial: string;
  rank: number;
  steps: number;
  stepsTarget: number;
  water: number;
  waterTarget: number;
  isCurrentUser: boolean;
}

interface Clan {
  name: string;
  emoji: string;
}

const LeaderboardScreen: React.FC = () => {
  const [clan] = useState<Clan>({ name: 'Step Titans', emoji: '🔥' });
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'You (Balaji)',
      initial: 'B',
      rank: 1,
      steps: 9500,
      stepsTarget: 10000,
      water: 2700,
      waterTarget: 3000,
      isCurrentUser: true,
    },
    {
      id: '2',
      name: 'Rishi',
      initial: 'R',
      rank: 2,
      steps: 8700,
      stepsTarget: 10000,
      water: 2500,
      waterTarget: 3000,
      isCurrentUser: false,
    },
    {
      id: '3',
      name: 'Rahul',
      initial: 'R',
      rank: 3,
      steps: 7800,
      stepsTarget: 10000,
      water: 2200,
      waterTarget: 3000,
      isCurrentUser: false,
    },
    {
      id: '4',
      name: 'Sneha',
      initial: 'S',
      rank: 4,
      steps: 7200,
      stepsTarget: 10000,
      water: 2100,
      waterTarget: 3000,
      isCurrentUser: false,
    },
  ]);

  const CircularChart: React.FC<{
    progress: number;
    target: number;
    size: number;
    color: string;
  }> = ({ progress, target, size, color }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressPercent = Math.min((progress / target) * 100, 100);
    const strokeDashoffset =
      circumference - (progressPercent / 100) * circumference;

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2d2d2d"
            strokeWidth="4"
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.chartTextContainer}>
          <Text style={styles.chartText}>{Math.round(progressPercent)}%</Text>
        </View>
      </View>
    );
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFB800']; // gold
      case 2:
        return ['#C0C0C0', '#A8A8A8']; // silver
      case 3:
        return ['#CD7F32', '#B87333']; // bronze
      default:
        return ['#2d2d2d', '#2d2d2d']; // normal
    }
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => {
    const gradientColors = user.isCurrentUser
      ? ['#667eea', '#764ba2']
      : getRankColor(user.rank);

    return (
      <LinearGradient
        colors={user.isCurrentUser ? gradientColors : ['#1e1e1e', '#1e1e1e']}
        style={[styles.userCard, user.isCurrentUser && styles.currentUserCard]}
      >
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              user.isCurrentUser && styles.currentUserAvatar,
            ]}
          >
            <Text style={styles.avatarText}>{user.initial}</Text>
          </View>
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>#{user.rank}</Text>
          </View>
          <View style={styles.userData}>
            <Text
              style={[
                styles.userName,
                user.isCurrentUser && styles.currentUserName,
              ]}
            >
              {user.name}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.chartWrapper}>
                <Text style={styles.chartLabel}>Steps</Text>
                <CircularChart
                  progress={user.steps}
                  target={user.stepsTarget}
                  size={40}
                  color="#667eea"
                />
              </View>
              <View style={styles.chartWrapper}>
                <Text style={styles.chartLabel}>Water</Text>
                <CircularChart
                  progress={user.water}
                  target={user.waterTarget}
                  size={40}
                  color="#4CAF50"
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.gradient}>
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.clanTitle}>
                {clan.emoji} {clan.name}
              </Text>
              <Text style={styles.subtitle}>Leaderboard for this week</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>Syncs every 24 hours</Text>
              <TouchableOpacity style={styles.refreshButton}>
                <Text style={styles.refreshText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, backgroundColor: '#121212' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  clanTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  userCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  currentUserCard: {
    borderWidth: 1.5,
    borderColor: '#7F7EFF',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currentUserAvatar: {
    backgroundColor: '#fff',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  rankContainer: { width: 40, alignItems: 'center', marginRight: 15 },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  userData: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  currentUserName: { color: '#fff', fontWeight: 'bold' },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 130,
  },
  chartWrapper: { alignItems: 'center' },
  chartLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 5 },
  chartContainer: { alignItems: 'center', justifyContent: 'center' },
  chartTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2d2d2d',
  },
  refreshText: { fontSize: 14, color: '#667eea', fontWeight: 'bold' },
});

export default LeaderboardScreen;
