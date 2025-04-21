'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTestPost = void 0;
const createTestPost = async () => {
  return {
    id: 'test-post-id',
    content: 'Test post content',
    authorId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    shares: 0,
    sensitive: false,
    contentWarning: null,
    attachments: [],
    actor: {
      id: 'test-user-id',
      username: 'testuser',
    },
  };
};
exports.createTestPost = createTestPost;
