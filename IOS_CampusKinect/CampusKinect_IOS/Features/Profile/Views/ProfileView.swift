//
//  ProfileView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
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
                    ProfileContent(selectedTab: selectedTab)
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
        }
    }
}

// MARK: - Profile Header
struct ProfileHeader: View {
    let user: User?
    
    var body: some View {
        VStack(spacing: 16) {
            // Profile Picture
            AsyncImage(url: user?.profileImageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color("PrimaryColor"))
                    .overlay(
                        Text(user?.initials ?? "??")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 100, height: 100)
            .clipShape(Circle())
            
            // User Info
            VStack(spacing: 8) {
                Text(user?.displayName ?? "Unknown User")
                    .font(.title2)
                    .fontWeight(.bold)
                
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
                // Navigate to edit profile
            }) {
                Text("Edit Profile")
                    .foregroundColor(.primary)
                    .padding()
                    .frame(width: 120)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
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
                        .foregroundColor(selectedTab == tab ? Color("PrimaryColor") : .secondary)
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
    
    var body: some View {
        VStack(spacing: 16) {
            switch selectedTab {
            case .posts:
                PostsTabContent()
            case .reposts:
                RepostsTabContent()
            case .bookmarks:
                BookmarksTabContent()
            }
        }
    }
}

// MARK: - Tab Content Views
struct PostsTabContent: View {
    var body: some View {
        EmptyStateView(
            title: "No Posts Yet",
            message: "Share something with your campus community!",
            systemImage: "doc.text",
            actionTitle: "Create Post"
        ) {
                            // Navigate to create post
        }
    }
}

struct RepostsTabContent: View {
    var body: some View {
        EmptyStateView(
            title: "No Reposts",
            message: "Posts you repost will appear here",
            systemImage: "arrow.2.squarepath"
        )
    }
}

struct BookmarksTabContent: View {
    var body: some View {
        EmptyStateView(
            title: "No Bookmarks",
            message: "Posts you bookmark will appear here",
            systemImage: "bookmark"
        )
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
}

