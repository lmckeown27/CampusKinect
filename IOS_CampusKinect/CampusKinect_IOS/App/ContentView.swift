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
    
    // CRITICAL: Prevent presentation conflicts
    @State private var isTermsCheckComplete = false
    @State private var showingNotificationPermissionAlert = false
    
    var body: some View {
        ZStack {
            if authManager.isLoading {
                LoadingView()
            } else if authManager.isAuthenticated {
                // CRITICAL: Only show MainTabView AFTER terms check is complete
                // This prevents competing presentations
                if isTermsCheckComplete && !termsManager.shouldShowTerms {
                    MainTabView()
                        .onAppear {
                            // Ensure device token is registered for authenticated users
                            Task {
                                let granted = await PushNotificationManager.shared.requestPermission()
                                print("📱 Authenticated User: Push notification permission \(granted ? "granted" : "denied")")
                            }
                        }
                } else {
                    // Show loading while terms check is in progress
                    LoadingView()
                        .onAppear {
                            // CRITICAL: Check terms BEFORE showing any other UI
                            checkTermsWithDelay()
                        }
                }
            } else {
                LoginView()
            }
        }
        // CRITICAL: Terms sheet has ABSOLUTE PRIORITY - no other presentations can interfere
        .sheet(isPresented: $termsManager.shouldShowTerms) {
            TermsOfServiceView(isPresented: $termsManager.shouldShowTerms) { shouldRememberChoice in
                // User accepted terms
                if let user = authManager.currentUser {
                    termsManager.acceptTerms(for: String(user.id), shouldRememberChoice: shouldRememberChoice)
                }
                // CRITICAL: Mark terms check as complete
                isTermsCheckComplete = true
                
                // Show notification permission popup after terms acceptance
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    showingNotificationPermissionAlert = true
                }
            } onDecline: {
                // User declined terms - log them out
                print("📋 Terms declined - logging out user")
                Task {
                    await authManager.logout()
                }
                // CRITICAL: Mark terms check as complete (user will be logged out)
                isTermsCheckComplete = true
            }
        }
        .alert("Enable Notifications?", isPresented: $showingNotificationPermissionAlert) {
            Button("Enable") {
                Task {
                    let granted = await PushNotificationManager.shared.requestPermission()
                    print("📱 User chose to enable notifications: \(granted ? "granted" : "denied")")
                }
            }
            Button("Not Now") {
                print("📱 User chose not to enable notifications")
            }
        } message: {
            Text("Would you like to receive notifications for new messages and updates? You can change this anytime in your phone's Settings.")
        }
        .overlay(alignment: .top) {
            if !networkMonitor.isConnected {
                OfflineBannerView()
            }
        }
        .onChange(of: authManager.isAuthenticated) { oldValue, newValue in
            // Reset terms check when authentication state changes
            if !newValue {
                isTermsCheckComplete = false
            }
        }
    }
    
    // CRITICAL: Delayed terms check to prevent presentation conflicts
    private func checkTermsWithDelay() {
        // Small delay to ensure UI is stable before checking terms
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            if let user = authManager.currentUser {
                print("📋 CRITICAL: Checking terms for user \(user.id)")
                termsManager.checkAndShowTermsIfNeeded(for: String(user.id))
                
                // If no terms needed, mark check as complete
                if !termsManager.shouldShowTerms {
                    isTermsCheckComplete = true
                    print("📋 CRITICAL: Terms not needed - UI can proceed")
                } else {
                    print("📋 CRITICAL: Terms popup will be shown - blocking other UI")
                }
            } else {
                isTermsCheckComplete = true
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
        .environmentObject(NetworkMonitor())
}

