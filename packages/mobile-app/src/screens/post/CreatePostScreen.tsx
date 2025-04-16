import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import TextInputWrapper from '../../components/ui/TextInputWrapper';
import Button from '../../components/ui/Button';
import postService from '../../services/postService';
import { useTheme } from '../../theme/ThemeContext';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  // State management
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate if the post button should be enabled
  const isPostButtonEnabled =
    (postContent.trim().length > 0 || selectedImage) && !isSubmitting;

  // Request media library permissions
  const getMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Request camera permissions
  const getCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Pick image from library
  const pickImage = async () => {
    const hasPermission = await getMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await getCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Handle post submission
  const handleSubmitPost = async () => {
    if ((!postContent.trim() && !selectedImage) || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await postService.createPost(postContent.trim(), selectedImage);

      // On success, go back to previous screen
      navigation.goBack();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSelectedImage(null);
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
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Cancel
            </Text>
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
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
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

        {/* Media selection buttons */}
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.mediaButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={pickImage}
            disabled={isSubmitting}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text
              style={[styles.mediaButtonText, { color: theme.colors.text }]}
            >
              Choose Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mediaButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={takePhoto}
            disabled={isSubmitting}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text
              style={[styles.mediaButtonText, { color: theme.colors.text }]}
            >
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected image preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[
                styles.removeImageButton,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={() => setSelectedImage(null)}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Loading indicator */}
        {isSubmitting && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: theme.colors.background + 'CC' },
            ]}
          >
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
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePostScreen;
