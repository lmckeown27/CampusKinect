//
//  MessagesView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingNewMessage = false
    @State private var activeTab: MessageTab = .sent
    @State private var searchText = ""
    @State private var selectedUser: User?
    @State private var shouldNavigateToChat = false
    
    enum MessageTab: String, CaseIterable {
        case incoming = "Unread"
        case sent = "Primary"
        case requests = "Requests"
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    
                    TextField(searchPlaceholder, text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                        .toolbar {
                            ToolbarItemGroup(placement: .keyboard) {
                                Spacer()
                                Button("Done") {
                                    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                                }
                            }
                        }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(.systemGray6))
                .cornerRadius(10)
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
                    ProgressView("Loading...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    switch activeTab {
                    case .incoming:
                        if filteredConversations.isEmpty {
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
                                    NavigationLink(destination: ChatView(
                                        userId: conversation.otherUser.id,
                                        userName: conversation.otherUser.displayName
                                    )) {
                                        ConversationRow(conversation: conversation)
                                    }
                                    .listRowSeparator(.hidden)
                                }
                            }
                            .listStyle(PlainListStyle())
                            .refreshable {
                                await viewModel.refreshConversations()
                            }
                        }
                    case .sent:
                        if filteredConversations.isEmpty {
                            EmptyStateView(
                                title: emptyStateTitle,
                                message: emptyStateMessage,
                                systemImage: "paperplane",
                                actionTitle: "New Message"
                            ) {
                                showingNewMessage = true
                            }
                        } else {
                            List {
                                ForEach(filteredConversations) { conversation in
                                    ConversationRow(conversation: conversation)
                                        .listRowSeparator(.hidden)
                                        .onTapGesture {
                                            selectedUser = User(
                                                id: conversation.otherUser.id,
                                                username: conversation.otherUser.username,
                                                email: nil,
                                                firstName: conversation.otherUser.firstName,
                                                lastName: conversation.otherUser.lastName,
                                                displayName: conversation.otherUser.displayName,
                                                profilePicture: conversation.otherUser.profilePicture,
                                                year: nil,
                                                major: nil,
                                                hometown: nil,
                                                bio: nil,
                                                universityId: 0,
                                                universityName: conversation.otherUser.university,
                                                universityDomain: nil,
                                                isVerified: false,
                                                isActive: true,
                                                createdAt: Date(),
                                                updatedAt: nil
                                            )
                                            shouldNavigateToChat = true
                                        }
                                }
                            }
                            .listStyle(PlainListStyle())
                            .refreshable {
                                await viewModel.refreshConversations()
                            }
                        }
                    case .requests:
                        if filteredMessageRequests.isEmpty {
                            EmptyStateView(
                                title: emptyStateTitle,
                                message: emptyStateMessage,
                                systemImage: "person.2",
                                actionTitle: "New Message"
                            ) {
                                showingNewMessage = true
                            }
                        } else {
                            List {
                                ForEach(filteredMessageRequests) { request in
                                    MessageRequestRow(request: request)
                                        .listRowSeparator(.hidden)
                                }
                            }
                            .listStyle(PlainListStyle())
                            .refreshable {
                                await viewModel.refreshMessageRequests()
                            }
                        }
                    }
                }
            }
            .navigationTitle("Messages")
            .navigationBarTitleDisplayMode(.large)
            .toolbar(content: {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingNewMessage = true
                    }) {
                        Image(systemName: "square.and.pencil")
                    }
                }
            })
            .sheet(isPresented: $showingNewMessage) {
                NewMessageView { user in
                    selectedUser = user
                    shouldNavigateToChat = true
                }
            }
            .navigationDestination(isPresented: $shouldNavigateToChat) {
                if let selectedUser = selectedUser {
                    ChatView(userId: selectedUser.id, userName: selectedUser.displayName)
                }
            }
            .onAppear {
                Task {
                    switch activeTab {
                    case .incoming:
                        await viewModel.loadConversations()
                    case .sent:
                        // Sent messages not implemented yet
                        break
                    case .requests:
                        await viewModel.loadMessageRequests()
                    }
                }
            }
            .onChange(of: activeTab) { oldValue, newValue in
                Task {
                    switch newValue {
                    case .incoming:
                        await viewModel.loadConversations()
                    case .sent:
                        // Sent messages not implemented yet
                        break
                    case .requests:
                        await viewModel.loadMessageRequests()
                    }
                }
            }
        }
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
            return "No Unread Messages"
        case .sent:
            return "No Recent Conversations"
        case .requests:
            return "No Message Requests"
        }
    }
    
    private var emptyStateMessage: String {
        switch activeTab {
        case .incoming:
            return "Messages you haven't responded to will appear here"
        case .sent:
            return "Conversations where you sent the last message will appear here"
        case .requests:
            return "Message requests will appear here"
        }
    }
    
    private var filteredConversations: [Conversation] {
        guard let currentUserId = authManager.currentUser?.id else {
            return []
        }
        
        switch activeTab {
        case .incoming:
            // Incoming: Show conversations where the last message was sent TO the current user (from someone else)
            return viewModel.conversations.filter { conversation in
                let matchesSearch = searchText.isEmpty || 
                    conversation.otherUser.displayName.localizedCaseInsensitiveContains(searchText)
                
                // Check if last message was sent by someone else (incoming)
                let isIncomingMessage = conversation.lastMessage?.senderId != currentUserId
                
                return matchesSearch && isIncomingMessage
            }
        case .sent:
            // Sent: Show conversations where the last message was sent BY the current user (outgoing)
            return viewModel.conversations.filter { conversation in
                let matchesSearch = searchText.isEmpty || 
                    conversation.otherUser.displayName.localizedCaseInsensitiveContains(searchText)
                
                // Check if last message was sent by current user (outgoing)
                let isOutgoingMessage = conversation.lastMessage?.senderId == currentUserId
                
                return matchesSearch && isOutgoingMessage
            }
        case .requests:
            // This will be handled separately with message requests
            return []
        }
    }
    
    private var filteredMessageRequests: [MessageRequest] {
        return viewModel.messageRequests.filter { request in
            searchText.isEmpty || 
                request.fromUser.displayName.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    private var filteredSentMessageRequests: [MessageRequest] {
        return viewModel.sentMessageRequests.filter { request in
            searchText.isEmpty || 
                request.toUser?.displayName.localizedCaseInsensitiveContains(searchText) == true
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
                
                Text(conversation.lastMessage?.content ?? "No messages yet")
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
    }
}

// MARK: - Message Request Row
struct MessageRequestRow: View {
    let request: MessageRequest
    
    var body: some View {
        HStack(spacing: 12) {
            // Profile Picture
            AsyncImage(url: request.fromUser.profileImageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color("BrandPrimary"))
                    .overlay(
                        Text(request.fromUser.initials)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(request.fromUser.displayName)
                        .font(.headline)
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(request.timeAgo)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(request.content)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                if let postTitle = request.postTitle {
                    Text("Re: \(postTitle)")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.top, 2)
                }
            }
            
            // Status indicator
            if request.status == "pending" {
                Circle()
                    .fill(Color.orange)
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .onTapGesture {
            // Handle message request tap
            print("Tapped message request from \(request.fromUser.displayName)")
        }
    }
}

#Preview {
    MessagesView()
}

