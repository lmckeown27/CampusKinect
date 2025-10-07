//
//  DataManagementView.swift
//  CampusKinect_IOS
//
//  Created for Apple Privacy Compliance (Guideline 5.1.1)
//  Provides users with data access, export, and deletion capabilities
//

import SwiftUI

struct DataManagementView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var isExportingData = false
    @State private var showingExportSuccess = false
    @State private var showingExportError = false
    @State private var exportErrorMessage = ""
    @State private var showingDeleteConfirmation = false
    @State private var showingDeleteVerification = false
    @State private var deletionConfirmationText = ""
    @State private var isDeletingAccount = false
    @State private var exportedData: String?
    @State private var showShareSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "hand.raised.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.blue)
                            
                            Spacer()
                        }
                        
                        Text("Privacy & Data Management")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("Manage your personal data and privacy settings. You have full control over your information.")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding(.bottom, 8)
                    
                    // Data Export Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Your Data")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "arrow.down.doc.fill")
                                    .font(.title3)
                                    .foregroundColor(.blue)
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Download Your Data")
                                        .font(.headline)
                                    
                                    Text("Export all your personal information, posts, comments, and activity. You'll receive a JSON file with all your data.")
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Button(action: {
                                Task {
                                    await exportUserData()
                                }
                            }) {
                                HStack {
                                    if isExportingData {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    } else {
                                        Image(systemName: "arrow.down.circle.fill")
                                        Text("Export My Data")
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            .disabled(isExportingData)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(16)
                    }
                    
                    // Permissions Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Permissions")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            PermissionRow(
                                icon: "camera.fill",
                                title: "Camera",
                                description: "Take photos for posts"
                            )
                            
                            Divider()
                            
                            PermissionRow(
                                icon: "photo.fill",
                                title: "Photo Library",
                                description: "Select photos for posts"
                            )
                            
                            Divider()
                            
                            PermissionRow(
                                icon: "bell.fill",
                                title: "Push Notifications",
                                description: "Receive important updates"
                            )
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(16)
                        
                        Text("To change these permissions, go to Settings > CampusKinect on your device.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            if let url = URL(string: UIApplication.openSettingsURLString) {
                                UIApplication.shared.open(url)
                            }
                        }) {
                            HStack {
                                Image(systemName: "gear")
                                Text("Open iOS Settings")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray5))
                            .foregroundColor(.primary)
                            .cornerRadius(12)
                        }
                    }
                    
                    // Delete Account Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Account Deletion")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.title3)
                                    .foregroundColor(.red)
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Delete My Account")
                                        .font(.headline)
                                        .foregroundColor(.red)
                                    
                                    Text("Permanently delete your account and all associated data. This action cannot be undone.")
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("What will be deleted:")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                ForEach([
                                    "Your profile and personal information",
                                    "All your posts and comments",
                                    "Your messages and conversations",
                                    "Bookmarks and saved content",
                                    "All account activity and history"
                                ], id: \.self) { item in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text("•")
                                            .foregroundColor(.red)
                                        Text(item)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding(.top, 4)
                            
                            Button(action: {
                                showingDeleteConfirmation = true
                            }) {
                                HStack {
                                    Image(systemName: "trash.fill")
                                    Text("Delete My Account")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red.opacity(0.1))
                                .foregroundColor(.red)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.red, lineWidth: 2)
                                )
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(16)
                    }
                    
                    // Privacy Policy Link
                    Button(action: {
                        // This would open PrivacyView
                    }) {
                        HStack {
                            Image(systemName: "doc.text.fill")
                            Text("View Privacy Policy")
                            Spacer()
                            Image(systemName: "chevron.right")
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    .foregroundColor(.primary)
                }
                .padding()
            }
            .navigationTitle("Privacy & Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Export Successful", isPresented: $showingExportSuccess) {
                Button("Share") {
                    showShareSheet = true
                }
                Button("OK", role: .cancel) { }
            } message: {
                Text("Your data has been exported successfully. You can now share or save this file.")
            }
            .alert("Export Failed", isPresented: $showingExportError) {
                Button("OK") { }
            } message: {
                Text(exportErrorMessage)
            }
            .alert("Delete Account?", isPresented: $showingDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Continue", role: .destructive) {
                    showingDeleteVerification = true
                }
            } message: {
                Text("Are you sure you want to permanently delete your account? All your data will be lost forever.")
            }
            .alert("Confirm Deletion", isPresented: $showingDeleteVerification) {
                TextField("Type DELETE to confirm", text: $deletionConfirmationText)
                Button("Cancel", role: .cancel) {
                    deletionConfirmationText = ""
                }
                Button("Delete Forever", role: .destructive) {
                    if deletionConfirmationText == "DELETE" {
                        Task {
                            await deleteAccount()
                        }
                    }
                }
            } message: {
                Text("Type DELETE to permanently delete your account. This cannot be undone.")
            }
            .sheet(isPresented: $showShareSheet) {
                if let data = exportedData {
                    ShareSheet(activityItems: [data])
                }
            }
        }
    }
    
    // MARK: - Data Export
    
    private func exportUserData() async {
        isExportingData = true
        
        do {
            guard let token = await authManager.keychainManager.getAccessToken() else {
                throw NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
            }
            
            guard let url = URL(string: "\(APIConstants.fullBaseURL)/users/profile/export") else {
                throw NSError(domain: "URL", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw NSError(domain: "HTTP", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to export data"])
            }
            
            // Convert data to pretty-printed JSON string
            if let jsonObject = try? JSONSerialization.jsonObject(with: data),
               let prettyData = try? JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted),
               let jsonString = String(data: prettyData, encoding: .utf8) {
                
                await MainActor.run {
                    exportedData = jsonString
                    isExportingData = false
                    showingExportSuccess = true
                }
            } else {
                throw NSError(domain: "JSON", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to parse exported data"])
            }
            
        } catch {
            await MainActor.run {
                isExportingData = false
                exportErrorMessage = error.localizedDescription
                showingExportError = true
            }
        }
    }
    
    // MARK: - Account Deletion
    
    private func deleteAccount() async {
        isDeletingAccount = true
        
        do {
            guard let token = await authManager.keychainManager.getAccessToken() else {
                throw NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
            }
            
            guard let url = URL(string: "\(APIConstants.fullBaseURL)/users/profile/permanent") else {
                throw NSError(domain: "URL", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "DELETE"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let body = ["confirmation": "DELETE_MY_ACCOUNT"]
            request.httpBody = try JSONEncoder().encode(body)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw NSError(domain: "HTTP", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to delete account"])
            }
            
            // Account deleted successfully - logout and dismiss
            await MainActor.run {
                isDeletingAccount = false
                Task {
                    await authManager.logout()
                    dismiss()
                }
            }
            
        } catch {
            await MainActor.run {
                isDeletingAccount = false
                exportErrorMessage = "Failed to delete account: \(error.localizedDescription)"
                showingExportError = true
            }
        }
    }
}

// MARK: - Supporting Views

struct PermissionRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {
        // No update needed
    }
}

#Preview {
    DataManagementView()
        .environmentObject(AuthenticationManager())
}
