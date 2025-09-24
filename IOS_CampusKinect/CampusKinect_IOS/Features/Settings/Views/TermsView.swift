//
//  TermsView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/16/25.
//

import SwiftUI

struct TermsView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Introduction
                    TermsSection(
                        title: "1. Introduction",
                        content: "Welcome to CampusKinect, a student community platform designed to connect university students for sharing events, finding roommates, offering tutoring services, and engaging in campus life activities. By accessing or using our platform, you agree to be bound by these Terms of Service."
                    )
                    
                    // Eligibility
                    TermsSection(
                        title: "2. Eligibility",
                        content: "CampusKinect is exclusively for university students with valid educational email addresses. You must have a valid educational email address (.edu, .ac.uk, .ca, .edu.au, .de, .fr) to create an account and use CampusKinect."
                    )
                    
                    // Acceptable Use
                    VStack(alignment: .leading, spacing: 12) {
                        Text("3. Acceptable Use")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior. CampusKinect has ZERO TOLERANCE for objectionable content or abusive behavior. You agree to use CampusKinect only for lawful purposes and in accordance with these Terms. You agree not to:")
                            .font(.body)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            BulletPoint("Post false, misleading, or fraudulent information")
                            BulletPoint("Harass, bully, or discriminate against other users")
                            BulletPoint("Share inappropriate, offensive, or illegal content")
                            BulletPoint("Post content that is hateful, threatening, or promotes violence")
                            BulletPoint("Share sexually explicit or suggestive content")
                            BulletPoint("Post spam, scams, or fraudulent offers")
                            BulletPoint("Attempt to gain unauthorized access to other accounts")
                            BulletPoint("Use the platform for commercial purposes without permission")
                            BulletPoint("Violate any applicable laws or regulations")
                            BulletPoint("Engage in any form of abusive behavior toward other users")
                        }
                        .padding(.leading, 16)
                    }
                    
                    // User Content
                    VStack(alignment: .leading, spacing: 12) {
                        Text("4. User Content")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("You retain ownership of content you post on CampusKinect. However, by posting content, you grant us a license to use, display, and distribute that content on our platform.")
                            .font(.body)
                        
                        Text("Third-Party Content Disclaimer: The contents requested or offered on this website is sole property of the third party individual and not in any way affiliated with the platform. CampusKinect does not endorse, guarantee, or assume responsibility for any user-generated content, including but not limited to goods, services, housing, events, or any other listings.")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        Text("Content Moderation: We actively monitor all user-generated content and will act on objectionable content reports within 24 hours by removing the content and ejecting users who provide offending content. We maintain the authority to review, edit, or remove any content that we deem inappropriate, harmful, or in violation of these terms. Users who violate our content policies will be immediately suspended or permanently banned from the platform.")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        // Warning Box
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                                .font(.title3)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Content Responsibility")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                
                                Text("You are responsible for all content you post and its accuracy. We reserve the right to remove content that violates our terms or community guidelines.")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                    }
                    
                    // Privacy and Data
                    TermsSection(
                        title: "5. Privacy and Data",
                        content: "Your privacy is important to us. We collect and process your personal information in accordance with our Privacy Policy. By using CampusKinect, you consent to our data practices as described in our Privacy Policy."
                    )
                    
                    // Safety and Security
                    VStack(alignment: .leading, spacing: 12) {
                        Text("6. Safety and Security")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We are committed to maintaining a safe and secure platform for all users. We implement various security measures to protect your information and maintain platform integrity.")
                            .font(.body)
                        
                        Text("If you encounter any suspicious activity or security concerns, please report them immediately through our support channels.")
                            .font(.body)
                    }
                    
                    // Account Termination
                    VStack(alignment: .leading, spacing: 12) {
                        Text("7. Account Termination")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage in behavior that is harmful to our community.")
                            .font(.body)
                        
                        Text("You may also terminate your account at any time by contacting our support team.")
                            .font(.body)
                    }
                    
                    // Changes to Terms
                    TermsSection(
                        title: "8. Changes to Terms",
                        content: "We may update these Terms of Service from time to time. We will notify you of any material changes via email or through our platform. Your continued use of CampusKinect after such changes constitutes acceptance of the new terms."
                    )
                    
                    // Contact Information
                    VStack(alignment: .leading, spacing: 12) {
                        Text("9. Contact Information")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("If you have any questions about these Terms of Service, please contact us at:")
                            .font(.body)
                        
                        // Contact Box
                        VStack(alignment: .leading, spacing: 8) {
                            Text("CampusKinect Support")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            
                            Text("Email: campuskinect01@gmail.com")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Text("Response time: Whenever I get around to it")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                    }
                    
                    // Footer
                    VStack(spacing: 8) {
                        Divider()
                        
                        Text("Last updated: August 2025")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 24)
                }
                .padding()
            }
            .navigationTitle("Terms of Service")
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
struct TermsSection: View {
    let title: String
    let content: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(content)
                .font(.body)
        }
    }
}

struct BulletPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
                .font(.body)
            
            Text(text)
                .font(.body)
            
            Spacer()
        }
    }
}

#Preview {
    TermsView()
} 