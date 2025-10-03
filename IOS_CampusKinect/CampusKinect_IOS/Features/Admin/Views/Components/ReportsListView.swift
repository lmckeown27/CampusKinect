import SwiftUI

struct ReportsListView: View {
    let reports: [ContentReport]
    let isLoading: Bool
    let onReportTap: (ContentReport) -> Void
    let onLoadMore: () -> Void
    let hasMore: Bool
    
    var body: some View {
        print("🔍 ReportsListView: reports.count = \(reports.count), isLoading = \(isLoading)")
        print("🔍 ReportsListView: Will show EmptyReportsView = \(reports.isEmpty && !isLoading)")
        
        return List {
            if reports.isEmpty && !isLoading {
                EmptyReportsView()
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
            } else {
                ForEach(reports) { report in
                    ReportRowView(report: report) {
                        onReportTap(report)
                    }
                    .onAppear {
                        // Load more when reaching the last few items
                        if report.id == reports.last?.id && hasMore {
                            onLoadMore()
                        }
                    }
                }
                
                if hasMore {
                    LoadMoreView()
                        .listRowSeparator(.hidden)
                        .onAppear {
                            onLoadMore()
                        }
                }
            }
        }
        .listStyle(.plain)
        .overlay {
            if isLoading && reports.isEmpty {
                ReportsLoadingView()
            }
        }
    }
}

// MARK: - Report Row View
struct ReportRowView: View {
    let report: ContentReport
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Content Type Icon
                Image(systemName: report.contentType.iconName)
                    .font(.title2)
                    .foregroundColor(.blue)
                    .frame(width: 24, height: 24)
                
                VStack(alignment: .leading, spacing: 4) {
                    // Report Header
                    HStack {
                        Text(report.contentTitle)
                            .font(.headline)
                            .foregroundColor(.primary)
                            .lineLimit(2)
                        
                        Spacer()
                        
                        // Time Remaining Badge
                        TimeRemainingBadge(report: report)
                    }
                    
                    // Report Details
                    HStack {
                        ReasonBadge(reason: report.primaryReason)
                        
                        Text("•")
                            .foregroundColor(.secondary)
                        
                        Text(report.contentType.displayName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                    }
                    
                    // Reported User Info
                    if let reportedDisplayName = report.reportedDisplayName {
                        Text("User: \(reportedDisplayName)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // Creation Date
                    Text(formatDate(report.createdAt))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Spacer(minLength: 0)
                
                // Chevron
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .background(backgroundView)
        .overlay(overlayView)
    }
    
    private var backgroundView: some View {
        let fillColor: Color = (report.isUrgent || report.isOverdue) ? Color.red.opacity(0.1) : Color.clear
        return RoundedRectangle(cornerRadius: 8)
            .fill(fillColor)
    }
    
    private var overlayView: some View {
        let strokeColor: Color = report.isOverdue ? Color.red : Color.clear
        return RoundedRectangle(cornerRadius: 8)
            .stroke(strokeColor, lineWidth: 1)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .short
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
}

// MARK: - Time Remaining Badge
struct TimeRemainingBadge: View {
    let report: ContentReport
    
    var body: some View {
        HStack(spacing: 4) {
            if report.isOverdue {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.caption2)
            } else if report.isUrgent {
                Image(systemName: "clock.fill")
                    .font(.caption2)
            }
            
            Text(report.timeRemainingText)
                .font(.caption)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(badgeColor)
        )
        .foregroundColor(textColor)
    }
    
    private var badgeColor: Color {
        if report.isOverdue {
            return .red
        } else if report.isUrgent {
            return .orange
        } else {
            return .blue
        }
    }
    
    private var textColor: Color {
        return .white
    }
}

// MARK: - Reason Badge
struct ReasonBadge: View {
    let reason: ContentReport.ReportReason
    
    var body: some View {
        Text(reason.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(reasonColor.opacity(0.2))
            )
            .foregroundColor(reasonColor)
    }
    
    private var reasonColor: Color {
        switch reason.color {
        case "red": return .red
        case "orange": return .orange
        case "purple": return .purple
        case "yellow": return .yellow
        default: return .gray
        }
    }
}

// MARK: - Empty Reports View
struct EmptyReportsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.shield")
                .font(.system(size: 50))
                .foregroundColor(.green)
            
            Text("No Pending Reports")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("All content reports have been resolved. Great job maintaining platform safety!")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Reports Loading View
struct ReportsLoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            
            Text("Loading reports...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Load More View
struct LoadMoreView: View {
    var body: some View {
        HStack {
            Spacer()
            ProgressView()
                .scaleEffect(0.8)
            Text("Loading more reports...")
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
        }
        .padding()
    }
}

#Preview {
    NavigationView {
        ReportsListView(
            reports: [
                ContentReport(
                    id: 1,
                    reporterId: 101,
                    reportedUserId: 201,
                    contentId: "301",
                    contentType: .post,
                    reason: "harassment",
                    details: "This user is sending threatening messages",
                    status: .pending,
                    moderatorId: nil,
                    moderatorNotes: nil,
                    createdAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-2 * 3600)),
                    resolvedAt: nil,
                    reporterUsername: "reporter_user",
                    reporterDisplayName: "Reporter User",
                    reportedUsername: "bad_user",
                    reportedDisplayName: "Bad User",
                    postTitle: "Roommate Needed - Spring Semester",
                    postDescription: "Looking for a roommate for Spring semester. 2BR apartment near campus. $600/month utilities included. Must be clean and quiet.",
                    postImageUrl: nil,
                    messageContent: nil,
                    conversationHistory: nil,
                    isReporterPostOwner: nil
                )
            ],
            isLoading: false,
            onReportTap: { _ in },
            onLoadMore: { },
            hasMore: false
        )
        .navigationTitle("Reports")
    }
} 