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
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Introduction")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("At CampusKinect, protecting your privacy is paramount. This Privacy Policy explains what data we collect, how we use it, who we share it with, and your rights regarding your personal information. Last updated: October 2024")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    
                    // Data Collection
                    VStack(alignment: .leading, spacing: 12) {
                        Text("1. Information We Collect")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("Personal Information:")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            DataCollectionPoint("Name (first and last name)")
                            DataCollectionPoint("Educational email address (for verification)")
                            DataCollectionPoint("Username (chosen by you)")
                            DataCollectionPoint("University and major")
                            DataCollectionPoint("Academic year")
                            DataCollectionPoint("Hometown (optional)")
                            DataCollectionPoint("Profile picture (optional)")
                            DataCollectionPoint("Bio and profile information (optional)")
                        }
                        .padding(.leading, 16)
                        
                        Text("Content You Create:")
                            .font(.body)
                            .fontWeight(.medium)
                            .padding(.top, 8)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            DataCollectionPoint("Posts, photos, and descriptions")
                            DataCollectionPoint("Comments and messages")
                            DataCollectionPoint("Bookmarks and saved content")
                            DataCollectionPoint("Reports of content or users")
                        }
                        .padding(.leading, 16)
                        
                        Text("Usage Information:")
                            .font(.body)
                            .fontWeight(.medium)
                            .padding(.top, 8)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            DataCollectionPoint("Device information (device type, OS version)")
                            DataCollectionPoint("Log data (access times, features used)")
                            DataCollectionPoint("Push notification tokens (if enabled)")
                        }
                        .padding(.leading, 16)
                    }
                    
                    // How We Use Information
                    VStack(alignment: .leading, spacing: 12) {
                        Text("2. How We Use Your Information")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We only use your data for the following purposes:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            DataUsePoint("Provide and maintain our campus community services")
                            DataUsePoint("Verify your university affiliation")
                            DataUsePoint("Enable communication with other verified students")
                            DataUsePoint("Ensure platform safety through content moderation")
                            DataUsePoint("Send important service notifications")
                            DataUsePoint("Respond to your support requests")
                            DataUsePoint("Comply with legal obligations")
                        }
                        .padding(.leading, 16)
                        
                        Text("We do NOT use your data for advertising or marketing purposes.")
                            .font(.body)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                            .padding(.top, 4)
                    }
                    
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
                    
                    // Information Sharing and Third Parties
                    VStack(alignment: .leading, spacing: 12) {
                        Text("4. Data Sharing and Third Parties")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We do NOT sell your personal information to anyone.")
                            .font(.body)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                        
                        Text("We may share your information only in these limited circumstances:")
                            .font(.body)
                            .padding(.top, 4)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            DataSharingPoint("With your consent: When you explicitly agree to share")
                            DataSharingPoint("Service Providers: Hosting infrastructure (AWS), push notifications (Apple)")
                            DataSharingPoint("Legal Requirements: When required by law, court order, or to protect rights and safety")
                            DataSharingPoint("University Officials: Only when legally required for student safety concerns")
                        }
                        .padding(.leading, 16)
                        
                        Text("Third-Party Services:")
                            .font(.body)
                            .fontWeight(.medium)
                            .padding(.top, 8)
                        
                        Text("Any third parties we work with are required to provide the same level of data protection as described in this policy. They may only use your data to provide services to us, not for their own purposes.")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    
                    // Data Security
                    VStack(alignment: .leading, spacing: 12) {
                        Text("5. Data Security")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We implement industry-standard security measures:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            SecurityPoint("Encrypted data transmission (HTTPS/TLS)")
                            SecurityPoint("Secure password storage (bcrypt hashing)")
                            SecurityPoint("Access tokens stored securely in Keychain")
                            SecurityPoint("Regular security audits and updates")
                        }
                        .padding(.leading, 16)
                        
                        Text("However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                    
                    // Data Retention and Deletion
                    VStack(alignment: .leading, spacing: 12) {
                        Text("6. Data Retention and Deletion")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("Retention Policy:")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            RetentionPoint("Account data: Retained while your account is active")
                            RetentionPoint("Posts and messages: Retained until you delete them or close your account")
                            RetentionPoint("Logs and analytics: Retained for 90 days for security and debugging")
                        }
                        .padding(.leading, 16)
                        
                        Text("Account Deletion:")
                            .font(.body)
                            .fontWeight(.medium)
                            .padding(.top, 8)
                        
                        Text("You can permanently delete your account at any time from Settings > Account > Delete Account. Upon deletion:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            DeletionPoint("All your personal information is permanently removed")
                            DeletionPoint("Your posts, comments, and messages are deleted")
                            DeletionPoint("Your profile becomes inaccessible immediately")
                            DeletionPoint("This action cannot be undone")
                        }
                        .padding(.leading, 16)
                    }
                    
                    // Your Privacy Rights
                    VStack(alignment: .leading, spacing: 12) {
                        Text("7. Your Privacy Rights")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("You have the following rights regarding your personal data:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            PrivacyRight("Access: View all data we have about you")
                            PrivacyRight("Download: Export your data in a portable format")
                            PrivacyRight("Correct: Update or correct inaccurate information")
                            PrivacyRight("Delete: Permanently remove your account and all data")
                            PrivacyRight("Withdraw Consent: Revoke permissions at any time")
                            PrivacyRight("Object: Opt out of certain data processing activities")
                        }
                        .padding(.leading, 16)
                        
                        Text("To exercise these rights, visit Settings > Privacy & Data or contact us at privacy@campuskinect.com")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                    
                    // Permissions and Consent
                    VStack(alignment: .leading, spacing: 12) {
                        Text("8. Permissions and Consent")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We request your permission before accessing:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            PermissionPoint("Camera: To take photos for posts")
                            PermissionPoint("Photo Library: To select photos for posts")
                            PermissionPoint("Push Notifications: To send you important updates")
                        }
                        .padding(.leading, 16)
                        
                        Text("You can revoke these permissions at any time through iOS Settings. Denying permissions will limit some features but won't prevent you from using the core app functionality.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                    
                    // Tracking and Analytics
                    VStack(alignment: .leading, spacing: 12) {
                        Text("9. Tracking and Analytics")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("We do NOT track you across other apps or websites for advertising purposes.")
                            .font(.body)
                            .fontWeight(.semibold)
                            .foregroundColor(.blue)
                        
                        Text("We only collect basic usage analytics within our app to improve service quality and fix bugs. This data is never shared with third parties for advertising.")
                            .font(.body)
                            .padding(.top, 4)
                    }
                    
                    // Children's Privacy
                    PrivacySection(
                        title: "10. Children's Privacy",
                        content: "Our service is intended for university students who are typically 18 years or older. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately."
                    )
                    
                    // Changes to Privacy Policy
                    PrivacySection(
                        title: "11. Changes to This Policy",
                        content: "We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email, and update the 'Last Updated' date below."
                    )
                    
                    // Contact Information
                    VStack(alignment: .leading, spacing: 12) {
                        Text("12. Contact Us")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        Text("If you have any questions about this Privacy Policy or want to exercise your privacy rights, please contact us:")
                            .font(.body)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Email: privacy@campuskinect.com")
                                .font(.body)
                                .fontWeight(.medium)
                            
                            Text("Support: campuskinect01@gmail.com")
                                .font(.body)
                            
                            Text("Address: CampusKinect, Inc.")
                                .font(.body)
                            
                            Text("Last updated: October 2024")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.blue)
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

struct DataCollectionPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
                .font(.body)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct DataUsePoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("✓")
                .font(.body)
                .foregroundColor(.green)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct DataSharingPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("→")
                .font(.body)
                .foregroundColor(.orange)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct SecurityPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "lock.fill")
                .font(.caption)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct RetentionPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "clock.fill")
                .font(.caption)
                .foregroundColor(.orange)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct DeletionPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "trash.fill")
                .font(.caption)
                .foregroundColor(.red)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

struct PermissionPoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "hand.raised.fill")
                .font(.caption)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    PrivacyView()
} 