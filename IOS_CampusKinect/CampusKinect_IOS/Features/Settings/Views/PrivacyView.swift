//
//  PrivacyView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/25/25.
//

import SwiftUI

struct PrivacyView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Introduction
                    PrivacySection(
                        title: "1. Information We Collect",
                        content: "We collect information you provide directly to us, such as when you create an account, post content, or contact us for support. This includes your name, email address, university affiliation, and any content you choose to share on our platform."
                    )
                    
                    // How We Use Information
                    PrivacySection(
                        title: "2. How We Use Your Information",
                        content: "We use the information we collect to provide, maintain, and improve our services, communicate with you, ensure platform safety through content moderation, and comply with legal obligations."
                    )
                    
                    // Content Moderation and Safety
                    VStack(alignment: .leading, spacing: 12) {
                        Text("3. Content Moderation and Safety")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("Your safety is our priority. We actively monitor user-generated content to maintain a safe community environment.")
                            .font(.body)
                        
                        // Safety Banner
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "shield.checkered")
                                    .foregroundColor(.blue)
                                    .font(.title2)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Content Safety Measures")
                                        .font(.headline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.blue)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        SafetyPoint("Automated content filtering for prohibited material")
                                        SafetyPoint("User reporting system for inappropriate content")
                                        SafetyPoint("24-hour response time for content reports")
                                        SafetyPoint("User blocking capabilities for personal safety")
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.blue.opacity(0.1))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                                )
                        )
                    }
                    
                    // Information Sharing
                    PrivacySection(
                        title: "4. Information Sharing",
                        content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information when required by law or to protect our rights and the safety of our users."
                    )
                    
                    // Data Security
                    PrivacySection(
                        title: "5. Data Security",
                        content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure."
                    )
                    
                    // Your Rights
                    VStack(alignment: .leading, spacing: 12) {
                        Text("6. Your Privacy Rights")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("You have the right to access, update, or delete your personal information. You can also control your privacy settings and manage who can see your content.")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            PrivacyRight("Access and download your data")
                            PrivacyRight("Update or correct your information")
                            PrivacyRight("Delete your account and data")
                            PrivacyRight("Control content visibility settings")
                            PrivacyRight("Manage notification preferences")
                        }
                        .padding(.leading, 16)
                    }
                    
                    // Cookies and Tracking
                    PrivacySection(
                        title: "7. Cookies and Tracking",
                        content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie settings through your browser preferences."
                    )
                    
                    // Children's Privacy
                    PrivacySection(
                        title: "8. Children's Privacy",
                        content: "Our service is intended for university students who are typically 18 years or older. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately."
                    )
                    
                    // Changes to Privacy Policy
                    PrivacySection(
                        title: "9. Changes to This Policy",
                        content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date."
                    )
                    
                    // Contact Information
                    VStack(alignment: .leading, spacing: 12) {
                        Text("10. Contact Us")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("If you have any questions about this Privacy Policy, please contact us at:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Email: privacy@campuskinect.com")
                                .font(.body)
                                .fontWeight(.medium)
                            
                            Text("Address: CampusKinect, Inc.")
                                .font(.body)
                            
                            Text("Last updated: September 2024")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.top, 8)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Privacy Policy")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

// MARK: - Supporting Views

struct PrivacySection: View {
    let title: String
    let content: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(content)
                .font(.body)
        }
    }
}

struct PrivacyRight: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
                .font(.body)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.body)
        }
    }
}

struct SafetyPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 6) {
            Text("•")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.caption)
                .foregroundColor(.primary)
        }
    }
}

#Preview {
    PrivacyView()
} 