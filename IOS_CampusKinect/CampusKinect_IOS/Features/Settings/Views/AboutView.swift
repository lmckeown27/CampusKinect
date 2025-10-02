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
    
    // State for showing legal pages
    @State private var showingPrivacyPolicy = false
    @State private var showingTermsOfService = false
    @State private var showingCommunityGuidelines = false
    @State private var showingSafetyCenter = false
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 32) {
                        headerSection
                        appInfoSection
                        teamSection
                        legalSection
                        versionSection
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
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    dismiss()
                }
                .foregroundColor(Color("BrandPrimary"))
            }
        }
        .sheet(isPresented: $showingPrivacyPolicy) {
            PrivacyView()
        }
        .sheet(isPresented: $showingTermsOfService) {
            TermsView()
        }
        .sheet(isPresented: $showingCommunityGuidelines) {
            CommunityGuidelinesView()
        }
        .sheet(isPresented: $showingSafetyCenter) {
            SafetyCenterView()
        }
    }
    
    // MARK: - Components
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: isIPad ? 100 : 80)
            
            VStack(spacing: 8) {
                Text("CampusKinect")
                    .font(isIPad ? .largeTitle : .title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text("Connecting Campus Communities")
                    .font(isIPad ? .title3 : .subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    private var appInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("About CampusKinect")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text("CampusKinect is a social platform designed exclusively for university students. Connect with your campus community, discover events, find housing, buy and sell items, and build meaningful relationships with fellow students.")
                .font(.body)
                .foregroundColor(.secondary)
                .lineSpacing(4)
            
            VStack(spacing: 12) {
                FeatureRow(icon: "person.3.fill", title: "Campus Community", description: "Connect with verified students from your university")
                FeatureRow(icon: "calendar.badge.plus", title: "Events & Activities", description: "Discover and share campus events and activities")
                FeatureRow(icon: "house.fill", title: "Housing & Roommates", description: "Find housing options and compatible roommates")
                FeatureRow(icon: "bag.fill", title: "Campus Marketplace", description: "Buy and sell items within your campus community")
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(16)
    }
    
    private var teamSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Our Team")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text("CampusKinect is developed by a passionate team dedicated to enhancing the university experience through technology and community building.")
                .font(.body)
                .foregroundColor(.secondary)
                .lineSpacing(4)
            
            VStack(spacing: 12) {
                TeamMemberRow(name: "Development Team", role: "App Development & Design")
                TeamMemberRow(name: "Community Team", role: "User Experience & Support")
                TeamMemberRow(name: "Safety Team", role: "Platform Safety & Moderation")
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(16)
    }
    
    private var legalSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Legal & Privacy")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                LegalLinkRow(title: "Privacy Policy", description: "How we protect your data") {
                    showingPrivacyPolicy = true
                }
                LegalLinkRow(title: "Terms of Service", description: "Terms and conditions of use") {
                    showingTermsOfService = true
                }
                LegalLinkRow(title: "Community Guidelines", description: "Rules for a safe community") {
                    showingCommunityGuidelines = true
                }
                LegalLinkRow(title: "Safety Center", description: "Resources for staying safe") {
                    showingSafetyCenter = true
                }
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(16)
    }
    
    private var versionSection: some View {
        VStack(spacing: 12) {
            Text("Version Information")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 8) {
                HStack {
                    Text("App Version:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("1.0.0")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                HStack {
                    Text("Release Date:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("2025")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(16)
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
                .font(.title2)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct TeamMemberRow: View {
    let name: String
    let role: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "person.circle.fill")
                .font(.title2)
                .foregroundColor(Color("BrandPrimary"))
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(role)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct LegalLinkRow: View {
    let title: String
    let description: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: "doc.text.fill")
                    .font(.title2)
                    .foregroundColor(Color("BrandPrimary"))
                    .frame(width: 30)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline)
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
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct AboutView_Previews: PreviewProvider {
    static var previews: some View {
        AboutView()
    }
}
