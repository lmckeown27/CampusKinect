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
        let center = UNUserNotificationCenter.current()
        
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            
            await MainActor.run {
                self.isAuthorized = granted
            }
            
            if granted {
                await registerForRemoteNotifications()
            }
            
            print("📱 Push notification permission: \(granted ? "Granted" : "Denied")")
            return granted
            
        } catch {
            print("❌ Error requesting notification permission: \(error)")
            return false
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
    
    private func registerDeviceToken(_ token: String) async {
        do {
            _ = try await apiService.registerDeviceToken(token: token, platform: "ios")
            print("✅ Device token registered with backend")
        } catch {
            print("❌ Failed to register device token with backend: \(error)")
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
                
                await MainActor.run {
                    UIApplication.shared.applicationIconBadgeNumber = unreadCount
                }
                
            } catch {
                print("❌ Failed to get unread message count: \(error)")
            }
        }
    }
    
    func clearBadge() {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = 0
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

