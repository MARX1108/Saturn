import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import type { RouteProp } from '@react-navigation/native'; // Import RouteProp
import { MainTabParamList } from '../../navigation/types'; // Import ParamList
import { useUserProfile } from '../../hooks/useUserProfile'; // Import the hook
import { useAppSelector } from '../../store/hooks'; // Import useAppSelector for auth state

// Placeholder image URL
const PLACEHOLDER_AVATAR =
  'https://placehold.co/100x100/EFEFEF/AAAAAA&text=PFP';

// Define route prop type
type ProfileScreenRouteProp = RouteProp<MainTabParamList, 'ProfileTab'>;

export default function ProfileScreen(): React.JSX.Element {
  const route = useRoute<ProfileScreenRouteProp>();
  // Get username from route params. Fallback needed if viewing own profile without param later.
  const profileUsername = route.params?.username; // Example: 'myUsername' was set as initialParam

  // Get logged-in user's info from Redux
  const loggedInUser = useAppSelector((state) => state.auth.user);

  // Determine if this is the logged-in user's own profile
  const isOwnProfile = useMemo(() => {
    return loggedInUser?.username === profileUsername;
  }, [loggedInUser, profileUsername]);

  // --- Placeholder state for follow status ---
  // TODO: Replace this with actual follow status from API data later
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch profile data using the hook
  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch, // Add refetch for retry button
  } = useUserProfile(profileUsername);

  // --- Action Handlers ---
  const handleEditProfile = (): void => {
    console.log('Edit Profile button pressed (Own Profile)');
    // TODO: Navigate to Edit Profile Screen
  };

  const handleFollow = (): void => {
    if (!profileUsername) return;
    console.log(`Follow button pressed for: ${profileUsername}`);
    // TODO: Implement API call via useMutation
    setIsFollowing(true); // Optimistic UI update (placeholder)
  };

  const handleUnfollow = (): void => {
    if (!profileUsername) return;
    console.log(`Unfollow button pressed for: ${profileUsername}`);
    // TODO: Implement API call via useMutation
    setIsFollowing(false); // Optimistic UI update (placeholder)
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

  // Determine which button to show in the header
  const renderHeaderButton = (): React.ReactNode => {
    if (isOwnProfile) {
      return <Button title="Edit Profile" onPress={handleEditProfile} />;
    } else if (isFollowing) {
      // Use a styled TouchableOpacity for better customization later
      return (
        <TouchableOpacity
          onPress={handleUnfollow}
          style={[styles.followButton, styles.followingButton]}
        >
          <Text style={styles.followingButtonText}>Following</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={handleFollow}
          style={[styles.followButton, styles.followButtonActive]}
        >
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      );
    }
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
          {renderHeaderButton()}
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
  // --- Follow Button Styles ---
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 15, // More rounded
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80, // Ensure minimum width
  },
  followButtonActive: {
    // Style for "Follow"
    backgroundColor: '#007AFF', // Example blue
    borderColor: '#007AFF',
  },
  followingButton: {
    // Style for "Following"
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  followButtonText: {
    // Text for "Follow"
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  followingButtonText: {
    // Text for "Following"
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
