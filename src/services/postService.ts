// ... existing code ...
      tag: [], // Corrected property name: tag (singular)
      // Replace incorrect fields with correct ones from Post model
      likedBy: [], // Use likedBy for ObjectIds of liking actors
      sharedBy: [], // Use sharedBy for ObjectIds of sharing actors
      replyCount: 0, // Initialize reply count
      likesCount: 0, // Initialize likes count
      sharesCount: 0, // Initialize shares count
      // published will be set by the repository
      // url will be generated based on domain/actor/post id
// ... existing code ...
