import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import TextInputWrapper from '../../components/ui/TextInputWrapper';
import Button from '../../components/ui/Button';
import postService from '../../services/postService';
import { useTheme } from '@react-navigation/native';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  // State management
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate if the post button should be enabled
  const isPostButtonEnabled = postContent.trim().length > 0 && !isSubmitting;

  // Handle post submission
  const handleSubmitPost = async () => {
    if (!postContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await postService.createPost(postContent.trim());

      // On success, go back to previous screen
      navigation.goBack();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button press
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScreenWrapper style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Button
            title="Post"
            onPress={handleSubmitPost}
            disabled={!isPostButtonEnabled}
            style={[
              styles.postButton,
              !isPostButtonEnabled && styles.postButtonDisabled,
            ]}
            titleStyle={styles.postButtonText}
          />
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Post content input */}
        <TextInputWrapper
          placeholder="What's happening?"
          value={postContent}
          onChangeText={setPostContent}
          multiline
          textAlignVertical="top"
          numberOfLines={5}
          autoFocus
          style={styles.postInput}
          inputContainerStyle={styles.postInputContainer}
          editable={!isSubmitting}
        />

        {/* Loading indicator */}
        {isSubmitting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1DA1F2',
  },
  postButtonDisabled: {
    backgroundColor: '#AAD8F2',
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  postInputContainer: {
    minHeight: 120,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
    borderWidth: 0,
  },
  postInput: {
    fontSize: 18,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default CreatePostScreen;
