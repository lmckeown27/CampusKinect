import SwiftUI

struct AllUniversitiesView: View {
    let universities: [AnalyticsData.UniversityStats]
    @Environment(\.dismiss) private var dismiss
    @StateObject private var universitySwitcher = AdminUniversitySwitcher.shared
    
    var sortedUniversities: [AnalyticsData.UniversityStats] {
        universities.sorted { $0.userCount > $1.userCount }
    }
    
    var totalUsers: Int {
        universities.reduce(0) { $0 + $1.userCount }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Summary Card
                    VStack(spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Total Universities")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text("\(universities.count)")
                                    .font(.title)
                                    .fontWeight(.bold)
                            }
                            
                            Spacer()
                            
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("Total Users")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text("\(totalUsers)")
                                    .font(.title)
                                    .fontWeight(.bold)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGroupedBackground))
                    .cornerRadius(12)
                    
                    // Current Viewing Banner (if viewing a different university)
                    if let viewingId = universitySwitcher.currentViewingUniversityId,
                       let viewingName = universitySwitcher.currentViewingUniversityName {
                        HStack {
                            Image(systemName: "eye.fill")
                                .foregroundColor(.blue)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Currently Viewing")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Text(viewingName)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text("ID: \(viewingId)")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Button("Reset") {
                                universitySwitcher.clearViewingUniversity()
                            }
                            .font(.caption)
                            .foregroundColor(.red)
                        }
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    
                    // Universities List
                    VStack(spacing: 0) {
                        ForEach(Array(sortedUniversities.enumerated()), id: \.element.id) { index, university in
                            UniversityDetailRow(
                                rank: index + 1,
                                university: university,
                                totalUsers: totalUsers,
                                isCurrentlyViewing: university.id == universitySwitcher.currentViewingUniversityId
                            )
                            
                            if index < sortedUniversities.count - 1 {
                                Divider()
                                    .padding(.leading, 60)
                            }
                        }
                    }
                    .background(Color(.systemGroupedBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .background(Color(.systemBackground))
            .navigationTitle("All Universities")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - University Detail Row
struct UniversityDetailRow: View {
    let rank: Int
    let university: AnalyticsData.UniversityStats
    let totalUsers: Int
    let isCurrentlyViewing: Bool
    @StateObject private var universitySwitcher = AdminUniversitySwitcher.shared
    
    var percentage: Double {
        guard totalUsers > 0 else { return 0 }
        return (Double(university.userCount) / Double(totalUsers)) * 100
    }
    
    var body: some View {
        VStack(spacing: 0) {
        HStack(spacing: 16) {
            // Rank Badge
            ZStack {
                Circle()
                    .fill(rankColor.opacity(0.2))
                    .frame(width: 44, height: 44)
                
                Text("#\(rank)")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(rankColor)
            }
            
            // University Info
            VStack(alignment: .leading, spacing: 6) {
                Text(university.name)
                    .font(.headline)
                    .lineLimit(1)
                
                HStack(spacing: 4) {
                    Text("ID: \(university.id)")
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                    
                    Image(systemName: "person.2.fill")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Text("\(university.userCount) \(university.userCount == 1 ? "user" : "users")")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .foregroundColor(.secondary)
                    
                    Text(String(format: "%.1f%%", percentage))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // User Count and Progress
            VStack(alignment: .trailing, spacing: 6) {
                Text("\(university.userCount)")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                // Progress bar showing percentage of total
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color(.systemGray5))
                            .frame(height: 4)
                            .cornerRadius(2)
                        
                        Rectangle()
                            .fill(rankColor)
                            .frame(width: geometry.size.width * (percentage / 100), height: 4)
                            .cornerRadius(2)
                    }
                }
                .frame(width: 80, height: 4)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        
        // View University Button
        if !isCurrentlyViewing {
            Button(action: {
                print("🎓 Admin: Selected university ID \(university.id) - \(university.name)")
                universitySwitcher.setViewingUniversity(id: university.id, name: university.name)
                print("🎓 Admin: University switcher updated - currentViewingUniversityId = \(universitySwitcher.currentViewingUniversityId ?? -1)")
            }) {
                HStack {
                    Image(systemName: "eye")
                    Text("View This University's Feed")
                }
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.blue)
                .cornerRadius(8)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        } else {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text("Currently Viewing")
                    .fontWeight(.medium)
            }
            .font(.caption)
            .foregroundColor(.green)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(Color.green.opacity(0.1))
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        }
        }
    }
    
    private var rankColor: Color {
        switch rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .orange
        default: return .blue
        }
    }
}

#Preview {
    AllUniversitiesView(universities: [
        AnalyticsData.UniversityStats(id: 1, name: "Cal Poly", userCount: 1523),
        AnalyticsData.UniversityStats(id: 2, name: "UC Berkeley", userCount: 1245),
        AnalyticsData.UniversityStats(id: 3, name: "Stanford University", userCount: 987),
        AnalyticsData.UniversityStats(id: 4, name: "UCLA", userCount: 856),
        AnalyticsData.UniversityStats(id: 5, name: "USC", userCount: 734),
        AnalyticsData.UniversityStats(id: 6, name: "UC San Diego", userCount: 612),
        AnalyticsData.UniversityStats(id: 7, name: "UC Davis", userCount: 543),
        AnalyticsData.UniversityStats(id: 8, name: "UC Irvine", userCount: 498)
    ])
}

