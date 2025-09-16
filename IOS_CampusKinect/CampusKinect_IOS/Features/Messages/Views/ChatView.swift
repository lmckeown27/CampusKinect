//
//  ChatView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ChatView: View {
    let userId: Int
    let userName: String
    
    @EnvironmentObject var authManager: AuthenticationManager
    @StateObject private var viewModel: ChatViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFieldFocused: Bool
    
    init(userId: Int, userName: String) {
        self.userId = userId
        self.userName = userName
        self._viewModel = StateObject(wrappedValue: ChatViewModel())
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Messages List
            messagesScrollView
            
            // Message Input
            messageInputView
        }
        .navigationTitle(userName)
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .gesture(
            DragGesture()
                .onEnded { value in
                    // Swipe right to dismiss (like Instagram DM)
                    if value.translation.width > 100 && abs(value.translation.height) < 50 {
                        dismiss()
                    }
                }
        )
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .medium))
                        Text("Messages")
                            .font(.body)
                    }
                    .foregroundColor(Color(hex: "708d81") ?? .blue)
                }
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                if let otherUser = viewModel.otherUser {
                    AsyncImage(url: otherUser.profileImageURL) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .overlay(
                                Text(otherUser.initials)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.gray)
                            )
                    }
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())
                }
            }
        }
        .task {
            if let currentUser = authManager.currentUser {
                viewModel.setCurrentUserId(currentUser.id)
            }
            await viewModel.loadChat(with: userId)
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            Text(viewModel.error?.localizedDescription ?? "An error occurred")
        }
    }
    
    // MARK: - Messages Scroll View
    private var messagesScrollView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 4) {
                    if viewModel.isLoading && viewModel.messages.isEmpty {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .padding()
                    } else if viewModel.messages.isEmpty {
                        emptyStateView
                    } else {
                        ForEach(Array(viewModel.messages.enumerated()), id: \.element.id) { index, message in
                            MessageBubbleView(
                                message: message,
                                isFromCurrentUser: viewModel.isMessageFromCurrentUser(message),
                                showTimestamp: viewModel.shouldShowTimestamp(for: message, at: index),
                                showAvatar: viewModel.shouldShowAvatar(for: message, at: index),
                                otherUser: viewModel.otherUser
                            )
                            .id(message.id)
                        }
                    }
                }
                .padding(.vertical, 8)
            }
            .onChange(of: viewModel.messages.count) { _, _ in
                // Auto-scroll to bottom when new messages arrive
                if let lastMessage = viewModel.messages.last {
                    withAnimation(.easeOut(duration: 0.3)) {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
        .background(Color(.systemBackground))
    }
    
    // MARK: - Empty State View
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "message.circle")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            VStack(spacing: 8) {
                Text("Start a conversation")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text("Send a message to \(userName) to start chatting")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Message Input View
    private var messageInputView: some View {
        VStack(spacing: 0) {
            Divider()
            
            HStack(spacing: 12) {
                // Text Input
                TextField("Type a message...", text: $viewModel.newMessageText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(.systemGray6))
                    )
                    .focused($isTextFieldFocused)
                    .lineLimit(1...4)
                
                // Send Button
                Button(action: {
                    Task {
                        await viewModel.sendMessage()
                    }
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(
                            viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                            ? .gray.opacity(0.5)
                            : Color(hex: "708d81") ?? .blue
                        )
                }
                .disabled(viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color(.systemBackground))
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ChatView(userId: 2, userName: "John Doe")
    }
}

