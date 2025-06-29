import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @StateObject private var authService = AuthService.shared
    @State private var isShowingPostCreation = false
    
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
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.posts) { post in
                                PostRowView(post: post) {
                                    viewModel.toggleLikeStatus(for: post.id)
                                }
                                .padding(.horizontal)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                                .padding(.horizontal)
                            }
                        }
                        .padding(.top)
                    }
                    .refreshable {
                        await viewModel.refreshPosts()
                    }
                }
            }
            .navigationTitle("Feed")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isShowingPostCreation = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
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
        .sheet(isPresented: $isShowingPostCreation) {
            PostCreationView()
        }
    }
}

#Preview {
    FeedView()
}