import SwiftUI

@main
struct SaturnApp: App {
    // Create our app's core services as single, stable instances.
    @StateObject private var authService = AuthService.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
        }
    }
}
