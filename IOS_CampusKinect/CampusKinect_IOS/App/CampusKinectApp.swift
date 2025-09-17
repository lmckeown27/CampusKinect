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
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var networkMonitor = NetworkMonitor()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkMonitor)
                .onAppear {
                    setupApp()
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
        
        // Request push notification permissions immediately on app launch
        Task {
            let granted = await PushNotificationManager.shared.requestPermission()
            print("📱 App Launch: Push notification permission \(granted ? "granted" : "denied")")
        }
        
        // Check for existing authentication
        Task {
            await authManager.checkExistingAuth()
        }
    }
}

