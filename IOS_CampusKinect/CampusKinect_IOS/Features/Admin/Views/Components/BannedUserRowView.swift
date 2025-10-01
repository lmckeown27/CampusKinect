import SwiftUI

struct BannedUserRowView: View {
    let user: BannedUser
    let onUnban: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // User Info Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(user.username)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(user.email)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Unban Button
                Button("Unban") {
                    onUnban()
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .tint(.green)
            }
            
            // University and Ban Info
            HStack {
                Label(user.university, systemImage: "building.2")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("\(user.daysSinceBan) days ago")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Ban Reason
            if !user.banReason.isEmpty {
                Text("Reason: \(user.banReason)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(4)
            }
            
            // Ban Date
            Text("Banned: \(user.formattedBanDate)")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    List {
        BannedUserRowView(
            user: BannedUser(
                id: 1,
                username: "testuser",
                email: "test@example.com",
                bannedAt: "2024-01-15T10:30:00Z",
                banReason: "Harassment and inappropriate content",
                university: "Cal Poly",
                banUntil: nil,
                banType: "permanent"
            ),
            onUnban: {}
        )
        
        BannedUserRowView(
            user: BannedUser(
                id: 2,
                username: "spammer123",
                email: "spam@example.com",
                bannedAt: "2024-01-10T15:45:00Z",
                banReason: "Spam",
                university: "UC San Diego",
                banUntil: "2024-02-10T15:45:00Z",
                banType: "temporary"
            ),
            onUnban: {}
        )
    }
} 