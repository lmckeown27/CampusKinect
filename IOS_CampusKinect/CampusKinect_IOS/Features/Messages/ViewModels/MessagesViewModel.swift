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
            
            // Create new last message
            let newLastMessage = Conversation.LastMessage(content: lastMessage, senderId: senderId)
            
            // Update conversation with new message info
            let updatedConversationData = Conversation(
                id: updatedConversation.id,
                postId: updatedConversation.postId,
                postTitle: updatedConversation.postTitle,
                postType: updatedConversation.postType,
                otherUser: updatedConversation.otherUser,
                lastMessage: newLastMessage,
                lastMessageTime: Date(),
                unreadCount: updatedConversation.unreadCount,
                createdAt: updatedConversation.createdAt
            )
            
            // Remove from current position and add to top
            conversations.remove(at: index)
            conversations.insert(updatedConversationData, at: 0)
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
}

