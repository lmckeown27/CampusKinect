//
//  AboutView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // App Icon and Title
                    VStack(spacing: 16) {
                        Image(systemName: "graduationcap.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(Color("BrandPrimary"))
                        
                        VStack(spacing: 8) {
                            Text("CampusKinect")
                                .font(.title)
                                .fontWeight(.bold)
                            
                            Text("Version 1.0.0")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical)
                    
                    // About Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("About CampusKinect")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("CampusKinect is a student community platform designed to connect university students for sharing events, finding roommates, offering tutoring services, and engaging in campus life activities.")
                            .font(.body)
                        
                        Text("Our mission is to enhance the college experience by making it easier for students to connect, collaborate, and build meaningful relationships within their campus community.")
                            .font(.body)
                    }
                    
                    // Features Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Key Features")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            FeatureRow(icon: "calendar", title: "Events", description: "Discover and share campus events")
                            FeatureRow(icon: "house", title: "Housing", description: "Find roommates and housing options")
                            FeatureRow(icon: "book", title: "Tutoring", description: "Offer or find academic help")
                            FeatureRow(icon: "cart", title: "Marketplace", description: "Buy and sell items with fellow students")
                            FeatureRow(icon: "message", title: "Messaging", description: "Connect directly with other students")
                        }
                    }
                    
                    // Contact Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Contact & Support")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            ContactRow(icon: "envelope", title: "Email", value: "campuskinect01@gmail.com")
                            ContactRow(icon: "globe", title: "Website", value: "campuskinect.net")
                        }
                    }
                    
                    // Legal Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Legal")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("CampusKinect is exclusively for university students with valid educational email addresses. By using this app, you agree to our Terms of Service and Privacy Policy.")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    
                    // Footer
                    VStack(spacing: 8) {
                        Divider()
                        
                        Text("© 2025 CampusKinect. All rights reserved.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity)
                    }
                    .padding(.top, 24)
                }
                .padding()
            }
            .navigationTitle("About")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Helper Views
struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct ContactRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(value)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    AboutView()
}

