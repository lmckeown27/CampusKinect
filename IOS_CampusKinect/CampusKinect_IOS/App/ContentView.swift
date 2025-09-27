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
    @StateObject private var termsManager = TermsOfServiceManager.shared
    
    var body: some View {
        ZStack {
            if authManager.isLoading {
                LoadingView()
            } else if authManager.isAuthenticated {
                MainTabView()
                    .onAppear {
                        // Check if terms popup should be shown
                        if let user = authManager.currentUser {
                            termsManager.checkAndShowTermsIfNeeded(for: String(user.id))
                        }
                        
                        // Ensure device token is registered for authenticated users
                        Task {
                            let granted = await PushNotificationManager.shared.requestPermission()
                            print("📱 Authenticated User: Push notification permission \(granted ? "granted" : "denied")")
                        }
                    }
                    .sheet(isPresented: $termsManager.shouldShowTerms) {
                        TermsOfServiceView(isPresented: $termsManager.shouldShowTerms) { shouldRememberChoice in
                            // User accepted terms
                            if let user = authManager.currentUser {
                                termsManager.acceptTerms(for: String(user.id), shouldRememberChoice: shouldRememberChoice)
                            }
                        } onDecline: {
                            // User declined terms - log them out
                            print("📋 Terms declined - logging out user")
                            Task {
                                await authManager.logout()
                            }
                        }
                    }
            } else {
                LoginView()
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

