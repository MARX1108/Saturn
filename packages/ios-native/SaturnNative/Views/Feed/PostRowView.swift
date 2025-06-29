import SwiftUI

struct PostRowView: View {
    let post: Post
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("@\(post.actor.preferredUsername)")
                    .font(.headline)
                    .fontWeight(.medium)
                
                Spacer()
                
                Text(post.createdAt, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(post.content)
                .font(.body)
                .multilineTextAlignment(.leading)
            
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: post.isLiked ? "heart.fill" : "heart")
                        .foregroundColor(post.isLiked ? .red : .secondary)
                    Text("\(post.likes)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 4) {
                    Image(systemName: "bubble.right")
                        .foregroundColor(.secondary)
                    Text("\(post.commentsCount)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    PostRowView(post: Post(
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
    ))
    .padding()
}