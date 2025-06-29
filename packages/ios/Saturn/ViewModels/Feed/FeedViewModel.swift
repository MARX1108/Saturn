import Foundation
import SwiftUI

@MainActor
final class FeedViewModel: ObservableObject {
    @Published var posts: [Post] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
    }
    
    func fetchPosts() async {
        isLoading = true
        errorMessage = nil
        
        defer {
            isLoading = false
        }
        
        do {
            posts = try await apiService.fetchPosts()
            NSLog("🟢 FeedViewModel: Successfully loaded \(posts.count) posts")
        } catch {
            NSLog("🔴 FeedViewModel: Error fetching posts: \(error)")
            if let apiError = error as? APIError {
                switch apiError {
                case .networkError(let networkError):
                    NSLog("🔴 Network error: \(networkError)")
                    errorMessage = "Network error: \(networkError.localizedDescription)"
                case .httpError(let statusCode):
                    NSLog("🔴 HTTP error: \(statusCode)")
                    errorMessage = "Server error (\(statusCode)). Please try again."
                case .decodingError(let decodingError):
                    NSLog("🔴 Decoding error: \(decodingError)")
                    errorMessage = "Data format error. Please try again."
                case .invalidURL:
                    NSLog("🔴 Invalid URL error")
                    errorMessage = "Invalid URL error"
                case .invalidResponse:
                    NSLog("🔴 Invalid response error")
                    errorMessage = "Invalid response error"
                }
            } else {
                NSLog("🔴 Unknown error: \(error)")
                errorMessage = "Failed to load posts. Please try again."
            }
            posts = []
        }
    }
    
    func refreshPosts() async {
        await fetchPosts()
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    private func index(for postId: String) -> Int? {
        return posts.firstIndex { $0.id == postId }
    }
    
    func toggleLikeStatus(for postId: String) {
        print("❤️ DEBUG: FeedViewModel.toggleLikeStatus called for post: \(postId)")
        
        guard let index = self.index(for: postId) else { 
            print("🔴 DEBUG: Could not find post with ID: \(postId)")
            return 
        }
        
        print("❤️ DEBUG: Found post at index \(index), current liked: \(posts[index].isLiked)")
        
        // Create a copy of the post before making changes for potential rollback
        let originalPost = posts[index]
        
        // Optimistic UI update
        let wasLiked = posts[index].isLiked
        posts[index].isLiked.toggle()
        posts[index].likes += wasLiked ? -1 : 1
        
        print("❤️ DEBUG: Updated post optimistically - new liked: \(posts[index].isLiked), new likes: \(posts[index].likes)")
        
        // Perform API call
        Task {
            do {
                print("❤️ DEBUG: Starting API call for \(wasLiked ? "unlike" : "like")")
                if wasLiked {
                    try await apiService.unlikePost(postId: postId)
                } else {
                    try await apiService.likePost(postId: postId)
                }
                print("❤️ DEBUG: API call completed successfully")
            } catch {
                print("🔴 DEBUG: API call failed: \(error)")
                // Revert changes on error
                if let currentIndex = self.index(for: postId) {
                    posts[currentIndex] = originalPost
                    print("❤️ DEBUG: Reverted post to original state")
                }
                errorMessage = "Failed to update like status. Please try again."
            }
        }
    }
}