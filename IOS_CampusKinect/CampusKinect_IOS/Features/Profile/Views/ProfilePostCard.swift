//
//  ProfilePostCard.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/23/25.
//

import SwiftUI

enum ProfileAction: Equatable {
    case delete
    case removeRepost
    case removeBookmark
    
    var title: String {
        switch self {
        case .delete:
            return "Delete Post"
        case .removeRepost:
            return "Remove Repost"
        case .removeBookmark:
            return "Remove Bookmark"
        }
    }
    
    var icon: String {
        switch self {
        case .delete:
            return "trash"
        case .removeRepost:
            return "arrow.2.squarepath"
        case .removeBookmark:
            return "bookmark.slash"
        }
    }
    
    var color: Color {
        switch self {
        case .delete:
            return .red
        case .removeRepost:
            return .orange
        case .removeBookmark:
            return .blue
        }
    }
    
    var confirmationMessage: String {
        switch self {
        case .delete:
            return "Are you sure you want to delete this post? This action cannot be undone."
        case .removeRepost:
            return "Are you sure you want to remove this repost from your profile?"
        case .removeBookmark:
            return "Are you sure you want to remove this bookmark?"
        }
    }
    
    var actionButtonText: String {
        switch self {
        case .delete:
            return "Delete"
        case .removeRepost:
            return "Remove"
        case .removeBookmark:
            return "Remove"
        }
    }
}

struct ProfilePostCard: View {
    let post: Post
    let action: ProfileAction
    let onAction: (Int) async -> Bool
    let onUndo: ((Int) async -> Bool)?
    
    @State private var showingActionConfirmation = false
    @State private var isPerformingAction = false
    @State private var showingImageViewer = false
    @State private var selectedImageIndex = 0
    @State private var showingEditPost = false
    @EnvironmentObject var authManager: AuthenticationManager
    
    private let apiService = APIService.shared
    
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with action button
            HStack {
                // Profile info
                HStack(spacing: 12) {
                    ProfileImageView(imageUrl: post.user.profilePicture, size: .small)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(post.user.displayName)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(post.timeAgo)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Action buttons
                HStack(spacing: 8) {
                    // Edit button (only for delete action, which means it's user's own post)
                    if action == .delete {
                        Button(action: {
                            showingEditPost = true
                        }) {
                            Image(systemName: "pencil")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.campusPrimary)
                                .padding(8)
                                .background(Color.campusPrimary.opacity(0.1))
                                .clipShape(Circle())
                        }
                        .disabled(isPerformingAction)
                    }
                    
                    // Delete/Remove button
                    Button(action: {
                        showingActionConfirmation = true
                    }) {
                        Image(systemName: action.icon)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(action.color)
                            .padding(8)
                            .background(action.color.opacity(0.1))
                            .clipShape(Circle())
                    }
                    .disabled(isPerformingAction)
                }
            }
            
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
            
            // Actions (message only for profile posts)
            ProfilePostActions(
                post: post,
                onMessage: { /* Handle message */ },
                onReport: { /* Handle report */ }
            )
        }
        .padding(16)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        .opacity(isPerformingAction ? 0.6 : 1.0)
        .alert(action.title, isPresented: $showingActionConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button(action.actionButtonText, role: .destructive) {
                Task {
                    isPerformingAction = true
                    let success = await onAction(post.id)
                    if !success {
                        isPerformingAction = false
                    }
                }
            }
        } message: {
            Text(action.confirmationMessage)
        }
        .fullScreenCover(isPresented: $showingImageViewer) {
            ImageViewer(
                images: post.images,
                selectedIndex: selectedImageIndex,
                
            )
        }
        .sheet(isPresented: $showingEditPost) {
            NavigationView {
                EditPostView(post: post)
            }
        }
    }
    
    // MARK: - Action Handlers
    
    private func handleLike() async {
        // Implement like functionality
    }
    
    private func handleRepost() async {
        // Implement repost functionality
    }
    
    private func handleBookmark() async {
        // Implement bookmark functionality
    }
}

// MARK: - Supporting Views (reusing from PostCardView)

// MARK: - Profile Post Actions
struct ProfilePostActions: View {
    let post: Post
    let onMessage: () -> Void
    let onReport: () -> Void
    
    var body: some View {
        HStack(spacing: 20) {
            // Report Button (bottom left)
            ProfileActionButton(
                systemImage: "flag",
                isActive: false,
                activeColor: .red,
                action: onReport
            )
            
            Spacer()
            
            // Direct Message
            ProfileActionButton(
                systemImage: "paperplane",
                isActive: false,
                activeColor: .blue,
                action: onMessage
            )
        }
    }
}

// MARK: - Profile Action Button
struct ProfileActionButton: View {
    let systemImage: String
    let isActive: Bool
    let activeColor: Color
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(isActive ? activeColor : .secondary)
                .frame(width: 32, height: 32)
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

