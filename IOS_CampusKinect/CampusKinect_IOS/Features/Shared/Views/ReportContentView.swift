//
//  ReportContentView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/24/25.
//

import SwiftUI

struct ReportContentView: View {
    let contentId: Int
    let contentType: ReportContentType
    let contentAuthor: String
    
    @Environment(\.dismiss) private var dismiss
    @State private var selectedReason: ReportReason?
    @State private var additionalDetails = ""
    @State private var isSubmitting = false
    @State private var showingConfirmation = false
    
    enum ReportContentType: String, CaseIterable {
        case post = "post"
        case message = "message"
        case user = "user"
        
        var displayName: String {
            switch self {
            case .post: return "Post"
            case .message: return "Message"
            case .user: return "User"
            }
        }
    }
    
    enum ReportReason: String, CaseIterable {
        case harassment = "harassment"
        case hateSpeech = "hate_speech"
        case spam = "spam"
        case inappropriateContent = "inappropriate_content"
        case scam = "scam"
        case violence = "violence"
        case sexualContent = "sexual_content"
        case falseInformation = "false_information"
        case other = "other"
        
        var displayName: String {
            switch self {
            case .harassment: return "Harassment or Bullying"
            case .hateSpeech: return "Hate Speech or Discrimination"
            case .spam: return "Spam or Unwanted Content"
            case .inappropriateContent: return "Inappropriate Content"
            case .scam: return "Scam or Fraud"
            case .violence: return "Violence or Threats"
            case .sexualContent: return "Sexual or Suggestive Content"
            case .falseInformation: return "False or Misleading Information"
            case .other: return "Other"
            }
        }
        
        var description: String {
            switch self {
            case .harassment: return "Targeting, intimidating, or bullying behavior"
            case .hateSpeech: return "Content that attacks or discriminates against individuals or groups"
            case .spam: return "Repetitive, irrelevant, or promotional content"
            case .inappropriateContent: return "Content that violates community guidelines"
            case .scam: return "Fraudulent offers or deceptive practices"
            case .violence: return "Threats of violence or promoting harmful activities"
            case .sexualContent: return "Sexually explicit or suggestive material"
            case .falseInformation: return "Deliberately false or misleading information"
            case .other: return "Other violations not listed above"
            }
        }
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "exclamationmark.shield.fill")
                                .foregroundColor(.red)
                                .font(.title2)
                            
                            Text("Report \(contentType.displayName)")
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        
                        Text("Help us keep CampusKinect safe by reporting content that violates our community guidelines.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Content Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Reporting \(contentType.displayName.lowercased()) by:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text(contentAuthor)
                            .font(.headline)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                    
                    // Report Reasons
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Why are you reporting this \(contentType.displayName.lowercased())?")
                            .font(.headline)
                        
                        LazyVStack(spacing: 12) {
                            ForEach(ReportReason.allCases, id: \.self) { reason in
                                ReportReasonRow(
                                    reason: reason,
                                    isSelected: selectedReason == reason,
                                    onTap: { selectedReason = reason }
                                )
                            }
                        }
                    }
                    
                    // Additional Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Additional Details (Optional)")
                            .font(.headline)
                        
                        Text("Provide any additional context that might help our moderation team.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        TextEditor(text: $additionalDetails)
                            .frame(minHeight: 100)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                    
                    // Warning
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                            .font(.title3)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Report Policy")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            
                            Text("False reports may result in action against your account. We review all reports within 24 hours and take appropriate action against violating content and users.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(12)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Submit") {
                        submitReport()
                    }
                    .disabled(selectedReason == nil || isSubmitting)
                    .fontWeight(.semibold)
                }
            }
        }
        .alert("Report Submitted", isPresented: $showingConfirmation) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Thank you for helping keep CampusKinect safe. Our moderation team will review this report within 24 hours.")
        }
    }
    
    private func submitReport() {
        guard let reason = selectedReason else { return }
        
        isSubmitting = true
        
        Task {
            do {
                let success = try await APIService.shared.reportContent(
                    contentId: contentId,
                    contentType: contentType.rawValue,
                    reason: reason.rawValue,
                    details: additionalDetails.isEmpty ? nil : additionalDetails
                )
                
                await MainActor.run {
                    isSubmitting = false
                    if success {
                        showingConfirmation = true
                    }
                }
            } catch {
                await MainActor.run {
                    isSubmitting = false
                    // Handle error - could show error alert
                    print("Failed to submit report: \(error)")
                }
            }
        }
    }
}

struct ReportReasonRow: View {
    let reason: ReportContentView.ReportReason
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .blue : .secondary)
                    .font(.title3)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reason.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(reason.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding(12)
            .background(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ReportContentView(
        contentId: 123,
        contentType: .post,
        contentAuthor: "John Doe"
    )
} 