//
//  BlockedUsersView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/24/25.
//

import SwiftUI

struct BlockedUsersView: View {
    @StateObject private var viewModel = BlockedUsersViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading blocked users...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.blockedUsers.isEmpty {
                    EmptyBlockedUsersView()
                } else {
                    List {
                        ForEach(viewModel.blockedUsers) { user in
                            BlockedUserRow(
                                user: user,
                                onUnblock: {
                                    viewModel.unblockUser(user.id)
                                }
                            )
                        }
                    }
                }
            }
            .navigationTitle("Blocked Users")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                viewModel.loadBlockedUsers()
            }
        }
    }
}

struct BlockedUserRow: View {
    let user: BlockedUser
    let onUnblock: () -> Void
    
    @State private var showingUnblockConfirmation = false
    
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: user.profilePicture ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color("BrandPrimary"))
                    .overlay(
                        Text(user.displayName.prefix(1).uppercased())
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user.displayName)
                    .font(.headline)
                    .fontWeight(.medium)
                
                if let username = user.username {
                    Text("@\(username)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text("Blocked \(user.blockedAt.timeAgoDisplay)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Unblock") {
                showingUnblockConfirmation = true
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundColor(.blue)
        }
        .padding(.vertical, 4)
        .alert("Unblock User", isPresented: $showingUnblockConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Unblock") {
                onUnblock()
            }
        } message: {
            Text("Are you sure you want to unblock \(user.displayName)? They will be able to see your content and message you again.")
        }
    }
}

struct EmptyBlockedUsersView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.crop.circle.badge.checkmark")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("No Blocked Users")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("You haven't blocked anyone yet. When you block users, they'll appear here and you can manage them.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Models

struct BlockedUser: Identifiable, Codable {
    let id: Int
    let username: String?
    let displayName: String
    let profilePicture: String?
    let blockedAt: Date
}

// MARK: - ViewModel

@MainActor
class BlockedUsersViewModel: ObservableObject {
    @Published var blockedUsers: [BlockedUser] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiService = APIService.shared
    
    func loadBlockedUsers() {
        isLoading = true
        error = nil
        
        Task {
            do {
                let users = try await apiService.getBlockedUsers()
                self.blockedUsers = users
            } catch {
                self.error = error.localizedDescription
                print("Failed to load blocked users: \(error)")
            }
            self.isLoading = false
        }
    }
    
    func unblockUser(_ userId: Int) {
        Task {
            do {
                let success = try await apiService.unblockUser(userId: userId)
                if success {
                    // Remove from local list
                    self.blockedUsers.removeAll { $0.id == userId }
                }
            } catch {
                self.error = error.localizedDescription
                print("Failed to unblock user: \(error)")
            }
        }
    }
}

// MARK: - Date Extension

extension Date {
    var timeAgoDisplay: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
}

#Preview {
    BlockedUsersView()
} 