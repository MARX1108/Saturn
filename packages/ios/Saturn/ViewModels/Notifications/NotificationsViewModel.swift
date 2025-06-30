import Foundation

@MainActor
final class NotificationsViewModel: ObservableObject {
    @Published private(set) var notifications: [Notification] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
    }
    
    func fetchNotifications() async {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        NSLog("🔔 NotificationsViewModel: Starting fetchNotifications")
        
        // For testing purposes, always show mock data for now
        // TODO: Uncomment API call when ready for production
        /*
        do {
            let fetchedNotifications = try await apiService.getNotifications()
            
            // If API returns empty, add mock data for testing
            if fetchedNotifications.isEmpty {
                notifications = createMockNotifications()
            } else {
                notifications = fetchedNotifications
            }
        } catch {
            // For testing purposes, show mock data instead of error
            notifications = createMockNotifications()
            // Uncomment the line below to show actual errors:
            // errorMessage = "Failed to fetch notifications."
        }
        */
        
        // Add a small delay to simulate loading
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        // Temporarily always use mock data for testing
        let mockNotifications = createMockNotifications()
        NSLog("🔔 NotificationsViewModel: Created \(mockNotifications.count) mock notifications")
        
        await MainActor.run {
            notifications = mockNotifications
            NSLog("🔔 NotificationsViewModel: Set notifications array to \(notifications.count) items")
        }
    }
    
    private func createMockNotifications() -> [Notification] {
        let mockActor1 = Actor(id: "1", username: "alice", preferredUsername: "Alice Johnson")
        let mockActor2 = Actor(id: "2", username: "bob", preferredUsername: "Bob Smith")
        let mockActor3 = Actor(id: "3", username: "carol", preferredUsername: "Carol Williams")
        
        let mockPost = NotificationPost(id: "post1", content: "This is a great post about SwiftUI!")
        
        return [
            Notification(
                id: "notif1",
                type: .LIKE,
                read: false,
                createdAt: "2025-06-29T10:00:00Z",
                actor: mockActor1,
                post: mockPost
            ),
            Notification(
                id: "notif2",
                type: .FOLLOW,
                read: true,
                createdAt: "2025-06-29T09:30:00Z",
                actor: mockActor2,
                post: nil
            ),
            Notification(
                id: "notif3",
                type: .MENTION,
                read: false,
                createdAt: "2025-06-29T09:00:00Z",
                actor: mockActor3,
                post: mockPost
            ),
            Notification(
                id: "notif4",
                type: .REPOST,
                read: true,
                createdAt: "2025-06-29T08:45:00Z",
                actor: mockActor1,
                post: mockPost
            ),
            Notification(
                id: "notif5",
                type: .COMMENT,
                read: false,
                createdAt: "2025-06-29T08:30:00Z",
                actor: mockActor2,
                post: mockPost
            )
        ]
    }
}