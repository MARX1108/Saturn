import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import type { RouteProp } from '@react-navigation/native'; // Import RouteProp
import { MainTabParamList } from '../../navigation/types'; // Import ParamList
import { useUserProfile } from '../../hooks/useUserProfile'; // Import the hook

// Placeholder image URL
const PLACEHOLDER_AVATAR =
  'https://placehold.co/100x100/EFEFEF/AAAAAA&text=PFP';

// Define route prop type
type ProfileScreenRouteProp = RouteProp<MainTabParamList, 'ProfileTab'>;

export default function ProfileScreen(): React.JSX.Element {
  const route = useRoute<ProfileScreenRouteProp>();
  // Get username from route params. Fallback needed if viewing own profile without param later.
  const username = route.params?.username; // Example: 'myUsername' was set as initialParam

  // Fetch profile data using the hook
  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch, // Add refetch for retry button
  } = useUserProfile(username);

  const handleEditProfileOrFollow = (): void => {
    console.log('Edit Profile / Follow button pressed for:', username);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  // --- Error State ---
  if (isError) {
    const errorMessage = error?.message || 'Unknown error';
    const isNotFound = error?.status === 404;

    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading profile:</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        {!isNotFound && ( // Don't show retry for 404 Not Found
          <Button
            title="Retry"
            onPress={() => {
              void refetch();
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- Success State ---
  // Ensure profileData exists before rendering (should be true if !isLoading and !isError)
  if (!profileData) {
    // This case should ideally not be reached if loading/error handled, but good practice
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Text>Profile data unavailable.</Text>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.displayName}>
              {profileData.displayName || profileData.username}
            </Text>
            <Text style={styles.username}>@{profileData.username}</Text>
            {/* Display counts only if available */}
            {(profileData.followingCount !== undefined ||
              profileData.followersCount !== undefined) && (
              <View style={styles.statsContainer}>
                {profileData.followingCount !== undefined && (
                  <Text style={styles.statText}>
                    <Text style={styles.statCount}>
                      {profileData.followingCount}
                    </Text>{' '}
                    Following
                  </Text>
                )}
                {profileData.followersCount !== undefined && (
                  <Text style={styles.statText}>
                    <Text style={styles.statCount}>
                      {profileData.followersCount}
                    </Text>{' '}
                    Followers
                  </Text>
                )}
              </View>
            )}
          </View>
          <Button
            title="Edit Profile" // TODO: Change based on isOwnProfile
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
          {/* Add FlatList for user posts later */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    flexWrap: 'wrap', // Allow stats to wrap on smaller screens
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginRight: 16, // Space between stats
    marginBottom: 4, // Add margin bottom for wrapping
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
    textAlign: 'center',
  },
  centerContent: {
    // Style for loading/error states
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
