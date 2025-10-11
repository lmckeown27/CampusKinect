//
//  ConfigurationService.swift
//  CampusKinect_IOS
//
//  Service for fetching and caching server-driven UI configuration
//

import Foundation
import Combine

class ConfigurationService: ObservableObject {
    static let shared = ConfigurationService()
    
    @Published var configuration: AppConfiguration?
    @Published var isLoading = false
    @Published var error: Error?
    
    private let userDefaults = UserDefaults.standard
    private let cacheKey = "app_configuration_cache"
    private let cacheTimestampKey = "app_configuration_cache_timestamp"
    
    private var cancellables = Set<AnyCancellable>()
    private var refreshTimer: Timer?
    
    private init() {
        // Try to load cached configuration immediately
        loadCachedConfiguration()
        
        // Fetch fresh configuration from server
        Task {
            await fetchConfiguration()
        }
    }
    
    // MARK: - Public Methods
    
    /// Fetch configuration from server
    func fetchConfiguration() async {
        print("📡 ConfigurationService: Fetching configuration from server...")
        
        await MainActor.run {
            isLoading = true
            error = nil
        }
        
        do {
            let config = try await performFetch()
            
            await MainActor.run {
                self.configuration = config
                self.isLoading = false
                print("✅ ConfigurationService: Configuration fetched successfully")
                
                // Cache the configuration
                cacheConfiguration(config)
                
                // Schedule next refresh
                scheduleRefresh(interval: config.configRefreshInterval)
            }
        } catch {
            await MainActor.run {
                self.error = error
                self.isLoading = false
                print("❌ ConfigurationService: Failed to fetch configuration: \(error.localizedDescription)")
                
                // Use cached configuration if available
                if self.configuration == nil {
                    loadCachedConfiguration()
                }
            }
        }
    }
    
    /// Get a specific feature flag
    func isFeatureEnabled(_ feature: String) -> Bool {
        guard let config = configuration else { return false }
        
        switch feature {
        case "messaging":
            return config.features.messaging.enabled
        case "posts":
            return config.features.posts.enabled
        case "userProfile":
            return config.features.userProfile.enabled
        case "notifications":
            return config.features.notifications.enabled
        case "search":
            return config.features.search.enabled
        case "admin":
            return config.features.admin.enabled
        case "guestMode":
            return config.features.guestMode.enabled
        default:
            return false
        }
    }
    
    /// Check if app needs force update
    func needsForceUpdate() -> Bool {
        guard let config = configuration else { return false }
        
        // Compare current app version with min supported version
        let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let minVersion = config.minSupportedVersion
        
        return compareVersions(currentVersion, minVersion) == .orderedAscending
    }
    
    /// Check if maintenance mode is active
    func isMaintenanceModeActive() -> Bool {
        return configuration?.maintenance.enabled ?? false
    }
    
    // MARK: - Private Methods
    
    private func performFetch() async throws -> AppConfiguration {
        let platform = "ios"
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let urlString = "\(APIConstants.fullBaseURL)/config/app?platform=\(platform)&version=\(version)"
        
        guard let url = URL(string: urlString) else {
            throw NSError(domain: "ConfigurationService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "ConfigurationService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        }
        
        guard httpResponse.statusCode == 200 else {
            throw NSError(domain: "ConfigurationService", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Server error: \(httpResponse.statusCode)"])
        }
        
        let decoder = JSONDecoder()
        let configResponse = try decoder.decode(ConfigurationResponse.self, from: data)
        
        return configResponse.data
    }
    
    private func cacheConfiguration(_ config: AppConfiguration) {
        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(config)
            userDefaults.set(data, forKey: cacheKey)
            userDefaults.set(Date(), forKey: cacheTimestampKey)
            print("💾 ConfigurationService: Configuration cached successfully")
        } catch {
            print("❌ ConfigurationService: Failed to cache configuration: \(error.localizedDescription)")
        }
    }
    
    private func loadCachedConfiguration() {
        guard let data = userDefaults.data(forKey: cacheKey) else {
            print("⚠️  ConfigurationService: No cached configuration found")
            return
        }
        
        do {
            let decoder = JSONDecoder()
            let config = try decoder.decode(AppConfiguration.self, from: data)
            self.configuration = config
            
            if let cacheTimestamp = userDefaults.object(forKey: cacheTimestampKey) as? Date {
                let age = Date().timeIntervalSince(cacheTimestamp)
                print("📦 ConfigurationService: Loaded cached configuration (age: \(Int(age))s)")
            }
        } catch {
            print("❌ ConfigurationService: Failed to load cached configuration: \(error.localizedDescription)")
        }
    }
    
    private func scheduleRefresh(interval: Int) {
        // Cancel existing timer
        refreshTimer?.invalidate()
        
        // Schedule new timer
        refreshTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(interval), repeats: false) { [weak self] _ in
            Task {
                await self?.fetchConfiguration()
            }
        }
        
        print("⏰ ConfigurationService: Next refresh scheduled in \(interval) seconds")
    }
    
    private func compareVersions(_ version1: String, _ version2: String) -> ComparisonResult {
        let v1 = version1.split(separator: ".").compactMap { Int($0) }
        let v2 = version2.split(separator: ".").compactMap { Int($0) }
        
        for i in 0..<max(v1.count, v2.count) {
            let num1 = i < v1.count ? v1[i] : 0
            let num2 = i < v2.count ? v2[i] : 0
            
            if num1 < num2 {
                return .orderedAscending
            } else if num1 > num2 {
                return .orderedDescending
            }
        }
        
        return .orderedSame
    }
    
    deinit {
        refreshTimer?.invalidate()
    }
}

// MARK: - Convenience Extensions
extension ConfigurationService {
    var theme: ThemeConfiguration? {
        configuration?.theme
    }
    
    var features: FeatureConfiguration? {
        configuration?.features
    }
    
    var ui: UIConfiguration? {
        configuration?.ui
    }
    
    var text: TextConfiguration? {
        configuration?.text
    }
}

