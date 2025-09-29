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
    
    @Environment(\.dismiss) private var dismiss
    @State private var selectedReason = ReportReason.spam
    @State private var additionalDetails = ""
    @State private var isSubmitting = false
    @State private var showingSuccessAlert = false
    @State private var errorMessage: String?
    
    enum ReportReason: String, CaseIterable {
        case spam = "Spam"
        case harassment = "Harassment"
        case inappropriate = "Inappropriate Content"
        case scam = "Scam or Fraud"
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
            case .other:
                return "Other reason (please specify below)"
            }
        }
    }
    
    var body: some View {
        NavigationView {
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
                    
                    Text("Help us keep CampusKinect safe by reporting users who violate our community guidelines.")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(Color(.systemGray6))
                
                // Form
                Form {
                    Section("Reason for Report") {
                        ForEach(ReportReason.allCases, id: \.self) { reason in
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Button(action: {
                                        selectedReason = reason
                                    }) {
                                        HStack {
                                            Image(systemName: selectedReason == reason ? "checkmark.circle.fill" : "circle")
                                                .foregroundColor(selectedReason == reason ? .blue : .gray)
                                            
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(reason.rawValue)
                                                    .font(.body)
                                                    .foregroundColor(.primary)
                                                
                                                Text(reason.description)
                                                    .font(.caption)
                                                    .foregroundColor(.secondary)
                                            }
                                            
                                            Spacer()
                                        }
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    
                    Section("Additional Details (Optional)") {
                        TextField("Provide more context about this report...", text: $additionalDetails, axis: .vertical)
                            .lineLimit(3...6)
                    }
                }
                
                // Submit Button
                VStack(spacing: 16) {
                    Button(action: submitReport) {
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
                        .background(isSubmitting ? Color.gray : Color.red)
                        .cornerRadius(12)
                    }
                    .disabled(isSubmitting)
                    .padding(.horizontal, 20)
                    
                    Text("Reports are reviewed by our moderation team within 24 hours.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }
                .padding(.bottom, 20)
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
        .alert("Report Submitted", isPresented: $showingSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Thank you for your report. Our moderation team will review it shortly.")
        }
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
        
        Task {
            do {
                try await APIService.shared.reportUser(
                    userId: userId,
                    reason: selectedReason.rawValue,
                    details: additionalDetails.isEmpty ? nil : additionalDetails
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

struct ReportUserView_Previews: PreviewProvider {
    static var previews: some View {
        ReportUserView(userId: 123, userName: "John Doe")
    }
} 