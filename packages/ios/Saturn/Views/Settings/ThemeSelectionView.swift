import SwiftUI

struct ThemeSelectionView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        List(themeManager.themes) { theme in
            ThemeRowView(
                theme: theme,
                isSelected: themeManager.currentTheme.id == theme.id
            )
            .listRowBackground(colors.secondaryBackground)
            .listRowSeparator(.hidden)
            .onTapGesture {
                themeManager.setTheme(theme)
            }
        }
        .navigationTitle("Select Theme")
        .listStyle(PlainListStyle())
        .background(colors.primaryBackground)
        .scrollContentBackground(.hidden)
        .configureNavigationBar()
    }
}

private struct ThemeRowView: View {
    let theme: Theme
    let isSelected: Bool
    @EnvironmentObject var themeManager: ThemeManager
    
    var body: some View {
        let colors = themeColors(themeManager)
        
        HStack(spacing: 16) {
            // Theme preview circles
            HStack(spacing: 4) {
                Circle()
                    .fill(Color(hex: theme.primaryAccent))
                    .frame(width: 20, height: 20)
                
                Circle()
                    .fill(Color(hex: theme.primaryBackground))
                    .stroke(Color(hex: theme.secondaryText), lineWidth: 1)
                    .frame(width: 20, height: 20)
                
                Circle()
                    .fill(Color(hex: theme.secondaryBackground))
                    .frame(width: 20, height: 20)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(theme.id.capitalized)
                    .font(.headline)
                    .foregroundColor(colors.primaryText)
                
                Text(themeDescription(for: theme))
                    .font(.caption)
                    .foregroundColor(colors.secondaryText)
            }
            
            Spacer()
            
            if isSelected {
                Image(systemName: "checkmark")
                    .foregroundColor(colors.primaryAccent)
                    .font(.headline)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 16)
        .contentShape(Rectangle())
    }
    
    private func themeDescription(for theme: Theme) -> String {
        switch theme.id {
        case "default":
            return "Clean, modern light theme"
        case "midnight":
            return "Dark theme for night usage"
        default:
            return "Custom theme"
        }
    }
}

#Preview {
    NavigationView {
        ThemeSelectionView()
            .environmentObject(ThemeManager())
    }
}