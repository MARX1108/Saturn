import SwiftUI
import UIKit

extension View {
    func navigationBarTheme(_ colors: ThemeColors) -> some View {
        self.modifier(NavigationBarThemeModifier(colors: colors))
    }
}

struct NavigationBarThemeModifier: ViewModifier {
    let colors: ThemeColors
    
    func body(content: Content) -> some View {
        content
            .onAppear {
                updateNavigationBarAppearance()
            }
            .onChange(of: colors.primaryBackground) { _ in
                updateNavigationBarAppearance()
            }
    }
    
    private func updateNavigationBarAppearance() {
        DispatchQueue.main.async {
            // Get the current navigation controller
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let window = windowScene.windows.first,
                  let navigationController = findNavigationController(in: window.rootViewController) else {
                return
            }
            
            // Create and apply new appearance
            let appearance = UINavigationBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(colors.primaryBackground)
            appearance.titleTextAttributes = [.foregroundColor: UIColor(colors.primaryText)]
            appearance.largeTitleTextAttributes = [.foregroundColor: UIColor(colors.primaryText)]
            
            // Apply to the current navigation controller
            navigationController.navigationBar.standardAppearance = appearance
            navigationController.navigationBar.compactAppearance = appearance
            navigationController.navigationBar.scrollEdgeAppearance = appearance
            navigationController.navigationBar.tintColor = UIColor(colors.primaryAccent)
            
            // Force immediate update
            navigationController.navigationBar.setNeedsLayout()
            navigationController.navigationBar.layoutIfNeeded()
        }
    }
    
    private func findNavigationController(in viewController: UIViewController?) -> UINavigationController? {
        if let navController = viewController as? UINavigationController {
            return navController
        }
        
        if let tabController = viewController as? UITabBarController {
            return findNavigationController(in: tabController.selectedViewController)
        }
        
        for child in viewController?.children ?? [] {
            if let navController = findNavigationController(in: child) {
                return navController
            }
        }
        
        return nil
    }
}