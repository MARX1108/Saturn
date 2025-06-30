import SwiftUI

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationsViewModel()
    @EnvironmentObject private var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        VStack {
                if viewModel.isLoading && viewModel.notifications.isEmpty {
                    VStack {
                        ProgressView()
                            .scaleEffect(1.2)
                        Text("Loading notifications...")
                            .font(.caption)
                            .foregroundColor(colors.secondaryText)
                            .padding(.top, 8)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)
                        
                        Text("Error")
                            .font(.title2)
                            .fontWeight(.medium)
                            .foregroundColor(colors.primaryText)
                        
                        Text(errorMessage)
                            .font(.body)
                            .foregroundColor(colors.secondaryText)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        Button("Retry") {
                            Task {
                                await viewModel.fetchNotifications()
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        if viewModel.notifications.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "bell.slash")
                                    .font(.system(size: 48))
                                    .foregroundColor(colors.secondaryText)
                                
                                Text("No notifications")
                                    .font(.title2)
                                    .foregroundColor(colors.primaryText)
                                
                                Text("You have no notifications yet")
                                    .font(.caption)
                                    .foregroundColor(colors.secondaryText)
                                
                                Text("Debug: notifications count = \(viewModel.notifications.count)")
                                    .font(.caption2)
                                    .foregroundColor(.orange)
                                
                                Text("Loading: \(viewModel.isLoading ? "Yes" : "No")")
                                    .font(.caption2)
                                    .foregroundColor(.orange)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 100)
                            .listRowSeparator(.hidden)
                        } else {
                            ForEach(viewModel.notifications) { notification in
                                NotificationRowView(notification: notification)
                            }
                        }
                    }
                    .refreshable {
                        NSLog("🔔 NotificationsView: Pull to refresh triggered")
                        await viewModel.fetchNotifications()
                    }
                    .onAppear {
                        NSLog("🔔 NotificationsView: View appeared, notifications count = \(viewModel.notifications.count)")
                        Task {
                            await viewModel.fetchNotifications()
                        }
                    }
                }
        }
        .background(colors.primaryBackground)
        .navigationTitle("Notifications")
        .configureNavigationBar()
        .id("notifications-\(themeManager.currentTheme.id)")
    }
}

private struct NotificationRowView: View {
    let notification: Notification
    @EnvironmentObject var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        NavigationLink(destination: destinationView) {
            HStack(spacing: 12) {
                Image(systemName: iconName)
                    .font(.title2)
                    .foregroundColor(colors.primaryAccent)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(notification.actor.preferredUsername ?? notification.actor.username)
                        .font(.themed(size: 17, weight: .semibold))
                        .foregroundColor(colors.primaryText)
                    
                    Text(notificationMessage)
                        .font(.themed(size: 15))
                        .foregroundColor(colors.secondaryText)
                        .lineLimit(2)
                    
                    Text(timeAgo)
                        .font(.themed(size: 12))
                        .foregroundColor(colors.secondaryText)
                }
                
                Spacer()
                
                if !notification.read {
                    Circle()
                        .fill(colors.primaryAccent)
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.vertical, 4)
        }
    }
    
    private var iconName: String {
        switch notification.type {
        case .LIKE:
            return "heart.fill"
        case .FOLLOW:
            return "person.badge.plus"
        case .MENTION:
            return "at"
        case .REPOST:
            return "arrow.2.squarepath"
        case .COMMENT:
            return "message"
        }
    }
    
    private var notificationMessage: String {
        let username = notification.actor.preferredUsername ?? notification.actor.username
        
        switch notification.type {
        case .LIKE:
            return "liked your post"
        case .FOLLOW:
            return "started following you"
        case .MENTION:
            return "mentioned you in a post"
        case .REPOST:
            return "reposted your post"
        case .COMMENT:
            return "commented on your post"
        }
    }
    
    private var timeAgo: String {
        // Simple time formatting - in a real app you'd use a proper date formatter
        return "Recently"
    }
    
    @ViewBuilder
    private var destinationView: some View {
        switch notification.type {
        case .FOLLOW:
            ProfileView(username: notification.actor.username)
        case .LIKE, .REPOST, .COMMENT, .MENTION:
            if let post = notification.post {
                // For now, navigate to the actor's profile
                // In a real app, you'd navigate to the specific post
                ProfileView(username: notification.actor.username)
            } else {
                ProfileView(username: notification.actor.username)
            }
        }
    }
}

#Preview {
    NotificationsView()
}