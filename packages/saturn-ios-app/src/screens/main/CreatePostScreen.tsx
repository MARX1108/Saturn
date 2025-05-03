import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  TextInput,
  StyleSheet,
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePostModal'
>;

export default function CreatePostScreen(): React.JSX.Element {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const [postContent, setPostContent] = useState('');

  const handlePost = useCallback((): void => {
    console.log('DEBUG - Posting content:', postContent);
    Alert.alert('Posting', `Content: ${postContent}`);

    // Try different navigation methods
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Error with goBack:', error);
      try {
        // Alternative approach
        navigation.dispatch(StackActions.pop());
      } catch (popError) {
        console.error('Error with pop:', popError);
      }
    }
  }, [postContent, navigation]);

  const handleCancel = useCallback((): void => {
    console.log('DEBUG - Cancel pressed, attempting to dismiss modal');

    try {
      navigation.goBack();
    } catch (error) {
      console.error('Error with goBack:', error);
      try {
        // Alternative approach
        navigation.dispatch(StackActions.pop());
      } catch (popError) {
        console.error('Error with pop:', popError);
      }
    }
  }, [navigation]);

  // Configure Header Buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Create Post',
      headerLeft: () => <Button onPress={handleCancel} title="Cancel" />,
      headerRight: () => (
        <Button
          onPress={handlePost}
          title="Post"
          disabled={!postContent.trim()}
        />
      ),
    });
  }, [navigation, postContent, handleCancel, handlePost]);

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
        />

        {/* Additional buttons in case header buttons aren't working */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.postButton,
              !postContent.trim() && styles.disabledButton,
            ]}
            onPress={handlePost}
            disabled={!postContent.trim()}
          >
            <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginTop: 16,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: 'tomato',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffcccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
