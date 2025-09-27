import Foundation

class TermsOfServiceManager: ObservableObject {
    static let shared = TermsOfServiceManager()
    
    @Published var shouldShowTerms = false
    
    // CRITICAL: Prevent rapid state changes that could cause auto-dismissal
    private var isCheckingTerms = false
    
    private let userDefaults = UserDefaults.standard
    private let hasAcceptedTermsKey = "hasAcceptedTerms"
    private let shouldRememberChoiceKey = "shouldRememberTermsChoice"
    private let termsVersionKey = "acceptedTermsVersion"
    
    // Current terms version - increment when terms are updated
    private let currentTermsVersion = "1.0"
    
    private init() {}
    
    // MARK: - Public Methods
    
    /// Check if user needs to see terms popup
    func shouldShowTermsPopup(for userId: String) -> Bool {
        let userSpecificKey = "\(hasAcceptedTermsKey)_\(userId)"
        let userSpecificRememberKey = "\(shouldRememberChoiceKey)_\(userId)"
        let userSpecificVersionKey = "\(termsVersionKey)_\(userId)"
        
        // Check if user has accepted terms
        let hasAccepted = userDefaults.bool(forKey: userSpecificKey)
        let shouldRemember = userDefaults.bool(forKey: userSpecificRememberKey)
        let acceptedVersion = userDefaults.string(forKey: userSpecificVersionKey)
        
        // Show terms if:
        // 1. User has never accepted terms, OR
        // 2. User chose not to remember their choice, OR
        // 3. Terms version has been updated
        return !hasAccepted || !shouldRemember || acceptedVersion != currentTermsVersion
    }
    
    /// Record that user has accepted terms
    func acceptTerms(for userId: String, shouldRememberChoice: Bool) {
        let userSpecificKey = "\(hasAcceptedTermsKey)_\(userId)"
        let userSpecificRememberKey = "\(shouldRememberChoiceKey)_\(userId)"
        let userSpecificVersionKey = "\(termsVersionKey)_\(userId)"
        
        userDefaults.set(true, forKey: userSpecificKey)
        userDefaults.set(shouldRememberChoice, forKey: userSpecificRememberKey)
        userDefaults.set(currentTermsVersion, forKey: userSpecificVersionKey)
        
        print("📋 Terms accepted for user \(userId), remember choice: \(shouldRememberChoice)")
    }
    
    /// Check if terms should be shown for current session
    func checkAndShowTermsIfNeeded(for userId: String) {
        // CRITICAL: Prevent multiple simultaneous checks
        guard !isCheckingTerms else {
            print("📋 CRITICAL: Terms check already in progress - ignoring duplicate request")
            return
        }
        
        isCheckingTerms = true
        
        let needsTerms = shouldShowTermsPopup(for: userId)
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.shouldShowTerms = needsTerms
            self.isCheckingTerms = false
            
            if needsTerms {
                print("📋 CRITICAL: Terms popup WILL BE SHOWN for user \(userId)")
            } else {
                print("📋 CRITICAL: Terms popup NOT NEEDED for user \(userId)")
            }
        }
    }
    
    /// Force show terms (for testing or terms updates)
    func forceShowTerms() {
        shouldShowTerms = true
    }
    
    /// Reset terms acceptance for a user (for testing)
    func resetTermsAcceptance(for userId: String) {
        let userSpecificKey = "\(hasAcceptedTermsKey)_\(userId)"
        let userSpecificRememberKey = "\(shouldRememberChoiceKey)_\(userId)"
        let userSpecificVersionKey = "\(termsVersionKey)_\(userId)"
        
        userDefaults.removeObject(forKey: userSpecificKey)
        userDefaults.removeObject(forKey: userSpecificRememberKey)
        userDefaults.removeObject(forKey: userSpecificVersionKey)
        
        print("📋 Terms acceptance reset for user \(userId)")
    }
    
    /// Reset terms acceptance for all users (for Apple review preparation)
    func resetAllTermsAcceptance() {
        // Get all UserDefaults keys and remove terms-related ones
        let allKeys = userDefaults.dictionaryRepresentation().keys
        let termsKeys = allKeys.filter { key in
            key.contains(hasAcceptedTermsKey) || 
            key.contains(shouldRememberChoiceKey) || 
            key.contains(termsVersionKey)
        }
        
        for key in termsKeys {
            userDefaults.removeObject(forKey: key)
        }
        
        print("📋 All terms acceptance data cleared - Terms popup will show for all users")
    }
    
    /// Get terms acceptance status for debugging
    func getTermsStatus(for userId: String) -> (hasAccepted: Bool, shouldRemember: Bool, version: String?) {
        let userSpecificKey = "\(hasAcceptedTermsKey)_\(userId)"
        let userSpecificRememberKey = "\(shouldRememberChoiceKey)_\(userId)"
        let userSpecificVersionKey = "\(termsVersionKey)_\(userId)"
        
        return (
            hasAccepted: userDefaults.bool(forKey: userSpecificKey),
            shouldRemember: userDefaults.bool(forKey: userSpecificRememberKey),
            version: userDefaults.string(forKey: userSpecificVersionKey)
        )
    }
} 