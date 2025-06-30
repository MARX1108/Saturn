import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @StateObject private var authService = AuthService.shared
    @EnvironmentObject private var themeManager: ThemeManager
    @State private var isShowingPostCreation = false
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        ZStack {
                if viewModel.isLoading && viewModel.posts.isEmpty {
                    VStack {
                        ProgressView("Loading posts...")
                            .progressViewStyle(CircularProgressViewStyle())
                        Text("Fetching the latest posts")
                            .font(.caption)
                            .foregroundColor(colors.secondaryText)
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
                            .foregroundColor(colors.secondaryText)
                        
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
                            .foregroundColor(colors.secondaryText)
                        
                        Text("No posts yet")
                            .font(.title2)
                            .fontWeight(.medium)
                            .foregroundColor(colors.primaryText)
                        
                        Text("Be the first to share something!")
                            .font(.body)
                            .foregroundColor(colors.secondaryText)
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
                                .background(colors.secondaryBackground)
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
        .background(colors.primaryBackground)
        .navigationTitle("Feed")
        .configureNavigationBar()
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    isShowingPostCreation = true
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(colors.primaryAccent)
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
        .sheet(isPresented: $isShowingPostCreation) {
            PostCreationView()
        }
        .id("feed-\(themeManager.currentTheme.id)")
    }
}

#Preview {
    FeedView()
}