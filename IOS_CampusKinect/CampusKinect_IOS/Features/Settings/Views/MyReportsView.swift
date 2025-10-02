//
//  MyReportsView.swift
//  CampusKinect_IOS
//
//  Created for viewing user's submitted reports
//

import SwiftUI

struct MyReportsView: View {
    @StateObject private var viewModel = MyReportsViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.reports.isEmpty {
                    ProgressView("Loading your reports...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.reports.isEmpty {
                    EmptyReportsView()
                } else {
                    List {
                        ForEach(viewModel.reports) { report in
                            ReportRow(report: report)
                        }
                    }
                }
            }
            .navigationTitle("My Reports")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                viewModel.loadReports()
            }
            .refreshable {
                await viewModel.refreshReports()
            }
        }
    }
}

struct ReportRow: View {
    let report: UserReport
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                // Status badge
                StatusBadge(status: report.status)
                
                Spacer()
                
                // Date
                Text(report.createdAt.timeAgoDisplay)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Content type
            HStack(spacing: 6) {
                Image(systemName: report.contentType.icon)
                    .font(.caption)
                    .foregroundColor(.blue)
                Text(report.contentType.displayName)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            // Reason
            Text("Reason: \(report.reason.displayName)")
                .font(.caption)
                .foregroundColor(.secondary)
            
            // Details if available
            if let details = report.details, !details.isEmpty {
                Text(details)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            // Moderator notes if resolved
            if report.status != .pending, let notes = report.moderatorNotes, !notes.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Admin Response:")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.blue)
                    
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(8)
                        .background(Color(.systemGray6))
                        .cornerRadius(6)
                }
                .padding(.top, 4)
            }
            
            // Resolved date if applicable
            if let resolvedAt = report.resolvedAt {
                Text("Resolved \(resolvedAt.timeAgoDisplay)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

struct StatusBadge: View {
    let status: ReportStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(status.color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(status.color.opacity(0.15))
            .cornerRadius(6)
    }
}

struct EmptyReportsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("No Reports")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("You haven't submitted any reports yet. When you report content, you can track its status here.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Models

struct UserReport: Identifiable, Codable {
    let id: Int
    let contentId: String
    let contentType: ContentType
    let reason: ReportReason
    let details: String?
    let status: ReportStatus
    let createdAt: Date
    let resolvedAt: Date?
    let moderatorNotes: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case contentId = "content_id"
        case contentType = "content_type"
        case reason
        case details
        case status
        case createdAt = "created_at"
        case resolvedAt = "resolved_at"
        case moderatorNotes = "moderator_notes"
    }
    
    enum ContentType: String, Codable {
        case post
        case message
        case user
        
        var displayName: String {
            switch self {
            case .post: return "Post"
            case .message: return "Chat"
            case .user: return "User"
            }
        }
        
        var icon: String {
            switch self {
            case .post: return "doc.text"
            case .message: return "message"
            case .user: return "person"
            }
        }
    }
    
    enum ReportReason: String, Codable {
        case harassment
        case hate_speech
        case spam
        case inappropriate_content
        case scam
        case violence
        case sexual_content
        case false_information
        case other
        
        var displayName: String {
            switch self {
            case .harassment: return "Harassment"
            case .hate_speech: return "Hate Speech"
            case .spam: return "Spam"
            case .inappropriate_content: return "Inappropriate Content"
            case .scam: return "Scam"
            case .violence: return "Violence"
            case .sexual_content: return "Sexual Content"
            case .false_information: return "False Information"
            case .other: return "Other"
            }
        }
    }
}

enum ReportStatus: String, Codable {
    case pending
    case reviewed
    case resolved
    case dismissed
    
    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .reviewed: return "Under Review"
        case .resolved: return "Resolved"
        case .dismissed: return "Dismissed"
        }
    }
    
    var color: Color {
        switch self {
        case .pending: return .orange
        case .reviewed: return .blue
        case .resolved: return .green
        case .dismissed: return .gray
        }
    }
}

// MARK: - ViewModel

@MainActor
class MyReportsViewModel: ObservableObject {
    @Published var reports: [UserReport] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiService = APIService.shared
    
    func loadReports() {
        guard !isLoading else { return }
        
        isLoading = true
        error = nil
        
        Task {
            do {
                let fetchedReports = try await apiService.getMyReports()
                self.reports = fetchedReports
            } catch {
                self.error = error.localizedDescription
                print("Failed to load reports: \(error)")
            }
            self.isLoading = false
        }
    }
    
    func refreshReports() async {
        do {
            let fetchedReports = try await apiService.getMyReports()
            self.reports = fetchedReports
        } catch {
            self.error = error.localizedDescription
            print("Failed to refresh reports: \(error)")
        }
    }
}

#Preview {
    MyReportsView()
} 