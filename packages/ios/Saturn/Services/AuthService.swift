import Foundation
import Security
import SwiftUI

enum AuthError: Error {
    case keychainError(OSStatus)
    case tokenNotFound
    case loginFailed
}

protocol AuthServiceProtocol {
    func login(username: String, password: String) async throws
    func logout() throws
    func getCurrentToken() throws -> String?
    func isLoggedIn() -> Bool
}

@MainActor
final class AuthService: AuthServiceProtocol, ObservableObject {
    static let shared = AuthService()
    
    @Published var isAuthenticated: Bool = false
    
    private let tokenKey = "saturn_jwt_token"
    private let serviceName = "com.saturn.app"
    
    private init() {
        checkAuthenticationStatus()
    }
    
    private func checkAuthenticationStatus() {
        do {
            isAuthenticated = try getToken() != nil
        } catch {
            isAuthenticated = false
        }
    }
    
    private func saveToken(_ token: String) throws {
        let tokenData = token.data(using: .utf8)!
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: tokenKey,
            kSecValueData as String: tokenData
        ]
        
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw AuthError.keychainError(status)
        }
    }
    
    private func getToken() throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                return nil
            }
            throw AuthError.keychainError(status)
        }
        
        guard let tokenData = result as? Data,
              let token = String(data: tokenData, encoding: .utf8) else {
            throw AuthError.tokenNotFound
        }
        
        return token
    }
    
    private func deleteToken() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: tokenKey
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw AuthError.keychainError(status)
        }
    }
    
    func login(username: String, password: String) async throws {
        let loginData = [
            "username": username,
            "password": password
        ]
        
        let body = try JSONEncoder().encode(loginData)
        
        do {
            let response: LoginResponse = try await APIService.shared.request(
                endpoint: "auth/login",
                method: "POST",
                body: body
            )
            
            try saveToken(response.token)
            isAuthenticated = true
        } catch {
            throw AuthError.loginFailed
        }
    }
    
    func logout() throws {
        try deleteToken()
        isAuthenticated = false
    }
    
    func getCurrentToken() throws -> String? {
        return try getToken()
    }
    
    func isLoggedIn() -> Bool {
        do {
            return try getToken() != nil
        } catch {
            return false
        }
    }
}