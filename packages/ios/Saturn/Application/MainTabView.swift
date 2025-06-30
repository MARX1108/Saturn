import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        TabView {
            NavigationStack {
                FeedView()
            }
            .tabItem {
                Label("Feed", systemImage: "house")
            }
            
            NavigationStack {
                SearchView()
            }
            .tabItem {
                Label("Search", systemImage: "magnifyingglass")
            }
            
            NavigationStack {
                NotificationsView()
            }
            .tabItem {
                Label("Notifications", systemImage: "bell")
            }
            
            NavigationStack {
                ProfileView(username: "Joanna") // TODO: Get current user's username from AuthService
            }
            .tabItem {
                Label("Profile", systemImage: "person")
            }
        }
        .background(colors.primaryBackground)
        .accentColor(colors.primaryAccent)
        .id("main-tab-\(themeManager.currentTheme.id)")
    }
}

#Preview {
    MainTabView()
}