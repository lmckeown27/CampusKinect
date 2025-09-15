//
//  HomeView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingFilter = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                
                // Filter Bar
                if viewModel.hasFiltersApplied {
                    FilterBar(
                        selectedCategory: viewModel.selectedCategory,
                        selectedSubcategory: viewModel.selectedSubcategory,
                        onClear: {
                            viewModel.clearSearch()
                        }
                    )
                    .padding(.horizontal)
                    .padding(.top, 8)
                }
                
                // Posts List
                PostsList()
                    .environmentObject(viewModel)
            }
            .navigationTitle("CampusKinect")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingFilter = true
                    }) {
                        Image(systemName: viewModel.hasFiltersApplied ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .refreshable {
                await viewModel.refreshPosts()
            }
            .task {
                await viewModel.loadPosts()
            }
            .sheet(isPresented: $showingFilter) {
                FilterView(viewModel: viewModel)
            }
        }
    }
}


// MARK: - Filter Bar
struct FilterBar: View {
    let selectedCategory: PostCategory?
    let selectedSubcategory: PostSubcategory?
    let onClear: () -> Void
    
    var body: some View {
        HStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    if let category = selectedCategory {
                        FilterChip(
                            title: category.displayName,
                            systemImage: category.systemIconName,
                            color: Color(hex: category.color) ?? .blue
                        )
                    }
                    
                    if let subcategory = selectedSubcategory {
                        FilterChip(
                            title: subcategory.displayName,
                            systemImage: "tag",
                            color: .secondary
                        )
                    }
                }
                .padding(.horizontal)
            }
            
            Button("Clear", action: onClear)
                .font(.caption)
                .foregroundColor(Color("AccentColor"))
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let systemImage: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: systemImage)
                .font(.caption)
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(color.opacity(0.1))
        .foregroundColor(color)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Posts List
struct PostsList: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.posts.isEmpty {
                LoadingView()
            } else if viewModel.posts.isEmpty {
                EmptyStateView(
                    title: "No Posts Yet",
                    message: "Be the first to share something with your campus community!",
                    systemImage: "doc.text"
                )
            } else {
                List {
                    ForEach(viewModel.filteredPosts) { post in
                        PostCardView(post: post)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .onAppear {
                                // Load more posts when reaching the end
                                if post.id == viewModel.posts.last?.id {
                                    Task {
                                        await viewModel.loadMorePosts()
                                    }
                                }
                            }
                    }
                    
                    // Loading more indicator
                    if viewModel.isLoading && !viewModel.posts.isEmpty {
                        HStack {
                            Spacer()
                            ProgressView()
                                .padding()
                            Spacer()
                        }
                        .listRowSeparator(.hidden)
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
        .overlay(
            Group {
                if let error = viewModel.error {
                    ErrorView(
                        error: error,
                        onRetry: {
                            Task {
                                await viewModel.loadPosts()
                            }
                        }
                    )
                }
            }
        )
    }
}

// MARK: - Color Extension
extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthenticationManager())
}

