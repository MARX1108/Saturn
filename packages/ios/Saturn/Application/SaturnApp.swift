import SwiftUI

@main
struct SaturnApp: App {
    // Create our app's core services as single, stable instances.
    @StateObject private var authService = AuthService.shared
    @StateObject private var themeManager = ThemeManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .environmentObject(themeManager)
                .onAppear {
                    // Initial theme setup
                    updateAppearance(for: themeManager.currentTheme)
                }
                .onReceive(themeManager.$currentTheme) { theme in
                    // Update navigation bar appearance when theme changes
                    updateAppearance(for: theme)
                }
        }
    }
    
    private func updateAppearance(for theme: Theme) {
        let colors = ThemeColors(theme: theme)
        
        DispatchQueue.main.async {
            // Navigation bar appearance
            let navBarAppearance = UINavigationBarAppearance()
            navBarAppearance.configureWithOpaqueBackground()
            navBarAppearance.backgroundColor = UIColor(colors.primaryBackground)
            navBarAppearance.titleTextAttributes = [
                .foregroundColor: UIColor(colors.primaryText)
            ]
            navBarAppearance.largeTitleTextAttributes = [
                .foregroundColor: UIColor(colors.primaryText)
            ]
            
            UINavigationBar.appearance().standardAppearance = navBarAppearance
            UINavigationBar.appearance().compactAppearance = navBarAppearance
            UINavigationBar.appearance().scrollEdgeAppearance = navBarAppearance
            UINavigationBar.appearance().tintColor = UIColor(colors.primaryAccent)
            
            // Tab bar appearance
            let tabBarAppearance = UITabBarAppearance()
            tabBarAppearance.configureWithOpaqueBackground()
            tabBarAppearance.backgroundColor = UIColor(colors.secondaryBackground)
            
            // Unselected item colors
            tabBarAppearance.stackedLayoutAppearance.normal.iconColor = UIColor(colors.secondaryText)
            tabBarAppearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor(colors.secondaryText)
            ]
            
            // Selected item colors
            tabBarAppearance.stackedLayoutAppearance.selected.iconColor = UIColor(colors.primaryAccent)
            tabBarAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor(colors.primaryAccent)
            ]
            
            UITabBar.appearance().standardAppearance = tabBarAppearance
            UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
            
            // Force update all existing navigation controllers and tab bar controllers
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                window.rootViewController?.view.setNeedsLayout()
                window.rootViewController?.view.layoutIfNeeded()
            }
        }
    }
}
