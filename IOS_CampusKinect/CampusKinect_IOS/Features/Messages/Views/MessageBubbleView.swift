//
//  MessageBubbleView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MessageBubbleView: View {
    let message: Message
    let isFromCurrentUser: Bool
    let showTimestamp: Bool
    let showAvatar: Bool
    let otherUser: User?
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if !isFromCurrentUser {
                // Other user's avatar
                if showAvatar {
                    AsyncImage(url: otherUser?.profileImageURL) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .overlay(
                                Text(otherUser?.initials ?? "?")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.gray)
                            )
                    }
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())
                } else {
                    // Spacer to maintain alignment
                    Color.clear
                        .frame(width: 32, height: 32)
                }
            }
            
            VStack(alignment: isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                // Message bubble
                HStack {
                    if isFromCurrentUser {
                        Spacer(minLength: 60) // Push message to the right
                    }
                    
                    VStack(alignment: .leading, spacing: 0) {
                        // Message content
                        Text(message.content)
                            .font(.body)
                            .foregroundColor(isFromCurrentUser ? .white : .primary)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(isFromCurrentUser ? Color(hex: "708d81") ?? .blue : Color(.systemGray5))
                    )
                    
                    if !isFromCurrentUser {
                        Spacer(minLength: 60) // Push message to the left
                    }
                }
                
                // Timestamp
                if showTimestamp {
                    HStack {
                        if isFromCurrentUser {
                            Spacer()
                        }
                        
                        Text(message.timeAgo)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        
                        if !isFromCurrentUser {
                            Spacer()
                        }
                    }
                    .padding(.horizontal, 4)
                }
            }
            
            if isFromCurrentUser {
                // Current user doesn't need avatar space
                Color.clear
                    .frame(width: 0)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 2)
    }
}

// MARK: - Message Status View
struct MessageStatusView: View {
    let message: Message
    
    var body: some View {
        HStack(spacing: 2) {
            if message.isRead {
                Image(systemName: "checkmark.circle.fill")
                    .font(.caption2)
                    .foregroundColor(.blue)
            } else {
                Image(systemName: "checkmark.circle")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 8) {
        MessageBubbleView(
            message: Message(
                id: 1,
                conversationId: 1,
                senderId: 1,
                receiverId: 2,
                content: "Hey! How are you doing?",
                messageType: .text,
                isRead: true,
                createdAt: Date().addingTimeInterval(-3600),
                updatedAt: Date().addingTimeInterval(-3600),
                metadata: nil
            ),
            isFromCurrentUser: false,
            showTimestamp: true,
            showAvatar: true,
            otherUser: nil
        )
        
        MessageBubbleView(
            message: Message(
                id: 2,
                conversationId: 1,
                senderId: 2,
                receiverId: 1,
                content: "I'm doing great! Thanks for asking. How about you?",
                messageType: .text,
                isRead: false,
                createdAt: Date().addingTimeInterval(-1800),
                updatedAt: Date().addingTimeInterval(-1800),
                metadata: nil
            ),
            isFromCurrentUser: true,
            showTimestamp: true,
            showAvatar: false,
            otherUser: nil
        )
        
        MessageBubbleView(
            message: Message(
                id: 3,
                conversationId: 1,
                senderId: 1,
                receiverId: 2,
                content: "That's awesome! I was wondering if you'd like to grab coffee sometime this week?",
                messageType: .text,
                isRead: false,
                createdAt: Date().addingTimeInterval(-900),
                updatedAt: Date().addingTimeInterval(-900),
                metadata: nil
            ),
            isFromCurrentUser: false,
            showTimestamp: false,
            showAvatar: true,
            otherUser: nil
        )
    }
    .padding()
    .background(Color(.systemBackground))
}

