import SwiftUI

struct AdminDashboardView: View {
    @StateObject private var viewModel = AdminDashboardViewModel()
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        Group {
            if _viewModel.wrappedValue.isAuthorizedAdmin {
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
                    _viewModel.wrappedValue.refreshData()
                }
                .disabled(_viewModel.wrappedValue.isLoading)
            }
        }
        .sheet(isPresented: Binding(
            get: { _viewModel.wrappedValue.showingReportDetail },
            set: { _viewModel.wrappedValue.showingReportDetail = $0 }
        )) {
            if let report = _viewModel.wrappedValue.selectedReport {
                ReportDetailView(report: report, viewModel: _viewModel.wrappedValue)
            }
        }
        .alert("Unban User", isPresented: Binding(
            get: { _viewModel.wrappedValue.showingUnbanConfirmation },
            set: { _viewModel.wrappedValue.showingUnbanConfirmation = $0 }
        )) {
            Button("Cancel", role: .cancel) {
                _viewModel.wrappedValue.cancelUnban()
            }
            Button("Unban", role: .destructive) {
                _viewModel.wrappedValue.confirmUnbanUser()
            }
        } message: {
            if let user = _viewModel.wrappedValue.userToUnban {
                Text("Are you sure you want to unban \(user.username)? They will be able to access the platform again.")
            }
        }
        .alert("Error", isPresented: Binding(
            get: { _viewModel.wrappedValue.errorMessage != nil },
            set: { _ in _viewModel.wrappedValue.errorMessage = nil }
        )) {
            Button("OK") {
                _viewModel.wrappedValue.errorMessage = nil
            }
        } message: {
            if let errorMessage = _viewModel.wrappedValue.errorMessage {
                Text(errorMessage)
            }
        }
        .onAppear {
            _viewModel.wrappedValue.loadAnalyticsData()
            _viewModel.wrappedValue.loadBannedUsers()
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
                List(AdminTab.allCases, id: \.self, selection: Binding(
                    get: { _viewModel.wrappedValue.selectedTab },
                    set: { _viewModel.wrappedValue.selectedTab = $0 }
                )) { tab in
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
                switch _viewModel.wrappedValue.selectedTab {
                case .overview:
                    OverviewTabView(viewModel: _viewModel.wrappedValue)
                case .reports:
                    ReportsTabView(viewModel: _viewModel.wrappedValue)
                case .users:
                    UsersTabView(viewModel: _viewModel.wrappedValue)
                case .analytics:
                    AnalyticsTabView(viewModel: _viewModel.wrappedValue)
                }
            }
        }
    }
    
    // MARK: - iPhone Layout
    private var iPhoneLayout: some View {
        TabView(selection: Binding(
            get: { _viewModel.wrappedValue.selectedTab },
            set: { _viewModel.wrappedValue.selectedTab = $0 }
        )) {
            // Overview Tab
            NavigationView {
                OverviewTabView(viewModel: _viewModel.wrappedValue)
            }
            .tabItem {
                Image(systemName: AdminTab.overview.iconName)
                Text(AdminTab.overview.displayName)
            }
            .tag(AdminTab.overview)
            
            // Reports Tab
            NavigationView {
                ReportsTabView(viewModel: _viewModel.wrappedValue)
            }
            .tabItem {
                Image(systemName: AdminTab.reports.iconName)
                Text(AdminTab.reports.displayName)
            }
            .tag(AdminTab.reports)
            
            // Users Tab
            NavigationView {
                UsersTabView(viewModel: _viewModel.wrappedValue)
            }
            .tabItem {
                Image(systemName: AdminTab.users.iconName)
                Text(AdminTab.users.displayName)
            }
            .tag(AdminTab.users)
            
            // Analytics Tab
            NavigationView {
                AnalyticsTabView(viewModel: _viewModel.wrappedValue)
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
    let viewModel: AdminDashboardViewModel
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 20) {
                // Statistics Cards
                if let stats = viewModel.stats {
                    AdminStatsGridView(stats: stats)
                        .padding(.horizontal)
                }
                
                // Urgent Reports Section
                let urgentReports = viewModel.reports.filter { $0.isUrgent }
                if !urgentReports.isEmpty {
                    UrgentReportsSection(
                        reports: urgentReports,
                        onReportTap: viewModel.selectReport
                    )
                    .padding(.horizontal)
                }
                
                // Recent Reports Section
                let sortedReports = viewModel.reports.sorted { $0.createdAt > $1.createdAt }
                RecentReportsSection(
                    reports: Array(sortedReports.prefix(5)),
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
    let viewModel: AdminDashboardViewModel
    
    var body: some View {
        let sortedReports = viewModel.reports.sorted { $0.createdAt > $1.createdAt }
        ReportsListView(
            reports: sortedReports,
            isLoading: viewModel.isLoading,
            onReportTap: viewModel.selectReport,
            onLoadMore: viewModel.loadMoreReports,
            hasMore: false // Simplified for now
        )
        .navigationTitle("Reports")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Users Tab
struct UsersTabView: View {
    let viewModel: AdminDashboardViewModel
    
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
    let viewModel: AdminDashboardViewModel
    
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