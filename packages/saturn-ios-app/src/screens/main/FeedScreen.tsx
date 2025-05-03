import React from 'react';
import { StyleSheet, FlatList, SafeAreaView } from 'react-native';
import PostCard from '../../components/PostCard';

// Placeholder data structure - align with PostCardProps for now
interface PlaceholderPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

// Static placeholder data for UI layout
const PLACEHOLDER_FEED_DATA: PlaceholderPost[] = [
  {
    id: '1',
    author: 'User One',
    content: 'This is the first placeholder post!',
    timestamp: '10m ago',
  },
  {
    id: '2',
    author: 'User Two',
    content: 'Just setting up my Saturn app.',
    timestamp: '1h ago',
  },
  {
    id: '3',
    author: 'User Three',
    content: 'React Native is fun! Building the feed UI.',
    timestamp: '3h ago',
  },
  {
    id: '4',
    author: 'User Four',
    content: 'Placeholder content number four.',
    timestamp: '5h ago',
  },
  {
    id: '5',
    author: 'User Five',
    content: 'Testing the FlatList rendering.',
    timestamp: '1d ago',
  },
];

export default function FeedScreen(): React.JSX.Element {
  // Render item function for FlatList
  const renderItem = ({ item }: { item: PlaceholderPost }) => (
    <PostCard
      id={item.id}
      author={item.author}
      content={item.content}
      timestamp={item.timestamp}
    />
  );

  return (
    // Use SafeAreaView to avoid notches/status bars
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={PLACEHOLDER_FEED_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        // Add ListHeaderComponent, ListEmptyComponent, etc. later
      />
    </SafeAreaView>
  );
}

// Update styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Background for the whole screen area
  },
  listContainer: {
    paddingTop: 8, // Add some padding at the top of the list
    paddingBottom: 8, // Add some padding at the bottom
  },
});
