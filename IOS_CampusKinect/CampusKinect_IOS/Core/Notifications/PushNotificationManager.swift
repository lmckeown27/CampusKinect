//
//  PushNotificationManager.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import UserNotifications
import UIKit

class PushNotificationManager: NSObject, ObservableObject {
    static let shared = PushNotificationManager()
    
    @Published var isAuthorized = false
    @Published var deviceToken: String?
    
    private let apiService = APIService.shared
    
    override init() {
        super.init()
        checkAuthorizationStatus()
    }
    
    // MARK: - Permission Management
    
    func requestPermission() async -> Bool {
        print("🔔 PushNotificationManager: requestPermission() called")
        let center = UNUserNotificationCenter.current()
        
        do {
            print("🔔 PushNotificationManager: Requesting authorization...")
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            
            print("🔔 PushNotificationManager: Authorization result: \(granted)")
            
            await MainActor.run {
                self.isAuthorized = granted
            }
            
            if granted {
                print("🔔 PushNotificationManager: Permission granted, registering for remote notifications...")
                await registerForRemoteNotifications()
            } else {
                print("🔔 PushNotificationManager: Permission denied by user")
                // Remove any existing device token from backend when permission is denied
                await unregisterCurrentDevice()
            }
            
            print("📱 Push notification permission: \(granted ? "Granted" : "Denied")")
            return granted
            
        } catch {
            print("❌ Error requesting notification permission: \(error)")
            return false
        }
    }
    
    func checkNotificationSettings() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        
        let wasAuthorized = isAuthorized
        let nowAuthorized = settings.authorizationStatus == .authorized
        
        await MainActor.run {
            self.isAuthorized = nowAuthorized
        }
        
        print("🔔 Notification settings check: was \(wasAuthorized), now \(nowAuthorized)")
        
        // Handle permission changes
        if wasAuthorized && !nowAuthorized {
            // User disabled notifications - remove device token
            print("🔔 User disabled notifications - removing device token")
            await unregisterCurrentDevice()
        } else if !wasAuthorized && nowAuthorized {
            // User enabled notifications - register device token
            print("🔔 User enabled notifications - registering device token")
            await registerForRemoteNotifications()
        }
    }
    
    private func unregisterCurrentDevice() async {
        guard let deviceToken = deviceToken else {
            print("🔔 No device token to unregister")
            return
        }
        
        do {
            _ = try await apiService.unregisterDeviceToken(token: deviceToken)
            print("✅ Device token unregistered from backend")
            
            await MainActor.run {
                self.deviceToken = nil
            }
        } catch {
            print("❌ Failed to unregister device token: \(error)")
        }
    }
    
    private func checkAuthorizationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }
    
    @MainActor
    private func registerForRemoteNotifications() {
        UIApplication.shared.registerForRemoteNotifications()
    }
    
    // MARK: - Device Token Management
    
    func handleDeviceToken(_ deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        DispatchQueue.main.async {
            self.deviceToken = tokenString
        }
        
        print("📱 Device token received: \(tokenString)")
        
        // Register token with backend
        Task {
            await registerDeviceToken(tokenString)
        }
    }
    
    func handleRegistrationError(_ error: Error) {
        print("❌ Failed to register for remote notifications: \(error)")
    }
    
    // Force registration for debugging
    func forceTokenRegistration() async {
        guard let token = deviceToken else {
            print("❌ No device token available to register")
            await registerForRemoteNotifications()
            return
        }
        
        print("🔄 Force registering existing device token...")
        await registerDeviceToken(token)
    }
    
    private func registerDeviceToken(_ token: String) async {
        do {
            print("📱 Attempting to register device token with backend...")
            _ = try await apiService.registerDeviceToken(token: token, platform: "ios")
            print("✅ Device token registered with backend successfully")
        } catch {
            print("❌ Failed to register device token with backend: \(error)")
            if let apiError = error as? APIError {
                print("❌ API Error details: \(apiError)")
            }
        }
    }
    
    // MARK: - Notification Handling
    
    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        print("📱 Received push notification: \(userInfo)")
        
        // Extract notification data
        guard let type = userInfo["type"] as? String else {
            print("❌ No notification type found")
            return
        }
        
        switch type {
        case "message":
            handleMessageNotification(userInfo)
        case "like":
            handleLikeNotification(userInfo)
        case "comment":
            handleCommentNotification(userInfo)
        case "follow":
            handleFollowNotification(userInfo)
        case "system":
            handleSystemNotification(userInfo)
        default:
            print("❓ Unknown notification type: \(type)")
        }
    }
    
    private func handleMessageNotification(_ userInfo: [AnyHashable: Any]) {
        print("💬 Handling message notification")
        
        // Navigate to messages or specific chat if app is active
        if UIApplication.shared.applicationState == .active {
            // App is in foreground - could show in-app notification or navigate
            NotificationCenter.default.post(
                name: .messageNotificationReceived,
                object: nil,
                userInfo: userInfo
            )
        }
        
        // Update badge count
        updateBadgeCount()
    }
    
    private func handleLikeNotification(_ userInfo: [AnyHashable: Any]) {
        print("❤️ Handling like notification")
        // Handle like notification logic
    }
    
    private func handleCommentNotification(_ userInfo: [AnyHashable: Any]) {
        print("💭 Handling comment notification")
        // Handle comment notification logic
    }
    
    private func handleFollowNotification(_ userInfo: [AnyHashable: Any]) {
        print("👥 Handling follow notification")
        // Handle follow notification logic
    }
    
    private func handleSystemNotification(_ userInfo: [AnyHashable: Any]) {
        print("🔔 Handling system notification")
        // Handle system notification logic
    }
    
    // MARK: - Badge Management
    
    func updateBadgeCount() {
        Task {
            do {
                let unreadCount = try await apiService.getUnreadMessageCount()
                
                // Use modern UNUserNotificationCenter API for iOS 16+
                if #available(iOS 16.0, *) {
                    try await UNUserNotificationCenter.current().setBadgeCount(unreadCount)
                } else {
                    // Fallback for older iOS versions
                    await MainActor.run {
                        UIApplication.shared.applicationIconBadgeNumber = unreadCount
                    }
                }
                
            } catch {
                print("❌ Failed to get unread message count: \(error)")
            }
        }
    }
    
    func clearBadge() {
        Task {
            // Use modern UNUserNotificationCenter API for iOS 16+
            if #available(iOS 16.0, *) {
                try? await UNUserNotificationCenter.current().setBadgeCount(0)
            } else {
                // Fallback for older iOS versions
                await MainActor.run {
                    UIApplication.shared.applicationIconBadgeNumber = 0
                }
            }
        }
    }
    
    // MARK: - Notification Categories
    
    func setupNotificationCategories() {
        let messageCategory = UNNotificationCategory(
            identifier: "MESSAGE_CATEGORY",
            actions: [
                UNNotificationAction(
                    identifier: "REPLY_ACTION",
                    title: "Reply",
                    options: [.foreground]
                ),
                UNNotificationAction(
                    identifier: "MARK_READ_ACTION",
                    title: "Mark as Read",
                    options: []
                )
            ],
            intentIdentifiers: [],
            options: []
        )
        
        let engagementCategory = UNNotificationCategory(
            identifier: "ENGAGEMENT_CATEGORY",
            actions: [
                UNNotificationAction(
                    identifier: "VIEW_ACTION",
                    title: "View",
                    options: [.foreground]
                )
            ],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([
            messageCategory,
            engagementCategory
        ])
    }
}

