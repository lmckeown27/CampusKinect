import SwiftUI

struct SafetyCenterView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Safety Introduction
                    VStack(alignment: .leading, spacing: 12) {
                        Image(systemName: "shield.checkered")
                            .font(.system(size: 50))
                            .foregroundColor(.campusOlive400)
                            .frame(maxWidth: .infinity, alignment: .center)
                        
                        Text("Your Safety Matters")
                            .font(.title2)
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .center)
                        
                        Text("CampusKinect is committed to maintaining a safe and respectful community for all students. Use these resources to stay safe and report any concerns.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, 8)
                    
                    // Reporting Section
                    SafetySection(
                        icon: "flag.fill",
                        title: "Report Content",
                        description: "Report inappropriate posts, messages, or behavior. All reports are reviewed within 24 hours."
                    )
                    
                    // Blocking Users
                    SafetySection(
                        icon: "person.crop.circle.badge.xmark",
                        title: "Block Users",
                        description: "Block users to prevent them from contacting you or seeing your content. You can manage blocked users in Settings."
                    )
                    
                    // Zero Tolerance Policy
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Image(systemName: "exclamationmark.shield.fill")
                                .font(.title2)
                                .foregroundColor(.red)
                            
                            Text("Zero Tolerance Policy")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        
                        Text("CampusKinect has zero tolerance for:")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            BulletText("Harassment, bullying, or threatening behavior")
                            BulletText("Hate speech or discriminatory content")
                            BulletText("Sexual or inappropriate content")
                            BulletText("Spam, scams, or fraudulent activities")
                            BulletText("Violence or threats")
                        }
                        .padding(.leading, 8)
                    }
                    .padding()
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(12)
                    
                    // Contact Emergency Services
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Image(systemName: "phone.circle.fill")
                                .font(.title2)
                                .foregroundColor(.red)
                            
                            Text("Emergency")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        
                        Text("If you are in immediate danger, contact local authorities:")
                            .font(.subheadline)
                        
                        Text("Emergency: 911")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                            .padding(.vertical, 4)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Contact Support
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Image(systemName: "envelope.circle.fill")
                                .font(.title2)
                                .foregroundColor(.campusOlive400)
                            
                            Text("Contact Support")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        
                        Text("For non-emergency safety concerns:")
                            .font(.subheadline)
                        
                        Text("Email: campuskinect01@gmail.com")
                            .font(.body)
                            .fontWeight(.medium)
                            .foregroundColor(.campusOlive400)
                        
                        Text("Response Time: 2-6 pm")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Safety Center")
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

struct SafetySection: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.campusOlive400)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct BulletText: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
                .font(.body)
                .fontWeight(.bold)
            
            Text(text)
                .font(.body)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    SafetyCenterView()
} 