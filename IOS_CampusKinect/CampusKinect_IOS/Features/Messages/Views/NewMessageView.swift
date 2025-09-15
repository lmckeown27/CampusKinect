//
//  NewMessageView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var users: [User] = []
    @State private var isLoading = false
    @State private var error: APIError?
    @State private var searchTask: Task<Void, Never>?
    
    private let apiService = APIService.shared
    
    var body: some View {
        NavigationView {
            VStack {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    
                    TextField("Search users...", text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                        .onChange(of: searchText) { newValue in
                            // Cancel previous search task
                            searchTask?.cancel()
                            
                            // Start new search with debouncing
                            searchTask = Task {
                                try? await Task.sleep(nanoseconds: 300_000_000) // 300ms delay
                                if !Task.isCancelled {
                                    await searchUsers(query: newValue)
                                }
                            }
                        }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()
                
                // Users List
                if isLoading {
                    VStack {
                        ProgressView()
                            .padding()
                        Text("Loading users...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                } else if let error = error {
                    VStack {
                        Text("Error loading users")
                            .font(.headline)
                            .foregroundColor(.red)
                        Text(error.localizedDescription)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task {
                                await searchUsers(query: searchText)
                            }
                        }
                        .padding(.top)
                    }
                    .padding()
                } else if filteredUsers.isEmpty {
                    EmptyStateView(
                        title: searchText.isEmpty ? "Search for Users" : "No Search Results",
                        message: searchText.isEmpty ? "Type a name to search for users from your campus" : "Try searching for someone else",
                        systemImage: searchText.isEmpty ? "magnifyingglass" : "person.2"
                    )
                } else {
                    List {
                        ForEach(filteredUsers) { user in
                            UserRow(user: user) {
                                // Start conversation
                                print("Starting conversation with \(user.displayName)")
                                dismiss()
                            }
                            .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(PlainListStyle())
                }
                
                Spacer()
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                // Don't load users on appear - only when user searches
                // The backend requires a non-empty search query
            }
        }
    }
    
    private var filteredUsers: [User] {
        if searchText.isEmpty {
            return users
        } else {
            return users.filter { user in
                user.displayName.localizedCaseInsensitiveContains(searchText) ||
                (user.major?.localizedCaseInsensitiveContains(searchText) ?? false) ||
                user.firstName.localizedCaseInsensitiveContains(searchText) ||
                user.lastName.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    @MainActor
    private func searchUsers(query: String) async {
        // Clear users and error when search is empty
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            users = []
            error = nil
            isLoading = false
            return
        }
        
        // Don't search for very short queries to avoid too many API calls
        guard query.count >= 2 else {
            return
        }
        
        isLoading = true
        error = nil
        
        do {
            print("🔍 Searching for users with query: '\(query)'")
            let response = try await apiService.fetchUsers(search: query)
            print("✅ Successfully found \(response.data.users.count) users")
            users = response.data.users
        } catch {
            self.error = error as? APIError ?? .unknown(0)
            print("❌ Failed to search users: \(error)")
            if let apiError = error as? APIError {
                print("❌ API Error details: \(apiError)")
            }
        }
        
        isLoading = false
    }
}

// MARK: - User Row
struct UserRow: View {
    let user: User
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Profile Picture
                if let profilePicture = user.profilePicture, !profilePicture.isEmpty {
                    AsyncImage(url: URL(string: "\(APIConstants.baseURL)\(profilePicture)")) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle()
                            .fill(Color("BrandPrimary"))
                            .overlay(
                                Text(user.initials)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                            )
                    }
                    .frame(width: 40, height: 40)
                    .clipShape(Circle())
                } else {
                    Circle()
                        .fill(Color("BrandPrimary"))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text(user.initials)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        )
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(user.displayName)
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    HStack {
                        if let year = user.year {
                            Text(year)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if user.major != nil && user.year != nil {
                            Text("•")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if let major = user.major {
                            Text(major)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}



#Preview {
    NewMessageView()
}


