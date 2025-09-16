//
//  ChatViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import SwiftUI

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading = false
    @Published var error: APIError?
    @Published var otherUser: User?
    @Published var conversation: Conversation?
    @Published var newMessageText = ""
    
    private let apiService = APIService.shared
    private var currentUserId: Int?
    private var pollTimer: Timer?
    
    init(currentUserId: Int? = nil) {
        self.currentUserId = currentUserId
    }
    
    deinit {
        pollTimer?.invalidate()
        pollTimer = nil
    }
    
    // MARK: - Public Methods
    
    func setCurrentUserId(_ userId: Int) {
        self.currentUserId = userId
    }
    
    func loadChat(with userId: Int) async {
        isLoading = true
        error = nil
        
        do {
            // Load the other user's information
            let user = try await apiService.getUserById(userId: userId)
            otherUser = user
            
            // Try to find existing conversation
            await loadExistingConversation(with: userId)
            
            // If conversation exists, load messages
            if let conversation = conversation {
                await loadMessages(for: conversation.id)
                startPolling()
            }
            
        } catch {
            self.error = error as? APIError ?? .unknown(0)
            print("❌ Failed to load chat: \(error)")
        }
        
        isLoading = false
    }
    
    func sendMessage() async {
        guard !newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              let otherUser = otherUser else { return }
        
        let messageContent = newMessageText.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Create optimistic message
        if let currentUserId = currentUserId {
            let optimisticMessage = Message(
                id: Int.random(in: 1000000...9999999), // Temporary ID
                conversationId: conversation?.id ?? 0,
                senderId: currentUserId,
                receiverId: otherUser.id,
                content: messageContent,
                messageType: .text,
                isRead: false,
                createdAt: Date(),
                updatedAt: Date(),
                metadata: nil
            )
            
            messages.append(optimisticMessage)
        }
        
        // Clear input immediately for better UX
        newMessageText = ""
        
        do {
            if let conversation = conversation {
                // Send message to existing conversation
                _ = try await apiService.sendMessage(
                    receiverId: otherUser.id,
                    content: messageContent
                )
            } else {
                // Create new conversation with initial message
                let response = try await apiService.createConversation(
                    receiverId: otherUser.id,
                    initialMessage: messageContent
                )
                
                if let newConversation = response.data.conversations.first {
                    self.conversation = newConversation
                    startPolling()
                }
            }
            
            // Refresh messages to get the actual message from server
            if let conversation = conversation {
                await loadMessages(for: conversation.id)
            }
            
        } catch {
            // Remove optimistic message on error
            if let currentUserId = currentUserId {
                messages.removeAll { $0.senderId == currentUserId && $0.content == messageContent }
            }
            
            self.error = error as? APIError ?? .unknown(0)
            print("❌ Failed to send message: \(error)")
        }
    }
    
    func markAsRead() {
        // TODO: Implement mark as read functionality when API is available
    }
    
    // MARK: - Private Methods
    
    private func loadExistingConversation(with userId: Int) async {
        do {
            let response = try await apiService.fetchConversations()
            
            // Find conversation with the specific user
            if let existingConversation = response.data.conversations.first(where: { $0.otherUser.id == userId }) {
                conversation = existingConversation
            }
        } catch {
            print("❌ Failed to load existing conversations: \(error)")
        }
    }
    
    private func loadMessages(for conversationId: Int) async {
        do {
            let response = try await apiService.fetchMessages(conversationId: conversationId)
            
            // Update messages with current user context
            let updatedMessages = response.messages
            
            messages = updatedMessages.sorted { $0.createdAt < $1.createdAt }
        } catch {
            self.error = error as? APIError ?? .unknown(0)
            print("❌ Failed to load messages: \(error)")
        }
    }
    
    private func startPolling() {
        stopPolling() // Stop any existing polling
        
        pollTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.pollForNewMessages()
            }
        }
    }
    
    private func stopPolling() {
        pollTimer?.invalidate()
        pollTimer = nil
    }
    
    private func pollForNewMessages() async {
        guard let conversation = conversation else { return }
        
        do {
            let response = try await apiService.fetchMessages(conversationId: conversation.id)
            let newMessages = response.messages.sorted { $0.createdAt < $1.createdAt }
            
            // Only update if we have more messages
            if newMessages.count > messages.count {
                messages = newMessages
            }
        } catch {
            // Silently fail polling to avoid spamming errors
            print("⚠️ Polling failed: \(error)")
        }
    }
    
    // MARK: - Helper Methods
    
    func isMessageFromCurrentUser(_ message: Message) -> Bool {
        return message.senderId == currentUserId
    }
    
    func shouldShowTimestamp(for message: Message, at index: Int) -> Bool {
        // Show timestamp for first message or if more than 5 minutes apart
        guard index > 0 else { return true }
        
        let previousMessage = messages[index - 1]
        let timeDifference = message.createdAt.timeIntervalSince(previousMessage.createdAt)
        return timeDifference > 300 // 5 minutes
    }
    
    func shouldShowAvatar(for message: Message, at index: Int) -> Bool {
        // Show avatar for messages from other user if it's the last in a group
        guard !isMessageFromCurrentUser(message) else { return false }
        
        // Show if it's the last message or next message is from different sender
        if index == messages.count - 1 {
            return true
        }
        
        let nextMessage = messages[index + 1]
        return nextMessage.senderId != message.senderId
    }
}

