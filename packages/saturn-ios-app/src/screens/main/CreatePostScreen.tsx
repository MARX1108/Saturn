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
} from 'react-native';
import {
  useNavigation,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCreatePost } from '../../hooks/useCreatePost';
import ToastMessage from 'react-native-toast-message';

// Define colors to avoid inline literals
const COLORS = {
  WHITE: '#fff',
  LIGHT_GRAY: '#ccc',
  MEDIUM_GRAY: '#999',
  TOMATO: 'tomato',
  LIGHT_RED: '#ffcccc',
  RED: 'red',
};

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePostModal'
>;

export default function CreatePostScreen(): React.JSX.Element {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const [postContent, setPostContent] = useState('');

  // Use the mutation hook with correct property access for v5
  const mutation = useCreatePost();
  const { mutate: submitPost } = mutation;
  const isLoading = mutation.isPending;
  const isError = mutation.isError;
  const error = mutation.error;

  const handlePost = useCallback((): void => {
    if (!postContent.trim() || isLoading) return; // Prevent empty posts or double submit

    console.log('DEBUG - Posting content:', postContent);

    try {
      submitPost(
        { content: postContent.trim() },
        {
          onSuccess: (newPost): void => {
            try {
              console.log('Post created successfully:', newPost?.id);
              setPostContent(''); // Clear input on success

              // Show success toast
              ToastMessage.show({
                type: 'success',
                text1: 'Success',
                text2: 'Post created successfully!',
                position: 'bottom',
              });

              // Dismiss the modal
              try {
                navigation.goBack();
              } catch (navError) {
                console.error('Error with goBack:', navError);
                try {
                  navigation.dispatch(StackActions.pop());
                } catch (popError) {
                  console.error('Error with pop:', popError);
                }
              }
            } catch (successHandlerError) {
              console.error('Error in success handler:', successHandlerError);
            }
          },
          onError: (err): void => {
            try {
              console.error('Error creating post:', err);

              // Handle specific error cases
              if (err?.message?.includes('Author not found')) {
                ToastMessage.show({
                  type: 'error',
                  text1: 'Profile Setup Required',
                  text2:
                    'Your profile is incomplete. Please make sure your profile is set up before posting.',
                  position: 'bottom',
                });

                // Navigate to profile after a slight delay
                setTimeout((): void => {
                  try {
                    navigation.goBack(); // Close the create post modal
                    // Navigate to profile tab with proper navigation
                    setTimeout((): void => {
                      try {
                        // Use CommonActions to ensure navigation works reliably
                        navigation.dispatch(
                          CommonActions.navigate({
                            name: 'MainFlow',
                            params: {
                              screen: 'ProfileTab',
                            },
                          })
                        );
                      } catch (navError) {
                        console.error('Error navigating to Profile:', navError);
                      }
                    }, 300); // Small delay to ensure modal is closed first
                  } catch (error) {
                    console.error('Error in profile navigation:', error);
                  }
                }, 500);
              } else {
                ToastMessage.show({
                  type: 'error',
                  text1: 'Post Failed',
                  text2:
                    err?.message || 'Failed to create post. Please try again.',
                  position: 'bottom',
                });
              }
            } catch (errorHandlerError) {
              console.error('Error in error handler:', errorHandlerError);
            }
          },
        }
      );
    } catch (submitError) {
      console.error('Failed to submit post:', submitError);
      ToastMessage.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'bottom',
      });
    }
  }, [postContent, navigation, submitPost, isLoading]);

  const handleCancel = useCallback((): void => {
    if (isLoading) {
      // Show toast notification instead of alert
      ToastMessage.show({
        type: 'info',
        text1: 'Post in Progress',
        text2: 'A post is currently being submitted. Please wait.',
        position: 'bottom',
      });
      return;
    }

    console.log('DEBUG - Cancel pressed, attempting to dismiss modal');
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Error with goBack:', error);
      try {
        navigation.dispatch(StackActions.pop());
      } catch (popError) {
        console.error('Error with pop:', popError);
      }
    }
  }, [navigation, isLoading]);

  // Configure Header Buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Create Post',
      headerLeft: () => (
        <Button onPress={handleCancel} title="Cancel" disabled={isLoading} />
      ),
      headerRight: () =>
        isLoading ? (
          <ActivityIndicator style={styles.headerLoadingIndicator} />
        ) : (
          <Button
            onPress={handlePost}
            title="Post"
            disabled={!postContent.trim() || isLoading}
          />
        ),
    });
  }, [navigation, postContent, handleCancel, handlePost, isLoading]);

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
            onPress={handleCancel}
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
