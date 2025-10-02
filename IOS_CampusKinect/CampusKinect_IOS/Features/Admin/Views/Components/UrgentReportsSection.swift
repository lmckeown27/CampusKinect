import SwiftUI

struct UrgentReportsSection: View {
    let reports: [ContentReport]
    let onReportTap: (ContentReport) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                
                Text("Urgent Reports")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                Text("\(reports.count)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.red)
                    )
                    .foregroundColor(.white)
            }
            
            VStack(spacing: 8) {
                ForEach(reports.prefix(3)) { report in
                    UrgentReportRow(report: report) {
                        onReportTap(report)
                    }
                }
                
                if reports.count > 3 {
                    Button("View All \(reports.count) Urgent Reports") {
                        // This would navigate to the full reports list
                    }
                    .font(.caption)
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 4)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.red.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

struct UrgentReportRow: View {
    let report: ContentReport
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: report.contentType.iconName)
                    .font(.title3)
                    .foregroundColor(.blue)
                    .frame(width: 20, height: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(report.contentTitle)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                    
                    HStack {
                        ReasonBadge(reason: report.reason)
                        
                        Spacer()
                        
                        Text(report.timeRemainingText)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(report.isOverdue ? .red : .orange)
                    }
                }
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }
}

struct RecentReportsSection: View {
    let reports: [ContentReport]
    let onReportTap: (ContentReport) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "clock.fill")
                    .foregroundColor(.blue)
                
                Text("Recent Reports")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button("View All") {
                    // Navigate to full reports list
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            VStack(spacing: 8) {
                ForEach(reports) { report in
                    RecentReportRow(report: report) {
                        onReportTap(report)
                    }
                }
                
                if reports.isEmpty {
                    Text("No recent reports")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding()
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        )
    }
}

struct RecentReportRow: View {
    let report: ContentReport
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: report.contentType.iconName)
                    .font(.title3)
                    .foregroundColor(.blue)
                    .frame(width: 20, height: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(report.contentTitle)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                    
                    HStack {
                        ReasonBadge(reason: report.reason)
                        
                        Text("•")
                            .foregroundColor(.secondary)
                            .font(.caption)
                        
                        Text(formatRelativeTime(report.createdAt))
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                    }
                }
                
                TimeRemainingBadge(report: report)
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }
    
    private func formatRelativeTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "Unknown" }
        
        let now = Date()
        let timeInterval = now.timeIntervalSince(date)
        
        if timeInterval < 3600 { // Less than 1 hour
            let minutes = Int(timeInterval / 60)
            return "\(minutes)m ago"
        } else if timeInterval < 86400 { // Less than 1 day
            let hours = Int(timeInterval / 3600)
            return "\(hours)h ago"
        } else {
            let days = Int(timeInterval / 86400)
            return "\(days)d ago"
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            UrgentReportsSection(
                reports: [
                    ContentReport(
                        id: 1,
                        reporterId: 101,
                        reportedUserId: 201,
                        contentId: "301",
                        contentType: .post,
                        reason: .harassment,
                        details: "Urgent harassment case",
                        status: .pending,
                        moderatorId: nil,
                        moderatorNotes: nil,
                        createdAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-3 * 3600)),
                        resolvedAt: nil,
                        reporterUsername: "reporter1",
                        reporterDisplayName: "Reporter One",
                        reportedUsername: "baduser1",
                        reportedDisplayName: "Bad User One",
                        postTitle: "CS 101 Tutoring",
                        postDescription: "Need help with CS 101 homework. Will pay $20/hour for tutoring. Must know Python and data structures.",
                        postImageUrl: nil,
                        messageContent: nil,
                        conversationHistory: nil
                    )
                ],
                onReportTap: { _ in }
            )
            
            RecentReportsSection(
                reports: [
                    ContentReport(
                        id: 2,
                        reporterId: 102,
                        reportedUserId: 202,
                        contentId: "302",
                        contentType: .message,
                        reason: .spam,
                        details: "Spam message",
                        status: .pending,
                        moderatorId: nil,
                        moderatorNotes: nil,
                        createdAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-1 * 3600)),
                        resolvedAt: nil,
                        reporterUsername: "reporter2",
                        reporterDisplayName: "Reporter Two",
                        reportedUsername: "spammer",
                        reportedDisplayName: "Spammer User",
                        postTitle: nil,
                        postDescription: nil,
                        postImageUrl: nil,
                        messageContent: "Buy my product now! Click here for amazing deals!",
                        conversationHistory: nil
                    )
                ],
                onReportTap: { _ in }
            )
        }
        .padding()
    }
} 