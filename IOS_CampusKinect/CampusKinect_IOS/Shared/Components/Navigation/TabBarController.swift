//
//  TabBarController.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            HomeView()
                .tabItem {
                    Image(systemName: selectedTab == 0 ? "house.fill" : "house")
                    Text("Home")
                }
                .tag(0)
            
            // Create Post Tab
            CreatePostView()
                .tabItem {
                    Image(systemName: selectedTab == 1 ? "plus.circle.fill" : "plus.circle")
                    Text("Create")
                }
                .tag(1)
            
            // Messages Tab
            MessagesView()
                .tabItem {
                    Image(systemName: selectedTab == 2 ? "message.fill" : "message")
                    Text("Messages")
                }
                .tag(2)
            
            // Profile Tab
            ProfileView()
                .tabItem {
                    Image(systemName: selectedTab == 3 ? "person.fill" : "person")
                    Text("Profile")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}

// MARK: - Placeholder Views (to be implemented)
struct HomeView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Home Feed")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your campus posts will appear here")
                    .foregroundColor(.secondary)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("CampusKinect")
        }
    }
}

struct CreatePostView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Create Post")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Share something with your campus")
                    .foregroundColor(.secondary)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("Create Post")
        }
    }
}

struct MessagesView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Messages")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your conversations will appear here")
                    .foregroundColor(.secondary)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("Messages")
        }
    }
}

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Profile Header
                VStack(spacing: 12) {
                    // Profile Picture Placeholder
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 80, height: 80)
                        .overlay(
                            Text(authManager.currentUser?.initials ?? "??")
                                .font(.title)
                                .fontWeight(.semibold)
                                .foregroundColor(.blue)
                        )
                    
                    Text(authManager.currentUser?.fullName ?? "User")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text(authManager.currentUser?.email ?? "")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                
                // Profile Actions
                VStack(spacing: 16) {
                    Button("Edit Profile") {
                        // Navigate to edit profile
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    
                    Button("Settings") {
                        // Navigate to settings
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(8)
                    
                    Button("Sign Out") {
                        Task {
                            await authManager.logout()
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(8)
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .navigationTitle("Profile")
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthenticationManager())
}

