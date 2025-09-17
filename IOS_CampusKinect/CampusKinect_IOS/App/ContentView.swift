//
//  ContentView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var networkMonitor: NetworkMonitor
    
    var body: some View {
        Group {
            if authManager.isLoading {
                LoadingView()
            } else if authManager.isAuthenticated {
                MainTabView()
                    .onAppear {
                        // Ensure device token is registered for authenticated users
                        Task {
                            let granted = await PushNotificationManager.shared.requestPermission()
                            print("📱 Authenticated User: Push notification permission \(granted ? "granted" : "denied")")
                        }
                    }
            } else {
                AuthenticationFlow()
            }
        }
        .overlay(alignment: .top) {
            if !networkMonitor.isConnected {
                OfflineBannerView()
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
        .environmentObject(NetworkMonitor())
}

