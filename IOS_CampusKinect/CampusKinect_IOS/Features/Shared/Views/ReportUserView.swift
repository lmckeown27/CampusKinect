//
//  ReportUserView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/29/25.
//

import SwiftUI

struct ReportUserView: View {
    let userId: Int
    let userName: String
    let context: String? // Optional: "post" or "conversation" to give admin context
    
    @Environment(\.dismiss) private var dismiss
    @State private var selectedReason: ReportReason?
    @State private var additionalDetails = ""
    @State private var isSubmitting = false
    @State private var showingSuccessAlert = false
    @State private var showingConfirmAlert = false
    @State private var errorMessage: String?
    @FocusState private var isTextFieldFocused: Bool
    
    enum ReportReason: String, CaseIterable, Hashable {
        case spam = "Spam"
        case harassment = "Harassment"
        case inappropriate = "Inappropriate Content"
        case scam = "Scam or Fraud"
        case hateSpeech = "Hate Speech"
        case violence = "Violence or Threats"
        case sexualContent = "Sexual Content"
        case falseInfo = "False Information"
        case other = "Other"
        
        var description: String {
            switch self {
            case .spam:
                return "Sending unwanted or repetitive messages"
            case .harassment:
                return "Bullying, threats, or harassment"
            case .inappropriate:
                return "Inappropriate or offensive content"
            case .scam:
                return "Attempting to scam or defraud"
            case .hateSpeech:
                return "Discriminatory or hateful content"
            case .violence:
                return "Threatening or promoting violence"
            case .sexualContent:
                return "Sexually explicit or suggestive material"
            case .falseInfo:
                return "Spreading false or misleading information"
            case .other:
                return "Other reason (please specify below)"
            }
        }
        
        // Backend API expects lowercase snake_case
        var apiValue: String {
            switch self {
            case .spam:
                return "spam"
            case .harassment:
                return "harassment"
            case .inappropriate:
                return "inappropriate_content"
            case .scam:
                return "scam"
            case .hateSpeech:
                return "hate_speech"
            case .violence:
                return "violence"
            case .sexualContent:
                return "sexual_content"
            case .falseInfo:
                return "false_information"
            case .other:
                return "other"
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
                                Text("Report User")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                
                                Text("Reporting \(userName)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                        
                        if let context = context {
                            Text("Context: Reported from \(context)")
                                .font(.caption)
                                .foregroundColor(.blue)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(6)
                        }
                        
                        Text("Help us keep CampusKinect safe by reporting users who violate our community guidelines.")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .background(Color(.systemGray6))
                    
                    // Reasons Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Select a reason")
                            .font(.headline)
                            .padding(.horizontal, 20)
                            .padding(.top, 20)
                        
                        VStack(spacing: 12) {
                            ForEach(ReportReason.allCases, id: \.self) { reason in
                                ReasonCheckboxRow(
                                    reason: reason,
                                    isSelected: selectedReason == reason,
                                    onTap: {
                                        selectedReason = reason
                                        // Clear additional details when switching away from "Other"
                                        if reason != .other {
                                            additionalDetails = ""
                                        }
                                    }
                                )
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    
                    // Description Section - Only shown when "Other" is selected
                    if selectedReason == .other {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Additional Details")
                                .font(.headline)
                            
                            Text("Please provide specific details to help our moderation team understand the issue.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            TextEditor(text: $additionalDetails)
                                .focused($isTextFieldFocused)
                                .frame(minHeight: 120)
                                .padding(12)
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(.systemGray4), lineWidth: 1)
                                )
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 24)
                        .transition(.opacity)
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
                            
                            Text("False reports may result in action against your account. Reports are reviewed within 24 hours.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(16)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    // Submit Button
                    Button(action: {
                        isTextFieldFocused = false
                        showingConfirmAlert = true
                    }) {
                        HStack {
                            if isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            }
                            
                            Text(isSubmitting ? "Submitting..." : "Submit Report")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(selectedReason != nil && !isSubmitting ? Color.red : Color.gray)
                        .cornerRadius(12)
                    }
                    .disabled(selectedReason == nil || isSubmitting)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
                    .padding(.bottom, 32)
                }
            }
            // Dismiss keyboard when tapping outside
            .onTapGesture {
                isTextFieldFocused = false
            }
            .navigationTitle("Report User")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        // Confirmation Alert
        .alert("Confirm Report", isPresented: $showingConfirmAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Submit", role: .destructive) {
                submitReport()
            }
        } message: {
            Text("Are you sure you want to report \(userName)? This action cannot be undone.")
        }
        // Success Alert
        .alert("Report Submitted", isPresented: $showingSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Thank you for your report. Our moderation team will review it shortly.")
        }
        // Error Alert
        .alert("Error", isPresented: Binding<Bool>(
            get: { errorMessage != nil },
            set: { _ in errorMessage = nil }
        )) {
            Button("OK") {
                errorMessage = nil
            }
        } message: {
            Text(errorMessage ?? "An error occurred while submitting your report.")
        }
    }
    
    private func submitReport() {
        isSubmitting = true
        
        guard let reason = selectedReason else {
            isSubmitting = false
            return
        }
        
        // Only send details if "Other" is selected and text is not empty
        let details = (reason == .other && !additionalDetails.isEmpty) ? additionalDetails : nil
        
        Task {
            do {
                try await APIService.shared.reportUser(
                    userId: userId,
                    reason: reason.apiValue,
                    details: details
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
    let reason: ReportUserView.ReportReason
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.square.fill" : "square")
                    .foregroundColor(isSelected ? .blue : .secondary)
                    .font(.title3)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reason.rawValue)
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
            .cornerRadius(10)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ReportUserView_Previews: PreviewProvider {
    static var previews: some View {
        ReportUserView(userId: 123, userName: "John Doe", context: "conversation")
    }
} 