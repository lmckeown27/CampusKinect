//
//  ChatView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import PhotosUI

struct ChatView: View {
    let postId: Int
    let postTitle: String
    let postType: String
    let otherUserId: Int
    let otherUserName: String
    let postImages: [String]?
    
    @EnvironmentObject var authManager: AuthenticationManager
    @StateObject private var viewModel: ChatViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFieldFocused: Bool
    @State private var showingOptionsMenu = false
    @State private var showingDeleteAlert = false
    @State private var showingReportSheet = false
    @State private var showingBanAlert = false
    
    // Post image viewer
    @State private var showingPostImageViewer = false
    @State private var selectedImageIndex = 0
    
    // Image sharing states
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingImageActionSheet = false
    @State private var photosPickerItems: [PhotosPickerItem] = []
    @State private var isUploadingImage = false

    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    init(postId: Int, postTitle: String, postType: String, otherUserId: Int, otherUserName: String, postImages: [String]? = nil) {
        self.postId = postId
        self.postTitle = postTitle
        self.postType = postType
        self.otherUserId = otherUserId
        self.otherUserName = otherUserName
        self.postImages = postImages
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
        .navigationTitle(postTitle)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button(action: {
                        showingDeleteAlert = true
                    }) {
                        Label("Delete Conversation", systemImage: "trash")
                    }
                    
                    Button(action: {
                        showingReportSheet = true
                    }) {
                        Label("Report User", systemImage: "flag")
                    }
                    
                    Button(role: .destructive, action: {
                        showingBanAlert = true
                    }) {
                        Label("Block User", systemImage: "person.slash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundColor(.primary)
                }
            }
        }
        .onAppear {
            // Set current user ID from auth manager
            viewModel.setCurrentUserId(authManager.currentUser?.id ?? 0)
            Task {
                await viewModel.loadChat(with: otherUserId)
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
        .alert("Delete Conversation", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                deleteConversation()
            }
        } message: {
            Text("Are you sure you want to delete this conversation? This action cannot be undone.")
        }
        .alert("Block User", isPresented: $showingBanAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Block", role: .destructive) {
                blockUser()
            }
        } message: {
            Text("Are you sure you want to block \(otherUserName)? You won't receive messages from them anymore.")
        }
        .sheet(isPresented: $showingReportSheet) {
            reportSheetContent
        }
        .confirmationDialog("Add Photo", isPresented: $showingImageActionSheet) {
            Button("Take Photo") {
                showingCamera = true
            }
            
            Button("Choose from Library") {
                showingImagePicker = true
            }
            
            Button("Cancel", role: .cancel) { }
        }
        .photosPicker(
            isPresented: $showingImagePicker,
            selection: $photosPickerItems,
            maxSelectionCount: 1,
            matching: .images
        )
        .fullScreenCover(isPresented: $showingCamera) {
            CameraView(
                onImageCaptured: { image in
                    handleImageSelected(image)
                },
                flashMode: .off,
                cameraDevice: .rear,
                allowsEditing: true
            )
        }
        .fullScreenCover(isPresented: $showingPostImageViewer) {
            if let images = postImages, !images.isEmpty {
                PostImageViewer(
                    images: images,
                    selectedIndex: selectedImageIndex
                )
            }
        }
        .onChange(of: photosPickerItems) { oldValue, newValue in
            Task {
                if let item = newValue.first {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        handleImageSelected(image)
                    }
                }
                photosPickerItems = []
            }
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
                        .foregroundColor(.black)
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
                        
                        Text("• \(otherUserName)")
                            .font(.caption)
                            .foregroundColor(.black)
                    }
                }
                
                Spacer()
                
                // View Images button (if post has images)
                if let images = postImages, !images.isEmpty {
                    Button(action: {
                        selectedImageIndex = 0
                        showingPostImageViewer = true
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "photo")
                                .font(.caption)
                            Text("View Images")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.campusPrimary)
                        .cornerRadius(8)
                    }
                }
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
                
                // Show placeholder when no conversation exists yet
                if viewModel.messages.isEmpty && !viewModel.isLoading && viewModel.conversation == nil {
                    VStack(spacing: 12) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary.opacity(0.6))
                        
                        Text("Start the conversation")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text("Send the first message to start chatting about this post")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 60)
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                }
                
                ForEach(viewModel.messages) { message in
                    // Use comment-style view for ALL messages (text and images)
                    CommentStyleMessageView(
                        message: message,
                        isCurrentUser: message.senderId == authManager.currentUser?.id,
                        otherUserName: otherUserName,
                        currentUserName: authManager.currentUser?.displayName ?? "You"
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
            .onTapGesture {
                // Dismiss keyboard when tapping outside
                isTextFieldFocused = false
            }
        }
    }
    
    private var messageInputSection: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                // Comment input field with media buttons
                HStack(spacing: 8) {
                    // Camera button (iOS only)
                    Button(action: {
                        showingImageActionSheet = true
                    }) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color.campusPrimary)
                    }
                    .disabled(isUploadingImage)
                    
                    // Image picker button
                    Button(action: {
                        showingImagePicker = true
                    }) {
                        Image(systemName: "photo.fill")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(Color.campusPrimary)
                    }
                    .disabled(isUploadingImage)
                    
                    ZStack(alignment: .leading) {
                        // Custom placeholder
                        if viewModel.newMessageText.isEmpty {
                            Text(viewModel.conversation == nil ? "Send the first message..." : "Send a message...")
                                .foregroundColor(.black.opacity(0.5))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                        }
                        
                        TextField("", text: $viewModel.newMessageText, axis: .vertical)
                            .textFieldStyle(PlainTextFieldStyle())
                            .foregroundColor(.black)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .focused($isTextFieldFocused)
                            .lineLimit(1...3)
                    }
                    .background(Color.campusBackgroundSecondary)
                    .cornerRadius(16)
                    
                    // Send button (like comment post button)
                    Button(action: {
                        sendMessage()
                    }) {
                        if isUploadingImage {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "paperplane.fill")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? .gray : Color.campusPrimary)
                        }
                    }
                    .disabled((viewModel.newMessageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isLoading) && !isUploadingImage)
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
    
    private func deleteConversation() {
        guard let conversation = viewModel.conversation else { return }
        
        Task {
            do {
                try await APIService.shared.deleteConversation(conversationId: conversation.id)
                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    viewModel.error = error as? APIError ?? .unknown(500)
                }
            }
        }
    }
    
    // MARK: - Report Sheet Content
    @ViewBuilder
    private var reportSheetContent: some View {
        // Report the most recent message to include full conversation history
        // Only allow reporting if there are messages (content to report)
        if let latestMessage = viewModel.messages.last {
            ReportConversationView(
                messageId: latestMessage.id,
                conversationWith: otherUserName,
                otherUserId: otherUserId
            )
        } else {
            // No messages to report - show explanatory message
            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.bubble")
                    .font(.system(size: 60))
                    .foregroundColor(.secondary)
                
                Text("No Content to Report")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("You can only report conversations that contain messages. If this user is bothering you, please block them instead.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
                
                Button("Block User") {
                    showingReportSheet = false
                    showingBanAlert = true
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                
                Button("Cancel") {
                    showingReportSheet = false
                }
                .buttonStyle(.bordered)
            }
            .padding()
        }
    }
    
    // MARK: - Helper Methods
    private func blockUser() {
        Task {
            do {
                let success = try await APIService.shared.blockUser(userId: otherUserId)
                await MainActor.run {
                    if success {
                        dismiss()
                    } else {
                        viewModel.error = .unknown(500)
                    }
                }
            } catch {
                await MainActor.run {
                    viewModel.error = error as? APIError ?? .unknown(500)
                }
            }
        }
    }
    
    private func handleImageSelected(_ image: UIImage) {
        Task {
            await uploadAndSendImage(image)
        }
    }
    
    private func uploadAndSendImage(_ image: UIImage) async {
        await MainActor.run {
            isUploadingImage = true
        }
        
        do {
            // First ensure we have a conversation
            if viewModel.conversation == nil {
                // Create conversation first with a placeholder message
                guard let postId = UserDefaults.standard.object(forKey: "pendingChatPostId") as? Int else {
                    await MainActor.run {
                        viewModel.error = .unknown(400)
                        isUploadingImage = false
                    }
                    return
                }
                
                let request = StartConversationRequest(
                    otherUserId: otherUserId,
                    postId: postId,
                    initialMessage: "Image" // Placeholder for image message
                )
                
                let response = try await APIService.shared.startConversation(request)
                await MainActor.run {
                    viewModel.conversation = response.data.conversation.toConversation()
                    UserDefaults.standard.removeObject(forKey: "pendingChatPostId")
                    UserDefaults.standard.removeObject(forKey: "pendingChatPostTitle")
                    UserDefaults.standard.removeObject(forKey: "pendingChatUserId")
                }
            }
            
            guard let conversation = viewModel.conversation else {
                await MainActor.run {
                    viewModel.error = .unknown(400)
                    isUploadingImage = false
                }
                return
            }
            
            // Upload image to conversation
            let imageMessage = try await APIService.shared.uploadImageToConversation(
                conversationId: conversation.id,
                image: image
            )
            
            await MainActor.run {
                // Add image message to the conversation
                viewModel.messages.append(imageMessage)
                isUploadingImage = false
                
                // Notify MessagesViewModel about the new message
                NotificationCenter.default.post(
                    name: .messageSent,
                    object: nil,
                    userInfo: [
                        "conversationId": conversation.id,
                        "message": "Image",
                        "senderId": viewModel.currentUserId ?? 0
                    ]
                )
            }
            
        } catch {
            await MainActor.run {
                viewModel.error = error as? APIError ?? .unknown(500)
                isUploadingImage = false
            }
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
        // Use campus branding colors (olive green/grey) for all post types
        return Color.campusPrimary
    }
}

// MARK: - Comment Style Message View
struct CommentStyleMessageView: View {
    let message: Message
    let isCurrentUser: Bool
    let otherUserName: String
    let currentUserName: String
    
    @EnvironmentObject var authManager: AuthenticationManager
    
    // Computed property to get the display name for the message sender
    private var senderDisplayName: String {
        if isCurrentUser {
            return currentUserName
        } else {
            // Use sender information from the message if available, otherwise fall back to otherUserName
            if let displayName = message.senderDisplayName {
                return displayName
            } else {
                let fullName = "\(message.senderFirstName ?? "") \(message.senderLastName ?? "")".trimmingCharacters(in: .whitespaces)
                return fullName.isEmpty ? otherUserName : fullName
            }
        }
    }
    
    // Computed property to get the profile picture URL
    private var profilePictureUrl: String? {
        if isCurrentUser {
            return authManager.currentUser?.profilePicture
        } else {
            return message.senderProfilePicture
        }
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // User avatar with profile picture support
            ProfileImageView(imageUrl: profilePictureUrl, size: .small)
            
            VStack(alignment: .leading, spacing: 4) {
                // Username and timestamp (like comment header)
                HStack(spacing: 8) {
                    Text(senderDisplayName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text(message.createdAt.formatted(.relative(presentation: .named)))
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                
                // Message content (like comment text)
                if !message.content.isEmpty {
                    Text(message.content)
                        .font(.body)
                        .foregroundColor(.primary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                // Image support (if message has image)
                if message.messageType == .image {
                    // Construct image URL from mediaUrl
                    let imageUrl: URL? = {
                        if let metadata = message.metadata,
                           let metadataUrl = metadata.fullImageURL {
                            return metadataUrl
                        } else if let mediaUrl = message.mediaUrl {
                            if mediaUrl.starts(with: "http://") || mediaUrl.starts(with: "https://") {
                                return URL(string: mediaUrl)
                            }
                            let cleanPath = mediaUrl.hasPrefix("/") ? mediaUrl : "/\(mediaUrl)"
                            return URL(string: "\(APIConstants.baseURL)\(cleanPath)")
                        }
                        return nil
                    }()
                    
                    if let imageUrl = imageUrl {
                        AsyncImage(url: imageUrl) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(maxWidth: 250, maxHeight: 250)
                                .clipped()
                                .cornerRadius(12)
                        } placeholder: {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.gray.opacity(0.3))
                                .frame(width: 250, height: 150)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(0.8)
                                )
                        }
                    }
                }
            }
            
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
    }
}


// MARK: - Post Image Viewer
struct PostImageViewer: View {
    let images: [String]
    @State var selectedIndex: Int
    @Environment(\.dismiss) private var dismiss
    @State private var dragOffset: CGSize = .zero
    @State private var isDragging: Bool = false
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
                .onTapGesture {
                    dismiss()
                }
            
            TabView(selection: $selectedIndex) {
                ForEach(Array(images.enumerated()), id: \.offset) { index, imageURL in
                    AsyncImage(url: URL(string: "\(APIConstants.baseURL)\(imageURL)")) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .offset(y: dragOffset.height)
                            .scaleEffect(isDragging ? max(0.7, 1 - abs(dragOffset.height) / 1000.0) : 1)
                            .animation(.interactiveSpring(), value: dragOffset)
                    } placeholder: {
                        ProgressView()
                            .tint(.white)
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle())
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
            .opacity(isDragging ? max(0.5, 1 - abs(dragOffset.height) / 500.0) : 1)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        if abs(value.translation.height) > abs(value.translation.width) {
                            isDragging = true
                            dragOffset = value.translation
                        }
                    }
                    .onEnded { value in
                        if abs(value.translation.height) > 200 {
                            dismiss()
                        } else {
                            withAnimation(.spring()) {
                                isDragging = false
                                dragOffset = .zero
                            }
                        }
                    }
            )
            
            VStack {
                HStack {
                    Spacer()
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .padding()
                }
                Spacer()
            }
        }
    }
}

struct ChatView_Previews: PreviewProvider {
    static var previews: some View {
        ChatView(postId: 1, postTitle: "Test Post", postType: "housing", otherUserId: 2, otherUserName: "John Doe")
            .environmentObject(AuthenticationManager())
    }
}
