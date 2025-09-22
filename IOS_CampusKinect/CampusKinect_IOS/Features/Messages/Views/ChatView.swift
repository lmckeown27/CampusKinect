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
    @State private var messageText = ""
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    init(userId: Int, userName: String) {
        self.userId = userId
        self.userName = userName
        self._viewModel = StateObject(wrappedValue: ChatViewModel())
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    messagesList
                    messageInputSection
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.85, 900) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
        }
        .navigationTitle(userName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    // Handle user profile or options
                }) {
                    Image(systemName: "person.circle")
                }
            }
        }
        .onAppear {
            Task {
                await viewModel.loadChat(with: userId)
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
    
    private var messagesList: some View {
        ScrollViewReader { proxy in
            List {
                ForEach(viewModel.messages) { message in
                    MessageBubbleView(
                        message: message,
                        isCurrentUser: message.senderId == authManager.currentUser?.id
                    )
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(
                        top: 4,
                        leading: isIPad ? 40 : 16,
                        bottom: 4,
                        trailing: isIPad ? 40 : 16
                    ))
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
            Divider()
            
            HStack(spacing: 12) {
                TextField("Type a message...", text: $messageText, axis: .vertical)
                    .textFieldStyle(PlainTextFieldStyle())
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color(.systemGray6))
                    .cornerRadius(20)
                    .focused($isTextFieldFocused)
                    .lineLimit(1...4)
                
                Button(action: {
                    sendMessage()
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? .gray : Color("BrandPrimary"))
                }
                .disabled(messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isLoading)
            }
            .padding(.horizontal, isIPad ? 40 : 16)
            .padding(.vertical, 12)
        }
        .background(Color(.systemBackground))
    }
    
    // MARK: - Methods
    
    private func sendMessage() {
        let trimmedMessage = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedMessage.isEmpty else { return }
        
        Task {
            await viewModel.sendMessage(
                content: trimmedMessage,
                to: userId,
                from: authManager.currentUser?.id ?? ""
            )
            
            // Clear the text field on successful send
            if viewModel.error == nil {
                messageText = ""
            }
        }
    }
}


struct ChatView_Previews: PreviewProvider {
    static var previews: some View {
        ChatView(userId: 1, userName: "John Doe")
            .environmentObject(AuthenticationManager())
    }
}
