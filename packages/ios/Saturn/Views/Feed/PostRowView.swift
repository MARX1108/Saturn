import SwiftUI

struct PostRowView: View {
    let post: Post
    let likeAction: () -> Void
    @State private var debugMessage = ""
    @State private var showDebug = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Debug indicator
            if showDebug {
                Text(debugMessage)
                    .font(.caption)
                    .foregroundColor(.orange)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(4)
            }
            
            // User profile header with navigation
            HStack {
                NavigationLink(destination: ProfileView(username: post.actor.username)) {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.blue)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(post.actor.preferredUsername ?? post.actor.username)
                                .font(.headline)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            
                            Text("@\(post.actor.username)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Text(post.createdAt, style: .relative)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .buttonStyle(.plain)
                .simultaneousGesture(TapGesture().onEnded {
                    NSLog("🔵 DEBUG: Profile navigation triggered for user: \(post.actor.username)")
                    debugMessage = "Profile nav: \(post.actor.username)"
                    showDebug = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        showDebug = false
                    }
                })
            }
            
            // Post content
            VStack(alignment: .leading, spacing: 8) {
                Text(post.content)
                    .font(.body)
                    .multilineTextAlignment(.leading)
                
                Button {
                    NSLog("🟡 DEBUG: Content area tapped")
                    debugMessage = "Content tapped"
                    showDebug = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        showDebug = false
                    }
                } label: {
                    Text("Tap content test")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .buttonStyle(.plain)
            }
            
            // Action buttons row
            HStack(spacing: 20) {
                Button {
                    NSLog("❤️ DEBUG: Like button tapped for post \(post.id), current liked: \(post.isLiked)")
                    debugMessage = "Like: \(post.isLiked ? "unlike" : "like")"
                    showDebug = true
                    likeAction()
                    NSLog("❤️ DEBUG: Like action completed")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        showDebug = false
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: post.isLiked ? "heart.fill" : "heart")
                            .foregroundColor(post.isLiked ? .red : .secondary)
                        Text("\(post.likes)")
                            .foregroundColor(.secondary)
                    }
                }
                .buttonStyle(.plain)
                
                Text("likes")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Button {
                    NSLog("💬 DEBUG: Comments button tapped for post \(post.id)")
                    debugMessage = "Comments tapped"
                    showDebug = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        showDebug = false
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "bubble.right")
                            .foregroundColor(.secondary)
                        Text("\(post.commentsCount)")
                            .foregroundColor(.secondary)
                    }
                }
                .buttonStyle(.plain)
                
                Spacer()
            }
        }
        .padding(16)
    }
}

#Preview {
    PostRowView(
        post: Post(
            id: "1",
            content: "This is a sample post to demonstrate the UI layout and design.",
            createdAt: Date(),
            likes: 42,
            commentsCount: 7,
            isLiked: true,
            actor: Actor(
                id: "1",
                username: "sampleuser",
                preferredUsername: "sampleuser"
            )
        ),
        likeAction: {}
    )
    .padding()
}