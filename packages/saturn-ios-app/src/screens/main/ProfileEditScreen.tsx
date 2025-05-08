import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks'; // To get current user data
import { useTheme } from 'styled-components/native';
import type { Theme } from '../../theme/theme';

const PLACEHOLDER_AVATAR =
  'https://placehold.co/100x100/EFEFEF/AAAAAA&text=PFP';

export default function ProfileEditScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const theme = useTheme() as Theme;
  const currentUser = useAppSelector((state) => state.auth.user); // Get logged-in user

  // Initialize state with current user data
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ''
  );
  const [bio, setBio] = useState(currentUser?.bio || '');
  // const [avatarUri, setAvatarUri] = useState<string | null>(currentUser?.avatarUrl || null); // For image picker later
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Placeholder for mutation loading

  // Track changes
  useEffect(() => {
    const changed =
      displayName !== (currentUser?.displayName || '') ||
      bio !== (currentUser?.bio || '');
    // || avatarUri !== (currentUser?.avatarUrl || null); // Add avatar check later
    setIsDirty(changed);
  }, [displayName, bio, /* avatarUri, */ currentUser]);

  const handleSaveChanges = () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true); // Simulate loading
    console.log('Saving profile:', { displayName, bio /*, avatarUri */ });
    // TODO: Call mutation hook here
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false); // Reset dirty state on successful save
      navigation.goBack(); // Go back after successful save
      console.log('Placeholder save complete');
    }, 1500);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    console.log('Change photo pressed');
    // TODO: Implement Image Picker logic (Task 2)
  };

  // Configure Header Buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Edit Profile',
      headerLeft: () => (
        <Button onPress={handleCancel} title="Cancel" disabled={isSaving} />
      ),
      headerRight: () =>
        isSaving ? (
          <ActivityIndicator style={{ marginRight: 10 }} />
        ) : (
          <Button
            onPress={handleSaveChanges}
            title="Save"
            disabled={!isDirty || isSaving}
          />
        ),
    });
  }, [navigation, handleSaveChanges, handleCancel, isDirty, isSaving]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: currentUser?.avatarUrl || PLACEHOLDER_AVATAR }}
            style={[styles.avatar, { backgroundColor: theme.colors.border }]}
          />
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text
              style={[styles.changePhotoText, { color: theme.colors.primary }]}
            >
              Change photo
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Name
        </Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display Name"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              color: theme.colors.textPrimary,
            },
          ]}
          editable={!isSaving}
        />

        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Username
        </Text>
        <TextInput
          value={currentUser?.username || ''}
          editable={false} // Username likely not editable
          placeholder="Username"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              color: theme.colors.textPrimary,
            },
          ]}
        />

        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          style={[
            styles.input,
            styles.bioInput,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              color: theme.colors.textPrimary,
            },
          ]}
          editable={!isSaving}
        />

        {/* Add other fields like website later if needed */}
      </ScrollView>
    </SafeAreaView>
  );
}

// Use StyleSheet for improved performance
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    fontSize: 16,
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
