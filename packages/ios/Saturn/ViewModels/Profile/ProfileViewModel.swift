import Foundation
import SwiftUI

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published private(set) var actor: Actor?
    @Published private(set) var posts: [Post] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService: APIServiceProtocol
    private let username: String
    
    init(username: String, apiService: APIServiceProtocol = APIService.shared) {
        self.username = username
        self.apiService = apiService
    }
    
    func fetchProfileData() async {
        isLoading = true
        errorMessage = nil
        
        defer {
            isLoading = false
        }
        
        do {
            // Launch both network requests concurrently for maximum performance
            async let actorTask = apiService.fetchActor(username: username)
            async let postsTask = apiService.fetchPosts(for: username)
            
            // Wait for both tasks to complete
            let (fetchedActor, fetchedPosts) = try await (actorTask, postsTask)
            
            // Update the published properties on the main actor
            actor = fetchedActor
            posts = fetchedPosts
            
        } catch {
            errorMessage = "Failed to load profile data. Please try again."
            NSLog("🔴 ProfileViewModel: Error fetching profile data for \(username): \(error)")
        }
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    func refreshProfile() async {
        await fetchProfileData()
    }
    
    private func index(for postId: String) -> Int? {
        return posts.firstIndex { $0.id == postId }
    }
    
    func toggleLikeStatus(for postId: String) {
        NSLog("❤️ DEBUG: ProfileViewModel.toggleLikeStatus called for post: \(postId)")
        
        guard let index = self.index(for: postId) else { 
            NSLog("🔴 DEBUG: Could not find post with ID: \(postId)")
            return 
        }
        
        NSLog("❤️ DEBUG: Found post at index \(index), current liked: \(posts[index].isLiked)")
        
        // Create a copy of the post before making changes for potential rollback
        let originalPost = posts[index]
        
        // Optimistic UI update
        let wasLiked = posts[index].isLiked
        posts[index].isLiked.toggle()
        posts[index].likes += wasLiked ? -1 : 1
        
        NSLog("❤️ DEBUG: Updated post optimistically - new liked: \(posts[index].isLiked), new likes: \(posts[index].likes)")
        
        // Perform API call
        Task {
            do {
                NSLog("❤️ DEBUG: Starting API call for \(wasLiked ? "unlike" : "like")")
                if wasLiked {
                    try await apiService.unlikePost(postId: postId)
                } else {
                    try await apiService.likePost(postId: postId)
                }
                NSLog("❤️ DEBUG: API call completed successfully")
            } catch {
                NSLog("🔴 DEBUG: API call failed: \(error)")
                // Revert changes on error
                if let currentIndex = self.index(for: postId) {
                    posts[currentIndex] = originalPost
                    NSLog("❤️ DEBUG: Reverted post to original state")
                }
                errorMessage = "Failed to update like status. Please try again."
            }
        }
    }
}