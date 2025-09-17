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
    let onUndo: ((Int) async -> Bool)?
    
    @State private var offset: CGFloat = 0
    @State private var isShowingConfirmation = false
    @State private var isPerformingAction = false
    @State private var isDeleted = false
    @State private var showingUndoToast = false
    @State private var undoTimer: Timer?
    
    init(post: Post, swipeAction: SwipeAction, onSwipeAction: @escaping (Int) async -> Bool, onUndo: ((Int) async -> Bool)? = nil) {
        self.post = post
        self.swipeAction = swipeAction
        self.onSwipeAction = onSwipeAction
        self.onUndo = onUndo
    }
    
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
        
        var successMessage: String {
            switch self {
            case .delete:
                return "Post deleted"
            case .removeRepost:
                return "Repost removed"
            case .removeBookmark:
                return "Bookmark removed"
            }
        }
        
        var undoMessage: String {
            switch self {
            case .delete:
                return "Post deleted. Tap to undo."
            case .removeRepost:
                return "Repost removed. Tap to undo."
            case .removeBookmark:
                return "Bookmark removed. Tap to undo."
            }
        }
    }
    
    var body: some View {
        ZStack {
            if isDeleted && onUndo != nil {
                undoToastView
            } else {
                mainContent
            }
        }
        .clipped()
        .alert(swipeAction.title, isPresented: $isShowingConfirmation) {
            alertButtons
        } message: {
            Text(swipeAction.confirmationMessage)
        }
    }
    
    private var mainContent: some View {
        ZStack {
            actionButton
            swipeablePostCard
        }
        .overlay(loadingOverlay)
        .overlay(progressIndicator)
    }
    
    private var actionButton: some View {
        HStack {
            Spacer()
            
            Button(action: {
                // Add haptic feedback
                let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                impactFeedback.impactOccurred()
                
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
            .scaleEffect(isPerformingAction ? 0.95 : 1.0)
            .opacity(isPerformingAction ? 0.7 : 1.0)
            .simultaneousGesture(swipeGesture)
            .onTapGesture {
                handleTapGesture()
            }
    }
    
    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 20)
            .onChanged { value in
                handleSwipeChanged(value)
            }
            .onEnded { value in
                handleSwipeEnded(value)
            }
    }
    
    private var alertButtons: some View {
        Group {
            Button("Cancel", role: .cancel) { 
                // Add haptic feedback for cancel
                let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                impactFeedback.impactOccurred()
            }
            Button(swipeAction.title, role: .destructive) {
                performAction()
            }
        }
    }
    
    private var loadingOverlay: some View {
        Group {
            if isPerformingAction {
                Color.black.opacity(0.3)
                    .transition(.opacity)
            } else {
                Color.clear
            }
        }
    }
    
    private var progressIndicator: some View {
        Group {
            if isPerformingAction {
                VStack(spacing: 8) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.2)
                    
                    Text("Deleting...")
                        .font(.caption)
                        .foregroundColor(.white)
                        .fontWeight(.medium)
                }
                .transition(.scale.combined(with: .opacity))
            }
        }
    }
    
    private var undoToastView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(swipeAction.successMessage)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text("Tap to undo")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("UNDO") {
                performUndo()
            }
            .font(.caption)
            .fontWeight(.bold)
            .foregroundColor(.blue)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
        .transition(.move(edge: .trailing).combined(with: .opacity))
        .onTapGesture {
            performUndo()
        }
    }
    
    private func handleSwipeChanged(_ value: DragGesture.Value) {
        // Only respond to primarily horizontal gestures
        let horizontalMovement = abs(value.translation.width)
        let verticalMovement = abs(value.translation.height)
        
        // Only handle if gesture is more horizontal than vertical
        guard horizontalMovement > verticalMovement else { return }
        
        // Only allow left swipe (negative translation)
        if value.translation.width < 0 {
            offset = max(value.translation.width, -80)
            
            // Add subtle haptic feedback when reaching threshold
            if offset <= -40 && offset > -45 {
                let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                impactFeedback.impactOccurred()
            }
        }
    }
    
    private func handleSwipeEnded(_ value: DragGesture.Value) {
        // Only respond to primarily horizontal gestures
        let horizontalMovement = abs(value.translation.width)
        let verticalMovement = abs(value.translation.height)
        
        // Only handle if gesture is more horizontal than vertical
        guard horizontalMovement > verticalMovement else { return }
        
        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
            if value.translation.width < -40 {
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
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                offset = 0
            }
        }
    }
    
    private func performAction() {
        // Add strong haptic feedback for destructive action
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
        
        isPerformingAction = true
        
        Task {
            let success = await onSwipeAction(post.id)
            
            await MainActor.run {
                isPerformingAction = false
                
                if success {
                    if onUndo != nil {
                        // Show undo toast instead of immediately removing
                        withAnimation(.easeInOut(duration: 0.3)) {
                            isDeleted = true
                        }
                        startUndoTimer()
                    } else {
                        // Animate the card away immediately
                        withAnimation(.easeInOut(duration: 0.3)) {
                            offset = -UIScreen.main.bounds.width
                        }
                    }
                    
                    // Success haptic feedback
                    let notificationFeedback = UINotificationFeedbackGenerator()
                    notificationFeedback.notificationOccurred(.success)
                } else {
                    // Reset position on failure
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                        offset = 0
                    }
                    
                    // Error haptic feedback
                    let notificationFeedback = UINotificationFeedbackGenerator()
                    notificationFeedback.notificationOccurred(.error)
                }
            }
        }
    }
    
    private func performUndo() {
        guard let onUndo = onUndo else { return }
        
        // Cancel the undo timer
        undoTimer?.invalidate()
        undoTimer = nil
        
        // Add haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
        
        Task {
            let success = await onUndo(post.id)
            
            await MainActor.run {
                if success {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        isDeleted = false
                    }
                    
                    // Success haptic feedback
                    let notificationFeedback = UINotificationFeedbackGenerator()
                    notificationFeedback.notificationOccurred(.success)
                }
            }
        }
    }
    
    private func startUndoTimer() {
        undoTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: false) { _ in
            // Auto-hide after 5 seconds
            withAnimation(.easeInOut(duration: 0.3)) {
                offset = -UIScreen.main.bounds.width
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
        onSwipeAction: { _ in return true },
        onUndo: { _ in return true }
    )
} 