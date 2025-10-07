//
//  ProfileView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showingSettings = false
    @State private var selectedTab: ProfileTab = .posts
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    enum ProfileTab: String, CaseIterable {
        case posts = "Posts"
        case reposts = "Reposts"
        case bookmarks = "Bookmarks"
    }
    
    var body: some View {
        // Show guest profile if in guest mode
        if authManager.isGuest {
            return AnyView(GuestProfileView())
        }
        
        return AnyView(NavigationStack {
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    Spacer(minLength: 0)
                    
                    ScrollView {
                        VStack(spacing: 20) {
                            // Profile Header
                            ProfileHeader(user: authManager.currentUser)
                            
                            // Tab Selection
                            ProfileTabSelector(selectedTab: $selectedTab)
                            
                            // Content based on selected tab
                            ProfileContent(selectedTab: selectedTab, viewModel: viewModel, currentUser: authManager.currentUser)
                        }
                        .padding()
                    }
                    .navigationTitle("Profile")
                    .navigationBarTitleDisplayMode(.large)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button(action: {
                                showingSettings = true
                            }) {
                                Image(systemName: "gearshape")
                            }
                        }
                    }
                    .sheet(isPresented: $showingSettings) {
                        SettingsView()
                    }
                    .task {
                        // Load user data when view appears
                        if let userId = authManager.currentUser?.id {
                            await viewModel.loadUserPosts(userId: userId)
                            await viewModel.loadUserReposts(userId: userId)
                            await viewModel.loadUserBookmarks(userId: userId)
                        }
                    }
                    .overlay(
                        // Toast notification overlay
                        ToastView(
                            message: viewModel.toastMessage ?? "",
                            isShowing: $viewModel.showingToast,
                            onDismiss: {
                                viewModel.dismissToast()
                            }
                        )
                        .animation(.spring(), value: viewModel.showingToast),
                        alignment: .bottom
                    )
                    .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
                    .frame(maxHeight: .infinity)
                    .clipped()
                    
                    Spacer(minLength: 0)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.campusBackground)
        })
    }
}

// MARK: - Profile Header
struct ProfileHeader: View {
    let user: User?
    @State private var showingEditProfile = false
    @State private var profileImageId = UUID() // For cache busting
    
    var profileImageURL: URL? {
        guard let profilePicture = user?.profilePicture else { return nil }
        
        // Add cache-busting parameter to force reload
        let baseURL = "https://campuskinect.net\(profilePicture)"
        let urlWithCacheBuster = "\(baseURL)?v=\(profileImageId.uuidString)"
        return URL(string: urlWithCacheBuster)
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // Profile Picture
            Button(action: {
                showingEditProfile = true
            }) {
                AsyncImage(url: profileImageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(Color("BrandPrimary"))
                        .overlay(
                            Text(user?.initials ?? "??")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        )
                }
                .frame(width: 100, height: 100)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color("BrandPrimary"), lineWidth: 3)
                )
            }
            .buttonStyle(PlainButtonStyle())
            
            // User Info
            VStack(spacing: 8) {
                Text(user?.displayName ?? "Unknown User")
                    .font(.title2)
                    .fontWeight(.bold)
                
                // Username
                if let username = user?.username, !username.isEmpty {
                    Text("@\(username)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let user = user {
                    HStack(spacing: 16) {
                        if let year = user.year {
                            Text(year)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        if let major = user.major {
                            Text(major)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if let hometown = user.hometown {
                        Text("📍 \(hometown)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if let bio = user.bio {
                        Text(bio)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .padding(.top, 8)
                    }
                }
            }
            
            // Edit Profile Button
            Button(action: {
                showingEditProfile = true
            }) {
                Text("Edit Profile")
                    .foregroundColor(.primary)
                    .padding()
                    .frame(width: 120)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
        }
                    .sheet(isPresented: $showingEditProfile) {
                EditProfileView()
            }
            .onChange(of: user?.profilePicture) { oldValue, newValue in
                // Force image reload when profile picture URL changes
                profileImageId = UUID()
            }
    }
}

// MARK: - Profile Tab Selector
struct ProfileTabSelector: View {
    @Binding var selectedTab: ProfileView.ProfileTab
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(ProfileView.ProfileTab.allCases, id: \.self) { tab in
                Button(action: {
                    selectedTab = tab
                }) {
                    Text(tab.rawValue)
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(selectedTab == tab ? Color("BrandPrimary") : .secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
            }
        }
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Profile Content
struct ProfileContent: View {
    let selectedTab: ProfileView.ProfileTab
    @ObservedObject var viewModel: ProfileViewModel
    let currentUser: User?
    
    var body: some View {
        VStack(spacing: 16) {
            switch selectedTab {
            case .posts:
                PostsTabContent(viewModel: viewModel, currentUser: currentUser)
            case .reposts:
                RepostsTabContent(viewModel: viewModel, currentUser: currentUser)
            case .bookmarks:
                BookmarksTabContent(viewModel: viewModel, currentUser: currentUser)
            }
        }
    }
}

// MARK: - Tab Content Views
struct PostsTabContent: View {
    @ObservedObject var viewModel: ProfileViewModel
    let currentUser: User?
    @State private var showingCreatePost = false
    
    var body: some View {
        VStack {
            if viewModel.isLoading && viewModel.userPosts.isEmpty {
                ProgressView("Loading posts...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.userPosts.isEmpty {
                EmptyStateView(
                    title: "No Posts Yet",
                    message: "Share something with your campus community!",
                    systemImage: "doc.text",
                    actionTitle: "Create Post"
                ) {
                    showingCreatePost = true
                }
                .sheet(isPresented: $showingCreatePost) {
                    NavigationView {
                        CreatePostView()
                    }
                }
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.userPosts) { post in
                        ProfilePostCard(
                            post: post,
                            action: .delete,
                            onAction: { postId in
                                await viewModel.deletePost(postId)
                            },
                            onUndo: { postId in
                                await viewModel.undoDeletePost(postId)
                            }
                        )
                    }
                    
                    // Load more posts if available
                    if viewModel.hasMorePosts && !viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .onAppear {
                                if let userId = currentUser?.id {
                                    Task {
                                        await viewModel.loadMoreUserPosts(userId: userId)
                                    }
                                }
                            }
                    }
                }
            }
        }
        .refreshable {
            if let userId = currentUser?.id {
                await viewModel.refreshUserPosts(userId: userId)
            }
        }
    }
}

struct RepostsTabContent: View {
    @ObservedObject var viewModel: ProfileViewModel
    let currentUser: User?
    
    var body: some View {
        VStack {
            if viewModel.isLoading && viewModel.userReposts.isEmpty {
                ProgressView("Loading reposts...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.userReposts.isEmpty {
                EmptyStateView(
                    title: "No Reposts",
                    message: "Posts you repost will appear here",
                    systemImage: "arrow.2.squarepath"
                )
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.userReposts) { post in
                        ProfilePostCard(
                            post: post,
                            action: .removeRepost,
                            onAction: { postId in
                                await viewModel.removeRepost(postId)
                            },
                            onUndo: { postId in
                                await viewModel.undoRemoveRepost(postId)
                            }
                        )
                    }
                }
            }
        }
        .refreshable {
            if let userId = currentUser?.id {
                await viewModel.loadUserReposts(userId: userId)
            }
        }
    }
}

struct BookmarksTabContent: View {
    @ObservedObject var viewModel: ProfileViewModel
    let currentUser: User?
    
    var body: some View {
        VStack {
            if viewModel.isLoading && viewModel.userBookmarks.isEmpty {
                ProgressView("Loading bookmarks...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.userBookmarks.isEmpty {
                EmptyStateView(
                    title: "No Bookmarks",
                    message: "Posts you bookmark will appear here",
                    systemImage: "bookmark"
                )
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(viewModel.userBookmarks) { post in
                        ProfilePostCard(
                            post: post,
                            action: .removeBookmark,
                            onAction: { postId in
                                await viewModel.removeBookmark(postId)
                            },
                            onUndo: { postId in
                                await viewModel.undoRemoveBookmark(postId)
                            }
                        )
                    }
                }
            }
        }
        .refreshable {
            if let userId = currentUser?.id {
                await viewModel.loadUserBookmarks(userId: userId)
            }
        }
    }
}

// MARK: - Toast View
struct ToastView: View {
    let message: String
    @Binding var isShowing: Bool
    let onDismiss: () -> Void
    
    var body: some View {
        if isShowing && !message.isEmpty {
            HStack {
                Image(systemName: message.contains("Failed") || message.contains("Error") ? "exclamationmark.circle.fill" : "checkmark.circle.fill")
                    .foregroundColor(message.contains("Failed") || message.contains("Error") ? .red : .green)
                
                Text(message)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
            .padding(.horizontal)
            .padding(.bottom, 100) // Account for tab bar
            .transition(.move(edge: .bottom).combined(with: .opacity))
            .onTapGesture {
                onDismiss()
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
}

