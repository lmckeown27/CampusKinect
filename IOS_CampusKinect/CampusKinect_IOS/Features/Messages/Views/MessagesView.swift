import SwiftUI

struct MessagesView: View {
    @StateObject private var viewModel = MessagesViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingNewMessage = false
    @State private var activeTab: MessageTab = .sent
    @State private var searchText = ""
    @State private var selectedUser: User?
    @State private var shouldNavigateToChat = false
    @State private var isViewReady = false // Track when view is fully initialized
    @State private var pendingNotification: [AnyHashable: Any]? // Queue notification if received before ready
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    enum MessageTab: String, CaseIterable {
        case incoming = "Incoming"
        case sent = "Sent"
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    searchSection
                    tabSection
                    conversationsList
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.85, 900) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
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
            NewMessageView { user in
                selectedUser = user
                shouldNavigateToChat = true
            }
        }
        .navigationDestination(isPresented: $shouldNavigateToChat) {
            if let user = selectedUser {
                ChatView(userId: user.id, userName: user.username ?? user.fullName)
            }
        }
        .onAppear {
            print("📱 MessagesView appeared. isViewReady = true")
            isViewReady = true
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
    }
    
    // MARK: - Components
    
    private var searchSection: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField(searchPlaceholder, text: $searchText)
                .textFieldStyle(PlainTextFieldStyle())
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
        .padding(.horizontal, isIPad ? 40 : 16)
        .padding(.top, 8)
    }
    
    private var tabSection: some View {
        Picker("Message Tab", selection: $activeTab) {
            ForEach(MessageTab.allCases, id: \.self) { tab in
                Text(tab.rawValue).tag(tab)
            }
        }
        .pickerStyle(SegmentedPickerStyle())
        .padding(.horizontal, isIPad ? 40 : 16)
        .padding(.vertical, 8)
    }
    
    private var conversationsList: some View {
        VStack {
            if viewModel.isLoading && viewModel.conversations.isEmpty {
                LoadingView()
            } else if viewModel.conversations.isEmpty {
                EmptyStateView(
                    title: "No \(activeTab.rawValue) Messages",
                    message: "You don't have any \(activeTab.rawValue.lowercased()) messages yet.",
                    systemImage: activeTab == .incoming ? "envelope.badge" : "paperplane"
                )
            } else {
                List {
                    ForEach(filteredConversations) { conversation in
                        ConversationRow(conversation: conversation) {
                            selectedUser = User(id: conversation.otherUser.id, username: conversation.otherUser.username, email: nil, firstName: conversation.otherUser.firstName, lastName: conversation.otherUser.lastName, displayName: conversation.otherUser.displayName, profilePicture: conversation.otherUser.profilePicture, year: nil, major: nil, hometown: nil, bio: nil, universityId: nil, universityName: conversation.otherUser.university, universityDomain: nil, isVerified: nil, isActive: nil, createdAt: Date(), updatedAt: nil)
                            shouldNavigateToChat = true
                        }
                    }
                    
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
    
    private var searchPlaceholder: String {
        activeTab == .incoming ? "Search incoming messages..." : "Search sent messages..."
    }
    
    private var filteredConversations: [Conversation] {
        let conversationsToFilter = viewModel.conversations
        
        if searchText.isEmpty {
            return conversationsToFilter
        } else {
            return conversationsToFilter.filter { conversation in
                conversation.otherUser.displayName.localizedCaseInsensitiveContains(searchText) ||
                conversation.lastMessage?.content.localizedCaseInsensitiveContains(searchText) ?? false
            }
        }
    }
    
    // MARK: - Methods
    
    private func handlePushNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling push notification in MessagesView: \(userInfo)")
        if let aps = userInfo["aps"] as? [String: Any],
           let alert = aps["alert"] as? [String: Any],
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
}

// MARK: - Conversation Row
struct ConversationRow: View {
    let conversation: Conversation
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ProfileImageView(imageUrl: conversation.otherUser.profilePicture, size: .medium)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(conversation.otherUser.displayName)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)

                    Text(conversation.lastMessage?.content ?? "No messages yet")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)

                }

                Spacer()

                if conversation.unreadCountInt > 0 {
                    Text("\(conversation.unreadCountInt)")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color("BrandPrimary"))
                        .cornerRadius(10)
                }
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct MessagesView_Previews: PreviewProvider {
    static var previews: some View {
        MessagesView()
            .environmentObject(AuthenticationManager())
    }
} 
