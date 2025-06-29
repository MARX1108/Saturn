import SwiftUI

@main
struct SaturnApp: App {
    // Create our app's core services as single, stable instances.
    @StateObject private var authService: AuthService
    private let apiService: APIService
    
    init() {
        // First, create the service with no dependencies.
        let api = APIService()
        self.apiService = api
        
        // Then, create the service that depends on it, and wrap it in a StateObject
        // for the property initialization.
        authService = StateObject(wrappedValue: AuthService(apiService: api))
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
        }
    }
}