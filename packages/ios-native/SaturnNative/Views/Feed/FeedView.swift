import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @StateObject private var authService = AuthService.shared
    
    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.isLoading && viewModel.posts.isEmpty {
                    VStack {
                        ProgressView("Loading posts...")
                            .progressViewStyle(CircularProgressViewStyle())
                        Text("Fetching the latest posts")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                    }
                } else if let errorMessage = viewModel.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        
                        Text(errorMessage)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        
                        Button("Try Again") {
                            Task {
                                await viewModel.fetchPosts()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else if viewModel.posts.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "doc.text")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        
                        Text("No posts yet")
                            .font(.title2)
                            .fontWeight(.medium)
                        
                        Text("Be the first to share something!")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    List(viewModel.posts) { post in
                        PostRowView(post: post)
                            .listRowSeparator(.hidden)
                    }
                    .listStyle(PlainListStyle())
                    .refreshable {
                        await viewModel.refreshPosts()
                    }
                }
            }
            .navigationTitle("Feed")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout") {
                        do {
                            try authService.logout()
                        } catch {
                            print("Logout error: \(error)")
                        }
                    }
                }
            }
            .task {
                await viewModel.fetchPosts()
            }
            .onTapGesture {
                if viewModel.errorMessage != nil {
                    viewModel.clearError()
                }
            }
        }
    }
}

#Preview {
    FeedView()
}