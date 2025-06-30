import SwiftUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @EnvironmentObject private var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        VStack {
                if viewModel.isLoading {
                    ProgressView("Searching...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if !viewModel.searchResults.isEmpty {
                    List(viewModel.searchResults) { actor in
                        NavigationLink(destination: ProfileView(username: actor.username)) {
                            ActorRowView(actor: actor)
                        }
                    }
                } else {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(colors.secondaryText)
                        
                        Text("Search for users")
                            .font(.title2)
                            .foregroundColor(colors.primaryText)
                        
                        Text("Enter a username or name to find other users")
                            .font(.caption)
                            .foregroundColor(colors.secondaryText)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
        }
        .background(colors.primaryBackground)
        .searchable(text: $viewModel.searchQuery, prompt: "Search for users...")
        .navigationTitle("Search")
        .configureNavigationBar()
        .id("search-\(themeManager.currentTheme.id)")
    }
}

private struct ActorRowView: View {
    let actor: Actor
    @EnvironmentObject private var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        HStack {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(colors.primaryAccent)
            
            VStack(alignment: .leading) {
                Text(actor.preferredUsername ?? actor.username)
                    .font(.headline)
                    .foregroundColor(colors.primaryText)
                Text("@\(actor.username)")
                    .font(.subheadline)
                    .foregroundColor(colors.secondaryText)
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SearchView()
}