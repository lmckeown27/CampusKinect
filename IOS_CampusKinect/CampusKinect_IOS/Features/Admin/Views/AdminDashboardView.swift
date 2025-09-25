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
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Admin Content
    private var adminContent: some View {
        Group {
            if horizontalSizeClass == .regular {
                // iPad Layout - Split View
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
            // Sidebar with stats and report list
            VStack(spacing: 0) {
                // Statistics Header
                if let stats = viewModel.stats {
                    AdminStatsHeaderView(stats: stats)
                        .padding()
                        .background(Color(.systemGroupedBackground))
                }
                
                Divider()
                
                // Reports List
                ReportsListView(
                    reports: viewModel.sortedReports,
                    isLoading: viewModel.isLoading,
                    onReportTap: viewModel.selectReport,
                    onLoadMore: viewModel.loadMoreReports,
                    hasMore: viewModel.hasMoreReports
                )
            }
            .navigationTitle("Reports")
            .navigationBarTitleDisplayMode(.inline)
        } detail: {
            // Detail view
            if let selectedReport = viewModel.selectedReport {
                ReportDetailView(report: selectedReport, viewModel: viewModel)
            } else {
                AdminEmptyStateView()
            }
        }
    }
    
    // MARK: - iPhone Layout
    private var iPhoneLayout: some View {
        TabView {
            // Dashboard Tab
            NavigationView {
                DashboardTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: "shield")
                Text("Dashboard")
            }
            
            // Reports Tab
            NavigationView {
                ReportsTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: "flag")
                Text("Reports")
            }
            
            // Statistics Tab
            NavigationView {
                StatisticsTabView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: "chart.bar")
                Text("Statistics")
            }
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

// MARK: - Dashboard Tab (iPhone)
struct DashboardTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
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
            }
            .padding(.vertical)
        }
        .navigationTitle("Admin Dashboard")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Reports Tab (iPhone)
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
        .navigationTitle("All Reports")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Statistics Tab (iPhone)
struct StatisticsTabView: View {
    @ObservedObject var viewModel: AdminDashboardViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let stats = viewModel.stats {
                    AdminStatsDetailView(stats: stats)
                } else if viewModel.isLoading {
                    ProgressView("Loading statistics...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    Text("No statistics available")
                        .foregroundColor(.secondary)
                }
            }
            .padding()
        }
        .navigationTitle("Statistics")
        .refreshable {
            viewModel.refreshData()
        }
    }
}

// MARK: - Empty State (iPad)
struct AdminEmptyStateView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "flag.slash")
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            Text("Select a Report")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Choose a report from the list to view details and take action.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

#Preview {
    NavigationView {
        AdminDashboardView()
    }
} 