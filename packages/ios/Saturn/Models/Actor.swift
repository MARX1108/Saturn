import Foundation

struct Actor: Codable, Identifiable {
    let id: String
    let username: String
    var preferredUsername: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case preferredUsername = "preferred_username"
    }
}