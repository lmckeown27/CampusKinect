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
    @State private var activeTab: MessageTab = .incoming
    @State private var searchText = ""
    
    enum MessageTab: String, CaseIterable {
        case incoming = "Incoming"
        case sent = "Sent"
        case requests = "Requests"
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField(searchPlaceholder, text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    
                    Button(action: {
                        showingNewMessage = true
                    }) {
                        Image(systemName: "plus")
                            .foregroundColor(Color("BrandPrimary"))
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)
                
                // Tab Navigation
                HStack(spacing: 0) {
                    ForEach(MessageTab.allCases, id: \.self) { tab in
                        Button(action: {
                            activeTab = tab
                        }) {
                            Text(tab.rawValue)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(activeTab == tab ? .white : Color("BrandPrimary"))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(
                                    activeTab == tab ? Color("BrandPrimary") : Color.clear
                                )
                        }
                    }
                }
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)
                .padding(.top, 16)
                
                // Content
                if viewModel.isLoading {
                    ProgressView("Loading conversations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredConversations.isEmpty {
                    EmptyStateView(
                        title: emptyStateTitle,
                        message: emptyStateMessage,
                        systemImage: "message",
                        actionTitle: "New Message"
                    ) {
                        showingNewMessage = true
                    }
                } else {
                    List {
                        ForEach(filteredConversations) { conversation in
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
        .dismissKeyboardOnTap()
    }
    
    // MARK: - Computed Properties
    private var searchPlaceholder: String {
        switch activeTab {
        case .incoming:
            return "Search incoming messages"
        case .sent:
            return "Search sent messages"
        case .requests:
            return "Search message requests"
        }
    }
    
    private var emptyStateTitle: String {
        switch activeTab {
        case .incoming:
            return "No Incoming Messages"
        case .sent:
            return "No Sent Messages"
        case .requests:
            return "No Message Requests"
        }
    }
    
    private var emptyStateMessage: String {
        switch activeTab {
        case .incoming:
            return "Messages sent to you will appear here"
        case .sent:
            return "Messages you've sent will appear here"
        case .requests:
            return "Message requests will appear here"
        }
    }
    
    private var filteredConversations: [Conversation] {
        let filtered = viewModel.conversations.filter { conversation in
            // Search filter
            let matchesSearch = searchText.isEmpty || 
                conversation.otherUser.displayName.localizedCaseInsensitiveContains(searchText)
            
            // Tab filter (simplified for now - would need backend support for proper filtering)
            return matchesSearch
        }
        
        return filtered
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
            print("Tapped conversation with \(conversation.otherUser.displayName)")
        }
    }
}

#Preview {
    MessagesView()
}

