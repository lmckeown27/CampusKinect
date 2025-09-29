//
//  PostCardView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct PostCardView: View {
    let post: Post
    @State private var showingImageViewer = false
    @State private var selectedImageIndex = 0
    @State private var showingMessageConfirmation = false
    @State private var showingReportView = false
    @State private var showingBlockUserConfirmation = false
    @State private var showingThreeDotsMenu = false
    @State private var isBookmarked = false
    @State private var isReposted = false
    @EnvironmentObject var authManager: AuthenticationManager
    
    private let apiService = APIService.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with 3-dot menu
            PostHeaderWithMenu(
                post: post,
                onThreeDotsMenu: {
                    showingThreeDotsMenu = true
                }
            )
            
            // Content
            PostContent(post: post)
            
            // Tags
            if !post.tags.isEmpty {
                PostTags(tags: post.tags)
            }
            
            // Images
            if post.hasImages {
                PostImages(
                    images: post.images,
                    onImageTap: { index in
                        selectedImageIndex = index
                        showingImageViewer = true
                    }
                )
            }
            
            // Location
            if let location = post.location {
                PostLocation(location: location)
            }
            
            // Bottom Action Bar
            PostActionBar(
                post: post,
                isBookmarked: isBookmarked,
                isReposted: isReposted,
                onMessage: handleMessage,
                onRepost: handleRepost,
                onBookmark: handleBookmark,
                onShare: handleShare
            )
        }
        .padding()
        .background(Color.campusBackground)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        .contextMenu {
            // Message
            Button(action: handleMessage) {
                Label("Message", systemImage: "paperplane")
            }
            
            // Repost
            Button(action: handleRepost) {
                Label(isReposted ? "Remove Repost" : "Repost", 
                      systemImage: "arrow.2.squarepath")
            }
            
            // Bookmark
            Button(action: handleBookmark) {
                Label(isBookmarked ? "Remove Bookmark" : "Bookmark", 
                      systemImage: isBookmarked ? "bookmark.fill" : "bookmark")
            }
            
            // Share
            Button(action: handleShare) {
                Label("Share", systemImage: "square.and.arrow.up")
            }
            
            Divider()
            
            // Report Post
            Button(action: { showingReportView = true }) {
                Label("Report Post", systemImage: "flag")
            }
            
            // Block User (only show if not own post)
            if post.poster.id != authManager.currentUser?.id {
                Button(action: { showingBlockUserConfirmation = true }) {
                    Label("Block User", systemImage: "person.crop.circle.badge.xmark")
                }
            }
        }
        .fullScreenCover(isPresented: $showingImageViewer) {
            ImageViewer(
                images: post.images,
                selectedIndex: selectedImageIndex
            )
        }
        .sheet(isPresented: $showingReportView) {
            ReportContentView(
                contentId: post.id,
                contentType: .post,
                contentAuthor: post.poster.displayName
            )
        }
        .actionSheet(isPresented: $showingThreeDotsMenu) {
            ActionSheet(
                title: Text("Post Options"),
                buttons: [
                    .default(Text("Report Post")) {
                        showingReportView = true
                    },
                    post.poster.id != authManager.currentUser?.id ? 
                        .destructive(Text("Block User")) {
                            showingBlockUserConfirmation = true
                        } : nil,
                    .cancel()
                ].compactMap { $0 }
            )
        }
        .alert("Block User", isPresented: $showingBlockUserConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Block", role: .destructive) {
                handleBlockUser()
            }
        } message: {
            Text("Are you sure you want to block \(post.poster.displayName)? You won't see their posts anymore.")
        }
        .alert("Message Error", isPresented: $showingMessageConfirmation) {
            Button("OK") { }
        } message: {
            Text("Unable to start conversation. Please try again.")
        }
        .onAppear {
            loadPostInteractionState()
        }
    }
    
    // MARK: - Action Handlers
    
    private func handleMessage() {
        guard let currentUser = authManager.currentUser else {
            print("❌ No current user - cannot message about post")
            return
        }
        
        // Don't allow messaging yourself about your own post
        guard currentUser.id != post.poster.id else {
            print("❌ Cannot message yourself about your own post")
            return
        }
        
        print("📱 PostCardView: handleMessage called for POST: '\(post.title)' (ID: \(post.id)) by user: \(post.poster.displayName)")
        
        Task {
            do {
                // Create POST-CENTRIC conversation with post context
                let request = StartConversationRequest(
                    otherUserId: post.poster.id,
                    postId: post.id, // POST-CENTRIC: Always include post context
                    initialMessage: nil
                )
                
                let response = try await apiService.startConversation(request)
                
                print("✅ Post conversation created successfully: \(response.data.conversation.id)")
                print("📋 Post context: '\(response.data.conversation.post.title)'")
                
                // Store the POST-CENTRIC conversation info for navigation
                UserDefaults.standard.set(post.poster.id, forKey: "pendingChatUserId")
                UserDefaults.standard.set(post.poster.displayName, forKey: "pendingChatUserName")
                UserDefaults.standard.set(post.id, forKey: "pendingChatPostId")
                UserDefaults.standard.set(post.title, forKey: "pendingChatPostTitle")
                
                // Navigate to chat with the post author
                await MainActor.run {
                    NotificationCenter.default.post(
                        name: .navigateToChat,
                        object: nil,
                        userInfo: [
                            "userId": post.poster.id,
                            "userName": post.poster.displayName
                        ]
                    )
                }
                
            } catch {
                print("❌ Failed to create conversation: \(error)")
                // Show error alert
                await MainActor.run {
                    showingMessageConfirmation = true
                }
            }
        }
    }
    
    private func handleRepost() {
        Task {
            do {
                _ = try await apiService.toggleRepost(post.id)
                // Toggle the local state since API doesn't return the new state
                await MainActor.run {
                    isReposted.toggle()
                }
            } catch {
                print("Error handling repost: \(error)")
            }
        }
    }
    
    private func handleBookmark() {
        Task {
            do {
                _ = try await apiService.toggleBookmark(post.id)
                // Toggle the local state since API doesn't return the new state
                await MainActor.run {
                    isBookmarked.toggle()
                }
            } catch {
                print("Error handling bookmark: \(error)")
            }
        }
    }
    
    private func handleShare() {
        // Create comprehensive share content
        var shareText = post.title
        if !post.content.isEmpty {
            shareText += "\n\n\(post.content)"
        }
        if let location = post.location {
            shareText += "\n📍 \(location)"
        }
        shareText += "\n\nShared from CampusKinect"
        
        // Create activity items
        var activityItems: [Any] = [shareText]
        
        // Add post images if available
        if post.hasImages && !post.images.isEmpty {
            // For now, just add the first image URL as text
            // In a full implementation, you'd download and add actual images
            let imageURL = "\(APIConstants.baseURL)\(post.images[0])"
            activityItems.append(imageURL)
        }
        
        let activityViewController = UIActivityViewController(
            activityItems: activityItems,
            applicationActivities: nil
        )
        
        // Configure for iPad
        if let popover = activityViewController.popoverPresentationController {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                popover.sourceView = window
            }
            popover.sourceRect = CGRect(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2, width: 0, height: 0)
            popover.permittedArrowDirections = []
        }
        
        // Present share sheet
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityViewController, animated: true)
        }
    }
    
    private func handleBlockUser() {
        Task {
            do {
                _ = try await apiService.blockUser(userId: post.poster.id)
                // Optionally refresh the feed or show confirmation
            } catch {
                print("Error blocking user: \(error)")
            }
        }
    }
    
    private func loadPostInteractionState() {
        // Load bookmark and repost state from API
        Task {
            do {
                let userInteractions = try await apiService.getUserInteractions(post.id)
                await MainActor.run {
                    isBookmarked = userInteractions.data.hasBookmarked
                    isReposted = userInteractions.data.hasReposted
                }
            } catch {
                print("Error loading post interaction state: \(error)")
            }
        }
    }
}

// MARK: - Post Header with Menu
struct PostHeaderWithMenu: View {
    let post: Post
    let onThreeDotsMenu: () -> Void
    
    var body: some View {
        HStack {
            // Profile Picture (visual only - no tap functionality)
            AsyncImage(url: post.user.profileImageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.campusPrimary)
                    .overlay(
                        Text(post.user.initials)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(post.user.displayName)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                HStack(spacing: 4) {
                    Text("@\(post.user.username)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("• \(post.timeAgo)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Category Badge
            CategoryBadge(category: post.categoryDisplayName)
            
            // 3-Dot Menu Button
            Button(action: onThreeDotsMenu) {
                Image(systemName: "ellipsis")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .frame(width: 32, height: 32)
                    .background(Color.clear)
                    .contentShape(Rectangle())
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
}

// MARK: - Post Content
struct PostContent: View {
    let post: Post
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Post Title
            if !post.title.isEmpty {
                Text(post.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            // Post Description
            Text(post.content)
                .font(.body)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

// MARK: - Post Images
struct PostImages: View {
    let images: [String]
    let onImageTap: (Int) -> Void
    
    var body: some View {
        if images.count == 1 {
            SingleImageView(imageURL: images[0]) {
                onImageTap(0)
            }
        } else {
            MultipleImagesView(images: images, onImageTap: onImageTap)
        }
    }
}

// MARK: - Single Image View
struct SingleImageView: View {
    let imageURL: String
    let onTap: () -> Void
    
    var body: some View {
        AsyncImage(url: URL(string: "\(APIConstants.baseURL)\(imageURL)")) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fit)
        } placeholder: {
            Rectangle()
                .fill(Color(.systemGray5))
                .aspectRatio(16/9, contentMode: .fit)
                .overlay(
                    ProgressView()
                )
        }
        .frame(maxHeight: 300)
        .cornerRadius(8)
        .onTapGesture {
            onTap()
        }
    }
}

// MARK: - Multiple Images View
struct MultipleImagesView: View {
    let images: [String]
    let onImageTap: (Int) -> Void
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(images.enumerated()), id: \.offset) { index, imageURL in
                    AsyncImage(url: URL(string: "\(APIConstants.baseURL)\(imageURL)")) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color(.systemGray5))
                            .overlay(
                                ProgressView()
                            )
                    }
                    .frame(width: 200, height: 150)
                    .cornerRadius(8)
                    .clipped()
                    .onTapGesture {
                        onImageTap(index)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Post Location
struct PostLocation: View {
    let location: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "location")
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(location)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Post Action Bar
struct PostActionBar: View {
    let post: Post
    let isBookmarked: Bool
    let isReposted: Bool
    let onMessage: () -> Void
    let onRepost: () -> Void
    let onBookmark: () -> Void
    let onShare: () -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            // Message Button
            PostActionButton(
                systemImage: "paperplane",
                isActive: false,
                activeColor: .blue,
                action: onMessage
            )
            
            Spacer()
            
            // Repost Button
            PostActionButton(
                systemImage: "arrow.2.squarepath",
                isActive: isReposted,
                activeColor: .green,
                action: onRepost
            )
            
            Spacer()
            
            // Bookmark Button
            PostActionButton(
                systemImage: isBookmarked ? "bookmark.fill" : "bookmark",
                isActive: isBookmarked,
                activeColor: .orange,
                action: onBookmark
            )
            
            Spacer()
            
            // Share Button
            PostActionButton(
                systemImage: "square.and.arrow.up",
                isActive: false,
                activeColor: .blue,
                action: onShare
            )
        }
        .padding(.top, 8)
    }
}

// MARK: - Post Action Button
struct PostActionButton: View {
    let systemImage: String
    let isActive: Bool
    let activeColor: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(isActive ? activeColor : .secondary)
                .frame(width: 44, height: 44)
                .background(
                    Circle()
                        .fill(isPressed ? Color.gray.opacity(0.2) : Color.clear)
                )
                .scaleEffect(isPressed ? 0.9 : 1.0)
                .animation(.easeInOut(duration: 0.1), value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = pressing
            }
        }, perform: {})
        .contentShape(Circle())
    }
}

// MARK: - Category Badge
struct CategoryBadge: View {
    let category: String
    
    var body: some View {
        Text(category)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.campusPrimary.opacity(0.1))
            .foregroundColor(Color.campusPrimary)
            .cornerRadius(12)
    }
}

// MARK: - Image Viewer
struct ImageViewer: View {
    let images: [String]
    @State var selectedIndex: Int
    @Environment(\.dismiss) private var dismiss
    @State private var dragOffset: CGSize = .zero
    @State private var isDragging: Bool = false
    
    var body: some View {
        ZStack {
            backgroundView
            imageTabView
            doneButtonOverlay
        }
    }
    
    // MARK: - View Components
    private var backgroundView: some View {
        Color.black
            .ignoresSafeArea()
            .onTapGesture {
                dismiss()
            }
    }
    
    private var imageTabView: some View {
        TabView(selection: $selectedIndex) {
            ForEach(Array(images.enumerated()), id: \.offset) { index, imageURL in
                imageView(for: imageURL, at: index)
            }
        }
        .tabViewStyle(PageTabViewStyle())
        .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
        .opacity(tabViewOpacity)
        .gesture(dragGesture)
    }
    
    private func imageView(for imageURL: String, at index: Int) -> some View {
        AsyncImage(url: URL(string: "\(APIConstants.baseURL)\(imageURL)")) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fit)
                .offset(y: dragOffset.height)
                .scaleEffect(imageScale)
                .animation(.interactiveSpring(), value: dragOffset)
        } placeholder: {
            ProgressView()
                .tint(.white)
        }
        .tag(index)
    }
    
    private var doneButtonOverlay: some View {
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
    
    // MARK: - Computed Properties
    private var tabViewOpacity: Double {
        isDragging ? max(0.5, 1 - abs(dragOffset.height) / 500.0) : 1
    }
    
    private var imageScale: Double {
        isDragging ? max(0.7, 1 - abs(dragOffset.height) / 1000.0) : 1
    }
    
    private var dragGesture: some Gesture {
        DragGesture()
            .onChanged { value in
                handleDragChanged(value)
            }
            .onEnded { value in
                handleDragEnded(value)
            }
    }
    
    // MARK: - Gesture Handlers
    private func handleDragChanged(_ value: DragGesture.Value) {
        // Only respond to vertical drags to avoid interfering with horizontal page swiping
        if abs(value.translation.height) > abs(value.translation.width) {
            isDragging = true
            dragOffset = value.translation
        }
    }
    
    private func handleDragEnded(_ value: DragGesture.Value) {
        isDragging = false
        // Dismiss if dragged far enough vertically
        if abs(value.translation.height) > 150 {
            dismiss()
        } else {
            // Snap back to original position
            withAnimation(.spring()) {
                dragOffset = .zero
            }
        }
    }
}

// MARK: - Post Tags
struct PostTags: View {
    let tags: [String]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(tags, id: \.self) { tag in
                    TagChip(text: tag)
                }
            }
            .padding(.horizontal, 2)
        }
    }
}

// MARK: - Tag Chip
struct TagChip: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(Color("BrandPrimary"))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Color("BrandPrimary").opacity(0.1)
            )
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color("BrandPrimary").opacity(0.3), lineWidth: 1)
            )
    }
}

// MARK: - Preview
#Preview {
    PostCardView(post: Post(
        id: 1,
        userId: 1,
        title: "Study Partner Needed",
        description: "Looking for a study partner for CS 101! Anyone interested in forming a study group?",
                    postType: "services",
        durationType: "one-time",
        location: "Library",
        repostFrequency: nil,
        isRecurring: false,
        originalPostId: nil,
        expiresAt: nil,
        eventStart: nil,
        eventEnd: nil,
        isFulfilled: false,
        viewCount: 42,
        createdAt: Date(),
        updatedAt: Date(),
        poster: PostUser(
            id: 1,
            username: "johndoe",
            firstName: "John",
            lastName: "Doe",
            displayName: "John Doe",
            profilePicture: nil
        ),
        university: PostUniversity(
            id: 1,
            name: "California Polytechnic State University, San Luis Obispo",
            city: "San Luis Obispo",
            state: "CA"
        ),
        images: [],
        imageCount: "0",
        tags: ["study", "cs101"]
    ))
    .environmentObject(AuthenticationManager())
    .padding()
}

