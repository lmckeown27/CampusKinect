import SwiftUI

// MARK: - Admin Stats Grid View (iPhone Dashboard)
struct AdminStatsGridView: View {
    let stats: ModerationStats
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            StatCard(
                title: "Pending Reports",
                value: "\(stats.pendingReports)",
                icon: "flag.fill",
                color: .orange,
                isUrgent: stats.pendingReports > 0
            )
            
            StatCard(
                title: "Resolved Today",
                value: "\(stats.resolvedToday)",
                icon: "checkmark.circle.fill",
                color: .green
            )
            
            StatCard(
                title: "Avg Response Time",
                value: stats.averageResponseTimeText,
                icon: "clock.fill",
                color: .blue
            )
            
            StatCard(
                title: "Banned Users",
                value: "\(stats.bannedUsers)",
                icon: "person.slash.fill",
                color: .red
            )
        }
    }
}

// MARK: - Admin Stats Header View (iPad Sidebar)
struct AdminStatsHeaderView: View {
    let stats: ModerationStats
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Moderation Overview")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            HStack(spacing: 12) {
                CompactStatCard(
                    title: "Pending",
                    value: "\(stats.pendingReports)",
                    color: .orange,
                    isUrgent: stats.pendingReports > 0
                )
                
                CompactStatCard(
                    title: "Resolved",
                    value: "\(stats.resolvedToday)",
                    color: .green
                )
                
                CompactStatCard(
                    title: "Avg Time",
                    value: stats.averageResponseTimeText,
                    color: .blue
                )
            }
        }
    }
}

// MARK: - Admin Stats Detail View (iPhone Statistics Tab)
struct AdminStatsDetailView: View {
    let stats: ModerationStats
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            VStack(spacing: 8) {
                Text("Moderation Statistics")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Apple Guideline 1.2 Compliance Dashboard")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Main Stats
            VStack(spacing: 16) {
                DetailedStatCard(
                    title: "Pending Reports",
                    value: "\(stats.pendingReports)",
                    subtitle: "Require action within 24 hours",
                    icon: "flag.fill",
                    color: .orange,
                    isUrgent: stats.pendingReports > 0
                )
                
                DetailedStatCard(
                    title: "Resolved Today",
                    value: "\(stats.resolvedToday)",
                    subtitle: "Reports handled in last 24 hours",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                DetailedStatCard(
                    title: "Average Response Time",
                    value: stats.averageResponseTimeText,
                    subtitle: "Time to resolve reports",
                    icon: "clock.fill",
                    color: .blue
                )
            }
            
            Divider()
            
            // User Stats
            VStack(spacing: 16) {
                Text("User Statistics")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HStack(spacing: 16) {
                    UserStatCard(
                        title: "Total Users",
                        value: "\(stats.totalUsers)",
                        icon: "person.3.fill",
                        color: .blue
                    )
                    
                    UserStatCard(
                        title: "Banned Users",
                        value: "\(stats.bannedUsers)",
                        icon: "person.slash.fill",
                        color: .red
                    )
                }
            }
            
            // Compliance Status
            ComplianceStatusView(stats: stats)
        }
    }
}

// MARK: - Stat Card Components
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    var isUrgent: Bool = false
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
                
                if isUrgent {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isUrgent ? Color.red : Color.clear, lineWidth: 2)
        )
    }
}

struct CompactStatCard: View {
    let title: String
    let value: String
    let color: Color
    var isUrgent: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(color.opacity(0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isUrgent ? Color.red : Color.clear, lineWidth: 1)
        )
    }
}

struct DetailedStatCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color
    var isUrgent: Bool = false
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)
                .frame(width: 40, height: 40)
                .background(
                    Circle()
                        .fill(color.opacity(0.1))
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(value)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(color)
                
                if isUrgent {
                    HStack(spacing: 4) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption2)
                        Text("Action Required")
                            .font(.caption2)
                    }
                    .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isUrgent ? Color.red : Color.clear, lineWidth: 2)
        )
    }
}

struct UserStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        )
    }
}

// MARK: - Compliance Status View
struct ComplianceStatusView: View {
    let stats: ModerationStats
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Apple Guideline 1.2 Compliance")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 8) {
                ComplianceRow(
                    title: "24-Hour Response",
                    status: stats.averageResponseTime <= 24 ? .compliant : .warning,
                    detail: "Avg: \(stats.averageResponseTimeText)"
                )
                
                ComplianceRow(
                    title: "Pending Reports",
                    status: stats.pendingReports == 0 ? .compliant : .actionRequired,
                    detail: "\(stats.pendingReports) pending"
                )
                
                ComplianceRow(
                    title: "Daily Activity",
                    status: stats.resolvedToday > 0 ? .compliant : .neutral,
                    detail: "\(stats.resolvedToday) resolved today"
                )
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
        }
    }
}

struct ComplianceRow: View {
    let title: String
    let status: ComplianceStatus
    let detail: String
    
    enum ComplianceStatus {
        case compliant, warning, actionRequired, neutral
        
        var color: Color {
            switch self {
            case .compliant: return .green
            case .warning: return .orange
            case .actionRequired: return .red
            case .neutral: return .gray
            }
        }
        
        var icon: String {
            switch self {
            case .compliant: return "checkmark.circle.fill"
            case .warning: return "exclamationmark.triangle.fill"
            case .actionRequired: return "exclamationmark.circle.fill"
            case .neutral: return "circle.fill"
            }
        }
    }
    
    var body: some View {
        HStack {
            Image(systemName: status.icon)
                .foregroundColor(status.color)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(detail)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            AdminStatsGridView(stats: ModerationStats(
                pendingReports: 3,
                resolvedToday: 12,
                averageResponseTime: 2.5,
                totalUsers: 1250,
                bannedUsers: 8
            ))
            .padding()
            
            Divider()
            
            AdminStatsDetailView(stats: ModerationStats(
                pendingReports: 3,
                resolvedToday: 12,
                averageResponseTime: 2.5,
                totalUsers: 1250,
                bannedUsers: 8
            ))
            .padding()
        }
    }
} 