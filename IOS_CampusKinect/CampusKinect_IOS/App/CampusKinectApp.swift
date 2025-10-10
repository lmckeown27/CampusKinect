//
//  CampusKinectApp.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

@main
struct CampusKinectApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var networkMonitor = NetworkMonitor()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkMonitor)
                .tint(.campusOlive400) // Global tint for ProgressViews and other interactive elements
                .onAppear {
                    setupApp()
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                    // Check notification settings when app becomes active
                    // This catches changes made in iOS Settings
                    Task {
                        await PushNotificationManager.shared.checkNotificationSettings()
                    }
                }
        }
    }
    
    private func setupApp() {
        // Configure URLSession cache
        let cache = URLCache(memoryCapacity: 50 * 1024 * 1024, // 50MB memory
                           diskCapacity: 200 * 1024 * 1024,    // 200MB disk
                           diskPath: "campuskinect_cache")
        URLCache.shared = cache
        
        // Start network monitoring
        networkMonitor.startMonitoring()
        
        // Request push notification permissions and check authentication sequentially
        Task {
            let granted = await PushNotificationManager.shared.requestPermission()
            print("📱 App Launch: Push notification permission \(granted ? "granted" : "denied")")
            
            // Small delay to ensure push notification setup completes
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            
            // Check for existing authentication
            await authManager.checkExistingAuth()
        }
    }
}

