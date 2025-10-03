import SwiftUI
import Charts

// MARK: - Quick Analytics Preview
struct QuickAnalyticsView: View {
    let analytics: AnalyticsData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Platform Overview")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                AnalyticsCard(
                    title: "Total Posts",
                    value: "\(analytics.totalPosts)",
                    icon: "doc.text",
                    color: .blue
                )
                
                AnalyticsCard(
                    title: "Active Users",
                    value: "\(analytics.activeUsers)",
                    icon: "person.2",
                    color: .green
                )
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(12)
    }
}

// MARK: - Platform Overview
struct PlatformOverviewView: View {
    let analytics: AnalyticsData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Platform Statistics")
                .font(.title2)
                .fontWeight(.bold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                AnalyticsCard(
                    title: "Total Posts",
                    value: "\(analytics.totalPosts)",
                    subtitle: "+\(analytics.postsToday) today",
                    icon: "doc.text",
                    color: .blue
                )
                
                AnalyticsCard(
                    title: "Total Messages",
                    value: "\(analytics.totalMessages)",
                    subtitle: String(format: "%d avg/day", analytics.messagesPerDay),
                    icon: "message",
                    color: .purple
                )
                
                AnalyticsCard(
                    title: "Active Users",
                    value: "\(analytics.activeUsers)",
                    subtitle: "+\(analytics.newUsersToday) new today",
                    icon: "person.2",
                    color: .green
                )
                
                AnalyticsCard(
                    title: "New Users Today",
                    value: "\(analytics.newUsersToday)",
                    subtitle: "Daily signups",
                    icon: "person.badge.plus",
                    color: .orange
                )
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(12)
    }
}

// MARK: - University Stats
struct UniversityStatsView: View {
    let universities: [AnalyticsData.UniversityStats]
    @State private var showingAllUniversities = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Top Universities")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                if !universities.isEmpty {
                    Button(action: {
                        showingAllUniversities = true
                    }) {
                        HStack(spacing: 4) {
                            Text("View All")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Image(systemName: "chevron.right")
                                .font(.caption)
                        }
                        .foregroundColor(.blue)
                    }
                }
            }
            
            if universities.isEmpty {
                Text("No university data available")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                VStack(spacing: 12) {
                    ForEach(Array(universities.prefix(5).enumerated()), id: \.element.id) { index, university in
                        UniversityRowView(
                            rank: index + 1,
                            university: university,
                            maxUserCount: universities.first?.userCount ?? 1
                        )
                    }
                }
                
                if universities.count > 5 {
                    Text("+ \(universities.count - 5) more universities")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 4)
                }
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(12)
        .sheet(isPresented: $showingAllUniversities) {
            AllUniversitiesView(universities: universities)
        }
    }
}

// MARK: - University Row
struct UniversityRowView: View {
    let rank: Int
    let university: AnalyticsData.UniversityStats
    let maxUserCount: Int
    
    var body: some View {
        HStack {
            // Rank
            Text("#\(rank)")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.secondary)
                .frame(width: 30)
            
            // University Info
            VStack(alignment: .leading, spacing: 4) {
                Text(university.name)
                    .font(.headline)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                
                HStack(spacing: 6) {
                    Text("ID: \(university.id)")
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                    
                    Text("\(university.userCount) \(university.userCount == 1 ? "user" : "users")")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Progress Bar
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(university.userCount)")
                    .font(.caption)
                    .fontWeight(.semibold)
                
                ProgressView(value: Double(university.userCount), total: Double(maxUserCount))
                    .frame(width: 60)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Content Trends
struct ContentTrendsView: View {
    let trends: [AnalyticsData.ContentTrend]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Content Trends (Last 7 Days)")
                .font(.title2)
                .fontWeight(.bold)
            
            if trends.isEmpty {
                Text("No trend data available")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                // Simple chart representation
                VStack(spacing: 8) {
                    ForEach(trends.suffix(7)) { trend in
                        HStack {
                            Text(formatDate(trend.date))
                                .font(.caption)
                                .frame(width: 60, alignment: .leading)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Rectangle()
                                        .fill(Color.blue)
                                        .frame(width: CGFloat(trend.posts) * 2, height: 8)
                                    Text("\(trend.posts) posts")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                                
                                HStack {
                                    Rectangle()
                                        .fill(Color.purple)
                                        .frame(width: CGFloat(trend.messages) * 0.5, height: 8)
                                    Text("\(trend.messages) messages")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(12)
    }
    
    private func formatDate(_ dateString: String) -> String {
        // Try ISO8601 format with fractional seconds (e.g., "2025-09-27T00:00:00.000Z")
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = isoFormatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "M/d"
            return displayFormatter.string(from: date)
        }
        
        // Try ISO8601 without fractional seconds
        isoFormatter.formatOptions = [.withInternetDateTime]
        if let date = isoFormatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "M/d"
            return displayFormatter.string(from: date)
        }
        
        // Fallback to simple date format (yyyy-MM-dd)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "M/d"
            return displayFormatter.string(from: date)
        }
        
        return dateString
    }
}

// MARK: - Report Reasons
struct ReportReasonsView: View {
    let reasons: [AnalyticsData.ReasonStats]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Reports by Reason")
                .font(.title2)
                .fontWeight(.bold)
            
            if reasons.isEmpty {
                Text("No report data available")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                VStack(spacing: 8) {
                    ForEach(reasons.sorted { $0.count > $1.count }) { reason in
                        HStack {
                            Text(reason.reason.capitalized)
                                .font(.subheadline)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            
                            Text("\(reason.count)")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
        .cornerRadius(12)
    }
}

// MARK: - Analytics Card
struct AnalyticsCard: View {
    let title: String
    let value: String
    let subtitle: String?
    let icon: String
    let color: Color
    
    init(title: String, value: String, subtitle: String? = nil, icon: String, color: Color) {
        self.title = title
        self.value = value
        self.subtitle = subtitle
        self.icon = icon
        self.color = color
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.title2)
                
                Spacer()
            }
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            if let subtitle = subtitle {
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(color)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            PlatformOverviewView(
                analytics: AnalyticsData(
                    totalPosts: 1250,
                    totalMessages: 8500,
                    activeUsers: 450,
                    newUsersToday: 12,
                    postsToday: 35,
                    messagesPerDay: 125,
                    topUniversities: [
                        AnalyticsData.UniversityStats(id: 1, name: "Cal Poly", userCount: 150),
                        AnalyticsData.UniversityStats(id: 2, name: "UC San Diego", userCount: 120),
                        AnalyticsData.UniversityStats(id: 3, name: "Stanford", userCount: 100)
                    ],
                    contentTrends: [],
                    reportsByReason: [
                        AnalyticsData.ReasonStats(reason: "spam", count: 15),
                        AnalyticsData.ReasonStats(reason: "harassment", count: 8),
                        AnalyticsData.ReasonStats(reason: "inappropriate_content", count: 5)
                    ],
                    userGrowth: []
                )
            )
            
            UniversityStatsView(
                universities: [
                    AnalyticsData.UniversityStats(id: 1, name: "Cal Poly", userCount: 150),
                    AnalyticsData.UniversityStats(id: 2, name: "UC San Diego", userCount: 120),
                    AnalyticsData.UniversityStats(id: 3, name: "Stanford", userCount: 100)
                ]
            )
        }
        .padding()
    }
} 