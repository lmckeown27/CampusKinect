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
    
    enum ProfileTab: String, CaseIterable {
        case posts = "Posts"
        case reposts = "Reposts"
        case bookmarks = "Bookmarks"
    }
    
    var body: some View {
        NavigationView {
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
        }
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
                    // Navigate to create post
                }
            } else {
                List {
                    ForEach(viewModel.userPosts) { post in
                        PostCardView(post: post)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button(role: .destructive) {
                                    Task {
                                        await viewModel.deletePost(post.id)
                                    }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                    
                    // Load more posts if available
                    if viewModel.hasMorePosts {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                        .listRowSeparator(.hidden)
                        .task {
                            if let userId = currentUser?.id {
                                await viewModel.loadMoreUserPosts(userId: userId)
                            }
                        }
                    }
                }
                .listStyle(PlainListStyle())
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
                List {
                    ForEach(viewModel.userReposts) { post in
                        PostCardView(post: post)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button(role: .destructive) {
                                    Task {
                                        await viewModel.removeRepost(post.id)
                                    }
                                } label: {
                                    Label("Remove", systemImage: "arrow.2.squarepath")
                                }
                                .tint(.orange)
                            }
                    }
                }
                .listStyle(PlainListStyle())
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
                        SwipeablePostCard(
                            post: post,
                            swipeAction: .removeBookmark,
                            onSwipeAction: { postId in
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

