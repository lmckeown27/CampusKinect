//
//  SettingsView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import MessageUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    @State private var showingLogoutAlert = false
    @State private var showingHelpSupport = false
    @State private var showingAbout = false
    @State private var showingTerms = false
    @State private var showingMailComposer = false
    
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
                
                // Support
                Section("Support") {
                    SettingsRow(
                        icon: "questionmark.circle",
                        title: "Help & Support",
                        subtitle: "Get help with the app"
                    ) {
                        showingHelpSupport = true
                    }
                    
                    SettingsRow(
                        icon: "envelope",
                        title: "Contact Us",
                        subtitle: "Send us feedback"
                    ) {
                        if MFMailComposeViewController.canSendMail() {
                            showingMailComposer = true
                        }
                    }
                    
                    SettingsRow(
                        icon: "doc.text",
                        title: "Terms & Conditions",
                        subtitle: "View our terms of service"
                    ) {
                        showingTerms = true
                    }
                    
                    SettingsRow(
                        icon: "info.circle",
                        title: "About",
                        subtitle: "App version and info"
                    ) {
                        showingAbout = true
                    }
                }
                
                // Notification Testing (Debug)
                Section("Push Notifications") {
                    Button(action: {
                        Task {
                            let granted = await PushNotificationManager.shared.requestPermission()
                            print("📱 Manual request: Push notification permission \(granted ? "granted" : "denied")")
                        }
                    }) {
                        HStack {
                            Image(systemName: "bell")
                                .foregroundColor(.blue)
                            
                            Text("Request Notification Permission")
                                .foregroundColor(.primary)
                            
                            Spacer()
                        }
                    }
                    
                    Button(action: {
                        PushNotificationManager.shared.updateBadgeCount()
                        print("📱 Manual badge update triggered")
                    }) {
                        HStack {
                            Image(systemName: "app.badge")
                                .foregroundColor(.orange)
                            
                            Text("Update Badge Count")
                                .foregroundColor(.primary)
                            
                            Spacer()
                        }
                    }
                    
                    Button(action: {
                        Task {
                            await PushNotificationManager.shared.forceTokenRegistration()
                        }
                    }) {
                        HStack {
                            Image(systemName: "arrow.clockwise")
                                .foregroundColor(.green)
                            
                            Text("Force Register Device Token")
                                .foregroundColor(.primary)
                            
                            Spacer()
                        }
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
            .sheet(isPresented: $showingHelpSupport) {
                HelpSupportView()
            }
            .sheet(isPresented: $showingAbout) {
                AboutView()
            }
            .sheet(isPresented: $showingTerms) {
                TermsView()
            }
            .sheet(isPresented: $showingMailComposer) {
                MailComposeView(
                    recipients: ["campuskinect01@gmail.com"],
                    subject: "CampusKinect Support Request",
                    body: "Hi CampusKinect Team,\n\nI need help with:\n\n"
                )
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
                
                Spacer(minLength: 0)
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthenticationManager())
}

