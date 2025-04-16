import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Post, User } from '../../types';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/feed/PostCard';
import { MainStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import StyledText from '../../components/ui/StyledText';
import { useTheme as useAppTheme } from '../../theme/ThemeContext';

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

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const appTheme = useAppTheme();

  // Get username from route params or use current user's username
  const { username = currentUser?.preferredUsername } = route.params || {};

  // State management
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [totalPostCount, setTotalPostCount] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Fetch profile and posts data
  const fetchData = async (page = 1, shouldRefresh = false) => {
    if (!username) {
      setError('Username not provided');
      setIsLoading(false);
      return;
    }

    try {
      const [profileResponse, postsResponse] = await Promise.all([
        profileService.fetchUserProfile(username),
        profileService.fetchUserPosts(username, page, postsPerPage),
      ]);

      setProfileData(profileResponse);
      setUserPosts(prevPosts =>
        shouldRefresh
          ? postsResponse.posts
          : [...prevPosts, ...postsResponse.posts]
      );
      setHasMorePosts(postsResponse.hasMore);
      setTotalPostCount(postsResponse.totalCount);
      setIsCurrentUser(currentUser?.preferredUsername === username);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      await fetchData(1, true);
      setIsLoading(false);
    };

    loadInitialData();
  }, [username, currentUser]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await fetchData(1, true);
    setIsRefreshing(false);
  }, [username]);

  // Load more posts handler
  const handleLoadMore = useCallback(async () => {
    if (!hasMorePosts || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchData(nextPage, false);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  }, [hasMorePosts, isLoadingMore, currentPage]);

  // Loading footer component
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="images-outline"
          size={48}
          color={appTheme.colors.textSecondary}
          style={styles.emptyIcon}
        />
        <StyledText
          weight="medium"
          color={appTheme.colors.textSecondary}
          style={styles.emptyText}
        >
          No posts yet
        </StyledText>
        <StyledText
          color={appTheme.colors.textSecondary}
          style={styles.emptySubtext}
        >
          Share your first post to get started
        </StyledText>
      </View>
    );
  };

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
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
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
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
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
