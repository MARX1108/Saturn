import SwiftUI

struct ProfileView: View {
    @StateObject private var authService = AuthService.shared
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.secondary)
                    .padding(.bottom, 8)
                
                Text("Profile View")
                    .font(.title2)
                    .fontWeight(.medium)
                
                Text("Coming Soon")
                    .font(.body)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button("Logout") {
                    do {
                        try authService.logout()
                    } catch {
                        print("Logout error: \(error)")
                    }
                }
                .buttonStyle(.bordered)
                .padding(.bottom, 40)
            }
            .navigationTitle("Profile")
        }
    }
}

#Preview {
    ProfileView()
}