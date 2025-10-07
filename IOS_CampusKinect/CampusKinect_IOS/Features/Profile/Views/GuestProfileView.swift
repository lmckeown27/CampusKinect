//
//  GuestProfileView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 10/7/25.
//

import SwiftUI

struct GuestProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingLogin = false
    @State private var showingRegister = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header Background
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(hex: "708d81"),
                            Color(hex: "5a7166")
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(height: 150)
                    .overlay(
                        // Profile Picture
                        VStack {
                            Spacer()
                            Circle()
                                .fill(Color(hex: "2d2d2d"))
                                .frame(width: 120, height: 120)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 50))
                                        .foregroundColor(.gray)
                                )
                                .overlay(
                                    Circle()
                                        .stroke(Color(hex: "1a1a1a"), lineWidth: 4)
                                )
                                .offset(y: 60)
                        }
                    )
                    
                    // Profile Content
                    VStack(spacing: 20) {
                        // Spacer for profile picture overlap
                        Spacer().frame(height: 70)
                        
                        // Guest Info
                        VStack(spacing: 8) {
                            Text("Guest")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            Text("Browsing as Guest")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                            
                            if let universityName = authManager.guestUniversityName {
                                HStack {
                                    Image(systemName: "mappin.circle.fill")
                                        .font(.system(size: 14))
                                        .foregroundColor(Color(hex: "708d81"))
                                    Text("Viewing: \(universityName)")
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color(hex: "2d2d2d"))
                                .cornerRadius(8)
                            }
                        }
                        .padding(.horizontal)
                        
                        // Join Community Message
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "graduationcap.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.blue)
                                
                                VStack(alignment: .leading, spacing: 6) {
                                    Text("Join Your Campus Community")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                    
                                    Text("Create an account to post, comment, message other students, and unlock all features of CampusKinect.")
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.blue.opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.blue.opacity(0.5), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal)
                        
                        // Action Buttons
                        VStack(spacing: 12) {
                            Button(action: {
                                showingRegister = true
                            }) {
                                HStack {
                                    Image(systemName: "person.crop.circle.fill.badge.plus")
                                        .font(.system(size: 20))
                                    Text("Create Account")
                                        .font(.headline)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(hex: "708d81"))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            
                            Button(action: {
                                showingLogin = true
                            }) {
                                HStack {
                                    Image(systemName: "arrow.right.circle.fill")
                                        .font(.system(size: 20))
                                    Text("Sign In")
                                        .font(.headline)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(hex: "2d2d2d"))
                                .foregroundColor(.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(hex: "708d81"), lineWidth: 2)
                                )
                            }
                        }
                        .padding(.horizontal)
                        
                        // Guest Capabilities
                        VStack(alignment: .leading, spacing: 16) {
                            Divider()
                                .background(Color.gray.opacity(0.3))
                                .padding(.vertical, 8)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Text("As a guest, you can:")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.gray)
                                
                                GuestCapabilityRow(
                                    icon: "checkmark.circle.fill",
                                    text: "Browse posts from your selected university",
                                    color: .green
                                )
                                
                                GuestCapabilityRow(
                                    icon: "checkmark.circle.fill",
                                    text: "View post categories and content",
                                    color: .green
                                )
                                
                                GuestCapabilityRow(
                                    icon: "checkmark.circle.fill",
                                    text: "Explore your campus community",
                                    color: .green
                                )
                            }
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Create an account to:")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.gray)
                                    .padding(.top, 8)
                                
                                GuestCapabilityRow(
                                    icon: "circle.fill",
                                    text: "Post, comment, and like content",
                                    color: Color(hex: "708d81")
                                )
                                
                                GuestCapabilityRow(
                                    icon: "circle.fill",
                                    text: "Message other students",
                                    color: Color(hex: "708d81")
                                )
                                
                                GuestCapabilityRow(
                                    icon: "circle.fill",
                                    text: "Bookmark and save posts",
                                    color: Color(hex: "708d81")
                                )
                                
                                GuestCapabilityRow(
                                    icon: "circle.fill",
                                    text: "Build your campus network",
                                    color: Color(hex: "708d81")
                                )
                            }
                        }
                        .padding()
                        .background(Color(hex: "2d2d2d"))
                        .cornerRadius(12)
                        .padding(.horizontal)
                        
                        Spacer().frame(height: 40)
                    }
                }
            }
            .background(Color(hex: "1a1a1a").edgesIgnoringSafeArea(.all))
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showingLogin) {
            LoginView()
                .environmentObject(authManager)
        }
        .sheet(isPresented: $showingRegister) {
            RegisterView()
                .environmentObject(authManager)
        }
    }
}

// MARK: - Guest Capability Row
struct GuestCapabilityRow: View {
    let icon: String
    let text: String
    let color: Color
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(color)
                .frame(width: 16, height: 16)
            
            Text(text)
                .font(.subheadline)
                .foregroundColor(.gray)
                .fixedSize(horizontal: false, vertical: true)
            
            Spacer()
        }
    }
}

// MARK: - Preview
#Preview {
    GuestProfileView()
        .environmentObject(AuthenticationManager())
}
