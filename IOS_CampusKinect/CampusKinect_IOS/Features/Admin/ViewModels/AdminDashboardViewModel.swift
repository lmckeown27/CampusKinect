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
    @Published var selectedTab: AdminTab = .overview
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
        loadInitialData()
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
    
    private func showSuccessMessage(for action: ModerationAction.ActionType) {
        switch action {
        case .approve:
            errorMessage = "Content removed and user banned successfully"
        case .dismiss:
            errorMessage = "Report dismissed successfully"
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
        isLoading = true
        errorMessage = nil
        
        print("🔍 AdminDashboard: Loading initial data...")
        
        apiService.getPendingReports()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        if case .failure(let error) = completion {
                            print("❌ AdminDashboard: Failed to load reports - \(error)")
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] response in
                    DispatchQueue.main.async {
                        print("✅ AdminDashboard: Loaded \(response.data.count) reports")
                        self?.reports = response.data
                        self?.refreshStats()
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
        isLoadingAnalytics = true
        print("🔍 AdminDashboard: Loading analytics data...")
        
        apiService.getAnalyticsData()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAnalytics = false
                        if case .failure(let error) = completion {
                            print("❌ AdminDashboard: Failed to load analytics - \(error)")
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] analyticsData in
                    DispatchQueue.main.async {
                        print("✅ AdminDashboard: Analytics data loaded successfully")
                        self?.analytics = analyticsData
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadBannedUsers() {
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
    
    func handleReportModeration(_ report: ContentReport, action: ModerationAction.ActionType, notes: String? = nil) {
        isLoadingAction = true
        errorMessage = nil
        
        let moderationAction = ModerationAction(action: action, moderatorNotes: notes)
        
        apiService.moderateReport(reportId: report.id, action: moderationAction)
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
    
    func banUser(_ userId: String, reason: String) {
        isLoadingAction = true
        
        apiService.banUser(userId: userId, reason: reason)
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAction = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        } else {
                            // Success - refresh data
                            self?.refreshData()
                            self?.showSuccessMessage(for: .approve)
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
        
        apiService.unbanUser(userId: user.id)
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
                            self?.showSuccessMessage(for: .dismiss)
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
