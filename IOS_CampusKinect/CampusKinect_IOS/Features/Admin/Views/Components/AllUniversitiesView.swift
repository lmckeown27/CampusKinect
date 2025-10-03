import SwiftUI

struct AllUniversitiesView: View {
    let universities: [AnalyticsData.UniversityStats]
    @Environment(\.dismiss) private var dismiss
    
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
                    
                    // Universities List
                    VStack(spacing: 0) {
                        ForEach(Array(sortedUniversities.enumerated()), id: \.element.id) { index, university in
                            UniversityDetailRow(
                                rank: index + 1,
                                university: university,
                                totalUsers: totalUsers
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
    
    var percentage: Double {
        guard totalUsers > 0 else { return 0 }
        return (Double(university.userCount) / Double(totalUsers)) * 100
    }
    
    var body: some View {
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
                    Image(systemName: "person.2.fill")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Text("\(university.userCount) users")
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
        AnalyticsData.UniversityStats(name: "Cal Poly", userCount: 1523),
        AnalyticsData.UniversityStats(name: "UC Berkeley", userCount: 1245),
        AnalyticsData.UniversityStats(name: "Stanford University", userCount: 987),
        AnalyticsData.UniversityStats(name: "UCLA", userCount: 856),
        AnalyticsData.UniversityStats(name: "USC", userCount: 734),
        AnalyticsData.UniversityStats(name: "UC San Diego", userCount: 612),
        AnalyticsData.UniversityStats(name: "UC Davis", userCount: 543),
        AnalyticsData.UniversityStats(name: "UC Irvine", userCount: 498)
    ])
}

