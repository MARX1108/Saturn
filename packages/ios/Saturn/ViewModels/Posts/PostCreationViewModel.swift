import Foundation
import SwiftUI

@MainActor
final class PostCreationViewModel: ObservableObject {
    @Published var postContent: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var didSuccessfullyPost: Bool = false
    
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
    }
    
    func submitPost() async {
        guard !postContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            errorMessage = "Post content cannot be empty"
            return
        }
        
        guard postContent.trimmingCharacters(in: .whitespacesAndNewlines).count <= 280 else {
            errorMessage = "Post content cannot exceed 280 characters"
            return
        }
        
        isLoading = true
        errorMessage = nil
        didSuccessfullyPost = false
        
        defer {
            isLoading = false
        }
        
        do {
            _ = try await apiService.createPost(content: postContent.trimmingCharacters(in: .whitespacesAndNewlines))
            didSuccessfullyPost = true
            postContent = ""
        } catch {
            errorMessage = "Failed to create post. Please try again."
        }
    }
    
    func resetState() {
        postContent = ""
        errorMessage = nil
        didSuccessfullyPost = false
        isLoading = false
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    var isSubmitEnabled: Bool {
        !postContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isLoading
    }
    
    var characterCount: Int {
        postContent.count
    }
    
    var characterCountColor: Color {
        let count = characterCount
        if count > 280 {
            return .red
        } else if count > 250 {
            return .orange
        } else {
            return .secondary
        }
    }
}