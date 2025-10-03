import Foundation
import Combine
import SwiftUI

class AdminDashboardViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var reports: [ContentReport] = []
    @Published var stats: ModerationStats?
    @Published var analytics: AnalyticsData?
    @Published var bannedUsers: [BannedUser] = []
    @Published var selectedReport: ContentReport?
    @Published var selectedTab: AdminTab = .analytics { // TEMPORARILY CHANGED FOR TESTING
        didSet {
            print("🔍 AdminDashboard: selectedTab changed to: \(selectedTab)")
        }
    }
    @Published var isLoading = false
    @Published var isLoadingAction = false
    @Published var isLoadingAnalytics = false
    @Published var isLoadingBannedUsers = false
    @Published var errorMessage: String?
    @Published var showingReportDetail = false
    @Published var showingUnbanConfirmation = false
    @Published var userToUnban: BannedUser?
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let apiService = AdminAPIService()
    
    // MARK: - Initialization
    init() {
        print("🏗️ AdminDashboardViewModel: Initializing...")
        print("🔍 AdminDashboardViewModel: Initial state - reports: \(reports.count), isLoading: \(isLoading)")
        print("🔍 AdminDashboardViewModel: Default selectedTab: \(selectedTab)")
        print("🚀 AdminDashboardViewModel: Loading data for first tab: \(selectedTab)")
        
        // Load data appropriate for the first tab
        switch selectedTab {
        case .analytics:
            loadAnalyticsData()
        case .reports:
            loadInitialData() // This loads reports
        case .users:
            loadBannedUsers()
        }
        
        print("✅ AdminDashboardViewModel: First tab data loading initiated")
    }
    
    // MARK: - Helper Methods
    private func formatError(_ error: Error) -> String {
        if let apiError = error as? APIError {
            switch apiError {
            case .networkError(let message):
                return "Network connection error: \(message)"
            case .serverError:
                return "Server error. Please try again later."
            case .unauthorized:
                return "You are not authorized to perform this action."
            case .notFound:
                return "The requested resource was not found."
            case .badRequest(let message):
                return "Bad request: \(message)"
            case .invalidURL:
                return "Invalid URL error."
            case .invalidResponse:
                return "Invalid response from server."
            case .decodingError(let message):
                return "Data parsing error: \(message)"
            case .keychainError:
                return "Authentication error. Please log in again."
            case .accountBanned(let details, _):
                return details
            case .accountInactive(let details, _):
                return details
            case .unknown(let code):
                return "Unknown error (Code: \(code))"
            }
        }
        return error.localizedDescription
    }
    
    private func removeReport(_ report: ContentReport) {
        reports.removeAll { $0.id == report.id }
    }
    
    private func refreshStats() {
        // Refresh moderation stats
        loadInitialData()
    }
    
    private func showSuccessMessage(for action: ModerationAction) {
        if action.action == "dismiss" {
            errorMessage = "Report dismissed successfully"
        } else if action.deleteContent && action.banUser {
            errorMessage = "Post deleted and user banned successfully"
        } else if action.deleteContent {
            errorMessage = "Post deleted successfully"
        } else if action.banUser {
            errorMessage = "User banned successfully"
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            self.errorMessage = nil
        }
    }
    
    private func checkAdminAuthorization() -> Bool {
        // For now, we'll use a simple approach and let the backend handle the real authorization
        return true
    }
    
    // MARK: - Data Loading Methods
    func loadInitialData() {
        print("🚀 AdminDashboard: loadInitialData() called")
        print("🔍 AdminDashboard: Current isLoading state: \(isLoading)")
        print("🔍 AdminDashboard: Setting isLoading = true")
        isLoading = true
        errorMessage = nil
        
        print("🔍 AdminDashboard: Loading initial data...")
        print("🔍 AdminDashboard: Current user authorization check...")
        
        // Load reports (primary data for Reports tab)
        apiService.getPendingReports()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoading = false // Always set loading to false when request completes
                        if case .failure(let error) = completion {
                            print("❌ AdminDashboard: Failed to load reports - \(error)")
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] response in
                    DispatchQueue.main.async {
                        print("✅ AdminDashboard: Loaded \(response.data.count) reports")
                        print("📋 AdminDashboard: Response success: \(response.success)")
                        print("📄 AdminDashboard: Pagination total: \(response.pagination.total)")
                        
                        self?.reports = response.data
                        print("🔄 AdminDashboard: Set reports array to \(self?.reports.count ?? 0) items")
                        
                        // Load stats in background (not blocking the UI)
                        self?.loadModerationStats()
                        
                        // If this is the first successful load, also load analytics
                        if self?.analytics == nil {
                            self?.loadAnalyticsData()
                        }
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadModerationStats() {
        apiService.getModerationStats()
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("❌ AdminDashboard: Failed to load stats - \(error)")
                        // Don't show error for stats since it's background data
                    }
                },
                receiveValue: { [weak self] stats in
                    DispatchQueue.main.async {
                        print("✅ AdminDashboard: Loaded moderation stats")
                        self?.stats = stats
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMoreReports() {
        // Simplified for now
        print("Load more reports requested")
    }
    
    func refreshData() {
        loadInitialData()
        loadAnalyticsData()
        loadBannedUsers()
    }
    
    func loadAnalyticsData() {
        print("🚀 AdminDashboard: loadAnalyticsData() called")
        print("🔍 AdminDashboard: Setting isLoadingAnalytics = true")
        isLoadingAnalytics = true
        print("🔍 AdminDashboard: Loading analytics data...")
        
        // Fetch both analytics and universities
        Task {
            do {
                async let analyticsResult = try await fetchAnalyticsData()
                async let universitiesResult = try await fetchUniversitiesData()
                
                let (analytics, universities) = try await (analyticsResult, universitiesResult)
                
                // Merge university data with analytics
                let updatedAnalytics = mergeUniversityData(analytics: analytics, universities: universities)
                
                await MainActor.run {
                    print("✅ AdminDashboard: Analytics and universities loaded successfully")
                    print("📊 Analytics: \(updatedAnalytics.totalPosts) posts, \(updatedAnalytics.totalMessages) messages")
                    print("🎓 Universities: \(updatedAnalytics.topUniversities.count) universities with real IDs")
                    self.isLoadingAnalytics = false
                    self.analytics = updatedAnalytics
                }
            } catch {
                await MainActor.run {
                    print("❌ AdminDashboard: Failed to load analytics - \(error)")
                    self.isLoadingAnalytics = false
                    if !error.localizedDescription.contains("404") {
                        self.errorMessage = self.formatError(error)
                    }
                }
            }
        }
    }
    
    private func fetchAnalyticsData() async throws -> AnalyticsData {
        return try await withCheckedThrowingContinuation { continuation in
            apiService.getAnalyticsData()
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            continuation.resume(throwing: error)
                        }
                    },
                    receiveValue: { data in
                        continuation.resume(returning: data)
                    }
                )
                .store(in: &cancellables)
        }
    }
    
    private func fetchUniversitiesData() async throws -> [UniversitySearchResult] {
        let response = try await APIService.shared.fetchAllUniversities()
        return response.data.universities
    }
    
    private func mergeUniversityData(analytics: AnalyticsData, universities: [UniversitySearchResult]) -> AnalyticsData {
        // Use ALL universities from the search endpoint (includes universities with 0 users)
        // This ensures admin sees every university in the database
        let allUniversities: [AnalyticsData.UniversityStats] = universities.map { uni in
            AnalyticsData.UniversityStats(
                id: uni.id,
                name: uni.name,
                userCount: uni.userCount
            )
        }
        
        print("🎓 AdminDashboard: Loaded \(allUniversities.count) total universities (including 0-user universities)")
        let withUsers = allUniversities.filter { $0.userCount > 0 }.count
        let withoutUsers = allUniversities.filter { $0.userCount == 0 }.count
        print("🎓 AdminDashboard: \(withUsers) universities with users, \(withoutUsers) universities with 0 users")
        
        // Return analytics with ALL university data
        return AnalyticsData(
            totalPosts: analytics.totalPosts,
            totalMessages: analytics.totalMessages,
            activeUsers: analytics.activeUsers,
            newUsersToday: analytics.newUsersToday,
            postsToday: analytics.postsToday,
            messagesPerDay: analytics.messagesPerDay,
            topUniversities: allUniversities,
            contentTrends: analytics.contentTrends,
            reportsByReason: analytics.reportsByReason,
            userGrowth: analytics.userGrowth
        )
    }
    
    func loadBannedUsers() {
        print("🚀 AdminDashboard: loadBannedUsers() called")
        print("🔍 AdminDashboard: Setting isLoadingBannedUsers = true")
        isLoadingBannedUsers = true
        print("🔍 AdminDashboard: Loading banned users...")
        
        apiService.getBannedUsers()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingBannedUsers = false
                        if case .failure(let error) = completion {
                            print("❌ AdminDashboard: Failed to load banned users - \(error)")
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] bannedUsers in
                    DispatchQueue.main.async {
                        print("✅ AdminDashboard: Loaded \(bannedUsers.count) banned users")
                        print("🔄 AdminDashboard: Setting isLoadingBannedUsers = false (success case)")
                        self?.isLoadingBannedUsers = false
                        self?.bannedUsers = bannedUsers
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Report Actions
    func selectReport(_ report: ContentReport) {
        selectedReport = report
        showingReportDetail = true
    }
    
    func handleReportModeration(_ report: ContentReport, action: ModerationAction, notes: String? = nil) {
        isLoadingAction = true
        errorMessage = nil
        
        apiService.moderateReport(reportId: String(report.id), action: action)
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAction = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        } else {
                            // Success - remove report from list and refresh stats
                            self?.removeReport(report)
                            self?.refreshStats()
                            self?.showingReportDetail = false
                            
                            // Show success feedback
                            self?.showSuccessMessage(for: action)
                        }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func banUser(_ userId: String, reason: String, duration: String? = nil) {
        isLoadingAction = true
        
        apiService.banUser(userId: userId, reason: reason, duration: duration)
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAction = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        } else {
                            // Success - refresh data
                            self?.refreshData()
                            self?.showSuccessMessage(for: .banUserOnly())
                        }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func requestUnbanUser(_ user: BannedUser) {
        userToUnban = user
        showingUnbanConfirmation = true
    }
    
    func confirmUnbanUser() {
        guard let user = userToUnban else { return }
        
        isLoadingAction = true
        showingUnbanConfirmation = false
        
        apiService.unbanUser(userId: String(user.id))
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAction = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        } else {
                            // Remove user from banned list and refresh stats
                            self?.bannedUsers.removeAll { $0.id == user.id }
                            self?.refreshStats()
                            self?.showSuccessMessage(for: .dismiss())
                        }
                        self?.userToUnban = nil
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func cancelUnban() {
        userToUnban = nil
        showingUnbanConfirmation = false
    }
    
    // MARK: - Admin Authorization
    var isAuthorizedAdmin: Bool {
        return true // Simplified for now
    }
    
    // MARK: - Test Method
    func testAccess() -> String {
        return "Access test successful"
    }
}
