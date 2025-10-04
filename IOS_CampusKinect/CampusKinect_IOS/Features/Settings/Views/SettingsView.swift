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
    @State private var showingBlockedUsers = false
    @State private var showingMyReports = false
    @State private var showingAdminDashboard = false
    @State private var showingRestoreTermsAlert = false
    @State private var showingVerificationCode = false
    @State private var showingSendVerificationAlert = false
    @State private var isSendingVerification = false
    @State private var showingVerificationSentSuccess = false
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    

    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
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
                    
                    // Reset Terms button removed - hidden for all users
                    
                    SettingsRow(
                        icon: "info.circle",
                        title: "About",
                        subtitle: "App version and info"
                    ) {
                        showingAbout = true
                    }
                }
                
                // Privacy & Safety
                Section("Privacy & Safety") {
                    SettingsRow(
                        icon: "person.crop.circle.badge.xmark",
                        title: "Blocked Users",
                        subtitle: "Manage blocked users"
                    ) {
                        showingBlockedUsers = true
                    }
                    
                    SettingsRow(
                        icon: "exclamationmark.shield",
                        title: "My Reports",
                        subtitle: "View your submitted reports"
                    ) {
                        showingMyReports = true
                    }
                }
                
                // Admin Section - Only visible to liam_mckeown38
                if let user = authManager.currentUser,
                   (user.email == "lmckeown@calpoly.edu" || user.username == "liam_mckeown38") {
                    Section("Administration") {
                        SettingsRow(
                            icon: "shield.lefthalf.filled",
                            title: "Admin Dashboard",
                            subtitle: "Content moderation & analytics"
                        ) {
                            showingAdminDashboard = true
                        }
                        
                        SettingsRow(
                            icon: "arrow.clockwise.circle",
                            title: "Restore Terms Popup",
                            subtitle: "Force show Terms of Service on next login"
                        ) {
                            showingRestoreTermsAlert = true
                        }
                        
                        SettingsRow(
                            icon: "checkmark.shield",
                            title: "Test Verification Code",
                            subtitle: "Open verification code page (testing)"
                        ) {
                            showingVerificationCode = true
                        }
                        
                        SettingsRow(
                            icon: "envelope.badge",
                            title: "Send Test Verification Email",
                            subtitle: "Send verification code to admin email (testing)"
                        ) {
                            showingSendVerificationAlert = true
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
        .sheet(isPresented: $showingBlockedUsers) {
            BlockedUsersView()
        }
        .sheet(isPresented: $showingMyReports) {
            MyReportsView()
        }
        .sheet(isPresented: $showingAdminDashboard) {
            AdminDashboardView()
        }
        .alert("Restore Terms Popup", isPresented: $showingRestoreTermsAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Restore") {
                if let user = authManager.currentUser {
                    TermsOfServiceManager.shared.resetTermsAcceptance(for: String(user.id))
                }
            }
        } message: {
            Text("The Terms of Service popup will appear on your next login. This is useful for testing.")
        }
        .sheet(isPresented: $showingVerificationCode) {
            NavigationView {
                VerificationView(email: "lmckeown@calpoly.edu")
                    .environmentObject(authManager)
            }
        }
        .alert("Send Test Verification Email", isPresented: $showingSendVerificationAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Send") {
                Task {
                    await sendTestVerificationCode()
                }
            }
        } message: {
            Text("This will send a verification code to lmckeown@calpoly.edu for testing purposes.")
        }
        .alert("Verification Email Sent", isPresented: $showingVerificationSentSuccess) {
            Button("OK") { }
        } message: {
            Text("A test verification code has been sent to lmckeown@calpoly.edu. Check your email to test the verification flow.")
        }
            .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
            .frame(maxHeight: .infinity)
            .clipped()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        }
    }
    
    // MARK: - Helper Functions
    
    private func sendTestVerificationCode() async {
        isSendingVerification = true
        
        // Call admin-only test endpoint that bypasses verification checks
        do {
            guard let url = URL(string: "https://campuskinect.net/api/v1/auth/admin/test-verification-email") else {
                isSendingVerification = false
                return
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let body = ["email": "lmckeown@calpoly.edu"]
            request.httpBody = try JSONEncoder().encode(body)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            isSendingVerification = false
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                showingVerificationSentSuccess = true
            }
        } catch {
            print("❌ Failed to send test verification email:", error)
            isSendingVerification = false
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

