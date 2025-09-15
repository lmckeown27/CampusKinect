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
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var currentPage = 1
    
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
            }
        }
    }
}

