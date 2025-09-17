//
//  AppDelegate.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import UIKit
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Setup push notifications
        setupPushNotifications()
        
        // Handle notification if app was launched from notification
        if let notificationUserInfo = launchOptions?[.remoteNotification] as? [AnyHashable: Any] {
            PushNotificationManager.shared.handleNotification(notificationUserInfo)
        }
        
        return true
    }
    
    private func setupPushNotifications() {
        // Set notification delegate
        UNUserNotificationCenter.current().delegate = self
        
        // Setup notification categories
        PushNotificationManager.shared.setupNotificationCategories()
    }
    
    // MARK: - Push Notification Methods
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        PushNotificationManager.shared.handleDeviceToken(deviceToken)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        PushNotificationManager.shared.handleRegistrationError(error)
    }
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        PushNotificationManager.shared.handleNotification(userInfo)
        completionHandler(.newData)
    }
    
    // MARK: UISceneSession Lifecycle
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
    
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    
    // Handle notification when app is in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        
        let userInfo = notification.request.content.userInfo
        PushNotificationManager.shared.handleNotification(userInfo)
        
        // Show notification banner and play sound even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    // Handle notification tap
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        
        let userInfo = response.notification.request.content.userInfo
        
        // Handle different notification actions
        switch response.actionIdentifier {
        case "REPLY_ACTION":
            // Handle reply action
            handleReplyAction(userInfo: userInfo)
        case "MARK_READ_ACTION":
            // Handle mark as read action
            handleMarkReadAction(userInfo: userInfo)
        case UNNotificationDefaultActionIdentifier:
            // Handle default tap (open app)
            PushNotificationManager.shared.handleNotification(userInfo)
        default:
            break
        }
        
        completionHandler()
    }
    
    private func handleReplyAction(userInfo: [AnyHashable: Any]) {
        // Navigate to chat for quick reply
        if let type = userInfo["type"] as? String, type == "message" {
            NotificationCenter.default.post(
                name: .messageNotificationReceived,
                object: nil,
                userInfo: userInfo
            )
        }
    }
    
    private func handleMarkReadAction(userInfo: [AnyHashable: Any]) {
        // Mark message as read without opening app
        print("📱 Marking message as read from notification action")
        // Could call API to mark as read here
    }
}

