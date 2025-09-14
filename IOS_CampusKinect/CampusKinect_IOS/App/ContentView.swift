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

