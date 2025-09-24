//
//  BlockUserView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/24/25.
//

import SwiftUI

struct BlockUserView: View {
    let userId: Int
    let userName: String
    let userProfilePicture: String?
    
    @Environment(\.dismiss) private var dismiss
    @State private var isBlocking = false
    @State private var showingConfirmation = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "person.crop.circle.badge.xmark")
                            .font(.system(size: 60))
                            .foregroundColor(.red)
                        
                        Text("Block User")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity)
                    
                    // User Info
                    HStack(spacing: 12) {
                        AsyncImage(url: URL(string: userProfilePicture ?? "")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color("BrandPrimary"))
                                .overlay(
                                    Text(userName.prefix(1).uppercased())
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.white)
                                )
                        }
                        .frame(width: 50, height: 50)
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("You are about to block:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Text(userName)
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        
                        Spacer()
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // What happens when you block
                    VStack(alignment: .leading, spacing: 16) {
                        Text("What happens when you block this user:")
                            .font(.headline)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            BlockEffectRow(
                                icon: "eye.slash",
                                title: "Hide their content",
                                description: "You won't see their posts or messages"
                            )
                            
                            BlockEffectRow(
                                icon: "message.slash",
                                title: "Prevent messaging",
                                description: "They won't be able to message you"
                            )
                            
                            BlockEffectRow(
                                icon: "person.slash",
                                title: "Hide your profile",
                                description: "They won't be able to view your profile or posts"
                            )
                            
                            BlockEffectRow(
                                icon: "bell.slash",
                                title: "Stop notifications",
                                description: "You won't receive notifications from their activity"
                            )
                        }
                    }
                    
                    // Unblock info
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                            .font(.title3)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("You can unblock users anytime")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            
                            Text("Go to Settings > Privacy & Safety > Blocked Users to manage your blocked users list.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(12)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                    
                    // Alternative actions
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Other options:")
                            .font(.headline)
                        
                        Button(action: {
                            // Report user action
                        }) {
                            HStack {
                                Image(systemName: "exclamationmark.shield")
                                    .foregroundColor(.orange)
                                
                                Text("Report this user instead")
                                    .foregroundColor(.primary)
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.secondary)
                                    .font(.caption)
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Block User") {
                        blockUser()
                    }
                    .disabled(isBlocking)
                    .foregroundColor(.red)
                    .fontWeight(.semibold)
                }
            }
        }
        .alert("User Blocked", isPresented: $showingConfirmation) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("\(userName) has been blocked. You can unblock them anytime in Settings > Privacy & Safety.")
        }
    }
    
    private func blockUser() {
        isBlocking = true
        
        Task {
            do {
                let success = try await APIService.shared.blockUser(userId: userId)
                
                await MainActor.run {
                    isBlocking = false
                    if success {
                        showingConfirmation = true
                    }
                }
            } catch {
                await MainActor.run {
                    isBlocking = false
                    // Handle error
                    print("Failed to block user: \(error)")
                }
            }
        }
    }
}

struct BlockEffectRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.red)
                .font(.title3)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    BlockUserView(
        userId: 123,
        userName: "John Doe",
        userProfilePicture: nil
    )
} 