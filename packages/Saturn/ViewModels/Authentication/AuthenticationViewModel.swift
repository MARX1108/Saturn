import Foundation
import SwiftUI

@MainActor
final class AuthenticationViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var password: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let authService: AuthServiceProtocol
    
    init(authService: AuthServiceProtocol = AuthService.shared) {
        self.authService = authService
    }
    
    func login() async {
        guard !username.isEmpty && !password.isEmpty else {
            errorMessage = "Please enter both username and password"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            try await authService.login(username: username, password: password)
        } catch {
            errorMessage = "Login failed. Please check your credentials and try again."
        }
        
        isLoading = false
    }
    
    func clearError() {
        errorMessage = nil
    }
}