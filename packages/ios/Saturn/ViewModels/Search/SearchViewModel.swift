import Foundation
import Combine

@MainActor
final class SearchViewModel: ObservableObject {
    @Published var searchQuery = ""
    @Published private(set) var searchResults: [Actor] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService: APIServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
        setupSearchPipeline()
    }
    
    private func setupSearchPipeline() {
        // Main search pipeline with debouncing
        $searchQuery
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
            .sink { [weak self] query in
                Task {
                    await self?.performSearch(query: query)
                }
            }
            .store(in: &cancellables)
        
        // Clear results when query becomes empty
        $searchQuery
            .filter { $0.isEmpty }
            .sink { [weak self] _ in
                self?.searchResults = []
                self?.errorMessage = nil
            }
            .store(in: &cancellables)
    }
    
    private func performSearch(query: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let results = try await apiService.searchActors(query: query)
            searchResults = results
        } catch {
            errorMessage = "Failed to search actors: \(error.localizedDescription)"
            searchResults = []
        }
        
        isLoading = false
    }
}