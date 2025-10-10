//
//  MessagesViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

extension Notification.Name {
    static let messageSent = Notification.Name("messageSent")
}

@MainActor
class MessagesViewModel: ObservableObject {
    static let shared = MessagesViewModel()
    
    @Published var conversations: [Conversation] = []
    @Published var messageRequests: [MessageRequest] = []
    @Published var sentMessageRequests: [MessageRequest] = []
    @Published var isLoading = false
    @Published var error: APIError?
    @Published var hasLoadedInitially = false
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var pollTimer: Timer?
    private var currentUserId: Int = 0
    
    private init() {
        // Listen for message sent notifications
        NotificationCenter.default.publisher(for: .messageSent)
            .sink { [weak self] notification in
                if let userInfo = notification.userInfo,
                   let conversationId = userInfo["conversationId"] as? Int,
                   let message = userInfo["message"] as? String,
                   let senderId = userInfo["senderId"] as? Int {
                    self?.updateConversationWithNewMessage(
                        conversationId: conversationId,
                        lastMessage: message,
                        senderId: senderId
                    )
                }
            }
            .store(in: &cancellables)
        
        // Start polling for new conversations/messages
        startPolling()
    }
    
    deinit {
        pollTimer?.invalidate()
        pollTimer = nil
    }
    
    // MARK: - Public Methods
    func loadConversations() async {
        // Don't load conversations if user is not authenticated
        let isAuthenticated = await KeychainManager.shared.getAccessToken() != nil
        guard isAuthenticated else {
            print("⚠️ Skipping conversation load - user not authenticated")
            return
        }
        
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchConversations()
            await MainActor.run {
                self.conversations = self.sortConversationsByPriority(response.data.conversations)
                self.isLoading = false
                self.hasLoadedInitially = true
                print("📱 MessagesViewModel: Conversations loaded (\(self.conversations.count) conversations)")
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
                print("❌ MessagesViewModel: Failed to load conversations: \(error)")
            }
        }
    }
    
    func refreshConversations() async {
        await loadConversations()
    }
    
    func updateConversationWithNewMessage(conversationId: Int, lastMessage: String, senderId: Int) {
        // Find and update the conversation
        if let index = conversations.firstIndex(where: { $0.id == conversationId }) {
            let updatedConversation = conversations[index]
            
            // Don't increment unread count for messages sent by current user
            let currentUserId = getCurrentUserId()
            let newUnreadCount = senderId == currentUserId ? updatedConversation.unreadCount : updatedConversation.unreadCount + 1
            
            // Update conversation with new message info (POST-CENTRIC structure)
            let updatedConversationData = Conversation(
                id: updatedConversation.id,
                createdAt: updatedConversation.createdAt,
                lastMessageAt: Date(),
                postId: updatedConversation.postId,
                postTitle: updatedConversation.postTitle,
                postType: updatedConversation.postType,
                otherUser: updatedConversation.otherUser,
                lastMessage: lastMessage, // Now a simple string
                lastMessageSenderId: senderId,
                lastMessageTime: Date(),
                unreadCount: newUnreadCount
            )
            
            // Update the conversation in the array
            conversations[index] = updatedConversationData
            
            // Re-sort to maintain priority order (incoming messages first)
            conversations = sortConversationsByPriority(conversations)
        } else {
            // Conversation not found locally, refresh to get it
            Task {
                await refreshConversations()
            }
        }
    }
    
    func loadMessageRequests() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchMessageRequests()
            await MainActor.run {
                self.messageRequests = response.data.requests
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    func loadSentMessageRequests() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchSentMessageRequests()
            await MainActor.run {
                self.sentMessageRequests = response.data.requests
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    func refreshMessageRequests() async {
        await loadMessageRequests()
    }
    
    func refreshSentMessageRequests() async {
        await loadSentMessageRequests()
    }
    
    func setCurrentUserId(_ userId: Int) {
        self.currentUserId = userId
    }
    
    private func getCurrentUserId() -> Int {
        return currentUserId
    }
    
    func deleteConversation(conversationId: Int) async {
        do {
            try await apiService.deleteConversation(conversationId: conversationId)
            // Remove the conversation from the local array
            await MainActor.run {
                self.conversations.removeAll { $0.id == conversationId }
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
            }
        }
    }
    
    // MARK: - Polling Methods
    
    private func startPolling() {
        stopPolling() // Stop any existing polling
        
        pollTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.pollForNewConversations()
            }
        }
    }
    
    private func stopPolling() {
        pollTimer?.invalidate()
        pollTimer = nil
    }
    
    private func pollForNewConversations() async {
        // Only poll if we're not already loading and have been initialized
        guard !isLoading && !conversations.isEmpty else { return }
        
        // CRITICAL: Don't poll if user is in guest mode or not authenticated
        // This prevents "unauthorized" errors for guest users
        let isAuthenticated = await KeychainManager.shared.getAccessToken() != nil
        guard isAuthenticated else {
            print("⚠️ Skipping conversation polling - user not authenticated")
            return
        }
        
        do {
            let response = try await apiService.fetchConversations()
            let newConversations = response.data.conversations
            
            // Check if there are new conversations or updates
            if newConversations.count != conversations.count || 
               newConversations.first?.lastMessageTime != conversations.first?.lastMessageTime {
                conversations = sortConversationsByPriority(newConversations)
            }
        } catch let apiError as APIError {
            // Only log non-auth errors to avoid spamming
            if case .unauthorized = apiError {
                print("⚠️ Conversation polling skipped - user not authenticated")
            } else {
                print("⚠️ Conversation polling failed: \(apiError)")
            }
        } catch {
            print("⚠️ Conversation polling failed (unknown error): \(error)")
        }
    }
    
    // MARK: - Sorting Logic
    /// Sorts conversations to prioritize incoming messages at the top
    /// Incoming messages (where lastMessageSenderId != currentUserId) are shown first,
    /// then sent messages, both sorted by most recent time
    private func sortConversationsByPriority(_ conversations: [Conversation]) -> [Conversation] {
        let userId = getCurrentUserId()
        
        return conversations.sorted { conv1, conv2 in
            let isIncoming1 = conv1.lastMessageSenderId != nil && conv1.lastMessageSenderId != userId
            let isIncoming2 = conv2.lastMessageSenderId != nil && conv2.lastMessageSenderId != userId
            
            // If one is incoming and the other isn't, prioritize incoming
            if isIncoming1 != isIncoming2 {
                return isIncoming1
            }
            
            // If both are incoming or both are sent, sort by most recent time
            let time1 = conv1.lastMessageTime ?? conv1.createdAt
            let time2 = conv2.lastMessageTime ?? conv2.createdAt
            return time1 > time2
        }
    }
}

