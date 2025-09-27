import SwiftUI
import Combine

struct ReportDetailView: View {
    let report: ContentReport
    let viewModel: AdminDashboardViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showingActionSheet = false
    @State private var moderatorNotes = ""
    @State private var selectedAction: ModerationAction.ActionType?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Report Header
                    reportHeader
                    
                    Divider()
                    
                    // Report Details
                    reportDetails
                    
                    Divider()
                    
                    // User Information
                    userInformation
                    
                    Divider()
                    
                    // Moderator Notes Section
                    moderatorNotesSection
                    
                    // Action Buttons
                    actionButtons
                }
                .padding()
            }
            .navigationTitle("Report Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .confirmationDialog(
                "Moderate Report",
                isPresented: $showingActionSheet,
                titleVisibility: .visible
            ) {
                Button("Dismiss Report") {
                    selectedAction = .dismiss
                    handleModerationAction()
                }
                
                Button("Remove Post", role: .destructive) {
                    selectedAction = .removePost
                    handleModerationAction()
                }
                
                Button("Ban User", role: .destructive) {
                    selectedAction = .banUser
                    handleModerationAction()
                }
                
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Choose an action for this report. This action cannot be undone.")
            }
        }
    }
    
    // MARK: - Report Header
    private var reportHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: report.contentType.iconName)
                    .font(.title)
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Report #\(String(report.id.suffix(8)))")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(report.contentType.displayName)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                TimeRemainingBadge(report: report)
            }
            
            // Urgency Alert
            if report.isOverdue || report.isUrgent {
                HStack {
                    Image(systemName: report.isOverdue ? "exclamationmark.triangle.fill" : "clock.fill")
                        .foregroundColor(report.isOverdue ? .red : .orange)
                    
                    Text(report.isOverdue ? "This report is overdue and requires immediate attention!" : "This report is urgent and needs attention soon.")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(report.isOverdue ? .red : .orange)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill((report.isOverdue ? Color.red : Color.orange).opacity(0.1))
                )
            }
        }
    }
    
    // MARK: - Report Details
    private var reportDetails: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Report Information")
                .font(.headline)
            
            DetailRow(title: "Reason", value: report.reason.displayName) {
                ReasonBadge(reason: report.reason)
            }
            
            DetailRow(title: "Status", value: report.status.displayName) {
                StatusBadge(status: report.status)
            }
            
            DetailRow(title: "Reported At", value: formatFullDate(report.createdAt))
            
            if let details = report.details, !details.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Additional Details")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text(details)
                        .font(.body)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(.systemGray6))
                        )
                }
            }
        }
    }
    
    // MARK: - User Information
    private var userInformation: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("User Information")
                .font(.headline)
            
            // Reporter Info
            VStack(alignment: .leading, spacing: 8) {
                Text("Reporter")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                HStack {
                    Image(systemName: "person.circle")
                        .foregroundColor(.blue)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(report.reporterDisplayName ?? "Unknown User")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        if let username = report.reporterUsername {
                            Text("@\(username)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(.systemGray6))
                )
            }
            
            // Reported User Info
            VStack(alignment: .leading, spacing: 8) {
                Text("Reported User")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                HStack {
                    Image(systemName: "person.circle.fill")
                        .foregroundColor(.red)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(report.reportedDisplayName ?? "Unknown User")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        if let username = report.reportedUsername {
                            Text("@\(username)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.red.opacity(0.1))
                )
            }
        }
    }
    
    // MARK: - Moderator Notes Section
    private var moderatorNotesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Moderator Notes")
                .font(.headline)
            
            Text("Add notes about your moderation decision (optional)")
                .font(.caption)
                .foregroundColor(.secondary)
            
            TextField("Enter your notes here...", text: $moderatorNotes)
                .textFieldStyle(.roundedBorder)
                .lineLimit(5)
        }
    }
    
    // MARK: - Action Buttons
    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Dismiss Report
            Button(action: {
                selectedAction = .dismiss
                showingActionSheet = true
            }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                    Text("Dismiss Report")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(viewModel.isLoadingAction)
            
            // Remove Post
            Button(action: {
                selectedAction = .removePost
                showingActionSheet = true
            }) {
                HStack {
                    Image(systemName: "doc.text.fill")
                    Text("Remove Post")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.orange)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(viewModel.isLoadingAction)
            
            // Ban User
            Button(action: {
                selectedAction = .banUser
                showingActionSheet = true
            }) {
                HStack {
                    Image(systemName: "person.fill.xmark")
                    Text("Ban User")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(viewModel.isLoadingAction)
            
            if viewModel.isLoadingAction {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Processing...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
            }
        }
    }
    
    // MARK: - Helper Methods
    private func handleModerationAction() {
        guard let action = selectedAction else { return }
        
        let notes = moderatorNotes.isEmpty ? nil : moderatorNotes
        
        // Call the moderation method
        viewModel.handleReportModeration(report, action: action, notes: notes)
        
        // Close the detail view
        dismiss()
    }
    
    private func formatFullDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .full
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
}

// MARK: - Supporting Views
struct DetailRow<Content: View>: View {
    let title: String
    let value: String
    let content: (() -> Content)?
    
    init(title: String, value: String, @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.value = value
        self.content = content
    }
    
    init(title: String, value: String) where Content == EmptyView {
        self.title = title
        self.value = value
        self.content = nil
    }
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            
            Spacer()
            
            if let content = content {
                content()
            } else {
                Text(value)
                    .font(.body)
            }
        }
    }
}

struct StatusBadge: View {
    let status: ContentReport.ReportStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(statusColor.opacity(0.2))
            )
            .foregroundColor(statusColor)
    }
    
    private var statusColor: Color {
        switch status {
        case .pending: return .orange
        case .reviewed: return .blue
        case .resolved: return .green
        case .dismissed: return .gray
        }
    }
}

#Preview {
    ReportDetailView(
        report: ContentReport(
            id: "12345678",
            reporterId: "reporter1",
            reportedUserId: "user1",
            contentId: "post1",
            contentType: .post,
            reason: .harassment,
            details: "This user is posting threatening messages and making other users uncomfortable. The content violates our community guidelines.",
            status: .pending,
            moderatorId: nil,
            moderatorNotes: nil,
            createdAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-2 * 3600)),
            resolvedAt: nil,
            reporterUsername: "reporter_user",
            reporterDisplayName: "Reporter User",
            reportedUsername: "bad_user",
            reportedDisplayName: "Bad User"
        ),
        viewModel: AdminDashboardViewModel()
    )
} 
 