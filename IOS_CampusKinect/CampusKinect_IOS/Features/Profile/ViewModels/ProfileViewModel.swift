//
//  ProfileViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var userPosts: [Post] = []
    @Published var userReposts: [Post] = []
    @Published var userBookmarks: [Post] = []
    @Published var isLoading = false
    @Published var error: APIError?
    @Published var hasMorePosts = true
    @Published var toastMessage: String?
    @Published var showingToast = false
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var currentPage = 1
    
    // Store recently deleted items for undo functionality
    private var recentlyDeletedPosts: [Int: Post] = [:]
    private var recentlyRemovedReposts: [Int: Post] = [:]
    private var recentlyRemovedBookmarks: [Int: Post] = [:]
    
    // MARK: - Load User Posts
    func loadUserPosts(userId: Int) async {
        isLoading = true
        error = nil
        currentPage = 1
        
        do {
            let response = try await apiService.fetchUserPosts(userId: userId, page: currentPage)
            await MainActor.run {
                self.userPosts = response.data.posts
                self.hasMorePosts = response.data.pagination.hasNext
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                self.showErrorToast("Failed to load posts")
            }
        }
    }
    
    // MARK: - Load More Posts
    func loadMoreUserPosts(userId: Int) async {
        guard hasMorePosts && !isLoading else { return }
        
        isLoading = true
        currentPage += 1
        
        do {
            let response = try await apiService.fetchUserPosts(userId: userId, page: currentPage)
            await MainActor.run {
                self.userPosts.append(contentsOf: response.data.posts)
                self.hasMorePosts = response.data.pagination.hasNext
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                self.currentPage -= 1 // Revert page increment on error
                self.showErrorToast("Failed to load more posts")
            }
        }
    }
    
    // MARK: - Refresh Posts
    func refreshUserPosts(userId: Int) async {
        await loadUserPosts(userId: userId)
    }
    
    // MARK: - Load Reposts
    func loadUserReposts(userId: Int) async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchUserReposts()
            await MainActor.run {
                self.userReposts = response.data.map { $0.asPost }
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                self.showErrorToast("Failed to load reposts")
            }
        }
    }
    
    // MARK: - Load Bookmarks
    func loadUserBookmarks(userId: Int) async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchUserBookmarks()
            await MainActor.run {
                self.userBookmarks = response.data.map { $0.asPost }
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                self.showErrorToast("Failed to load bookmarks")
            }
        }
    }
    
    // MARK: - Delete Actions
    func deletePost(_ postId: Int) async -> Bool {
        // Store the post for potential undo
        if let post = userPosts.first(where: { $0.id == postId }) {
            recentlyDeletedPosts[postId] = post
        }
        
        do {
            try await apiService.deletePost(postId)
            await MainActor.run {
                self.userPosts.removeAll { $0.id == postId }
            }
            return true
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.showErrorToast("Failed to delete post")
                // Remove from recently deleted since it failed
                self.recentlyDeletedPosts.removeValue(forKey: postId)
            }
            return false
        }
    }
    
    func undoDeletePost(_ postId: Int) async -> Bool {
        guard let post = recentlyDeletedPosts[postId] else { return false }
        
        // For now, we'll just restore the post to the UI
        // In a real implementation, you might need to recreate the post via API
        await MainActor.run {
            // Insert the post back in its original position
            if let originalIndex = self.userPosts.firstIndex(where: { $0.createdAt < post.createdAt }) {
                self.userPosts.insert(post, at: originalIndex)
            } else {
                self.userPosts.append(post)
            }
            self.recentlyDeletedPosts.removeValue(forKey: postId)
            self.showSuccessToast("Post restored")
        }
        
        return true
    }
    
    func removeRepost(_ postId: Int) async -> Bool {
        // Store the post for potential undo
        if let post = userReposts.first(where: { $0.id == postId }) {
            recentlyRemovedReposts[postId] = post
        }
        
        do {
            let _ = try await apiService.toggleRepost(postId)
            // If the API call succeeds, assume the repost was removed
            await MainActor.run {
                self.userReposts.removeAll { $0.id == postId }
            }
            return true
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.showErrorToast("Failed to remove repost")
                // Remove from recently removed since it failed
                self.recentlyRemovedReposts.removeValue(forKey: postId)
            }
            return false
        }
    }
    
    func undoRemoveRepost(_ postId: Int) async -> Bool {
        guard let post = recentlyRemovedReposts[postId] else { return false }
        
        do {
            let _ = try await apiService.toggleRepost(postId)
            await MainActor.run {
                // Insert the post back in its original position
                if let originalIndex = self.userReposts.firstIndex(where: { $0.createdAt < post.createdAt }) {
                    self.userReposts.insert(post, at: originalIndex)
                } else {
                    self.userReposts.append(post)
                }
                self.recentlyRemovedReposts.removeValue(forKey: postId)
                self.showSuccessToast("Repost restored")
            }
            return true
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.showErrorToast("Failed to restore repost")
            }
            return false
        }
    }
    
    func removeBookmark(_ postId: Int) async -> Bool {
        // Store the post for potential undo
        if let post = userBookmarks.first(where: { $0.id == postId }) {
            recentlyRemovedBookmarks[postId] = post
        }
        
        do {
            let _ = try await apiService.toggleBookmark(postId)
            // If the API call succeeds, assume the bookmark was removed
            await MainActor.run {
                self.userBookmarks.removeAll { $0.id == postId }
            }
            return true
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.showErrorToast("Failed to remove bookmark")
                // Remove from recently removed since it failed
                self.recentlyRemovedBookmarks.removeValue(forKey: postId)
            }
            return false
        }
    }
    
    func undoRemoveBookmark(_ postId: Int) async -> Bool {
        guard let post = recentlyRemovedBookmarks[postId] else { return false }
        
        do {
            let _ = try await apiService.toggleBookmark(postId)
            await MainActor.run {
                // Insert the post back in its original position
                if let originalIndex = self.userBookmarks.firstIndex(where: { $0.createdAt < post.createdAt }) {
                    self.userBookmarks.insert(post, at: originalIndex)
                } else {
                    self.userBookmarks.append(post)
                }
                self.recentlyRemovedBookmarks.removeValue(forKey: postId)
                self.showSuccessToast("Bookmark restored")
            }
            return true
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.showErrorToast("Failed to restore bookmark")
            }
            return false
        }
    }
    
    // MARK: - Toast Messages
    private func showSuccessToast(_ message: String) {
        toastMessage = message
        showingToast = true
        
        // Auto-hide after 3 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            self.showingToast = false
        }
    }
    
    private func showErrorToast(_ message: String) {
        toastMessage = message
        showingToast = true
        
        // Auto-hide after 4 seconds (longer for errors)
        DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
            self.showingToast = false
        }
    }
    
    func dismissToast() {
        showingToast = false
    }
}

