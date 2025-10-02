//
//  ReportConversationView.swift
//  CampusKinect_IOS
//
//  Created for message/conversation reporting with full chat history context
//

import SwiftUI

struct ReportConversationView: View {
    let messageId: Int
    let conversationWith: String
    let otherUserId: Int
    
    @Environment(\.dismiss) private var dismiss
    @State private var selectedReasons: Set<ReportReason> = []
    @State private var additionalDetails = ""
    @State private var isSubmitting = false
    @State private var showingSuccessAlert = false
    @State private var showingConfirmAlert = false
    @State private var errorMessage: String?
    @FocusState private var isTextFieldFocused: Bool
    
    enum ReportReason: String, CaseIterable, Hashable {
        case spam = "spam"
        case harassment = "harassment"
        case inappropriate = "inappropriate_content"
        case scam = "scam"
        case hateSpeech = "hate_speech"
        case violence = "violence"
        case sexualContent = "sexual_content"
        case falseInfo = "false_information"
        case other = "other"
        
        var displayName: String {
            switch self {
            case .spam: return "Spam"
            case .harassment: return "Harassment"
            case .inappropriate: return "Inappropriate Content"
            case .scam: return "Scam or Fraud"
            case .hateSpeech: return "Hate Speech"
            case .violence: return "Violence or Threats"
            case .sexualContent: return "Sexual Content"
            case .falseInfo: return "False Information"
            case .other: return "Other"
            }
        }
        
        var description: String {
            switch self {
            case .spam: return "Sending unwanted or repetitive messages"
            case .harassment: return "Bullying, threats, or harassment"
            case .inappropriate: return "Inappropriate or offensive content"
            case .scam: return "Attempting to scam or defraud"
            case .hateSpeech: return "Discriminatory or hateful content"
            case .violence: return "Threatening or promoting violence"
            case .sexualContent: return "Sexually explicit or suggestive material"
            case .falseInfo: return "Spreading false or misleading information"
            case .other: return "Other reason (please specify below)"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Image(systemName: "flag.fill")
                                .foregroundColor(.red)
                                .font(.title2)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Report Conversation")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                Text("Reporting conversation with \(conversationWith)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                        
                        Text("Help us understand what's wrong with this conversation. Select all that apply:")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    
                    Divider()
                    
                    // Reasons
                    VStack(spacing: 0) {
                        ForEach(ReportReason.allCases, id: \.self) { reason in
                            ReasonCheckboxRow(
                                reason: reason,
                                isSelected: selectedReasons.contains(reason),
                                onTap: {
                                    if selectedReasons.contains(reason) {
                                        selectedReasons.remove(reason)
                                    } else {
                                        selectedReasons.insert(reason)
                                    }
                                }
                            )
                            
                            if reason != ReportReason.allCases.last {
                                Divider()
                                    .padding(.leading, 56)
                            }
                        }
                    }
                    .background(Color(.systemBackground))
                    
                    Divider()
                    
                    // Additional Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Additional Details (Optional)")
                            .font(.headline)
                        
                        ZStack(alignment: .topLeading) {
                            if additionalDetails.isEmpty {
                                Text("Provide any additional context that might help us review this report...")
                                    .foregroundColor(.secondary)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 12)
                            }
                            
                            TextEditor(text: $additionalDetails)
                                .focused($isTextFieldFocused)
                                .frame(minHeight: 120)
                                .padding(4)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color(.separator), lineWidth: 1)
                                )
                        }
                        
                        Text("\(additionalDetails.count)/500 characters")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    
                    Spacer(minLength: 20)
                }
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
                        showingConfirmAlert = true
                    }
                    .disabled(selectedReasons.isEmpty || isSubmitting)
                    .fontWeight(.semibold)
                    .foregroundColor(selectedReasons.isEmpty ? .secondary : .red)
                }
            }
            .onTapGesture {
                isTextFieldFocused = false
            }
        }
        .alert("Confirm Report", isPresented: $showingConfirmAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Report", role: .destructive) {
                submitReport()
            }
        } message: {
            Text("Are you sure you want to report this conversation? Our moderation team will review it.")
        }
        .alert("Report Submitted", isPresented: $showingSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Thank you for helping keep our community safe. We'll review your report within 24 hours.")
        }
        .alert("Error", isPresented: .constant(errorMessage != nil)) {
            Button("OK") {
                errorMessage = nil
            }
        } message: {
            Text(errorMessage ?? "")
        }
    }
    
    private func submitReport() {
        isSubmitting = true
        
        // Use the first selected reason as the primary reason
        guard let primaryReason = selectedReasons.first else {
            return
        }
        
        // Combine all reasons if multiple selected
        let reasonsString = selectedReasons.map { $0.rawValue }.joined(separator: ", ")
        let fullDetails = "Reported conversation with \(conversationWith). Reasons: \(reasonsString). " + (additionalDetails.isEmpty ? "" : additionalDetails)
        
        Task {
            do {
                // Report the message (this will include full conversation history for admin)
                _ = try await APIService.shared.reportContent(
                    contentId: messageId,
                    contentType: "message",
                    reason: primaryReason.rawValue,
                    details: fullDetails
                )
                
                await MainActor.run {
                    isSubmitting = false
                    showingSuccessAlert = true
                }
            } catch {
                await MainActor.run {
                    isSubmitting = false
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct ReasonCheckboxRow: View {
    let reason: ReportConversationView.ReportReason
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.square.fill" : "square")
                    .foregroundColor(isSelected ? .blue : .secondary)
                    .font(.title3)
                    .frame(width: 24)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reason.displayName)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(reason.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                Spacer()
            }
            .contentShape(Rectangle())
            .padding()
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ReportConversationView(messageId: 123, conversationWith: "John Doe", otherUserId: 456)
} 