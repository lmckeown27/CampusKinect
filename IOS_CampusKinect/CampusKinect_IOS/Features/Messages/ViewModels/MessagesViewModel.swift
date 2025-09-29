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
    @Published var conversations: [Conversation] = []
    @Published var messageRequests: [MessageRequest] = []
    @Published var sentMessageRequests: [MessageRequest] = []
    @Published var isLoading = false
    @Published var error: APIError?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var pollTimer: Timer?
    private var currentUserId: Int = 0
    
    init() {
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
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchConversations()
            await MainActor.run {
                self.conversations = response.data.conversations
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
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
            
            // Remove from current position and add to top
            conversations.remove(at: index)
            conversations.insert(updatedConversationData, at: 0)
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
        
        do {
            let response = try await apiService.fetchConversations()
            let newConversations = response.data.conversations
            
            // Check if there are new conversations or updates
            if newConversations.count != conversations.count || 
               newConversations.first?.lastMessageTime != conversations.first?.lastMessageTime {
                conversations = newConversations
            }
        } catch {
            // Silently fail polling to avoid spamming errors
            print("⚠️ Conversation polling failed: \(error)")
        }
    }
}

