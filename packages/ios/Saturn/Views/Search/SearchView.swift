import SwiftUI

struct SearchView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                
                Image(systemName: "magnifyingglass")
                    .font(.largeTitle)
                    .foregroundColor(.secondary)
                    .padding(.bottom, 8)
                
                Text("Search View")
                    .font(.title2)
                    .fontWeight(.medium)
                
                Text("Coming Soon")
                    .font(.body)
                    .foregroundColor(.secondary)
                
                Spacer()
            }
            .navigationTitle("Search")
        }
    }
}

#Preview {
    SearchView()
}