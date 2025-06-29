import Foundation

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case networkError(Error)
}

protocol APIServiceProtocol {
    func request<T: Codable>(
        endpoint: String,
        method: String,
        body: Data?,
        authToken: String?
    ) async throws -> T
    
    func fetchPosts() async throws -> [Post]
    func createPost(content: String) async throws -> Post
}

final class APIService: APIServiceProtocol {
    static let shared = APIService()
    
    private let baseURL = "https://api.saturn.app/api"
    private let session = URLSession.shared
    
    private init() {}
    
    func request<T: Codable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        authToken: String? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)/\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if let authToken = authToken {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            guard 200...299 ~= httpResponse.statusCode else {
                throw APIError.httpError(statusCode: httpResponse.statusCode)
            }
            
            let decoder = JSONDecoder()
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                guard let date = formatter.date(from: dateString) else {
                    throw DecodingError.dataCorruptedError(
                        in: container,
                        debugDescription: "Invalid date format: \(dateString)"
                    )
                }
                return date
            }
            
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    func fetchPosts() async throws -> [Post] {
        let token = try AuthService.shared.getCurrentToken()
        return try await request<[Post]>(endpoint: "posts", method: "GET", authToken: token)
    }
    
    func createPost(content: String) async throws -> Post {
        let token = try AuthService.shared.getCurrentToken()
        
        let postData = [
            "content": content
        ]
        
        let body = try JSONEncoder().encode(postData)
        
        return try await request<Post>(
            endpoint: "posts",
            method: "POST",
            body: body,
            authToken: token
        )
    }
}