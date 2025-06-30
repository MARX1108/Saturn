import Foundation

extension Bundle {
    /// Safely decode a JSON file from the bundle
    /// Returns nil if file is missing or decoding fails
    func decode<T: Decodable>(_ file: String, as type: T.Type = T.self) -> T? {
        NSLog("🔧 Bundle: Attempting to decode file: \(file)")
        
        // Check if file exists in bundle
        guard let url = self.url(forResource: file, withExtension: nil) else {
            NSLog("❌ Bundle: Failed to locate \(file) in bundle")
            return nil
        }
        
        do {
            // Load file data
            let data = try Data(contentsOf: url)
            NSLog("✅ Bundle: Successfully loaded \(data.count) bytes from \(file)")
            
            // Decode JSON
            let decoder = JSONDecoder()
            let decoded = try decoder.decode(T.self, from: data)
            NSLog("✅ Bundle: Successfully decoded \(file) to \(T.self)")
            
            return decoded
        } catch {
            NSLog("❌ Bundle: Failed to decode \(file): \(error.localizedDescription)")
            return nil
        }
    }
    
    /// Convenience method for arrays
    func decodeArray<T: Decodable>(_ file: String, as type: T.Type = T.self) -> [T] {
        return decode(file, as: [T].self) ?? []
    }
}