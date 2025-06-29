import Foundation

struct CreatedPostResponse: Codable {
    let id: String
    let content: String
    let createdAt: Date
    let actor: PostActor
    
    struct PostActor: Codable {
        let id: String
        let username: String
        let preferredUsername: String
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case createdAt = "published"
        case actor = "author"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        content = try container.decode(String.self, forKey: .content)
        actor = try container.decode(PostActor.self, forKey: .actor)
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        createdAt = formatter.date(from: createdAtString) ?? Date()
    }
}