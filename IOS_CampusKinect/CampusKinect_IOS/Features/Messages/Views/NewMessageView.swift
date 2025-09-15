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
                                await loadUsers()
                            }
                        }
                        .padding(.top)
                    }
                    .padding()
                } else if filteredUsers.isEmpty {
                    EmptyStateView(
                        title: searchText.isEmpty ? "No Users Found" : "No Search Results",
                        message: searchText.isEmpty ? "No users available from your campus" : "Try searching for someone else",
                        systemImage: "person.2"
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
                Task {
                    await loadUsers()
                }
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
    private func loadUsers() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchUsers()
            users = response.data
        } catch {
            self.error = error as? APIError ?? .unknown(0)
            print("Failed to load users: \(error.localizedDescription)")
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
                        
                        if let major = user.major, let year = user.year {
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


