import Foundation

enum NotificationType: String, Codable, CaseIterable {
    case LIKE
    case FOLLOW
    case MENTION
    case REPOST
    case COMMENT
}

struct NotificationPost: Codable, Identifiable {
    let id: String
    let content: String
}

struct PaginationInfo: Codable {
    let currentPage: Int
    let totalPages: Int
    let totalItems: Int
    let hasNext: Bool
    let hasPrev: Bool
    
    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case totalItems = "total_items"
        case hasNext = "has_next"
        case hasPrev = "has_prev"
    }
}

struct Notification: Codable, Identifiable {
    let id: String
    let type: NotificationType
    let read: Bool
    let createdAt: String
    let actor: Actor
    let post: NotificationPost?
    
    enum CodingKeys: String, CodingKey {
        case id
        case type
        case read
        case createdAt = "created_at"
        case actor
        case post
    }
}

struct NotificationResponse: Codable {
    let notifications: [Notification]
    let pagination: PaginationInfo
}