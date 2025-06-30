import Foundation
import UIKit
import SwiftUI

@MainActor
final class ThemeManager: ObservableObject {
    @Published var currentTheme: Theme
    let themes: [Theme]
    
    init() {
        NSLog("🎨 ThemeManager: Initializing with JSON theme loading")
        
        // Attempt to load themes from JSON file
        if let loadedThemes: [Theme] = Bundle.main.decode("themes.json") {
            NSLog("✅ ThemeManager: Successfully loaded \(loadedThemes.count) themes from JSON")
            self.themes = loadedThemes
            self.currentTheme = loadedThemes.first ?? Theme.defaultFallback
        } else {
            NSLog("⚠️ ThemeManager: Failed to load themes.json, using fallback theme")
            self.themes = [Theme.defaultFallback]
            self.currentTheme = Theme.defaultFallback
        }
        
        NSLog("🎨 ThemeManager: Initialized with \(themes.count) themes, current: \(currentTheme.id)")
    }
    
    func setTheme(_ theme: Theme) {
        NSLog("🎨 ThemeManager: Setting theme to \(theme.id)")
        NSLog("🎨 ThemeManager: Primary accent: \(theme.primaryAccent)")
        NSLog("🎨 ThemeManager: Primary background: \(theme.primaryBackground)")
        
        // Update theme
        currentTheme = theme
        
        // Post notification for immediate navigation bar updates (handled by NavigationBarConfigurator)
        NotificationCenter.default.post(name: .themeDidChange, object: theme)
        
        // Only update tab bar appearance here (navigation bars handled by notification)
        DispatchQueue.main.async {
            self.updateTabBarAppearance()
        }
        
        NSLog("🎨 ThemeManager: Theme change complete")
    }
    
    private func updateTabBarAppearance() {
        let colors = ThemeColors(theme: currentTheme)
        
        NSLog("🎨 ThemeManager: Updating tab bar appearance with theme \(currentTheme.id)")
        
        // Update tab bar appearance only (navigation bars handled by notification system)
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(colors.secondaryBackground)
        tabBarAppearance.stackedLayoutAppearance.normal.iconColor = UIColor(colors.secondaryText)
        tabBarAppearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor(colors.secondaryText)]
        tabBarAppearance.stackedLayoutAppearance.selected.iconColor = UIColor(colors.primaryAccent)
        tabBarAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor(colors.primaryAccent)]
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        
        // Set system appearance style and force tab bar refresh
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                for window in windowScene.windows {
                    window.overrideUserInterfaceStyle = currentTheme.id == "Midnight" ? .dark : .light
                    
                    // Force refresh existing tab bars only
                    if let tabController = findTabBarController(in: window.rootViewController) {
                        tabController.tabBar.setNeedsLayout()
                        tabController.tabBar.layoutIfNeeded()
                    }
                }
            }
        }
        
        NSLog("🎨 ThemeManager: Tab bar appearance update complete")
    }
    
    private func findTabBarController(in viewController: UIViewController?) -> UITabBarController? {
        if let tabController = viewController as? UITabBarController {
            return tabController
        }
        
        for child in viewController?.children ?? [] {
            if let tabController = findTabBarController(in: child) {
                return tabController
            }
        }
        
        return nil
    }
}