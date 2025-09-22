//
//  MessageBubbleView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MessageBubbleView: View {
    let message: Message
    let isCurrentUser: Bool
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        HStack(alignment: .bottom, spacing: isIPad ? 16 : 12) {
            if isCurrentUser {
                Spacer(minLength: isIPad ? 80 : 50)
            }
            
            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                messageBubble
                timestampView
            }
            
            if !isCurrentUser {
                Spacer(minLength: isIPad ? 80 : 50)
            }
        }
        .padding(.horizontal, isIPad ? 24 : 16)
        .padding(.vertical, 4)
    }
    
    // MARK: - Components
    
    private var messageBubble: some View {
        Text(message.content)
            .font(isIPad ? .body : .subheadline)
            .foregroundColor(isCurrentUser ? .white : .primary)
            .padding(.horizontal, isIPad ? 20 : 16)
            .padding(.vertical, isIPad ? 14 : 10)
            .background(
                RoundedRectangle(cornerRadius: isIPad ? 22 : 18)
                    .fill(isCurrentUser ? Color("BrandPrimary") : Color(.systemGray5))
            )
            .overlay(
                // Message tail/pointer
                messageTail,
                alignment: isCurrentUser ? .bottomTrailing : .bottomLeading
            )
    }
    
    private var messageTail: some View {
        Path { path in
            let tailSize: CGFloat = isIPad ? 8 : 6
            if isCurrentUser {
                // Right-pointing tail for current user
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: tailSize, y: tailSize))
                path.addLine(to: CGPoint(x: 0, y: tailSize))
                path.closeSubpath()
            } else {
                // Left-pointing tail for other user
                path.move(to: CGPoint(x: tailSize, y: 0))
                path.addLine(to: CGPoint(x: 0, y: tailSize))
                path.addLine(to: CGPoint(x: tailSize, y: tailSize))
                path.closeSubpath()
            }
        }
        .fill(isCurrentUser ? Color("BrandPrimary") : Color(.systemGray5))
        .frame(width: isIPad ? 8 : 6, height: isIPad ? 8 : 6)
        .offset(
            x: isCurrentUser ? (isIPad ? 4 : 3) : (isIPad ? -4 : -3),
            y: isIPad ? -2 : -1
        )
    }
    
    private var timestampView: some View {
        Text(message.createdAt, formatter: DateFormatter.messageTimeFormatter)
            .font(isIPad ? .caption : .caption2)
            .foregroundColor(.secondary)
            .padding(.horizontal, isIPad ? 8 : 4)
    }
}

// MARK: - Date Formatter Extension
extension DateFormatter {
    static let messageTimeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter
    }()
    
    static let messageDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }()
}

struct MessageBubbleView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 16) {
            // Current user message
            MessageBubbleView(
                message: Message(
                    id: "1",
                    content: "Hey! How are you doing today?",
                    senderId: "current",
                    receiverId: "other",
                    createdAt: Date(),
                    updatedAt: Date()
                ),
                isCurrentUser: true
            )
            
            // Other user message
            MessageBubbleView(
                message: Message(
                    id: "2",
                    content: "I'm doing great! Thanks for asking. How about you?",
                    senderId: "other",
                    receiverId: "current",
                    createdAt: Date(),
                    updatedAt: Date()
                ),
                isCurrentUser: false
            )
            
            // Long message example
            MessageBubbleView(
                message: Message(
                    id: "3",
                    content: "This is a longer message to test how the bubble handles multiple lines of text and wrapping on different screen sizes.",
                    senderId: "current",
                    receiverId: "other",
                    createdAt: Date(),
                    updatedAt: Date()
                ),
                isCurrentUser: true
            )
        }
        .padding()
        .background(Color(.systemBackground))
    }
}

