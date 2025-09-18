//
//  NotificationSettingsView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import UserNotifications

struct NotificationSettingsView: View {
    @StateObject private var pushManager = PushNotificationManager.shared
    @State private var notificationsEnabled = false
    @State private var showingPermissionAlert = false
    @State private var showingSettingsAlert = false
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.blue)
                            .frame(width: 24, height: 24)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Push Notifications")
                                .font(.headline)
                            
                            Text("Receive notifications for new messages and updates")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Toggle("", isOn: $notificationsEnabled)
                            .onChange(of: notificationsEnabled) { _, newValue in
                                handleNotificationToggle(newValue)
                            }
                    }
                    .padding(.vertical, 8)
                } header: {
                    Text("Notification Preferences")
                } footer: {
                    Text("When enabled, you'll receive push notifications for new messages and important updates. You can change this setting anytime.")
                }
                
                if notificationsEnabled {
                    Section("Notification Types") {
                        NotificationTypeRow(
                            icon: "message.fill",
                            title: "Messages",
                            subtitle: "New messages and conversations",
                            isEnabled: true
                        )
                        
                        NotificationTypeRow(
                            icon: "heart.fill",
                            title: "Interactions",
                            subtitle: "Likes and comments on your posts",
                            isEnabled: true
                        )
                        
                        NotificationTypeRow(
                            icon: "bell.fill",
                            title: "General Updates",
                            subtitle: "App updates and announcements",
                            isEnabled: true
                        )
                    }
                }
            }
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                checkCurrentNotificationStatus()
            }
            .alert("Enable Notifications", isPresented: $showingPermissionAlert) {
                Button("Not Now", role: .cancel) {
                    notificationsEnabled = false
                }
                Button("Allow") {
                    requestNotificationPermission()
                }
            } message: {
                Text("Allow CampusKinect to send you notifications for new messages and updates?")
            }
            .alert("Notifications Disabled", isPresented: $showingSettingsAlert) {
                Button("Cancel", role: .cancel) {
                    notificationsEnabled = false
                }
                Button("Open Settings") {
                    openAppSettings()
                }
            } message: {
                Text("Notifications are disabled in Settings. To enable notifications, please go to Settings > CampusKinect > Notifications.")
            }
        }
    }
    
    private func checkCurrentNotificationStatus() {
        Task {
            let center = UNUserNotificationCenter.current()
            let settings = await center.notificationSettings()
            
            await MainActor.run {
                notificationsEnabled = settings.authorizationStatus == .authorized
            }
        }
    }
    
    private func handleNotificationToggle(_ enabled: Bool) {
        if enabled {
            Task {
                let center = UNUserNotificationCenter.current()
                let settings = await center.notificationSettings()
                
                switch settings.authorizationStatus {
                case .notDetermined:
                    // First time - show permission request
                    await MainActor.run {
                        showingPermissionAlert = true
                    }
                case .denied:
                    // Previously denied - direct to settings
                    await MainActor.run {
                        showingSettingsAlert = true
                    }
                case .authorized, .provisional, .ephemeral:
                    // Already authorized - register token
                    await MainActor.run {
                        PushNotificationManager.shared.registerForRemoteNotifications()
                    }
                @unknown default:
                    await MainActor.run {
                        notificationsEnabled = false
                    }
                }
            }
        } else {
            // User disabled notifications - unregister token
            Task {
                await PushNotificationManager.shared.unregisterCurrentDevice()
            }
        }
    }
    
    private func requestNotificationPermission() {
        Task {
            let granted = await PushNotificationManager.shared.requestPermission()
            await MainActor.run {
                notificationsEnabled = granted
            }
        }
    }
    
    private func openAppSettings() {
        if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(settingsURL)
        }
    }
}

struct NotificationTypeRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let isEnabled: Bool
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 24, height: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if isEnabled {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NotificationSettingsView()
}

