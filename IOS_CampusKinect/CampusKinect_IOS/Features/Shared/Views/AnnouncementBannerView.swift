//
//  AnnouncementBannerView.swift
//  CampusKinect_IOS
//
//  Server-driven announcement banners
//

import SwiftUI

struct AnnouncementBannerView: View {
    let announcement: Announcement
    let onDismiss: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: iconForType(announcement.type))
                .font(.title3)
                .foregroundColor(colorForType(announcement.type))
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(announcement.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                
                Text(announcement.message)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Dismiss button
            if announcement.dismissible {
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(backgroundColorForType(announcement.type))
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private func iconForType(_ type: String) -> String {
        switch type {
        case "info": return "info.circle.fill"
        case "warning": return "exclamationmark.triangle.fill"
        case "error": return "xmark.circle.fill"
        case "success": return "checkmark.circle.fill"
        default: return "bell.fill"
        }
    }
    
    private func colorForType(_ type: String) -> Color {
        switch type {
        case "info": return .campusInfo
        case "warning": return .campusWarning
        case "error": return .campusError
        case "success": return .campusSuccess
        default: return .campusPrimary
        }
    }
    
    private func backgroundColorForType(_ type: String) -> Color {
        switch type {
        case "info": return Color.campusInfo.opacity(0.1)
        case "warning": return Color.campusWarning.opacity(0.1)
        case "error": return Color.campusError.opacity(0.1)
        case "success": return Color.campusSuccess.opacity(0.1)
        default: return Color.campusPrimary.opacity(0.1)
        }
    }
}

// MARK: - Announcement Manager
class AnnouncementManager: ObservableObject {
    static let shared = AnnouncementManager()
    
    @Published var activeAnnouncements: [Announcement] = []
    private var dismissedAnnouncementIds: Set<String> = []
    
    private init() {
        loadDismissedAnnouncements()
        refreshAnnouncements()
    }
    
    func refreshAnnouncements() {
        guard let config = ConfigurationService.shared.configuration else { return }
        
        // Filter out dismissed announcements
        activeAnnouncements = config.announcements.filter { announcement in
            !dismissedAnnouncementIds.contains(announcement.id)
        }.sorted { $0.priority > $1.priority }
    }
    
    func dismissAnnouncement(_ id: String) {
        dismissedAnnouncementIds.insert(id)
        saveDismissedAnnouncements()
        activeAnnouncements.removeAll { $0.id == id }
    }
    
    private func loadDismissedAnnouncements() {
        if let ids = UserDefaults.standard.array(forKey: "dismissedAnnouncements") as? [String] {
            dismissedAnnouncementIds = Set(ids)
        }
    }
    
    private func saveDismissedAnnouncements() {
        UserDefaults.standard.set(Array(dismissedAnnouncementIds), forKey: "dismissedAnnouncements")
    }
}

#Preview {
    AnnouncementBannerView(
        announcement: Announcement(
            id: "test",
            type: "info",
            title: "New Feature!",
            message: "Check out our new messaging system",
            dismissible: true,
            priority: 1
        ),
        onDismiss: {}
    )
}

