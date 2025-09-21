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
    @Published var selectedCategory: String? = nil // Single category selection
    
    // Category expansion state
    @Published var isCategoryExpanded = false
    
    // Filter bar visibility (separate from actual selection)
    @Published var showingFilterBar = true
    
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
        
        // Apply category filtering if a category is selected
        if let selectedCategoryId = selectedCategory {
            filtered = filtered.filter { post in
                return post.postType.lowercased() == selectedCategoryId.lowercased()
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
        return (!selectedTags.isEmpty || selectedCategory != nil) && showingFilterBar
    }
    
    var shouldShowOfferRequestToggle: Bool {
        // Only show toggle when goods, services, or housing categories are selected
        guard let category = selectedCategory else { return false }
        let offerRequestCategories = ["goods", "services", "housing"]
        return offerRequestCategories.contains(category.lowercased())
    }
    
    // MARK: - Tag Management Methods
    func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
            // Show filter bar when new tags are selected
            showingFilterBar = true
        }
    }
    
    func selectCategory(_ category: String) {
        if selectedCategory == category {
            // If same category, toggle expansion
            isCategoryExpanded.toggle()
        } else {
            // Select new category and expand
            selectedCategory = category
            isCategoryExpanded = true
            selectedTags.removeAll() // Clear previous tags
            showingFilterBar = true
        }
    }
    
    func clearCategory() {
        selectedCategory = nil
        isCategoryExpanded = false
        selectedTags.removeAll()
        showingFilterBar = true
    }
    
    func hideFilterBar() {
        // Only hide the filter bar display, keep all selections intact
        showingFilterBar = false
    }
    
    func clearAllTags() {
        selectedTags.removeAll()
        selectedCategory = nil
        isCategoryExpanded = false
        showingFilterBar = true // Reset visibility when clearing
    }
    
    // MARK: - Post Type Toggle Methods
    func togglePostType() {
        showingOffers.toggle()
    }
    
    var currentPostTypeTitle: String {
        return showingOffers ? "Offers" : "Requests"
    }
}

