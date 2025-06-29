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
        } catch {
            errorMessage = "Failed to load posts. Please try again."
            posts = []
        }
    }
    
    func refreshPosts() async {
        await fetchPosts()
    }
    
    func clearError() {
        errorMessage = nil
    }
}