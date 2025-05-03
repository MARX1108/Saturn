import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder props - will be replaced with actual Post type later
interface PostCardProps {
  id: string; // Need a key for FlatList
  author?: string;
  content?: string;
  timestamp?: string;
}

const PostCard = ({
  author,
  content,
  timestamp,
}: PostCardProps): React.JSX.Element => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{author || 'Placeholder Author'}</Text>
        <Text style={styles.timestamp}>{timestamp || 'Timestamp'}</Text>
      </View>
      <Text style={styles.content}>
        {content || 'Placeholder post content goes here...'}
      </Text>
      {/* Add placeholders for actions (Like, Comment) later */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  author: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 14,
  },
});

export default PostCard;
