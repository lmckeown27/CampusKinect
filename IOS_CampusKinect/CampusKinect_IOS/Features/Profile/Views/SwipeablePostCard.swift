//
//  SwipeablePostCard.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/15/25.
//

import SwiftUI

struct SwipeablePostCard: View {
    let post: Post
    let swipeAction: SwipeAction
    let onSwipeAction: (Int) async -> Bool
    
    @State private var offset: CGFloat = 0
    @State private var isShowingConfirmation = false
    @State private var isPerformingAction = false
    
    enum SwipeAction {
        case delete
        case removeRepost
        case removeBookmark
        
        var title: String {
            switch self {
            case .delete:
                return "Delete"
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
                return "Are you sure you want to remove this repost?"
            case .removeBookmark:
                return "Are you sure you want to remove this bookmark?"
            }
        }
    }
    
    var body: some View {
        mainContent
            .clipped()
            .alert(swipeAction.title, isPresented: $isShowingConfirmation) {
                alertButtons
            } message: {
                Text(swipeAction.confirmationMessage)
            }
            .overlay(loadingOverlay)
            .overlay(progressIndicator)
    }
    
    private var mainContent: some View {
        ZStack {
            actionButton
            swipeablePostCard
        }
    }
    
    private var actionButton: some View {
        HStack {
            Spacer()
            
            Button(action: {
                isShowingConfirmation = true
            }) {
                actionButtonContent
            }
            .disabled(isPerformingAction)
        }
    }
    
    private var actionButtonContent: some View {
        VStack {
            Image(systemName: swipeAction.icon)
                .font(.title2)
                .foregroundColor(.white)
            
            Text(swipeAction.title)
                .font(.caption)
                .foregroundColor(.white)
        }
        .frame(width: 80)
        .frame(maxHeight: .infinity)
        .background(swipeAction.color)
    }
    
    private var swipeablePostCard: some View {
        PostCardView(post: post)
            .offset(x: offset)
            .gesture(swipeGesture)
            .onTapGesture {
                handleTapGesture()
            }
    }
    
    private var swipeGesture: some Gesture {
        DragGesture()
            .onChanged { value in
                handleSwipeChanged(value)
            }
            .onEnded { value in
                handleSwipeEnded(value)
            }
    }
    
    private var alertButtons: some View {
        Group {
            Button("Cancel", role: .cancel) { }
            Button(swipeAction.title, role: .destructive) {
                performAction()
            }
        }
    }
    
    private var loadingOverlay: some View {
        Group {
            if isPerformingAction {
                Color.black.opacity(0.3)
            } else {
                Color.clear
            }
        }
    }
    
    private var progressIndicator: some View {
        Group {
            if isPerformingAction {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.2)
            }
        }
    }
    
    private func handleSwipeChanged(_ value: DragGesture.Value) {
        // Only allow left swipe (negative translation)
        if value.translation.x < 0 {
            offset = max(value.translation.x, -80)
        }
    }
    
    private func handleSwipeEnded(_ value: DragGesture.Value) {
        withAnimation(.spring()) {
            if value.translation.x < -40 {
                // Snap to show action button
                offset = -80
            } else {
                // Snap back to original position
                offset = 0
            }
        }
    }
    
    private func handleTapGesture() {
        // Tap to close if swiped open
        if offset != 0 {
            withAnimation(.spring()) {
                offset = 0
            }
        }
    }
    
    private func performAction() {
        isPerformingAction = true
        
        Task {
            let success = await onSwipeAction(post.id)
            
            await MainActor.run {
                isPerformingAction = false
                if success {
                    // Animate the card away
                    withAnimation(.easeInOut(duration: 0.3)) {
                        offset = -UIScreen.main.bounds.width
                    }
                } else {
                    // Reset position on failure
                    withAnimation(.spring()) {
                        offset = 0
                    }
                }
            }
        }
    }
}

#Preview {
    SwipeablePostCard(
        post: Post(
            id: 1,
            userId: 1,
            title: "Sample Post",
            description: "This is a sample post for preview",
            postType: "goods",
            durationType: "recurring",
            location: "Sample Location",
            repostFrequency: nil,
            isRecurring: true,
            originalPostId: nil,
            expiresAt: nil,
            eventStart: nil,
            eventEnd: nil,
            isFulfilled: false,
            viewCount: 0,
            createdAt: Date(),
            updatedAt: Date(),
            poster: PostUser(
                id: 1,
                username: "sampleuser",
                firstName: "Sample",
                lastName: "User",
                displayName: "Sample User",
                profilePicture: nil
            ),
            university: PostUniversity(
                id: 1,
                name: "Sample University",
                city: "Sample City",
                state: "CA"
            ),
            images: [],
            imageCount: "0",
            tags: ["sample"]
        ),
        swipeAction: .delete,
        onSwipeAction: { _ in return true }
    )
} 