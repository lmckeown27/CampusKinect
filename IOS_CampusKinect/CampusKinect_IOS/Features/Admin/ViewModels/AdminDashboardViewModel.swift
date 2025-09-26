import Foundation
import Combine
import SwiftUI

@MainActor
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
    @Published var currentPage = 1
    @Published var hasMoreReports = true
    
    // MARK: - Private Properties
    private let apiService = AdminAPIService()
    private var cancellables = Set<AnyCancellable>()
    private let reportsPerPage = 20
    
    // MARK: - Helper Methods
    private func formatError(_ error: Error) -> String {
        if let urlError = error as? URLError {
            switch urlError.code {
            case .notConnectedToInternet:
                return "No internet connection"
            case .timedOut:
                return "Request timed out"
            case .cannotFindHost:
                return "Cannot connect to server"
            default:
                return "Network error occurred"
            }
        }
        
        return error.localizedDescription
    }
    
    private func removeReport(_ report: ContentReport) {
        reports.removeAll { $0.id == report.id }
    }
    
    private func refreshStats() {
        apiService.getModerationStats()
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] stats in
                    DispatchQueue.main.async {
                        self?.stats = stats
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    private func showSuccessMessage(for action: ModerationAction.ActionType) {
        let message = action == .approve ? "Content removed and user banned" : "Report dismissed"
        
        // You can implement a toast/alert system here
        print("✅ \(message)")
        
        // Add haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    // MARK: - Computed Properties
    var urgentReports: [ContentReport] {
        reports.filter { $0.isUrgent || $0.isOverdue }
    }
    
    var sortedReports: [ContentReport] {
        reports.sorted { report1, report2 in
            // Overdue reports first
            if report1.isOverdue && !report2.isOverdue {
                return true
            } else if !report1.isOverdue && report2.isOverdue {
                return false
            }
            
            // Then urgent reports
            if report1.isUrgent && !report2.isUrgent {
                return true
            } else if !report1.isUrgent && report2.isUrgent {
                return false
            }
            
            // Then by creation date (oldest first)
            return report1.createdAt < report2.createdAt
        }
    }
    
    // MARK: - Initialization
    init() {
        loadInitialData()
    }
    
    // MARK: - Data Loading
    func loadInitialData() {
        isLoading = true
        errorMessage = nil
        
        let reportsPublisher = apiService.getPendingReports(page: 1, limit: reportsPerPage)
        let statsPublisher = apiService.getModerationStats()
        
        Publishers.CombineLatest(reportsPublisher, statsPublisher)
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] (reportsResponse, stats) in
                    DispatchQueue.main.async {
                        self?.reports = reportsResponse.data
                        self?.stats = stats
                        self?.hasMoreReports = reportsResponse.pagination.hasNext
                        self?.currentPage = 1
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMoreReports() {
        guard hasMoreReports && !isLoading else { return }
        
        let nextPage = currentPage + 1
        
        apiService.getPendingReports(page: nextPage, limit: reportsPerPage)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        DispatchQueue.main.async {
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] response in
                    DispatchQueue.main.async {
                        self?.reports.append(contentsOf: response.data)
                        self?.hasMoreReports = response.pagination.hasNext
                        self?.currentPage = nextPage
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func refreshData() {
        loadInitialData()
        loadAnalyticsData()
        loadBannedUsers()
    }
    
    // MARK: - Analytics Data Loading
    func loadAnalyticsData() {
        isLoadingAnalytics = true
        
        apiService.getAnalyticsData()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingAnalytics = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] analytics in
                    DispatchQueue.main.async {
                        self?.analytics = analytics
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Banned Users Data Loading
    func loadBannedUsers() {
        isLoadingBannedUsers = true
        
        apiService.getBannedUsers()
            .sink(
                receiveCompletion: { [weak self] completion in
                    DispatchQueue.main.async {
                        self?.isLoadingBannedUsers = false
                        if case .failure(let error) = completion {
                            self?.errorMessage = self?.formatError(error)
                        }
                    }
                },
                receiveValue: { [weak self] users in
                    DispatchQueue.main.async {
                        self?.bannedUsers = users
                    }
                }
            )
            .store(in: &cancellables)
    
    // MARK: - Report Actions
    func selectReport(_ report: ContentReport) {
        selectedReport = report
        showingReportDetail = true
    }
    
    func moderateReport(_ report: ContentReport, action: ModerationAction.ActionType, notes: String? = nil) {
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
                            // Refresh banned users list and stats
                            self?.loadBannedUsers()
                            self?.refreshStats()
                        }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Unban User Actions
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
                            self?.showSuccessMessage(for: .dismiss) // Reuse dismiss message
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
        // Check authorization using stored user data
        return checkAdminAuthorization()
    }
    
    private func checkAdminAuthorization() -> Bool {
        // Try to get user data from keychain/storage
        // For now, we'll use a simple approach and let the backend handle the real authorization
        // The API calls will fail if the user is not authorized
        return true
    }
    
    // MARK: - Cleanup
    deinit {
        cancellables.removeAll()
    }
} 