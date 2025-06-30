import SwiftUI

extension Font {
    /// Provides a centralized way to access themed fonts.
    static func themed(size: CGFloat, weight: Weight = .regular) -> Font {
        let fontName: String
        switch weight {
        case .semibold:
            fontName = "Inter-SemiBold"
        case .bold:
            fontName = "Inter-Bold"
        default:
            fontName = "Inter-Regular"
        }
        return .custom(fontName, size: size)
    }
}