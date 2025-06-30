import SwiftUI
import UIKit
import Combine
import Foundation

extension NSNotification.Name {
    static let themeDidChange = NSNotification.Name("themeDidChange")
}

extension View {
    func configureNavigationBar() -> some View {
        self.onReceive(NotificationCenter.default.publisher(for: .themeDidChange)) { notification in
            // Always get fresh colors from the new theme
            if let theme = notification.object as? Theme {
                let freshColors = ThemeColors(theme: theme)
                NSLog("🔔 NavigationBarConfigurator: Received theme change notification for \(theme.id)")
                NSLog("🔔 NavigationBarConfigurator: Fresh colors - Background: \(freshColors.primaryBackground), Text: \(freshColors.primaryText)")
                updateNavigationBarAppearance(with: freshColors)
            } else {
                NSLog("❌ NavigationBarConfigurator: Failed to extract theme from notification")
            }
        }
    }
}

private func updateNavigationBarAppearance(with colors: ThemeColors) {
    DispatchQueue.main.async {
        NSLog("🎨 Updating navigation bar with colors - Background: \(colors.primaryBackground), Text: \(colors.primaryText)")
        
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(colors.primaryBackground)
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor(colors.primaryText)
        ]
        appearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor(colors.primaryText)
        ]
        
        // Apply to all existing navigation controllers directly (not global appearance)
        for window in UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows }) {
            updateNavigationBarsDirectly(in: window.rootViewController, with: appearance, tintColor: UIColor(colors.primaryAccent))
        }
        
        NSLog("🎨 Navigation bar update complete")
    }
}

private func updateNavigationBarsDirectly(in viewController: UIViewController?, with appearance: UINavigationBarAppearance, tintColor: UIColor) {
    guard let viewController = viewController else { return }
    
    if let navController = viewController as? UINavigationController {
        NSLog("🎨 Updating navigation controller directly")
        
        // Apply appearance directly to this navigation controller
        navController.navigationBar.standardAppearance = appearance
        navController.navigationBar.compactAppearance = appearance
        navController.navigationBar.scrollEdgeAppearance = appearance
        navController.navigationBar.tintColor = tintColor
        
        // Force immediate update
        navController.navigationBar.setNeedsLayout()
        navController.navigationBar.layoutIfNeeded()
        
        // Trigger a refresh by briefly changing and restoring properties
        let currentPrefersLargeTitles = navController.navigationBar.prefersLargeTitles
        navController.navigationBar.prefersLargeTitles = !currentPrefersLargeTitles
        navController.navigationBar.prefersLargeTitles = currentPrefersLargeTitles
    }
    
    if let tabController = viewController as? UITabBarController {
        // Update all navigation controllers in tabs
        for child in tabController.viewControllers ?? [] {
            updateNavigationBarsDirectly(in: child, with: appearance, tintColor: tintColor)
        }
    }
    
    // Recursively check all child view controllers
    for child in viewController.children {
        updateNavigationBarsDirectly(in: child, with: appearance, tintColor: tintColor)
    }
}