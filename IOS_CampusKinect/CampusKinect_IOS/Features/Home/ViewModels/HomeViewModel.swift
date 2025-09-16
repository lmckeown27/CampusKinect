//
//  HomeViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

// MARK: - Home View Model
class HomeViewModel: ObservableObject {
    @Published var posts: [Post] = []
    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var error: APIError?
    @Published var hasMorePosts = true
    
    // Pagination
    private var currentPage = 1
    private let postsPerPage = 20
    
    // Tag-based filtering
    @Published var selectedTags: Set<String> = []
    @Published var selectedCategories: Set<String> = []
    
    // Post type toggle (Offers vs Requests)
    @Published var showingOffers = true // Default to offers
    
    private var cancellables = Set<AnyCancellable>()
    private let apiService = APIService.shared
    
    init() {
        // No need for search debouncing in tag-based system
    }
    
    // MARK: - Public Methods
    @MainActor
    func loadPosts() async {
        isLoading = true
        do {
            let response = try await apiService.fetchPosts()
            await MainActor.run {
                self.posts = response.data.posts
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    @MainActor
    func refreshPosts() async {
        isRefreshing = true
        do {
            let response = try await apiService.fetchPosts()
            await MainActor.run {
                self.posts = response.data.posts
                self.isRefreshing = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isRefreshing = false
            }
        }
    }
    
    @MainActor
    func loadMorePosts() async {
        guard !isLoading && hasMorePosts else { return }
        
        isLoading = true
        currentPage += 1
        
        do {
            let response = try await apiService.fetchPosts(page: currentPage, limit: postsPerPage)
            self.posts.append(contentsOf: response.data.posts)
            self.hasMorePosts = response.data.pagination.hasNext
            print("Loaded \(response.data.posts.count) more posts. Total: \(self.posts.count)")
        } catch {
            self.error = error as? APIError ?? .unknown(0)
            currentPage -= 1 // Revert page increment on error
            print("Failed to load more posts: \(error.localizedDescription)")
        }
        
        isLoading = false
    }
    
    // MARK: - Filter Management (now handled by tag methods in extension)
    
    // MARK: - Post Interactions
    @MainActor
    func toggleBookmark(for post: Post) async {
        // Implementation would call API to toggle bookmark
        // For now, just update local state
        if posts.contains(where: { $0.id == post.id }) {
            // Update bookmark count locally
            print("Toggled bookmark for post \(post.id)")
        }
    }
    
    @MainActor
    func toggleRepost(for post: Post) async {
        // Implementation would call API to toggle repost
        // For now, just update local state
        if posts.contains(where: { $0.id == post.id }) {
            // Update repost count locally
            print("Toggled repost for post \(post.id)")
        }
    }
    
    // MARK: - Private Methods
    // Search functionality removed - now using tag-based filtering
}

// MARK: - Home View Model Extensions
extension HomeViewModel {
    var filteredPosts: [Post] {
        // Start with all posts
        var filtered = posts
        
        // Apply category filtering if any categories are selected
        if !selectedCategories.isEmpty {
            filtered = filtered.filter { post in
                return selectedCategories.contains { selectedCategory in
                    return post.postType.lowercased() == selectedCategory.lowercased()
                }
            }
        }
        
        // Apply tag filtering if any tags are selected
        if !selectedTags.isEmpty {
            filtered = filtered.filter { post in
                return selectedTags.contains { selectedTag in
                    return post.tags.contains { postTag in
                        postTag.lowercased() == selectedTag.lowercased()
                    }
                }
            }
        }
        
        // Apply offer/request filtering only if relevant categories are selected
        if shouldShowOfferRequestToggle {
            filtered = filtered.filter { post in
                if showingOffers {
                    return post.tags.contains { $0.lowercased() == "offer" }
                } else {
                    return post.tags.contains { $0.lowercased() == "request" }
                }
            }
        }
        
        return filtered
    }
    
    var hasTagsSelected: Bool {
        return !selectedTags.isEmpty || !selectedCategories.isEmpty
    }
    
    var shouldShowOfferRequestToggle: Bool {
        // Only show toggle when goods, services, or housing categories are selected
        let offerRequestCategories = ["goods", "services", "housing"]
        return selectedCategories.contains { category in
            offerRequestCategories.contains(category.lowercased())
        }
    }
    
    // MARK: - Tag Management Methods
    func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
        }
    }
    
    func toggleCategory(_ category: String) {
        if selectedCategories.contains(category) {
            selectedCategories.remove(category)
        } else {
            selectedCategories.insert(category)
        }
    }
    
    func clearAllTags() {
        selectedTags.removeAll()
        selectedCategories.removeAll()
    }
    
    // MARK: - Post Type Toggle Methods
    func togglePostType() {
        showingOffers.toggle()
    }
    
    var currentPostTypeTitle: String {
        return showingOffers ? "Offers" : "Requests"
    }
}

