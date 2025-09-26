import SwiftUI

struct AdminDashboardView: View {
    @StateObject private var viewModel = AdminDashboardViewModel()
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        Group {
            if viewModel.isAuthorizedAdmin {
                adminContent
            } else {
                unauthorizedView
            }
        }
        .navigationTitle("Admin Dashboard")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Refresh") {
                    viewModel.refreshData()
                }
                .disabled(viewModel.isLoading)
            }
        }
        .sheet(isPresented: $viewModel.showingReportDetail) {
            if let report = viewModel.selectedReport {
                ReportDetailView(report: report, viewModel: viewModel)
            }
        }
        .alert("Unban User", isPresented: $viewModel.showingUnbanConfirmation) {
            Button("Cancel", role: .cancel) {
                viewModel.cancelUnban()
            }
            Button("Unban", role: .destructive) {
                viewModel.confirmUnbanUser()
            }
        } message: {
            if let user = viewModel.userToUnban {
                Text("Are you sure you want to unban \(user.username)? They will be able to access the platform again.")
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
            }
        }
        .onAppear {
            viewModel.loadAnalyticsData()
            viewModel.loadBannedUsers()
        }
    }
    
    // MARK: - Admin Content
    private var adminContent: some View {
        Group {
            if horizontalSizeClass == .regular {
                // iPad Layout - Split View with Sidebar
                iPadLayout
            } else {
                // iPhone Layout - Tab View
                iPhoneLayout
            }
        }
    }
    
    // MARK: - iPad Layout
    private var iPadLayout: some View {
        NavigationSplitView {
            // Sidebar with tabs
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("CampusKinect")
                        .font(.title2)
                        .fontWeight(.bold)
                    Text("Admin Dashboard")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGroupedBackground))
                
                Divider()
                
                // Tab Selection
                List(AdminTab.allCases, id: \.self, selection: $viewModel.selectedTab) { tab in
                    Label(tab.displayName, systemImage: tab.iconName)
                        .tag(tab)
                }
                .listStyle(SidebarListStyle())
            }
            .navigationTitle("Admin")
            .navigationBarTitleDisplayMode(.inline)
        } detail: {
            // Detail view based on selected tab
            Group {
                switch viewModel.selectedTab {
                case .overview:
                    OverviewTabView(viewModel: viewModel)
                case .reports:
                    ReportsTabView(viewModel: viewModel)
                case .users:
                    UsersTabView(viewModel: viewModel)
                case .analytics:
                    AnalyticsTabView(viewModel: viewModel)
                }
            }
        }
    }
    
    // MARK: - iPhone Layout
    private var iPhoneLayout: some View {
        TabView(selection: $viewModel.selectedTab) {
            // Overview Tab
            NavigationView {
                OverviewTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: AdminTab.overview.iconName)
                Text(AdminTab.overview.displayName)
            }
            .tag(AdminTab.overview)
            
            // Reports Tab
            NavigationView {
                ReportsTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: AdminTab.reports.iconName)
                Text(AdminTab.reports.displayName)
            }
            .tag(AdminTab.reports)
            
            // Users Tab
            NavigationView {
                UsersTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: AdminTab.users.iconName)
                Text(AdminTab.users.displayName)
            }
            .tag(AdminTab.users)
            
            // Analytics Tab
            NavigationView {
                AnalyticsTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: AdminTab.analytics.iconName)
                Text(AdminTab.analytics.displayName)
            }
            .tag(AdminTab.analytics)
        }
        .accentColor(.red)
    }
    
    // MARK: - Unauthorized View
    private var unauthorizedView: some View {
        VStack(spacing: 20) {
            Image(systemName: "shield.slash")
                .font(.system(size: 60))
                .foregroundColor(.red)
            
            Text("Access Denied")
                .font(.title)
                .fontWeight(.bold)
            
            Text("You don't have permission to access the admin dashboard.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            
            Button("Return to App") {
                dismiss()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .navigationBarHidden(true)
    }
}

// MARK: - Overview Tab
struct OverviewTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 20) {
                // Statistics Cards
                if let stats = viewModel.stats {
                    AdminStatsGridView(stats: stats)
                        .padding(.horizontal)
                }
                
                // Urgent Reports Section
                if !viewModel.urgentReports.isEmpty {
                    UrgentReportsSection(
                        reports: viewModel.urgentReports,
                        onReportTap: viewModel.selectReport
                    )
                    .padding(.horizontal)
                }
                
                // Recent Reports Section
                RecentReportsSection(
                    reports: Array(viewModel.sortedReports.prefix(5)),
                    onReportTap: viewModel.selectReport
                )
                .padding(.horizontal)
                
                // Quick Analytics Preview
                if let analytics = viewModel.analytics {
                    QuickAnalyticsView(analytics: analytics)
                        .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Overview")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Reports Tab
struct ReportsTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        ReportsListView(
            reports: viewModel.sortedReports,
            isLoading: viewModel.isLoading,
            onReportTap: viewModel.selectReport,
            onLoadMore: viewModel.loadMoreReports,
            hasMore: viewModel.hasMoreReports
        )
        .navigationTitle("Reports")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Users Tab
struct UsersTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        Group {
            if viewModel.isLoadingBannedUsers {
                ProgressView("Loading banned users...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.bannedUsers.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.shield")
                        .font(.system(size: 50))
                        .foregroundColor(.green)
                    
                    Text("No Banned Users")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("All users are currently in good standing.")
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List(viewModel.bannedUsers) { user in
                    BannedUserRowView(
                        user: user,
                        onUnban: { viewModel.requestUnbanUser(user) }
                    )
                }
                .listStyle(PlainListStyle())
            }
        }
        .navigationTitle("Banned Users")
        .refreshable {
            viewModel.loadBannedUsers()
        }
    }
}

// MARK: - Analytics Tab
struct AnalyticsTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        Group {
            if viewModel.isLoadingAnalytics {
                ProgressView("Loading analytics...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let analytics = viewModel.analytics {
                ScrollView {
                    LazyVStack(spacing: 20) {
                        // Platform Overview
                        PlatformOverviewView(analytics: analytics)
                            .padding(.horizontal)
                        
                        // University Stats
                        UniversityStatsView(universities: analytics.topUniversities)
                            .padding(.horizontal)
                        
                        // Content Trends
                        ContentTrendsView(trends: analytics.contentTrends)
                            .padding(.horizontal)
                        
                        // Reports by Reason
                        ReportReasonsView(reasons: analytics.reportsByReason)
                            .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    
                    Text("No Analytics Data")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text("Analytics data is not available at the moment.")
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                    
                    Button("Retry") {
                        viewModel.loadAnalyticsData()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Analytics")
        .refreshable {
            viewModel.loadAnalyticsData()
        }
    }
}

#Preview {
    NavigationView {
        AdminDashboardView()
    }
} 