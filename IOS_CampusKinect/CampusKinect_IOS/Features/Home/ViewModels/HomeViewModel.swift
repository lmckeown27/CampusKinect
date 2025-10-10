//
//  HomeViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

// MARK: - Home View Model
@MainActor
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
    
    // Category section visibility (controls entire category section)
    @Published var showingCategorySection = true
    
    // Filter bar visibility (separate from actual selection)
    @Published var showingFilterBar = true
    
    // Post type toggle (Offers vs Requests) - nil means show both
    @Published var selectedOfferRequest: String? = nil // nil = both, "offer" = offers only, "request" = requests only
    private var cancellables = Set<AnyCancellable>()
    private let apiService = APIService.shared
    
    // Admin university switcher (for viewing different universities)
    private let universitySwitcher = AdminUniversitySwitcher.shared
    
    // Authentication manager to check guest status
    private let authManager = AuthenticationManager.shared
    
    init() {
        // No need for search debouncing in tag-based system
        print("🏠 HomeViewModel: Initializing with authManager instance: \(ObjectIdentifier(authManager))")
        print("🏠 HomeViewModel: Initial guest state - isGuest=\(authManager.isGuest), ID=\(authManager.guestUniversityId?.description ?? "nil")")
        setupUniversitySwitcherObserver()
        setupGuestUniversityObserver()
        setupPostDeletedObserver()
        setupGuestUniversityChangedObserver()
    }
    
    // MARK: - University Switcher
    private func setupUniversitySwitcherObserver() {
        // Reload posts when admin switches universities
        universitySwitcher.$currentViewingUniversityId
            .dropFirst() // Skip initial value
            .sink { [weak self] newId in
                guard let self = self, !self.authManager.isGuest else { return }
                print("🏠 HomeViewModel: Admin university ID changed to \(newId?.description ?? "nil")")
                Task { @MainActor in
                    print("🏠 HomeViewModel: Reloading posts for university ID \(newId?.description ?? "nil")")
                    await self.loadPosts()
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Guest University Observer
    private func setupGuestUniversityObserver() {
        // Reload posts when guest switches universities
        authManager.$guestUniversityId
            .receive(on: DispatchQueue.main)
            .removeDuplicates() // Only fire when value actually changes
            .dropFirst() // Skip initial value
            .sink { [weak self] newId in
                guard let self = self else { return }
                print("🏠 HomeViewModel: Guest university ID published value changed to \(newId?.description ?? "nil")")
                print("🏠 HomeViewModel: Current isGuest = \(self.authManager.isGuest)")
                print("🏠 HomeViewModel: Will reload posts now")
                
                if self.authManager.isGuest {
                    print("🏠 HomeViewModel: ✅ Reloading posts for guest university ID \(newId?.description ?? "nil")")
                    Task { @MainActor in
                        await self.loadPosts()
                    }
                } else {
                    print("🏠 HomeViewModel: ❌ Not reloading - user is not in guest mode")
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Post Deleted Observer
    private func setupPostDeletedObserver() {
        // Remove deleted posts from the feed
        NotificationCenter.default.publisher(for: .postDeleted)
            .sink { [weak self] notification in
                guard let postId = notification.object as? Int else { return }
                Task { @MainActor in
                    self?.posts.removeAll { $0.id == postId }
                    print("🗑️ Removed deleted post \(postId) from feed")
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Guest University Changed Observer (Notification-based fallback)
    private func setupGuestUniversityChangedObserver() {
        // This is a fallback observer using NotificationCenter
        // to ensure posts reload when guest switches universities
        NotificationCenter.default.publisher(for: .guestUniversityChanged)
            .sink { [weak self] notification in
                guard let self = self else { return }
                let universityId = notification.object as? Int
                print("🔔 HomeViewModel: Received guestUniversityChanged notification for ID \(universityId?.description ?? "nil")")
                
                if self.authManager.isGuest {
                    print("🔔 HomeViewModel: ✅ Guest mode confirmed, reloading posts")
                    Task { @MainActor in
                        await self.loadPosts()
                    }
                } else {
                    print("🔔 HomeViewModel: ⚠️ Not in guest mode, ignoring notification")
                }
            }
            .store(in: &cancellables)
    }
    
    // Get the current university ID to use for API calls
    private var currentUniversityId: Int? {
        // For guests, use their selected university
        if authManager.isGuest {
            let id = authManager.guestUniversityId
            print("🏠 HomeViewModel: Guest currentUniversityId = \(id?.description ?? "nil")")
            return id
        }
        
        // For admins/authenticated users, use admin switcher
        let id = universitySwitcher.currentViewingUniversityId
        print("🏠 HomeViewModel: Admin currentUniversityId = \(id?.description ?? "nil")")
        return id
    }
    
    // MARK: - Public Methods
    @MainActor
    func loadPosts() async {
        isLoading = true
        
        // Extensive debugging for guest mode
        print("🏠 HomeViewModel.loadPosts() START")
        print("🏠   isGuest: \(authManager.isGuest)")
        print("🏠   guestUniversityId: \(authManager.guestUniversityId?.description ?? "nil")")
        print("🏠   guestUniversityName: \(authManager.guestUniversityName ?? "nil")")
        print("🏠   currentUniversityId: \(currentUniversityId?.description ?? "nil")")
        
        // Safety check: If in guest mode but no university selected, skip loading
        if authManager.isGuest && currentUniversityId == nil {
            print("⚠️ HomeViewModel: Skipping post load - guest mode requires university selection")
            self.posts = []
            self.isLoading = false
            return
        }
        
        do {
            let response = try await apiService.fetchPosts(universityId: currentUniversityId)
            await MainActor.run {
                self.posts = response.data.posts
                self.isLoading = false
                
                // Log if viewing a different university
                if let universityId = self.currentUniversityId {
                    print("📚 Loaded posts for university ID: \(universityId)")
                } else {
                    print("📚 Loaded posts with NO university ID (using backend default)")
                }
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                print("❌ Failed to load posts: \(error)")
            }
        }
    }
    
    @MainActor
    func refreshPosts() async {
        isRefreshing = true
        do {
            let response = try await apiService.fetchPosts(universityId: currentUniversityId)
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
            let response = try await apiService.fetchPosts(page: currentPage, limit: postsPerPage, universityId: currentUniversityId)
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
        
        // Apply offer/request filtering only if a specific type is selected
        if let offerRequestFilter = selectedOfferRequest {
            filtered = filtered.filter { post in
                return post.tags.contains { $0.lowercased() == offerRequestFilter.lowercased() }
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
            // Single tap to deselect - show all posts
            selectedCategory = nil
            isCategoryExpanded = false
            selectedTags.removeAll()
            showingFilterBar = true
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
    
    func clearCategoryTagsOnly() {
        // Clear only subcategory tags, keep main category selection
        selectedTags.removeAll()
        showingFilterBar = true
    }
    
    func toggleCategorySectionVisibility() {
        showingCategorySection.toggle()
    }
    
    func toggleSubcategoryVisibility() {
        isCategoryExpanded.toggle()
    }
    
    // MARK: - Post Type Toggle Methods
    func selectOfferRequest(_ type: String?) {
        // Toggle behavior: tap selected = deselect (show both), tap unselected = select it
        if selectedOfferRequest == type {
            selectedOfferRequest = nil // Deselect to show both
        } else {
            selectedOfferRequest = type // Select this type
        }
    }
}

