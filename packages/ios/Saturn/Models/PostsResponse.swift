import Foundation

struct PostsResponse: Codable {
    let posts: [Post]
    let pagination: Pagination?
    
    struct Pagination: Codable {
        let page: Int
        let limit: Int
        let totalPages: Int
        let totalItems: Int
    }
}

struct ActorPostsResponse: Codable {
    let posts: [Post]
    let pagination: Pagination?
    
    struct Pagination: Codable {
        let page: Int
        let limit: Int
        let totalPages: Int
        let totalItems: Int
    }
}