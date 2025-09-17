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
    @EnvironmentObject var authManager: AuthenticationManager
    
    private let apiService = APIService.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            PostHeader(post: post, onProfileTap: handleProfileTap)
            
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
            
            // Actions
            PostActions(
                post: post,
                onMessage: handleMessage
            )
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        .fullScreenCover(isPresented: $showingImageViewer) {
            ImageViewer(
                images: post.images,
                selectedIndex: selectedImageIndex
            )
        }
    }
    
    // MARK: - Action Handlers
    
    private func handleMessage() {
        guard let currentUser = authManager.currentUser else {
            // Show login prompt
            return
        }
        
        // Don't allow messaging yourself
        guard currentUser.id != post.userId else {
            return
        }
        
        // Navigate to chat with the post author
        // This would typically be handled by a navigation coordinator
        // For now, we'll use a notification to trigger navigation
        NotificationCenter.default.post(
            name: .navigateToChat,
            object: nil,
            userInfo: [
                "userId": post.userId as Any,
                "userName": post.poster.displayName
            ]
        )
    }
    
    private func handleProfileTap() {
        // Navigate to user profile
        NotificationCenter.default.post(
            name: .navigateToProfile,
            object: nil,
            userInfo: ["userId": post.userId as Any]
        )
    }
}

// MARK: - Post Header
struct PostHeader: View {
    let post: Post
    let onProfileTap: () -> Void
    
    var body: some View {
        HStack {
            // Profile Picture
            Button(action: onProfileTap) {
                AsyncImage(url: post.user.profileImageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(Color("BrandPrimary"))
                        .overlay(
                            Text(post.user.initials)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        )
                }
                .frame(width: 40, height: 40)
                .clipShape(Circle())
            }
            
            Button(action: onProfileTap) {
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
            }
            .buttonStyle(PlainButtonStyle())
            
            Spacer()
            
            // Category Badge
            CategoryBadge(category: post.categoryDisplayName)
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

// MARK: - Post Actions
struct PostActions: View {
    let post: Post
    let onMessage: () -> Void
    
    var body: some View {
        HStack(spacing: 20) {
            // Direct Message
            ActionButton(
                systemImage: "paperplane",
                count: nil,
                isActive: false,
                action: onMessage
            )
        }
    }
}

// MARK: - Action Button
struct ActionButton: View {
    let systemImage: String
    let count: Int?
    let isActive: Bool
    let activeColor: Color
    let action: () -> Void
    
    init(
        systemImage: String,
        count: Int? = nil,
        isActive: Bool,
        activeColor: Color = .blue,
        action: @escaping () -> Void
    ) {
        self.systemImage = systemImage
        self.count = count
        self.isActive = isActive
        self.activeColor = activeColor
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: systemImage)
                    .font(.caption)
                
                if let count = count, count > 0 {
                    Text("\(count)")
                        .font(.caption)
                }
            }
            .foregroundColor(isActive ? activeColor : .secondary)
        }
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
            .background(Color("BrandPrimary").opacity(0.1))
            .foregroundColor(Color("BrandPrimary"))
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

// MARK: - Notification Extensions
extension Notification.Name {
    static let navigateToChat = Notification.Name("navigateToChat")
    static let navigateToProfile = Notification.Name("navigateToProfile")
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

