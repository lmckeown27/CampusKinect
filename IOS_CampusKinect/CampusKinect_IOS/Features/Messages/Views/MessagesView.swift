import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingNewMessage = false
    @State private var searchText = ""
    @State private var selectedUser: User?
    @State private var selectedPostId: Int?
    @State private var selectedPostTitle: String?
    @State private var selectedPostType: String?
    @State private var shouldNavigateToChat = false
    @State private var isViewReady = false // Track when view is fully initialized
    @State private var pendingNotification: [AnyHashable: Any]? // Queue notification if received before ready
    @State private var showingConversationConfirmation = false
    @State private var pendingConversationUser: User?
    @State private var pendingConversationPostId: Int?
    @State private var pendingConversationPostTitle: String?
    @State private var pendingConversationPostType: String?
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    searchSection
                    conversationsList
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.85, 900) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.campusBackground)
            .navigationDestination(isPresented: $shouldNavigateToChat) {
                if let user = selectedUser,
                   let postId = selectedPostId,
                   let postTitle = selectedPostTitle,
                   let postType = selectedPostType {
                    ChatView(
                        postId: postId,
                        postTitle: postTitle,
                        postType: postType,
                        otherUserId: user.id,
                        otherUserName: user.displayName
                    )
                    .onAppear {
                        print("📱 ChatView appeared successfully for post: '\(postTitle)'")
                    }
                    .onDisappear {
                        print("📱 ChatView disappeared, resetting navigation state")
                        // Reset navigation state when user navigates back
                        shouldNavigateToChat = false
                        selectedUser = nil
                        selectedPostId = nil
                        selectedPostTitle = nil
                        selectedPostType = nil
                    }
                }
            }        }
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
            NewMessageView { user in
                selectedUser = user
                shouldNavigateToChat = true
            }
        }
        .onAppear {
            print("📱 MessagesView appeared. isViewReady = true")
            isViewReady = true
            // Set current user ID in view model
            viewModel.setCurrentUserId(authManager.currentUser?.id ?? 0)
            Task {
                await viewModel.loadConversations()
            }
            if let notification = pendingNotification {
                handlePushNotification(notification)
                pendingNotification = nil
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .messageNotificationReceived)) { notification in
            print("📱 MessagesView received push notification: \(notification.userInfo ?? [:])")
            if isViewReady {
                handlePushNotification(notification.userInfo ?? [:])
            } else {
                pendingNotification = notification.userInfo ?? [:]
                print("📱 MessagesView not ready, queuing notification.")
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { notification in
            print("📱 MessagesView received navigateToChat notification: \(notification.userInfo ?? [:])")
            handleNavigateToChat(notification.userInfo ?? [:])
        }
        .alert("Error", isPresented: Binding<Bool>(
            get: { viewModel.error != nil },
            set: { _ in viewModel.error = nil }
        )) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            Text(viewModel.error?.localizedDescription ?? "An unknown error occurred.")
        }
        .alert("Start Conversation?", isPresented: $showingConversationConfirmation) {
            Button("Cancel", role: .cancel) {
                // Clear pending data
                pendingConversationUser = nil
                pendingConversationPostId = nil
                pendingConversationPostTitle = nil
                pendingConversationPostType = nil
            }
            Button("Yes") {
                // Proceed with navigation
                confirmConversationStart()
            }
        } message: {
            if let userName = pendingConversationUser?.displayName,
               let postTitle = pendingConversationPostTitle {
                Text("Do you want to start a conversation with \(userName) about '\(postTitle)'?")
            } else {
                Text("Do you want to start this conversation?")
            }
        }
    }
    
    // MARK: - Components
    
    private var searchSection: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search conversations...", text: $searchText)
                .textFieldStyle(PlainTextFieldStyle())
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
        .padding(.horizontal, isIPad ? 40 : 16)
        .padding(.top, 8)
    }
    
    private var conversationsList: some View {
        VStack {
            if viewModel.isLoading && viewModel.conversations.isEmpty {
                LoadingView()
            } else if viewModel.conversations.isEmpty {
                EmptyStateView(
                    title: "No Conversations",
                    message: "You don't have any conversations yet. Start by messaging someone about a post!",
                    systemImage: "bubble.left.and.bubble.right"
                )
            } else {
                List {
                    ForEach(filteredConversations, id: \.id) { conversation in
                        ConversationRow(conversation: conversation, currentUserId: authManager.currentUser?.id ?? 0) {
                            print("📱 ConversationRow tapped for POST: '\(conversation.postTitle)' with user: \(conversation.otherUser.displayName)")
                            
                            // Store user information
                            selectedUser = User(id: conversation.otherUser.id, username: "user\(conversation.otherUser.id)", email: nil, firstName: "User", lastName: "\(conversation.otherUser.id)", displayName: conversation.otherUser.displayName, profilePicture: nil, year: nil, major: nil, hometown: nil, bio: nil, universityId: nil, universityName: conversation.otherUser.university, universityDomain: nil, isVerified: nil, isActive: nil, createdAt: Date(), updatedAt: nil)
                            
                            // Store post information for post-centric chat
                            selectedPostId = conversation.postId
                            selectedPostTitle = conversation.postTitle
                            selectedPostType = conversation.postType
                            
                            shouldNavigateToChat = true
                            print("📱 Navigation state set: selectedUser=\(selectedUser?.displayName ?? "nil"), post='\(conversation.postTitle)', shouldNavigateToChat=\(shouldNavigateToChat)")
                        }
                    }
                    .onDelete(perform: deleteConversations)
                    
                    if viewModel.isLoading && !viewModel.conversations.isEmpty {
                        HStack {
                            Spacer()
                            ProgressView()
                                .padding()
                            Spacer()
                        }
                        .listRowSeparator(.hidden)
                    }
                }
                .listStyle(PlainListStyle())
                .scrollIndicators(.hidden)
                .refreshable {
                    await viewModel.refreshConversations()
                }
            }
        }
    }
    
    // MARK: - Computed Properties
    
    private var filteredConversations: [Conversation] {
        let allConversations = viewModel.conversations
        
        // Filter by search text only - show all conversations (like the webpage)
        return searchText.isEmpty ? allConversations : allConversations.filter { conversation in
            // POST-CENTRIC SEARCH: Search post title first, then user, then message
            conversation.postTitle.localizedCaseInsensitiveContains(searchText) ||
            conversation.otherUser.displayName.localizedCaseInsensitiveContains(searchText) ||
            conversation.lastMessage?.localizedCaseInsensitiveContains(searchText) ?? false
        }
    }    
    // MARK: - Methods
    
    private func deleteConversations(at offsets: IndexSet) {
        let conversationsToDelete = offsets.map { filteredConversations[$0] }
        
        for conversation in conversationsToDelete {
            Task {
                await viewModel.deleteConversation(conversationId: conversation.id)
            }
        }
    }
    
    private func handlePushNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling push notification in MessagesView: \(userInfo)")
        if let aps = userInfo["aps"] as? [String: Any],
           let _ = aps["alert"] as? [String: Any],
           let senderId = userInfo["senderId"] as? String,
           let senderUsername = userInfo["senderUsername"] as? String {
            
            let senderUser = User(
                id: Int(senderId) ?? 0,
                username: senderUsername,
                email: "",
                firstName: senderUsername,
                lastName: "",
                displayName: senderUsername,
                profilePicture: nil,
                year: nil,
                major: nil,
                hometown: nil,                bio: nil,
                universityId: nil,
                universityName: nil,
                universityDomain: nil,
                isVerified: nil,
                isActive: nil,                createdAt: Date(),
                updatedAt: nil
            )
            
            selectedUser = senderUser
            shouldNavigateToChat = true
            
            Task {
                await viewModel.refreshConversations()
            }
        }
    }
    
    private func handleNavigateToChat(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling navigateToChat in MessagesView: \(userInfo)")
        
        guard let userId = userInfo["userId"] as? Int,
              let userName = userInfo["userName"] as? String,
              let postId = userInfo["postId"] as? Int,
              let postTitle = userInfo["postTitle"] as? String else {
            print("❌ Missing required navigation data in userInfo")
            return
        }
        
        let postType = userInfo["postType"] as? String ?? "general"
        
        // Check if conversation already exists
        if let existingConversation = viewModel.conversations.first(where: { 
            $0.otherUser.id == userId && $0.postId == postId 
        }) {
            // Conversation exists - navigate directly without confirmation
            print("📱 Existing conversation found - navigating directly")
            selectedUser = User(
                id: userId,
                username: userName,
                email: "",
                firstName: userName,
                lastName: "",
                displayName: userName,
                profilePicture: nil,
                year: nil,
                major: nil,
                hometown: nil,
                bio: nil,
                universityId: nil,
                universityName: nil,
                universityDomain: nil,
                isVerified: nil,
                isActive: nil,
                createdAt: Date(),
                updatedAt: nil
            )
            selectedPostId = postId
            selectedPostTitle = postTitle
            selectedPostType = existingConversation.postType
            shouldNavigateToChat = true
            return
        }
        
        // No existing conversation - show confirmation popup
        print("📱 No existing conversation - showing confirmation popup")
        pendingConversationUser = User(
            id: userId,
            username: userName,
            email: "",
            firstName: userName,
            lastName: "",
            displayName: userName,
            profilePicture: nil,
            year: nil,
            major: nil,
            hometown: nil,
            bio: nil,
            universityId: nil,
            universityName: nil,
            universityDomain: nil,
            isVerified: nil,
            isActive: nil,
            createdAt: Date(),
            updatedAt: nil
        )
        pendingConversationPostId = postId
        pendingConversationPostTitle = postTitle
        pendingConversationPostType = postType // Use actual post type (housing, goods, services, etc.)
        showingConversationConfirmation = true
    }
    
    private func confirmConversationStart() {
        guard let user = pendingConversationUser,
              let postId = pendingConversationPostId,
              let postTitle = pendingConversationPostTitle,
              let postType = pendingConversationPostType else {
            print("❌ Missing pending conversation data")
            return
        }
        
        print("📱 Confirmed conversation start - creating conversation with user: \(user.displayName) for post: '\(postTitle)'")
        
        // Create the conversation immediately
        Task {
            do {
                // Create conversation with no initial message (conversation is created instantly)
                let request = StartConversationRequest(
                    otherUserId: user.id,
                    postId: postId,
                    initialMessage: nil // No message - just create the conversation
                )
                
                let response = try await APIService.shared.startConversation(request)
                print("✅ Conversation created successfully: \(response.data.conversation.id)")
                
                await MainActor.run {
                    // Set navigation state to trigger ChatView with the created conversation
                    selectedUser = user
                    selectedPostId = postId
                    selectedPostTitle = postTitle
                    selectedPostType = postType
                    shouldNavigateToChat = true
                    
                    // Refresh conversations to show the new one
                    Task {
                        await viewModel.loadConversations()
                    }
                    
                    // Clear pending data
                    pendingConversationUser = nil
                    pendingConversationPostId = nil
                    pendingConversationPostTitle = nil
                    pendingConversationPostType = nil
                }
            } catch {
                await MainActor.run {
                    viewModel.error = error as? APIError ?? .unknown(500)
                    print("❌ Failed to create conversation: \(error)")
                    
                    // Clear pending data on error
                    pendingConversationUser = nil
                    pendingConversationPostId = nil
                    pendingConversationPostTitle = nil
                    pendingConversationPostType = nil
                }
            }
        }
    }
}

// MARK: - Conversation Row
// MARK: - POST-CENTRIC Conversation Row
struct ConversationRow: View {
    let conversation: Conversation
    let currentUserId: Int
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // POST ICON (PRIMARY VISUAL ELEMENT)
                VStack {
                    Image(systemName: postIcon)
                        .font(.title2)
                        .foregroundColor(postColor)
                        .frame(width: 44, height: 44)
                        .background(postColor.opacity(0.1))
                        .cornerRadius(8)
                    
                    // Post type indicator
                    Text(conversation.postType.capitalized)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(postColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(postColor.opacity(0.1))
                        .cornerRadius(4)
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    // POST TITLE (PRIMARY EMPHASIS)
                    Text(conversation.postTitle)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    // MESSAGE DIRECTION (SECONDARY)
                    Text(messageDirectionText)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .fontWeight(.medium)
                    
                    // LAST MESSAGE (TERTIARY)
                    if let lastMessage = conversation.lastMessage, !lastMessage.isEmpty {
                        Text(lastMessage)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    } else if conversation.lastMessageSenderId != nil {
                        // Empty message but has a sender = image message
                        Text("Image")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    } else {
                        Text("Tap to start messaging about this post")
                            .font(.caption)
                            .foregroundColor(.blue)
                            .italic()
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    // Time
                    Text(conversation.timeAgo)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    // Unread count
                    if conversation.hasUnreadMessages {
                        Text("\(conversation.unreadCount)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.red)
                            .cornerRadius(10)
                    }
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
        }
        .buttonStyle(PlainButtonStyle())
        .background(Color(.systemBackground))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.campusPrimary, lineWidth: 1.5)
        )
        .cornerRadius(12)
        .padding(.vertical, 6)
        .padding(.horizontal, 4)
    }
    
    // MARK: - Post Visual Helpers
    private var postIcon: String {
        switch conversation.postType.lowercased() {
        case "goods": return "cube.box"
        case "services": return "wrench.and.screwdriver"
        case "housing": return "house"
        case "events": return "calendar"
        default: return "doc.text"
        }
    }
    
    private var postColor: Color {
        // Use campus branding colors (olive green/grey) for all post types
        return Color.campusPrimary
    }
    
    private var messageDirectionText: String {
        // Determine if this is an incoming or sent conversation based on last message
        if let lastMessageSenderId = conversation.lastMessageSenderId {
            // If the last message was sent by the current user, it's "Sent"
            // If the last message was sent by the other user, it's "Incoming"
            return lastMessageSenderId == currentUserId ? "Sent" : "Incoming"
        } else {
            // No messages yet
            return "Tap to start conversation"
        }
    }
}

struct MessagesView_Previews: PreviewProvider {
    static var previews: some View {
        MessagesView()
            .environmentObject(AuthenticationManager())
    }
} 
