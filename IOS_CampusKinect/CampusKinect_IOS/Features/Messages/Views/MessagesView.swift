//
//  MessagesView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MessagesView: View {
    @State private var conversations: [MockConversation] = []
    @State private var showingNewMessage = false
    
    var body: some View {
        NavigationView {
            VStack {
                if conversations.isEmpty {
                    EmptyStateView(
                        title: "No Messages Yet",
                        message: "Start a conversation with someone from your campus!",
                        systemImage: "message",
                        actionTitle: "New Message"
                    ) {
                        showingNewMessage = true
                    }
                } else {
                    List {
                        ForEach(conversations) { conversation in
                            ConversationRow(conversation: conversation)
                                .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingNewMessage = true
                    }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            }
            .sheet(isPresented: $showingNewMessage) {
                NewMessageView()
            }
            .onAppear {
                loadMockConversations()
            }
        }
    }
    
    private func loadMockConversations() {
        // Mock data for demonstration
        conversations = [
            MockConversation(
                id: 1,
                userName: "Sarah Johnson",
                lastMessage: "Hey! Are you still selling that textbook?",
                timestamp: "2m ago",
                hasUnread: true
            ),
            MockConversation(
                id: 2,
                userName: "Mike Chen",
                lastMessage: "Thanks for the study group invite!",
                timestamp: "1h ago",
                hasUnread: false
            ),
            MockConversation(
                id: 3,
                userName: "Emma Davis",
                lastMessage: "The apartment looks great! When can we meet?",
                timestamp: "3h ago",
                hasUnread: true
            )
        ]
    }
}

// MARK: - Conversation Row
struct ConversationRow: View {
    let conversation: MockConversation
    
    var body: some View {
        HStack(spacing: 12) {
            // Profile Picture
            Circle()
                .fill(Color("BrandPrimary"))
                .frame(width: 50, height: 50)
                .overlay(
                    Text(conversation.initials)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.userName)
                        .font(.headline)
                        .fontWeight(conversation.hasUnread ? .semibold : .medium)
                    
                    Spacer()
                    
                    Text(conversation.timestamp)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(conversation.lastMessage)
                    .font(.subheadline)
                    .foregroundColor(conversation.hasUnread ? .primary : .secondary)
                    .lineLimit(2)
            }
            
            if conversation.hasUnread {
                Circle()
                    .fill(Color("AccentColor"))
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .onTapGesture {
            // Navigate to chat view
            print("Tapped conversation with \(conversation.userName)")
        }
    }
}

// MARK: - Mock Conversation Model
struct MockConversation: Identifiable {
    let id: Int
    let userName: String
    let lastMessage: String
    let timestamp: String
    let hasUnread: Bool
    
    var initials: String {
        let components = userName.components(separatedBy: " ")
        let firstInitial = components.first?.first?.uppercased() ?? ""
        let lastInitial = components.count > 1 ? components.last?.first?.uppercased() ?? "" : ""
        return "\(firstInitial)\(lastInitial)"
    }
}

#Preview {
    MessagesView()
}

