//
//  SettingsView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    @State private var showingLogoutAlert = false
    
    var body: some View {
        NavigationView {
            List {
                // Profile Section
                Section {
                    if let user = authManager.currentUser {
                        HStack {
                            AsyncImage(url: user.profileImageURL) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Circle()
                                    .fill(Color("BrandPrimary"))
                                    .overlay(
                                        Text(user.initials)
                                            .font(.headline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.white)
                                    )
                            }
                            .frame(width: 50, height: 50)
                            .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.displayName)
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                Text(user.email ?? "No email available")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                }
                
                // App Settings
                Section("App Settings") {
                    SettingsRow(
                        icon: "bell",
                        title: "Notifications",
                        subtitle: "Manage your notification preferences"
                    ) {
                        print("Notifications tapped")
                    }
                    
                    SettingsRow(
                        icon: "lock",
                        title: "Privacy",
                        subtitle: "Control your privacy settings"
                    ) {
                        print("Privacy tapped")
                    }
                    
                    SettingsRow(
                        icon: "paintbrush",
                        title: "Appearance",
                        subtitle: "Customize app appearance"
                    ) {
                        print("Appearance tapped")
                    }
                }
                
                // Support
                Section("Support") {
                    SettingsRow(
                        icon: "questionmark.circle",
                        title: "Help & Support",
                        subtitle: "Get help with the app"
                    ) {
                        print("Help tapped")
                    }
                    
                    SettingsRow(
                        icon: "envelope",
                        title: "Contact Us",
                        subtitle: "Send us feedback"
                    ) {
                        print("Contact tapped")
                    }
                    
                    SettingsRow(
                        icon: "info.circle",
                        title: "About",
                        subtitle: "App version and info"
                    ) {
                        print("About tapped")
                    }
                }
                
                // Account Actions
                Section {
                    Button(action: {
                        showingLogoutAlert = true
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .foregroundColor(.red)
                            
                            Text("Sign Out")
                                .foregroundColor(.red)
                            
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                // Refresh user data to ensure we have the latest information including email
                Task {
                    await authManager.refreshCurrentUser()
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Sign Out", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Sign Out", role: .destructive) {
                    Task {
                        await authManager.logout()
                        dismiss()
                    }
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
}

// MARK: - Settings Row
struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(Color("BrandPrimary"))
                    .frame(width: 24, height: 24)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthenticationManager())
}

