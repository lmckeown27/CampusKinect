//
//  HelpSupportView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/16/25.
//

import SwiftUI

struct HelpSupportView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedSection: HelpSection? = nil
    @State private var searchText = ""
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 24) {
                        headerSection
                        searchSection
                        helpSections
                        contactSection
                    }
                    .padding(.horizontal, isIPad ? 40 : 24)
                    .padding(.vertical, 32)
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
        }
        .navigationTitle("Help & Support")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    dismiss()
                }
                .foregroundColor(Color("BrandPrimary"))
            }
        }
    }
    
    // MARK: - Components
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: isIPad ? 80 : 60)
            
            VStack(spacing: 8) {
                Text("How can we help you?")
                    .font(isIPad ? .title : .title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text("Find answers to common questions or get in touch with our support team")
                    .font(isIPad ? .body : .subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    private var searchSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Search Help Topics")
                .font(.headline)
                .fontWeight(.semibold)
            
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search for help...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
    
    private var helpSections: some View {
        VStack(spacing: 16) {
            ForEach(HelpSection.allSections.filter { section in
                searchText.isEmpty || section.title.localizedCaseInsensitiveContains(searchText) ||
                section.items.contains { $0.question.localizedCaseInsensitiveContains(searchText) }
            }) { section in
                HelpSectionView(section: section, isExpanded: selectedSection?.id == section.id) {
                    selectedSection = selectedSection?.id == section.id ? nil : section
                }
            }
        }
    }
    
    private var contactSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Still need help?")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                ContactOptionView(
                    icon: "envelope.fill",
                    title: "Email Support",
                    description: "Get help via email",
                    action: { openEmailSupport() }
                )
                
                ContactOptionView(
                    icon: "message.fill",
                    title: "Live Chat",
                    description: "Chat with our support team",
                    action: { openLiveChat() }
                )
                
                ContactOptionView(
                    icon: "phone.fill",
                    title: "Phone Support",
                    description: "Call us during business hours",
                    action: { openPhoneSupport() }
                )
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(16)
    }
    
    // MARK: - Methods
    
    private func openEmailSupport() {
        if let url = URL(string: "mailto:support@campuskinect.com") {
            UIApplication.shared.open(url)
        }
    }
    
    private func openLiveChat() {
        // Implement live chat functionality
    }
    
    private func openPhoneSupport() {
        if let url = URL(string: "tel:+1-555-CAMPUS") {
            UIApplication.shared.open(url)
        }
    }
}

// MARK: - Help Section View
struct HelpSectionView: View {
    let section: HelpSection
    let isExpanded: Bool
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: onTap) {
                HStack {
                    Image(systemName: section.icon)
                        .font(.title2)
                        .foregroundColor(Color("BrandPrimary"))
                        .frame(width: 30)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(section.title)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
                        Text(section.description)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
            
            if isExpanded {
                VStack(spacing: 8) {
                    ForEach(section.items) { item in
                        HelpItemView(item: item)
                    }
                }
                .padding(.top, 8)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: isExpanded)
    }
}

// MARK: - Help Item View
struct HelpItemView: View {
    let item: HelpItem
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: {
                isExpanded.toggle()
            }) {
                HStack {
                    Text(item.question)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.leading)
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "minus.circle" : "plus.circle")
                        .font(.caption)
                        .foregroundColor(Color("BrandPrimary"))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color(.systemBackground))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )
            }
            .buttonStyle(PlainButtonStyle())
            
            if isExpanded {
                Text(item.answer)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color(.systemGray6).opacity(0.5))
                    .cornerRadius(8)
                    .padding(.top, 4)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: isExpanded)
    }
}

// MARK: - Contact Option View
struct ContactOptionView: View {
    let icon: String
    let title: String
    let description: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Color("BrandPrimary"))
                    .frame(width: 30)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(.systemGray4), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Data Models
struct HelpSection: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let icon: String
    let items: [HelpItem]
    
    static let allSections = [
        HelpSection(
            title: "Getting Started",
            description: "Learn the basics of using CampusKinect",
            icon: "play.circle.fill",
            items: [
                HelpItem(
                    question: "How do I create an account?",
                    answer: "To create an account, tap 'Sign Up' on the login screen and enter your university email address, create a password, and verify your email."
                ),
                HelpItem(
                    question: "How do I verify my university email?",
                    answer: "After signing up, check your university email for a verification code and enter it in the app to complete your registration."
                ),
                HelpItem(
                    question: "What universities are supported?",
                    answer: "CampusKinect supports most universities with .edu email addresses. If your university isn't supported, contact our support team."
                )
            ]
        ),
        HelpSection(
            title: "Posts & Content",
            description: "Creating and managing your posts",
            icon: "doc.text.fill",
            items: [
                HelpItem(
                    question: "How do I create a post?",
                    answer: "Tap the '+' button in the bottom navigation, select a category, write your content, and tap 'Post' to share with your campus community."
                ),
                HelpItem(
                    question: "Can I edit or delete my posts?",
                    answer: "Yes, you can edit or delete your posts by tapping the three dots menu on your post and selecting the appropriate option."
                ),
                HelpItem(
                    question: "What types of posts can I create?",
                    answer: "You can create posts for goods, services, housing, events, and general campus discussions. Each category has specific subcategories to help organize content."
                )
            ]
        ),
        HelpSection(
            title: "Messages & Communication",
            description: "Connecting with other students",
            icon: "message.fill",
            items: [
                HelpItem(
                    question: "How do I message other users?",
                    answer: "Tap on a user's profile or post, then tap 'Message' to start a conversation. You can also use the Messages tab to see all your conversations."
                ),
                HelpItem(
                    question: "Are my messages private?",
                    answer: "Yes, all messages are private and encrypted. Only you and the person you're messaging can see the conversation."
                ),
                HelpItem(
                    question: "Can I block or report users?",
                    answer: "Yes, you can block users by going to their profile and tapping 'Block User'. To report inappropriate content, use the report button on posts or messages."
                )
            ]
        ),
        HelpSection(
            title: "Privacy & Safety",
            description: "Keeping your information secure",
            icon: "shield.fill",
            items: [
                HelpItem(
                    question: "What information is visible to other users?",
                    answer: "Other users can see your name, profile picture, and posts. Your email address and other personal information remain private."
                ),
                HelpItem(
                    question: "How do I change my privacy settings?",
                    answer: "Go to Settings > Privacy to control who can message you, see your posts, and other privacy options."
                ),
                HelpItem(
                    question: "How do I report inappropriate content?",
                    answer: "Tap the three dots menu on any post or message and select 'Report'. Our moderation team will review the content promptly."
                )
            ]
        )
    ]
}

struct HelpItem: Identifiable {
    let id = UUID()
    let question: String
    let answer: String
}

struct HelpSupportView_Previews: PreviewProvider {
    static var previews: some View {
        HelpSupportView()
    }
}
