//
//  MessagesView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @State private var showingNewMessage = false
    
    var body: some View {
        NavigationView {
            VStack {
                if viewModel.isLoading {
                    ProgressView("Loading conversations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.conversations.isEmpty {
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
                        ForEach(viewModel.conversations) { conversation in
                            ConversationRow(conversation: conversation)
                                .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(PlainListStyle())
                    .refreshable {
                        await viewModel.refreshConversations()
                    }
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
                Task {
                    await viewModel.loadConversations()
                }
            }
        }
    }
    

}

// MARK: - Conversation Row
struct ConversationRow: View {
    let conversation: Conversation
    
    var body: some View {
        HStack(spacing: 12) {
            // Profile Picture
            AsyncImage(url: conversation.otherUser.profileImageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color("BrandPrimary"))
                    .overlay(
                        Text(conversation.otherUser.initials)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.otherUser.displayName)
                        .font(.headline)
                        .fontWeight(conversation.unreadCountInt > 0 ? .semibold : .medium)
                    
                    Spacer()
                    
                    Text(conversation.timeAgo)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(conversation.lastMessage.content)
                    .font(.subheadline)
                    .foregroundColor(conversation.unreadCountInt > 0 ? .primary : .secondary)
                    .lineLimit(2)
            }
            
            if conversation.unreadCountInt > 0 {
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

