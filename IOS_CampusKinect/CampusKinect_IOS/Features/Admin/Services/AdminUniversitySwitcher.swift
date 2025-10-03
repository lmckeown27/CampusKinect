import Foundation
import Combine

/// Service to manage admin's current viewing university context
class AdminUniversitySwitcher: ObservableObject {
    static let shared = AdminUniversitySwitcher()
    
    @Published var currentViewingUniversityId: Int?
    @Published var currentViewingUniversityName: String?
    
    private let userDefaults = UserDefaults.standard
    private let viewingUniversityKey = "admin_viewing_university_id"
    private let viewingUniversityNameKey = "admin_viewing_university_name"
    
    private init() {
        // Load saved viewing university on init
        loadSavedUniversity()
    }
    
    /// Set the university the admin wants to view
    func setViewingUniversity(id: Int, name: String) {
        currentViewingUniversityId = id
        currentViewingUniversityName = name
        
        // Save to UserDefaults
        userDefaults.set(id, forKey: viewingUniversityKey)
        userDefaults.set(name, forKey: viewingUniversityNameKey)
        
        print("🎓 Admin switched to viewing university: \(name) (ID: \(id))")
    }
    
    /// Clear viewing university (return to own university)
    func clearViewingUniversity() {
        currentViewingUniversityId = nil
        currentViewingUniversityName = nil
        
        userDefaults.removeObject(forKey: viewingUniversityKey)
        userDefaults.removeObject(forKey: viewingUniversityNameKey)
        
        print("🎓 Admin returned to own university view")
    }
    
    /// Check if admin is currently viewing a different university
    var isViewingDifferentUniversity: Bool {
        return currentViewingUniversityId != nil
    }
    
    private func loadSavedUniversity() {
        if let id = userDefaults.object(forKey: viewingUniversityKey) as? Int,
           let name = userDefaults.string(forKey: viewingUniversityNameKey) {
            currentViewingUniversityId = id
            currentViewingUniversityName = name
            print("🎓 Loaded saved viewing university: \(name) (ID: \(id))")
        }
    }
}

