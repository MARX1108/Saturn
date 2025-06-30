import SwiftUI

struct ProfileView: View {
    let username: String
    @StateObject private var viewModel: ProfileViewModel
    @EnvironmentObject private var themeManager: ThemeManager
    
    init(username: String) {
        self.username = username
        self._viewModel = StateObject(wrappedValue: ProfileViewModel(username: username))
    }
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                    if viewModel.isLoading {
                        VStack {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Loading profile...")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.top, 8)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 100)
                    } else if let errorMessage = viewModel.errorMessage {
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 48))
                                .foregroundColor(.orange)
                            
                            Text("Error")
                                .font(.title2)
                                .fontWeight(.medium)
                            
                            Text(errorMessage)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                            
                            Button("Try Again") {
                                Task {
                                    await viewModel.fetchProfileData()
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 100)
                    } else {
                        // Header View
                        profileHeaderView
                        
                        // Settings Section (temporary for theme testing)
                        settingsSection
                        
                        // Posts List
                        postsListView
                    }
                }
                .padding()
            }
            .background(colors.primaryBackground)
            .onAppear {
                print("🔵 DEBUG: ProfileView appeared for user: \(username)")
                Task {
                    await viewModel.fetchProfileData()
                }
        }
        .navigationTitle(viewModel.actor?.username ?? "Profile")
        .navigationBarTitleDisplayMode(.large)
        .configureNavigationBar()
        .id("profile-\(themeManager.currentTheme.id)")
    }
    
    @ViewBuilder
    private var settingsSection: some View {
        let colors = themeColors(themeManager)
        
        VStack(alignment: .leading, spacing: 12) {
            Text("Settings")
                .font(.headline)
                .foregroundColor(colors.primaryText)
                .padding(.horizontal)
            
            NavigationLink(destination: ThemeSelectionView()) {
                HStack {
                    Image(systemName: "paintpalette")
                        .foregroundColor(colors.primaryAccent)
                        .frame(width: 24)
                    
                    Text("Themes")
                        .font(.body)
                        .foregroundColor(colors.primaryText)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(colors.secondaryText)
                }
                .padding()
                .background(colors.secondaryBackground)
                .cornerRadius(8)
            }
            .buttonStyle(PlainButtonStyle())
            .padding(.horizontal)
        }
        .padding(.bottom, 8)
    }
    
    @ViewBuilder
    private var profileHeaderView: some View {
        let colors = themeColors(themeManager)
        
        if let actor = viewModel.actor {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(colors.primaryAccent)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(actor.preferredUsername ?? actor.username)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(colors.primaryText)
                        
                        Text("@\(actor.username)")
                            .font(.subheadline)
                            .foregroundColor(colors.secondaryText)
                    }
                    
                    Spacer()
                }
                
                // Note: Bio/summary field would go here when Actor model is expanded
                // For now, we'll show a placeholder or skip it
            }
            .padding(.vertical, 8)
        }
    }
    
    @ViewBuilder
    private var postsListView: some View {
        let colors = themeColors(themeManager)
        
        if !viewModel.posts.isEmpty {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("Posts")
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(colors.primaryText)
                    
                    Spacer()
                    
                    Text("\(viewModel.posts.count)")
                        .font(.caption)
                        .foregroundColor(colors.secondaryText)
                }
                .padding(.bottom, 12)
                
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.posts) { post in
                        PostRowView(
                            post: post,
                            likeAction: {
                                viewModel.toggleLikeStatus(for: post.id)
                            }
                        )
                        .padding(.horizontal, 8)
                        .padding(.vertical, 8)
                        .background(colors.secondaryBackground)
                        .cornerRadius(8)
                    }
                }
            }
        } else if !viewModel.isLoading {
            VStack(spacing: 12) {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 32))
                    .foregroundColor(colors.secondaryText)
                
                Text("No posts yet")
                    .font(.headline)
                    .foregroundColor(colors.primaryText)
                
                Text("This user hasn't posted anything yet.")
                    .font(.caption)
                    .foregroundColor(colors.secondaryText)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 40)
        }
    }
}

#Preview {
    ProfileView(username: "sampleuser")
}