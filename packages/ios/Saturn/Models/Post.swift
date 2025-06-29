import Foundation

struct Post: Codable, Identifiable {
    let id: String
    let content: String
    let createdAt: Date
    var likes: Int
    let commentsCount: Int
    var isLiked: Bool
    let actor: Actor
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case createdAt = "published"
        case likes
        case commentsCount = "replyCount"
        case isLiked = "likedByUser"
        case actor = "author"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        content = try container.decode(String.self, forKey: .content)
        likes = try container.decodeIfPresent(Int.self, forKey: .likes) ?? 0
        commentsCount = try container.decodeIfPresent(Int.self, forKey: .commentsCount) ?? 0
        isLiked = try container.decodeIfPresent(Bool.self, forKey: .isLiked) ?? false
        actor = try container.decode(Actor.self, forKey: .actor)
        
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        createdAt = formatter.date(from: createdAtString) ?? Date()
    }
    
    // Simple initializer for testing/previews
    init(id: String, content: String, createdAt: Date, likes: Int, commentsCount: Int, isLiked: Bool, actor: Actor) {
        self.id = id
        self.content = content
        self.createdAt = createdAt
        self.likes = likes
        self.commentsCount = commentsCount
        self.isLiked = isLiked
        self.actor = actor
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

extension Post {
    init(from response: CreatedPostResponse) {
        self.id = response.id
        self.content = response.content
        self.createdAt = response.createdAt
        self.actor = Actor(id: response.actor.id, username: response.actor.username, preferredUsername: response.actor.preferredUsername)
        self.likes = 0
        self.commentsCount = 0
        self.isLiked = false
    }
}