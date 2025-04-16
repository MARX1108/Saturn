import { Ionicons } from '@expo/vector-icons';
import StyledText from '../../components/ui/StyledText';
import { useTheme } from '../../theme/ThemeContext';

const SearchScreen: React.FC = () => {
  const theme = useTheme();
  // ... existing state and handlers ...

  // Render empty state
  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={theme.colors.textSecondary}
          style={styles.emptyIcon}
        />
        <StyledText
          weight="medium"
          color={theme.colors.textSecondary}
          style={styles.emptyText}
        >
          No results found
        </StyledText>
        <StyledText
          color={theme.colors.textSecondary}
          style={styles.emptySubtext}
        >
          Try searching with different keywords
        </StyledText>
      </View>
    );
  };

  // ... rest of the component ...

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* ... existing search input ... */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
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
  // ... rest of the styles ...
});
