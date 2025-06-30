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
    
    func fetchActor(username: String) async throws -> Actor
    func fetchPosts() async throws -> [Post]
    func fetchPosts(for username: String) async throws -> [Post]
    func createPost(content: String) async throws -> CreatedPostResponse
    func likePost(postId: String) async throws
    func unlikePost(postId: String) async throws
    func searchActors(query: String) async throws -> [Actor]
    func getNotifications() async throws -> [Notification]
}

final class APIService: APIServiceProtocol {
    static let shared = APIService()
    
    private let baseURL = "http://127.0.0.1:4000/api"
    private let session: URLSession
    
    public init(session: URLSession = .shared) {
        self.session = session
    }
    
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
            
            NSLog("🟡 APIService: Response data: \(String(data: data, encoding: .utf8) ?? "invalid UTF-8")")
            
            guard let httpResponse = response as? HTTPURLResponse else {
                NSLog("🔴 APIService: Invalid response type")
                throw APIError.invalidResponse
            }
            
            NSLog("🟡 APIService: HTTP Status: \(httpResponse.statusCode)")
            
            guard 200...299 ~= httpResponse.statusCode else {
                NSLog("🔴 APIService: HTTP error - Status: \(httpResponse.statusCode), Data: \(String(data: data, encoding: .utf8) ?? "invalid")")
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
                let result = try decoder.decode(T.self, from: data)
                NSLog("🟢 APIService: Successfully decoded response")
                return result
            } catch {
                NSLog("🔴 APIService: Decoding failed - Error: \(error)")
                NSLog("🔴 APIService: Raw response data: \(String(data: data, encoding: .utf8) ?? "invalid")")
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    func fetchPosts() async throws -> [Post] {
        let token = try await AuthService.shared.getCurrentToken()
        NSLog("🟡 APIService: Fetching posts with token: \(token?.prefix(20) ?? "nil")...")
        do {
            let response: PostsResponse = try await request<PostsResponse>(endpoint: "posts", method: "GET", body: nil, authToken: token)
            NSLog("🟢 APIService: Successfully decoded \(response.posts.count) posts")
            // Debug: log the first post's ID format to understand the server response
            if let firstPost = response.posts.first {
                NSLog("🔍 DEBUG: First post ID format: '\(firstPost.id)'")
            }
            return response.posts
        } catch {
            NSLog("🔴 APIService: Error fetching posts: \(error)")
            throw error
        }
    }
    
    func createPost(content: String) async throws -> CreatedPostResponse {
        let token = try await AuthService.shared.getCurrentToken()
        NSLog("🟡 APIService: Creating post with content: \(content.prefix(50))...")
        NSLog("🟡 APIService: Using token: \(token?.prefix(20) ?? "nil")...")
        
        let postData = [
            "content": content
        ]
        
        let body = try JSONEncoder().encode(postData)
        NSLog("🟡 APIService: Request body: \(String(data: body, encoding: .utf8) ?? "invalid")")
        
        do {
            let response: CreatedPostResponse = try await request<CreatedPostResponse>(
                endpoint: "posts",
                method: "POST",
                body: body,
                authToken: token
            )
            NSLog("🟢 APIService: Successfully created post with ID: \(response.id)")
            return response
        } catch {
            NSLog("🔴 APIService: Error creating post: \(error)")
            if let apiError = error as? APIError {
                switch apiError {
                case .decodingError(let decodingError):
                    NSLog("🔴 Decoding error details: \(decodingError)")
                case .httpError(let statusCode):
                    NSLog("🔴 HTTP error status: \(statusCode)")
                case .networkError(let networkError):
                    NSLog("🔴 Network error: \(networkError)")
                default:
                    NSLog("🔴 Other API error: \(apiError)")
                }
            }
            throw error
        }
    }
    
    func likePost(postId: String) async throws {
        let token = try await AuthService.shared.getCurrentToken()
        let cleanPostId = extractPostId(from: postId)
        
        NSLog("🔵 DEBUG: Liking post - original ID: \(postId), clean ID: \(cleanPostId)")
        
        let _: EmptyResponse = try await request(
            endpoint: "posts/\(cleanPostId)/like",
            method: "POST",
            body: nil,
            authToken: token
        )
    }
    
    func unlikePost(postId: String) async throws {
        let token = try await AuthService.shared.getCurrentToken()
        let cleanPostId = extractPostId(from: postId)
        
        NSLog("🔵 DEBUG: Unliking post - original ID: \(postId), clean ID: \(cleanPostId)")
        
        let _: EmptyResponse = try await request(
            endpoint: "posts/\(cleanPostId)/unlike",
            method: "POST",
            body: nil,
            authToken: token
        )
    }
    
    // Helper function to extract the ID from a full URL
    private func extractPostId(from id: String) -> String {
        // If it's a full URL, extract the ID part
        if id.contains("/posts/") {
            let components = id.components(separatedBy: "/posts/")
            if components.count > 1 {
                let afterPosts = components[1]
                // Extract just the ID part (before any additional path components)
                let idPart = afterPosts.components(separatedBy: "/").first ?? afterPosts
                
                // The server expects MongoDB ObjectId format (24-char hex)
                // If this looks like a UUID, we need to handle the server format mismatch
                if idPart.contains("-") {
                    // This is a UUID format, but server expects ObjectId
                    // Log this for debugging - there may be a server configuration issue
                    NSLog("⚠️ DEBUG: Server sent UUID format but expects ObjectId: \(idPart)")
                }
                
                return idPart
            }
        }
        // If it's already just an ID, return as-is
        return id
    }
    
    func fetchActor(username: String) async throws -> Actor {
        NSLog("🟡 APIService: Fetching actor profile for: \(username)")
        do {
            let actor: Actor = try await request<Actor>(
                endpoint: "actors/\(username)",
                method: "GET",
                body: nil,
                authToken: nil
            )
            NSLog("🟢 APIService: Successfully fetched actor profile for: \(username)")
            return actor
        } catch {
            NSLog("🔴 APIService: Error fetching actor \(username): \(error)")
            throw error
        }
    }
    
    func fetchPosts(for username: String) async throws -> [Post] {
        NSLog("🟡 APIService: Fetching posts for user: \(username)")
        do {
            let response: ActorPostsResponse = try await request<ActorPostsResponse>(
                endpoint: "actors/\(username)/posts",
                method: "GET",
                body: nil,
                authToken: nil
            )
            NSLog("🟢 APIService: Successfully decoded \(response.posts.count) posts for user: \(username)")
            return response.posts
        } catch {
            NSLog("🔴 APIService: Error fetching posts for user \(username): \(error)")
            throw error
        }
    }
    
    func searchActors(query: String) async throws -> [Actor] {
        NSLog("🔍 APIService: Searching actors with query: '\(query)'")
        
        // Construct URL with query parameter safely
        guard var urlComponents = URLComponents(string: "\(baseURL)/actors/search") else {
            NSLog("🔴 APIService: Failed to create URL components for search")
            throw APIError.invalidURL
        }
        
        // Add query parameter
        urlComponents.queryItems = [URLQueryItem(name: "q", value: query)]
        
        guard let url = urlComponents.url else {
            NSLog("🔴 APIService: Failed to construct search URL with query: '\(query)'")
            throw APIError.invalidURL
        }
        
        NSLog("🔍 APIService: Search URL: \(url.absoluteString)")
        
        do {
            // Make request without authentication as per specification
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            
            let (data, urlResponse) = try await session.data(for: request)
            
            guard let httpResponse = urlResponse as? HTTPURLResponse else {
                NSLog("🔴 APIService: Invalid response type for search")
                throw APIError.invalidResponse
            }
            
            let statusCode = httpResponse.statusCode
            NSLog("🔍 APIService: Search response status: \(statusCode)")
            
            if let responseString = String(data: data, encoding: .utf8) {
                NSLog("🔍 APIService: Search response data: \(responseString)")
            }
            
            guard 200...299 ~= statusCode else {
                NSLog("🔴 APIService: Search HTTP error - Status: \(statusCode), Data: \(String(data: data, encoding: .utf8) ?? "nil")")
                throw APIError.httpError(statusCode: statusCode)
            }
            
            let actors = try JSONDecoder().decode([Actor].self, from: data)
            NSLog("🟢 APIService: Successfully decoded \(actors.count) actors for query: '\(query)'")
            return actors
            
        } catch let error as APIError {
            throw error
        } catch {
            NSLog("🔴 APIService: Search network/decoding error: \(error)")
            if error is DecodingError {
                throw APIError.decodingError(error)
            } else {
                throw APIError.networkError(error)
            }
        }
    }
    
    func getNotifications() async throws -> [Notification] {
        let token = try await AuthService.shared.getCurrentToken()
        NSLog("🔔 APIService: Fetching notifications")
        
        do {
            let response: NotificationResponse = try await request<NotificationResponse>(
                endpoint: "notifications",
                method: "GET",
                body: nil,
                authToken: token
            )
            NSLog("🟢 APIService: Successfully fetched \(response.notifications.count) notifications")
            return response.notifications
        } catch {
            NSLog("🔴 APIService: Error fetching notifications: \(error)")
            throw error
        }
    }
}

private struct EmptyResponse: Codable {}

struct ActorSearchResponse: Codable {
    let actors: [Actor]
}
