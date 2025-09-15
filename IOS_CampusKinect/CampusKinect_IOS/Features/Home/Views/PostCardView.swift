//
//  PostCardView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct PostCardView: View {
    let post: Post
    @State private var isBookmarked = false
    @State private var isReposted = false
    @State private var showingImageViewer = false
    @State private var selectedImageIndex = 0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            PostHeader(post: post)
            
            // Content
            PostContent(post: post)
            
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
                isBookmarked: $isBookmarked,
                isReposted: $isReposted
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
}

// MARK: - Post Header
struct PostHeader: View {
    let post: Post
    
    var body: some View {
        HStack {
            // Profile Picture
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
            
            VStack(alignment: .leading, spacing: 2) {
                Text(post.user.displayName)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                HStack(spacing: 4) {
                    if let year = post.user.year {
                        Text(year)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    if let major = post.user.major {
                        Text("• \(major)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Text("• \(post.timeAgo)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
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
        Text(post.content)
            .font(.body)
            .multilineTextAlignment(.leading)
            .fixedSize(horizontal: false, vertical: true)
    }
}

// MARK: - Post Images
struct PostImages: View {
    let images: [PostImage]
    let onImageTap: (Int) -> Void
    
    var body: some View {
        if images.count == 1 {
            SingleImageView(image: images[0]) {
                onImageTap(0)
            }
        } else {
            MultipleImagesView(images: images, onImageTap: onImageTap)
        }
    }
}

// MARK: - Single Image View
struct SingleImageView: View {
    let image: PostImage
    let onTap: () -> Void
    
    var body: some View {
        AsyncImage(url: image.thumbnailImageURL) { image in
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
    let images: [PostImage]
    let onImageTap: (Int) -> Void
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(images.enumerated()), id: \.element.id) { index, image in
                    AsyncImage(url: image.thumbnailImageURL) { image in
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
    @Binding var isBookmarked: Bool
    @Binding var isReposted: Bool
    
    var body: some View {
        HStack(spacing: 20) {
            // Message Count
            ActionButton(
                systemImage: "message",
                count: post.messageCount,
                isActive: false,
                action: {
                    // Navigate to post detail/comments
                }
            )
            
            // Repost
            ActionButton(
                systemImage: "arrow.2.squarepath",
                count: post.repostCount,
                isActive: isReposted,
                activeColor: .green,
                action: {
                    isReposted.toggle()
                }
            )
            
            // Bookmark
            ActionButton(
                systemImage: isBookmarked ? "bookmark.fill" : "bookmark",
                count: post.bookmarkCount,
                isActive: isBookmarked,
                activeColor: Color("AccentColor"),
                action: {
                    isBookmarked.toggle()
                }
            )
            
            Spacer()
            
            // Engagement Score (optional)
            if post.engagementScore > 0 {
                HStack(spacing: 2) {
                    Image(systemName: "flame")
                        .font(.caption)
                        .foregroundColor(.orange)
                    
                    Text("\(Int(post.engagementScore))")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
        }
    }
}

// MARK: - Action Button
struct ActionButton: View {
    let systemImage: String
    let count: Int
    let isActive: Bool
    let activeColor: Color
    let action: () -> Void
    
    init(
        systemImage: String,
        count: Int,
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
                
                if count > 0 {
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
    let images: [PostImage]
    @State var selectedIndex: Int
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            TabView(selection: $selectedIndex) {
                ForEach(Array(images.enumerated()), id: \.element.id) { index, image in
                    AsyncImage(url: image.fullImageURL) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } placeholder: {
                        ProgressView()
                            .tint(.white)
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle())
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
            
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

#Preview {
    PostCardView(post: Post(
        id: 1,
        content: "Looking for a study partner for CS 101! Anyone interested in forming a study group?",
        category: "academic",
        subcategory: "study_groups",
        location: "Library",
        userId: 1,
        universityId: 1,
        isActive: true,
        createdAt: Date(),
        updatedAt: Date(),
        user: PostUser(
            id: 1,
            displayName: "John Doe",
            profilePicture: nil,
            year: "Junior",
            major: "Computer Science"
        ),
        messageCount: 5,
        shareCount: 2,
        bookmarkCount: 8,
        repostCount: 1,
        engagementScore: 15.5,
        images: [],
        tags: ["study", "cs101"]
    ))
    .padding()
}

