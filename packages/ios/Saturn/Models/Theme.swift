import Foundation

struct Theme: Identifiable, Codable {
    let id: String
    let primaryAccent: String
    let primaryBackground: String
    let primaryText: String
    let secondaryText: String
    let secondaryBackground: String
}

extension Theme {
    /// Fallback theme used when JSON loading fails
    static let defaultFallback = Theme(
        id: "Default",
        primaryAccent: "#00A0B0",
        primaryBackground: "#FFFFFF", 
        primaryText: "#121212",
        secondaryText: "#6E6E6E",
        secondaryBackground: "#F5F5F5"
    )
}