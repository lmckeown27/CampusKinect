//
//  PostCardView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import Combine

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
    
    // Owner actions
    @State private var showingOwnerDeleteConfirmation = false
    
    // Admin actions
    @State private var showingAdminDeleteConfirmation = false
    @State private var showingAdminBanConfirmation = false
    
    // Loading states for better UX
    @State private var isRepostLoading = false
    @State private var isBookmarkLoading = false
    
    // Success/Error feedback states
    @State private var showingSuccessMessage = false
    @State private var successMessage = ""
    @State private var showingErrorAlert = false
    @State private var errorMessage = ""
    
    @EnvironmentObject var authManager: AuthenticationManager
    
    private let apiService = APIService.shared
    private let adminAPIService = AdminAPIService()
    @State private var cancellables = Set<AnyCancellable>()
    
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
                isRepostLoading: isRepostLoading,
                isBookmarkLoading: isBookmarkLoading,
                onMessage: handleMessage,
                onRepost: handleRepost,
                onBookmark: handleBookmark
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
            
            Divider()
            
            // Report Post and Block User (only show if not own post)
            if post.poster.id != authManager.currentUser?.id {
                Button(action: { showingReportView = true }) {
                    Label("Report Post", systemImage: "flag")
                }
                
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
            var buttons: [ActionSheet.Button] = []
            
            // Admin actions (only show for admin users)
            if isAdmin {
                buttons.append(.destructive(Text("🗑️ Admin: Delete Post")) {
                    showingAdminDeleteConfirmation = true
                })
                buttons.append(.destructive(Text("🚫 Admin: Ban User")) {
                    showingAdminBanConfirmation = true
                })
            }
            
            // Owner actions (only show if user owns the post)
            if post.poster.id == authManager.currentUser?.id {
                buttons.append(.destructive(Text("Delete Post")) {
                    showingOwnerDeleteConfirmation = true
                })
            }
            
            // Regular user actions (only show if not own post)
            if post.poster.id != authManager.currentUser?.id {
                buttons.append(.default(Text("Report Post")) {
                    showingReportView = true
                })
                
                buttons.append(.destructive(Text("Block User")) {
                    showingBlockUserConfirmation = true
                })
            }
            
            buttons.append(.cancel())
            
            return ActionSheet(
                title: Text("Post Options"),
                buttons: buttons
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
        .alert("Delete Post", isPresented: $showingOwnerDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                handleOwnerDeletePost()
            }
        } message: {
            Text("Are you sure you want to delete this post? This action cannot be undone.")
        }
        .alert("Admin: Delete Post", isPresented: $showingAdminDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                handleAdminDeletePost()
            }
        } message: {
            Text("Are you sure you want to delete this post? This action cannot be undone.")
        }
        .alert("Admin: Ban User", isPresented: $showingAdminBanConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Ban", role: .destructive) {
                handleAdminBanUser()
            }
        } message: {
            Text("Are you sure you want to ban \(post.poster.displayName)? They will be unable to access the platform.")
        }
        .alert("Message Error", isPresented: $showingMessageConfirmation) {
            Button("OK") { }
        } message: {
            Text("Unable to start conversation. Please try again.")
        }
        .alert("Error", isPresented: $showingErrorAlert) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .overlay(
            // Success message overlay
            VStack {
                if showingSuccessMessage {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text(successMessage)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.primary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(.systemBackground))
                            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                    )
                    .transition(.asymmetric(
                        insertion: .move(edge: .top).combined(with: .opacity),
                        removal: .move(edge: .top).combined(with: .opacity)
                    ))
                }
                Spacer()
            }
            .padding(.top, 8)
            .animation(.spring(response: 0.5, dampingFraction: 0.8), value: showingSuccessMessage)
        )
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
        
        // Store the POST-CENTRIC conversation info for navigation (no conversation created yet)
        UserDefaults.standard.set(post.poster.id, forKey: "pendingChatUserId")
        UserDefaults.standard.set(post.poster.displayName, forKey: "pendingChatUserName")
        UserDefaults.standard.set(post.id, forKey: "pendingChatPostId")
        UserDefaults.standard.set(post.title, forKey: "pendingChatPostTitle")
        UserDefaults.standard.set(post.postType, forKey: "pendingChatPostType")
        UserDefaults.standard.set(post.images, forKey: "pendingChatPostImages")
        
        // Store images persistently by postId for future access
        UserDefaults.standard.set(post.images, forKey: "postImages_\(post.id)")
        
        // Navigate to chat with the post author (conversation will be created when first message is sent)
        NotificationCenter.default.post(
            name: .navigateToChat,
            object: nil,
            userInfo: [
                "userId": post.poster.id,
                "userName": post.poster.displayName,
                "postId": post.id,
                "postTitle": post.title,
                "postImages": post.images,
                "postType": post.postType
            ]
        )
    }
    
    private func handleRepost() {
        // Prevent multiple simultaneous requests
        guard !isRepostLoading else { return }
        
        Task {
            await MainActor.run {
                isRepostLoading = true
                // Haptic feedback for button press
                let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                impactFeedback.impactOccurred()
            }
            
            do {
                _ = try await apiService.toggleRepost(post.id)
                
                await MainActor.run {
                    // Toggle the local state since API doesn't return the new state
                    isReposted.toggle()
                    isRepostLoading = false
                    
                    // Success feedback
                    let successFeedback = UINotificationFeedbackGenerator()
                    successFeedback.notificationOccurred(.success)
                    
                    // Show success message
                    successMessage = isReposted ? "Post reposted!" : "Repost removed"
                    showingSuccessMessage = true
                    
                    // Auto-hide success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showingSuccessMessage = false
                    }
                }
            } catch {
                await MainActor.run {
                    isRepostLoading = false
                    
                    // Error feedback
                    let errorFeedback = UINotificationFeedbackGenerator()
                    errorFeedback.notificationOccurred(.error)
                    
                    // Show error alert
                    errorMessage = "Failed to update repost. Please try again."
                    showingErrorAlert = true
                }
                print("Error handling repost: \(error)")
            }
        }
    }
    
    private func handleBookmark() {
        // Prevent multiple simultaneous requests
        guard !isBookmarkLoading else { return }
        
        Task {
            await MainActor.run {
                isBookmarkLoading = true
                // Haptic feedback for button press
                let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                impactFeedback.impactOccurred()
            }
            
            do {
                _ = try await apiService.toggleBookmark(post.id)
                
                await MainActor.run {
                    // Toggle the local state since API doesn't return the new state
                    isBookmarked.toggle()
                    isBookmarkLoading = false
                    
                    // Success feedback
                    let successFeedback = UINotificationFeedbackGenerator()
                    successFeedback.notificationOccurred(.success)
                    
                    // Show success message
                    successMessage = isBookmarked ? "Post bookmarked!" : "Bookmark removed"
                    showingSuccessMessage = true
                    
                    // Auto-hide success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showingSuccessMessage = false
                    }
                }
            } catch {
                await MainActor.run {
                    isBookmarkLoading = false
                    
                    // Error feedback
                    let errorFeedback = UINotificationFeedbackGenerator()
                    errorFeedback.notificationOccurred(.error)
                    
                    // Show error alert
                    errorMessage = "Failed to update bookmark. Please try again."
                    showingErrorAlert = true
                }
                print("Error handling bookmark: \(error)")
            }
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
    
    private func handleAdminDeletePost() {
        adminAPIService.deletePost(postId: String(post.id))
            .sink(
                receiveCompletion: { [self] completion in
                    switch completion {
                    case .finished:
                        break
                    case .failure(let error):
                        errorMessage = "Failed to delete post. Please try again."
                        showingErrorAlert = true
                        print("Error deleting post: \(error)")
                    }
                },
                receiveValue: { [self] _ in
                    successMessage = "Post deleted successfully"
                    showingSuccessMessage = true
                    
                    // Auto-hide success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showingSuccessMessage = false
                    }
                    
                    // Notify to refresh feed
                    NotificationCenter.default.post(name: .postDeleted, object: post.id)
                }
            )
            .store(in: &cancellables)
    }
    
    private func handleAdminBanUser() {
        adminAPIService.banUserAdmin(userId: post.poster.id, reason: "Banned by admin from post")
            .sink(
                receiveCompletion: { [self] completion in
                    switch completion {
                    case .finished:
                        break
                    case .failure(let error):
                        errorMessage = "Failed to ban user. Please try again."
                        showingErrorAlert = true
                        print("Error banning user: \(error)")
                    }
                },
                receiveValue: { [self] _ in
                    successMessage = "User banned successfully"
                    showingSuccessMessage = true
                    
                    // Auto-hide success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showingSuccessMessage = false
                    }
                    
                    // Notify to refresh feed
                    NotificationCenter.default.post(name: .userBanned, object: post.poster.id)
                }
            )
            .store(in: &cancellables)
    }
    
    private func handleOwnerDeletePost() {
        Task {
            do {
                try await apiService.deletePost(post.id)
                await MainActor.run {
                    successMessage = "Post deleted successfully"
                    showingSuccessMessage = true
                    
                    // Auto-hide success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showingSuccessMessage = false
                    }
                    
                    // Notify to refresh feed
                    NotificationCenter.default.post(name: .postDeleted, object: post.id)
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to delete post. Please try again."
                    showingErrorAlert = true
                    print("Error deleting post: \(error)")
                }
            }
        }
    }
    
    private var isAdmin: Bool {
        // Check if current user is admin
        guard let email = authManager.currentUser?.email,
              let username = authManager.currentUser?.username else {
            return false
        }
        // Admin check (adjust this to match your admin criteria)
        return email == "lmckeown@calpoly.edu" || username == "liam_mckeown38"
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
            
            HStack(spacing: 8) {
                // Offer/Request Badge (to the left)
                OfferRequestBadge(durationType: post.durationType)
                
                // Category Badge (to the right)
                CategoryBadge(category: post.categoryDisplayName)
            }
            
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
    let isRepostLoading: Bool
    let isBookmarkLoading: Bool
    let onMessage: () -> Void
    let onRepost: () -> Void
    let onBookmark: () -> Void
    
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
                isLoading: isRepostLoading,
                activeColor: .green,
                action: onRepost
            )
            
            Spacer()
            
            // Bookmark Button
            PostActionButton(
                systemImage: isBookmarked ? "bookmark.fill" : "bookmark",
                isActive: isBookmarked,
                isLoading: isBookmarkLoading,
                activeColor: .orange,
                action: onBookmark
            )
        }
        .padding(.top, 8)
    }
}

// MARK: - Post Action Button
struct PostActionButton: View {
    let systemImage: String
    let isActive: Bool
    let isLoading: Bool
    let activeColor: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    init(
        systemImage: String,
        isActive: Bool,
        isLoading: Bool = false,
        activeColor: Color = .blue,
        action: @escaping () -> Void
    ) {
        self.systemImage = systemImage
        self.isActive = isActive
        self.isLoading = isLoading
        self.activeColor = activeColor
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                        .foregroundColor(isActive ? activeColor : .secondary)
                } else {
                    Image(systemName: systemImage)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(isActive ? activeColor : .secondary)
                }
            }
            .frame(width: 44, height: 44)
            .background(
                Circle()
                    .fill(isPressed ? Color.gray.opacity(0.2) : Color.clear)
            )
            .scaleEffect(isPressed ? 0.9 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isPressed)
            .opacity(isLoading ? 0.6 : 1.0)
        }
        .disabled(isLoading)
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            if !isLoading {
                withAnimation(.easeInOut(duration: 0.1)) {
                    isPressed = pressing
                }
            }
        }, perform: {})
        .contentShape(Circle())
    }
}

// MARK: - Category Badge
struct CategoryBadge: View {
    let category: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(category)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(Color.campusPrimary)
            
            Image(systemName: categoryIcon)
                .font(.system(size: 16))
                .foregroundColor(Color.campusPrimary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.campusPrimary.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var categoryIcon: String {
        switch category.lowercased() {
        case "goods":
            return "cube.box.fill"
        case "services":
            return "wrench.and.screwdriver.fill"
        case "housing":
            return "house.fill"
        case "events":
            return "calendar"
        default:
            return "doc.text.fill"
        }
    }
}

// MARK: - Offer/Request Badge
struct OfferRequestBadge: View {
    let durationType: String
    
    var body: some View {
        Text(displayText)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(badgeColor)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(badgeColor.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var displayText: String {
        // Capitalize first letter
        return durationType.prefix(1).uppercased() + durationType.dropFirst().lowercased()
    }
    
    private var badgeColor: Color {
        switch durationType.lowercased() {
        case "offer":
            return Color.blue
        case "request":
            return Color.orange
        default:
            return Color.gray
        }
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
            .foregroundColor(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.campusPrimary)
            .cornerRadius(16)
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
        durationType: "offer",
        location: "Library",
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

