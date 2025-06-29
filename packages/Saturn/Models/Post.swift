import Foundation

struct Post: Codable, Identifiable {
    let id: String
    let content: String
    let createdAt: Date
    let likes: Int
    let commentsCount: Int
    let isLiked: Bool
    let actor: Actor
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case createdAt = "created_at"
        case likes
        case commentsCount = "comments_count"
        case isLiked = "is_liked"
        case actor
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        content = try container.decode(String.self, forKey: .content)
        likes = try container.decode(Int.self, forKey: .likes)
        commentsCount = try container.decode(Int.self, forKey: .commentsCount)
        isLiked = try container.decode(Bool.self, forKey: .isLiked)
        actor = try container.decode(Actor.self, forKey: .actor)
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        createdAt = formatter.date(from: createdAtString) ?? Date()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(content, forKey: .content)
        try container.encode(likes, forKey: .likes)
        try container.encode(commentsCount, forKey: .commentsCount)
        try container.encode(isLiked, forKey: .isLiked)
        try container.encode(actor, forKey: .actor)
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        try container.encode(formatter.string(from: createdAt), forKey: .createdAt)
    }
}