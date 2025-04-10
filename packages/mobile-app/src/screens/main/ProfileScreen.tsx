import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Post, User } from '../../types';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/feed/PostCard';
import { MainStackParamList } from '../../navigation/types';

type ProfileScreenRouteProp = RouteProp<MainStackParamList, 'Profile'>;

const ProfileHeader = ({
  profileData,
  isCurrentUser,
  isLoading,
}: {
  profileData: User | null;
  isCurrentUser: boolean;
  isLoading: boolean;
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.avatarContainer}>
        {profileData.icon?.url ? (
          <Image source={{ uri: profileData.icon.url }} style={styles.avatar} />
        ) : (
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.avatarPlaceholder}>
              {profileData.preferredUsername?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.displayName}>
          {profileData.name || profileData.preferredUsername}
        </Text>
        <Text style={styles.username}>@{profileData.preferredUsername}</Text>
        {profileData.summary && (
          <Text style={styles.bio}>{profileData.summary}</Text>
        )}
      </View>
      {isCurrentUser && (
        <Button
          mode="outlined"
          style={styles.editButton}
          onPress={() => console.log('Edit profile')}
        >
          Edit Profile
        </Button>
      )}
    </View>
  );
};

const ProfileScreen = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { currentUser } = useAuth();
  const theme = useTheme();

  // Get username from route params or use current user's username
  const { username = currentUser?.preferredUsername } = route.params || {};

  // State management
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setError('Username not provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch only profile data since fetchUserPosts endpoint is not available in API docs
        const profileResponse = await profileService.fetchUserProfile(username);
        setProfileData(profileResponse);

        // Set empty posts array since the endpoint is not available
        setUserPosts([]);

        // Add a console warning about the missing endpoint
        console.warn(
          'Unable to fetch user posts: API endpoint not documented/available'
        );

        // Determine if this is the current user's profile
        setIsCurrentUser(currentUser?.preferredUsername === username);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser]);

  // Display loading state
  if (isLoading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  // Display error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <ProfileHeader
            profileData={profileData}
            isCurrentUser={isCurrentUser}
            isLoading={isLoading}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    fontSize: 32,
    color: 'white',
  },
  userInfoContainer: {
    marginBottom: 15,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    marginTop: 10,
  },
});

export default ProfileScreen;
