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
    @Published var openCategories: Set<String> = []
    
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
        guard !selectedTags.isEmpty else {
            return posts // Show all posts when no tags are selected
        }
        
        return posts.filter { post in
            // Check if post matches any selected tag
            return selectedTags.contains { selectedTag in
                // Check if it's a category tag
                if ["goods", "services", "housing", "events"].contains(selectedTag.lowercased()) {
                    return post.postType.lowercased() == selectedTag.lowercased()
                } else {
                    // Check if it's a subcategory tag
                    return post.tags.contains { postTag in
                        postTag.lowercased() == selectedTag.lowercased()
                    }
                }
            }
        }
    }
    
    var hasTagsSelected: Bool {
        return !selectedTags.isEmpty
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
        if openCategories.contains(category) {
            openCategories.remove(category)
        } else {
            openCategories.insert(category)
        }
    }
    
    func clearAllTags() {
        selectedTags.removeAll()
        openCategories.removeAll()
    }
}

