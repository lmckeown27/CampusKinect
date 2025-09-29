//
//  ChatView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ChatView: View {
    let postId: Int
    let postTitle: String
    let postType: String
    let otherUserId: Int
    let otherUserName: String
    
    @EnvironmentObject var authManager: AuthenticationManager
    @StateObject private var viewModel: ChatViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFieldFocused: Bool

    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    init(postId: Int, postTitle: String, postType: String, otherUserId: Int, otherUserName: String) {
        self.postId = postId
        self.postTitle = postTitle
        self.postType = postType
        self.otherUserId = otherUserId
        self.otherUserName = otherUserName
        self._viewModel = StateObject(wrappedValue: ChatViewModel())
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    // POST HEADER (Like Instagram/X post)
                    postHeaderSection
                    
                    Divider()
                    
                    // MESSAGES/COMMENTS SECTION
                    messagesList
                    
                    Divider()
                    
                    // MESSAGE INPUT (Like comment input)
                    messageInputSection
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.85, 900) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.campusBackground)
        }
        .navigationTitle("Post Conversation")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    // Handle post options
                }) {
                    Image(systemName: "ellipsis")
                }
            }
        }
        .onAppear {
            Task {
                await viewModel.loadPostChat(postId: postId, otherUserId: otherUserId)
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
            Text(viewModel.error?.localizedDescription ?? "An error occurred.")
        }
    }
    
    // MARK: - Components
    
    private var postHeaderSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Post type and title (like a social media post header)
            HStack(spacing: 12) {
                // Post type icon
                Image(systemName: postTypeIcon)
                    .font(.title2)
                    .foregroundColor(postTypeColor)
                    .frame(width: 40, height: 40)
                    .background(postTypeColor.opacity(0.1))
                    .cornerRadius(8)
                
                VStack(alignment: .leading, spacing: 4) {
                    // Post title (main focus)
                    Text(postTitle)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                    
                    // Post type and conversation context
                    HStack(spacing: 8) {
                        Text(postType.capitalized)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(postTypeColor)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(postTypeColor.opacity(0.1))
                            .cornerRadius(6)
                        
                        Text("• Conversation with \(otherUserName)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.campusBackgroundSecondary)
    }
    
    private var messagesList: some View {
        ScrollViewReader { proxy in
            List {
                // Header for comments section
                if !viewModel.messages.isEmpty {
                    HStack {
                        Text("Conversation")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Text("\(viewModel.messages.count) messages")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }
                
                ForEach(viewModel.messages) { message in
                    CommentStyleMessageView(
                        message: message,
                        isCurrentUser: message.senderId == authManager.currentUser?.id,
                        otherUserName: otherUserName
                    )
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(
                        top: 6,
                        leading: 16,
                        bottom: 6,
                        trailing: 16
                    ))
                    .listRowBackground(Color.clear)
                    .id(message.id)
                }
                
                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                            .padding()
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                }
            }
            .listStyle(PlainListStyle())
            .scrollIndicators(.hidden)
            .onChange(of: viewModel.messages.count) { _, _ in
                if let lastMessage = viewModel.messages.last {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
    }
    
    private var messageInputSection: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                // User avatar (like comment input)
                Circle()
                    .fill(Color.campusPrimary)
                    .frame(width: 32, height: 32)
                    .overlay(
                        Text("You")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
                
                // Comment input field
                HStack(spacing: 8) {
                    TextField("Add a message about this post...", text: $viewModel.newMessageText, axis: .vertical)
                        .textFieldStyle(PlainTextFieldStyle())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.campusBackgroundSecondary)
                        .cornerRadius(16)
                        .focused($isTextFieldFocused)
                        .lineLimit(1...3)
                    
                    // Send button (like comment post button)
                    Button(action: {
                        sendMessage()
                    }) {
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? .gray : Color.campusPrimary)
                    }
                    .disabled(viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isLoading)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color.campusBackground)
    }
    
    // MARK: - Methods
    
    private func sendMessage() {
        Task {
            await viewModel.sendMessage()
        }
    }
    
    // MARK: - Post Visual Helpers
    private var postTypeIcon: String {
        switch postType.lowercased() {
        case "goods": return "cube.box"
        case "services": return "wrench.and.screwdriver"
        case "housing": return "house"
        case "events": return "calendar"
        default: return "doc.text"
        }
    }
    
    private var postTypeColor: Color {
        switch postType.lowercased() {
        case "goods": return .blue
        case "services": return .green
        case "housing": return .orange
        case "events": return .purple
        default: return .gray
        }
    }
}

// MARK: - Comment Style Message View
struct CommentStyleMessageView: View {
    let message: Message
    let isCurrentUser: Bool
    let otherUserName: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // User avatar (small, like comment avatar)
            Circle()
                .fill(isCurrentUser ? Color.campusPrimary : Color.campusGrey400)
                .frame(width: 32, height: 32)
                .overlay(
                    Text(isCurrentUser ? "You" : String(otherUserName.prefix(1)))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                // Username and timestamp (like comment header)
                HStack(spacing: 8) {
                    Text(isCurrentUser ? "You" : otherUserName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text(message.timestamp.formatted(.relative(presentation: .named)))
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                
                // Message content (like comment text)
                Text(message.content)
                    .font(.body)
                    .foregroundColor(.primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
    }
}


struct ChatView_Previews: PreviewProvider {
    static var previews: some View {
        ChatView(postId: 1, postTitle: "Test Post", postType: "housing", otherUserId: 2, otherUserName: "John Doe")
            .environmentObject(AuthenticationManager())
    }
}
