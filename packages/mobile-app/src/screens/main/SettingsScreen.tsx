import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MainTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import StyledText from '../../components/ui/StyledText';
import pluginService from '../../services/pluginService';
import {
  PluginManifest,
  SettingsMenuItemContribution,
} from '../../types/plugin';

const SettingsScreen = ({
  navigation,
}: MainTabScreenProps<'Settings'>): React.JSX.Element => {
  const theme = useTheme();
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        setIsLoading(true);
        const loadedPlugins = await pluginService.loadPluginManifests();
        setPlugins(loadedPlugins);
      } catch (err) {
        setError('Failed to load plugins');
        console.error('Error loading plugins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlugins();
  }, []);

  const handleMenuItemPress = (item: SettingsMenuItemContribution) => {
    if (item.targetRoute) {
      navigation.navigate(item.targetRoute as never);
    }
  };

  const renderPluginMenuItems = () => {
    if (isLoading) {
      return (
        <View style={styles.section}>
          <StyledText color={theme.colors.textSecondary}>
            Loading plugins...
          </StyledText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.section}>
          <StyledText color={theme.colors.error}>{error}</StyledText>
        </View>
      );
    }

    const menuItems = plugins.flatMap(
      plugin => plugin.contributions?.settingsMenuItems || []
    );

    if (menuItems.length === 0) {
      return (
        <View style={styles.section}>
          <StyledText color={theme.colors.textSecondary}>
            No plugin menu items available
          </StyledText>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <StyledText
          weight="semibold"
          color={theme.colors.textSecondary}
          style={styles.sectionTitle}
        >
          Extensions
        </StyledText>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              { borderBottomColor: theme.colors.border },
            ]}
            onPress={() => handleMenuItemPress(item)}
          >
            {item.icon && (
              <Ionicons
                name={item.icon as any}
                size={24}
                color={theme.colors.text}
                style={styles.menuItemIcon}
              />
            )}
            <StyledText
              weight="medium"
              color={theme.colors.text}
              style={styles.menuItemText}
            >
              {item.label}
            </StyledText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* App Settings Section */}
      <View style={styles.section}>
        <StyledText
          weight="semibold"
          color={theme.colors.textSecondary}
          style={styles.sectionTitle}
        >
          App Settings
        </StyledText>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('ThemeSettings' as never)}
        >
          <Ionicons
            name="color-palette-outline"
            size={24}
            color={theme.colors.text}
            style={styles.menuItemIcon}
          />
          <StyledText
            weight="medium"
            color={theme.colors.text}
            style={styles.menuItemText}
          >
            Theme
          </StyledText>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Plugin Menu Items */}
      {renderPluginMenuItems()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
});

export default SettingsScreen;
