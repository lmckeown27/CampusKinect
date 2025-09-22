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
                ChatView(userId: Int(user.id) ?? 0, userName: user.username)
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
        Group {
            if viewModel.isLoadingConversations && viewModel.conversations.isEmpty {
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
                        ConversationRow(conversation: conversation)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(
                                top: 8,
                                leading: isIPad ? 40 : 16,
                                bottom: 8,
                                trailing: isIPad ? 40 : 16
                            ))
                            .onTapGesture {
                                selectedUser = conversation.otherUser
                                shouldNavigateToChat = true
                            }
                    }
                    
                    if viewModel.isLoadingConversations && !viewModel.conversations.isEmpty {
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
        let conversationsToFilter = activeTab == .incoming ? viewModel.incomingConversations : viewModel.sentConversations
        
        if searchText.isEmpty {
            return conversationsToFilter
        } else {
            return conversationsToFilter.filter { conversation in
                conversation.otherUser.fullName.localizedCaseInsensitiveContains(searchText) ||
                conversation.lastMessage?.content.localizedCaseInsensitiveContains(searchText) ?? false
            }
        }
    }
    
    // MARK: - Methods
    
    private func handlePushNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Handling push notification in MessagesView: \(userInfo)")
        if let aps = userInfo["aps"] as? [String: Any],
           let alert = aps["alert"] as? [String: Any],
           let title = alert["title"] as? String,
           let body = alert["body"] as? String,
           let senderId = userInfo["senderId"] as? String,
           let senderUsername = userInfo["senderUsername"] as? String {
            
            let senderUser = User(
                id: senderId,
                username: senderUsername,
                email: "",
                firstName: senderUsername,
                lastName: "",
                profileImageUrl: nil,
                bio: nil,
                universityId: nil,
                createdAt: Date(),
                updatedAt: Date()
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
    
    var body: some View {
        HStack(spacing: 12) {
            ProfileImageView(imageUrl: conversation.otherUser.profileImageUrl, size: .medium)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(conversation.otherUser.fullName)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(conversation.lastMessage?.content ?? "No messages yet")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                if let lastMessageDate = conversation.lastMessage?.createdAt {
                    Text(lastMessageDate, formatter: DateFormatter.messageDateFormatter)
                        .font(.caption)
                        .foregroundColor(.tertiary)
                }
            }
            
            Spacer()
            
            if conversation.unreadCount > 0 {
                Text("\(conversation.unreadCount)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color("BrandPrimary"))
                    .cornerRadius(10)
            }
        }
        .padding(.vertical, 8)
    }
}

struct MessagesView_Previews: PreviewProvider {
    static var previews: some View {
        MessagesView()
            .environmentObject(AuthenticationManager())
    }
} 