import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  TextInput,
  StyleSheet,
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useNavigation,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCreatePost } from '../../hooks/useCreatePost';
import { useAppSelector } from '../../store/hooks';
import * as Haptics from 'expo-haptics';

// Define colors to avoid inline literals
const COLORS = {
  WHITE: '#fff',
  LIGHT_GRAY: '#ccc',
  MEDIUM_GRAY: '#999',
  TOMATO: 'tomato',
  LIGHT_RED: '#ffcccc',
  RED: 'red',
  WARNING_BG: '#fff3cd',
  WARNING_TEXT: '#856404',
  WARNING_BORDER: '#ffeeba',
};

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePostModal'
>;

export default function CreatePostScreen(): React.JSX.Element {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const [postContent, setPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: submitPost, isError, error } = useCreatePost();
  const user = useAppSelector((state) => state.auth.user);
  const profileComplete = useAppSelector((state) => state.auth.profileComplete);

  // Check if the profile is complete on mount
  useLayoutEffect(() => {
    if (!profileComplete && user) {
      Alert.alert(
        'Profile Setup Required',
        'Your profile is incomplete. Please make sure your profile is set up before posting.',
        [
          {
            text: 'Complete Profile',
            onPress: () => {
              navigation.goBack(); // Close the create post modal
              // Navigate to profile edit
              setTimeout(() => {
                navigation.navigate('ProfileEditModal');
              }, 300);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  }, [navigation, profileComplete, user]);

  const handlePost = useCallback((): void => {
    if (!postContent.trim() || isLoading) return; // Prevent empty posts or double submit
    if (!profileComplete) {
      Alert.alert(
        'Profile Setup Required',
        'Your profile is incomplete. Please make sure your profile is set up before posting.',
        [
          {
            text: 'Complete Profile',
            onPress: () => {
              navigation.goBack(); // Close the create post modal
              // Navigate to profile edit
              setTimeout(() => {
                navigation.navigate('ProfileEditModal');
              }, 300);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    setIsLoading(true);

    // Call the mutation
    submitPost(
      { content: postContent },
      {
        onSuccess: (): void => {
          console.log('Post created successfully');
          // Trigger success haptic feedback
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          // Reset form
          setPostContent('');
          setIsLoading(false);
          // Close the modal
          navigation.dispatch(StackActions.pop());
        },
        onError: (err): void => {
          try {
            console.error('Error creating post:', err);
            // Trigger error haptic feedback
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );

            // Handle specific error cases
            if (err?.message?.includes('Author not found')) {
              // Show error alert
              Alert.alert(
                'Profile Setup Required',
                'Your profile is incomplete. Please make sure your profile is set up before posting.'
              );

              // Navigate to profile after a slight delay
              setTimeout((): void => {
                try {
                  navigation.goBack(); // Close the create post modal
                  // Navigate to profile tab with proper navigation
                  setTimeout((): void => {
                    try {
                      // Use navigate to ProfileEditModal
                      navigation.navigate('ProfileEditModal');
                    } catch (navError) {
                      console.error('Error navigating to Profile:', navError);
                    }
                  }, 300); // Small delay to ensure modal is closed first
                } catch (error) {
                  console.error('Error in profile navigation:', error);
                }
              }, 500);
            } else {
              // Show error alert
              Alert.alert(
                'Post Failed',
                err?.message || 'Failed to create post. Please try again.'
              );
            }
          } catch (errorHandlerError) {
            console.error('Error in error handler:', errorHandlerError);
          }
          setIsLoading(false);
        },
      }
    );
  }, [postContent, isLoading, submitPost, navigation, profileComplete]);

  useLayoutEffect(() => {
    // Set up the "Post" button in the header
    navigation.setOptions({
      title: 'Create Post',
      headerRight: () => (
        <Button
          title="Post"
          onPress={handlePost}
          disabled={postContent.trim() === '' || isLoading}
        />
      ),
      headerLeft: () => (
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        />
      ),
      headerTitleAlign: 'center', // Position title in the center (iOS style)
    });
  }, [navigation, handlePost, postContent, isLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TextInput
          style={styles.input}
          placeholder="What's happening?"
          value={postContent}
          onChangeText={setPostContent}
          multiline
          autoFocus
          editable={!isLoading}
        />

        {/* Show error message if there is one */}
        {isError && error && (
          <Text style={styles.errorText}>Error: {error.message}</Text>
        )}

        {/* Additional buttons in case header buttons aren't working */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          {isLoading ? (
            <View style={styles.postButton}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.postButton,
                !postContent.trim() && styles.disabledButton,
              ]}
              onPress={handlePost}
              disabled={!postContent.trim() || isLoading}
            >
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  postButton: {
    backgroundColor: COLORS.TOMATO,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: COLORS.LIGHT_RED,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.RED,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  headerLoadingIndicator: {
    marginRight: 10,
    color: COLORS.MEDIUM_GRAY,
  },
});
