import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import TextInputWrapper from '../../components/ui/TextInputWrapper';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInputWrapper
            placeholder="Search users..."
            value=""
            onChangeText={() => {}}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.colors.text }]}
            containerStyle={[
              styles.searchInputContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        </View>
      </View>
      <View
        style={[
          styles.resultsContainer,
          { backgroundColor: theme.colors.background },
        ]}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInputContainer: {
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 0,
  },
  searchInput: {
    paddingLeft: 40,
    height: 40,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
});

export default SearchScreen;
