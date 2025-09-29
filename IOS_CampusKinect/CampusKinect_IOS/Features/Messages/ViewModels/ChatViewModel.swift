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
                    conversationId: conversation.id,
                    content: messageContent
                )
                
                // Notify MessagesViewModel about the new message
                NotificationCenter.default.post(
                    name: .messageSent,
                    object: nil,
                    userInfo: [
                        "conversationId": conversation.id,
                        "message": messageContent,
                        "senderId": currentUserId ?? 0
                    ]
                )
            } else {
                // Create new POST-CENTRIC conversation with first message
                guard let postId = UserDefaults.standard.object(forKey: "pendingChatPostId") as? Int else {
                    print("❌ Cannot create conversation without post context")
                    self.error = .unknown(400)
                    return
                }
                
                let request = StartConversationRequest(
                    otherUserId: otherUser.id,
                    postId: postId,
                    initialMessage: messageContent
                )
                
                let response = try await apiService.startConversation(request)
                print("✅ Post conversation created with first message: \(response.data.conversation.id)")
                
                // Update the conversation reference
                self.conversation = response.data.conversation
                
                // Clear the pending post data since conversation is now created
                UserDefaults.standard.removeObject(forKey: "pendingChatPostId")
                UserDefaults.standard.removeObject(forKey: "pendingChatPostTitle")
                UserDefaults.standard.removeObject(forKey: "pendingChatUserId")
                UserDefaults.standard.removeObject(forKey: "pendingChatUserName")
                
                // Notify MessagesViewModel about the new conversation
                NotificationCenter.default.post(
                    name: .messageSent,
                    object: nil,
                    userInfo: [
                        "conversationId": response.data.conversation.id,
                        "message": messageContent,
                        "senderId": currentUserId ?? 0
                    ]
                )
            }
            
            // Don't immediately reload - let polling handle it
            // This prevents the optimistic message from disappearing before server processes it
            
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
            let serverMessages = response.data.messages.sorted { $0.createdAt < $1.createdAt }
            
            // Merge with existing messages, removing optimistic messages that now have server versions
            mergeMessages(serverMessages)
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
            let serverMessages = response.data.messages.sorted { $0.createdAt < $1.createdAt }
            
            // Always merge messages to handle updates and new messages
            mergeMessages(serverMessages)
        } catch {
            // Silently fail polling to avoid spamming errors
            print("⚠️ Polling failed: \(error)")
        }
    }
    
    // MARK: - Helper Methods
    
    private func mergeMessages(_ serverMessages: [Message]) {
        
        // Remove optimistic messages that now have server versions
        // (optimistic messages have temporary IDs >= 1000000)
        let nonOptimisticMessages = messages.filter { message in
            if message.id >= 1000000 {
                // This is an optimistic message - check if server has a real version
                return !serverMessages.contains { serverMessage in
                    serverMessage.content == message.content &&
                    serverMessage.senderId == message.senderId &&
                    abs(serverMessage.createdAt.timeIntervalSince(message.createdAt)) < 10 // Within 10 seconds
                }
            }
            return true
        }
        
        // Combine non-optimistic local messages with server messages
        var allMessages = nonOptimisticMessages
        
        // Add server messages that aren't already in our local messages
        for serverMessage in serverMessages {
            if !allMessages.contains(where: { $0.id == serverMessage.id }) {
                allMessages.append(serverMessage)
            }
        }
        
        // Sort by creation date and update
        messages = allMessages.sorted { $0.createdAt < $1.createdAt }
    }
    
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

