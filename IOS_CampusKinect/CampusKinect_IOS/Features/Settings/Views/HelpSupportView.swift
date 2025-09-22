//
//  HelpSupportView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/16/25.
//

import SwiftUI

struct HelpSupportView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
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
                    // Getting Started
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Getting Started")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            HelpItem(
                                icon: "person.circle",
                                title: "Creating Your Profile",
                                description: "Set up your profile with your university email, add a photo, and fill in your information to connect with other students."
                            )
                            
                            HelpItem(
                                icon: "magnifyingglass",
                                title: "Finding Posts",
                                description: "Browse posts by category, use the search function, or filter by post type to find exactly what you're looking for."
                            )
                            
                            HelpItem(
                                icon: "plus.circle",
                                title: "Creating Posts",
                                description: "Tap the + button to create posts for events, housing, tutoring, or marketplace items. Add photos and detailed descriptions."
                            )
                        }
                    }
                    
                    // Common Questions
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Frequently Asked Questions")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            FAQItem(
                                question: "Who can use CampusKinect?",
                                answer: "CampusKinect is exclusively for university students with valid educational email addresses (.edu, .ac.uk, .ca, .edu.au, .de, .fr)."
                            )
                            
                            FAQItem(
                                question: "How do I message other users?",
                                answer: "Tap on any post to view details, then use the 'Message' button to start a conversation with the poster."
                            )
                            
                            FAQItem(
                                question: "How do I report inappropriate content?",
                                answer: "Tap the three dots on any post and select 'Report Post'. Our moderation team will review it promptly."
                            )
                            
                            FAQItem(
                                question: "Can I edit or delete my posts?",
                                answer: "Yes! Go to your profile, find your post, and tap the three dots to edit or delete it."
                            )
                            
                            FAQItem(
                                question: "How do I change my notification settings?",
                                answer: "Currently, notification settings are managed through your device's Settings app under CampusKinect."
                            )
                        }
                    }
                    
                    // Safety Tips
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Safety & Security")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            SafetyTip(
                                icon: "shield.checkered",
                                title: "Meet in Public Places",
                                description: "When meeting someone from the app, always choose public, well-lit locations on campus."
                            )
                            
                            SafetyTip(
                                icon: "person.2.badge.gearshape",
                                title: "Verify Identity",
                                description: "All users must verify their university email, but always use your best judgment when interacting with others."
                            )
                            
                            SafetyTip(
                                icon: "exclamationmark.triangle",
                                title: "Report Suspicious Activity",
                                description: "If something doesn't feel right, report it immediately through the app or contact campus security."
                            )
                        }
                    }
                    
                    // Contact Support
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Still Need Help?")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("If you can't find the answer to your question, our support team is here to help.")
                            .font(.body)
                            .foregroundColor(.secondary)
                        
                        VStack(alignment: .leading, spacing: 12) {
                            ContactOption(
                                icon: "envelope.fill",
                                title: "Email Support",
                                description: "campuskinect01@gmail.com",
                                subtitle: "Response time: Whenever I get around to it"
                            )
                            
                            ContactOption(
                                icon: "questionmark.circle.fill",
                                title: "Common Issues",
                                description: "Check our FAQ section above",
                                subtitle: "Most questions are answered there"
                            )
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Help & Support")
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
struct HelpItem: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
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

struct FAQItem: View {
    let question: String
    let answer: String
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    Text(question)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .buttonStyle(PlainButtonStyle())
            
            if isExpanded {
                Text(answer)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.leading, 4)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct SafetyTip: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.orange)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
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

struct ContactOption: View {
    let icon: String
    let title: String
    let description: String
    let subtitle: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.primary)
                
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    HelpSupportView()
} }
