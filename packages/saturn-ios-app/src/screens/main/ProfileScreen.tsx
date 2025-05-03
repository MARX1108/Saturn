import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  SafeAreaView,
} from 'react-native';
// Import navigation types if needed to access route params later
// import { MainTabScreenProps } from '../../navigation/types';

// Placeholder image URL
const PLACEHOLDER_AVATAR =
  'https://placehold.co/100x100/EFEFEF/AAAAAA&text=PFP';

// Define props if needed (e.g., receiving username from route)
// type ProfileScreenProps = MainTabScreenProps<'ProfileTab'>;
// export default function ProfileScreen({ route }: ProfileScreenProps): React.JSX.Element {
// const username = route.params?.username || 'MyProfile'; // Get username from route later

export default function ProfileScreen(): React.JSX.Element {
  // Placeholder data - replace with fetched data later
  const profileData = {
    displayName: 'Placeholder User',
    username: 'placeholderuser',
    bio: 'This is a placeholder bio description for the profile screen layout.',
    avatarUrl: null, // Use placeholder image
    followersCount: 123,
    followingCount: 45,
    // Add isOwnProfile flag later
  };

  const handleEditProfileOrFollow = () => {
    // Implement logic later based on whether it's own profile or not
    console.log('Edit Profile / Follow button pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Profile Header --- */}
        <View style={styles.header}>
          <Image
            source={{ uri: profileData.avatarUrl || PLACEHOLDER_AVATAR }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.displayName}>{profileData.displayName}</Text>
            <Text style={styles.username}>@{profileData.username}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>
                <Text style={styles.statCount}>
                  {profileData.followingCount}
                </Text>{' '}
                Following
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.statCount}>
                  {profileData.followersCount}
                </Text>{' '}
                Followers
              </Text>
            </View>
          </View>
          <Button
            title="Edit Profile" // Change to "Follow/Unfollow" later
            onPress={handleEditProfileOrFollow}
          />
        </View>

        {/* --- Bio --- */}
        {profileData.bio && <Text style={styles.bio}>{profileData.bio}</Text>}

        {/* --- Content Area Placeholder --- */}
        <View style={styles.contentArea}>
          <Text style={styles.contentPlaceholderText}>
            User Posts / Content Area Placeholder
          </Text>
          {/* Add Tabs or FlatList for posts later */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Profile often has white background
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to top
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80, // Larger avatar for profile
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  headerText: {
    flex: 1, // Take remaining space
    marginRight: 16,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  username: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginRight: 16, // Space between stats
  },
  statCount: {
    fontWeight: 'bold',
  },
  bio: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  contentArea: {
    flex: 1, // Take remaining vertical space
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
});
