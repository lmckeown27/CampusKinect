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
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Category Button Section
                CategoryButtonSection()
                    .environmentObject(viewModel)
                
                // Active Filter Bar (only shows when tags are selected and filter bar is visible)
                if viewModel.hasTagsSelected {
                    ActiveFilterBar()
                        .environmentObject(viewModel)
                        .padding(.horizontal)
                        .padding(.top, 8)
                } else if viewModel.selectedCategory != nil && !viewModel.showingFilterBar {
                    // Compact indicator when filters are active but hidden
                    CompactFilterIndicator()
                        .environmentObject(viewModel)
                        .padding(.horizontal)
                        .padding(.top, 8)
                
                // Posts List
                PostsList()
                    .environmentObject(viewModel)
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Image("Logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 32)
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.shouldShowOfferRequestToggle {
                        OfferRequestToggle()
                            .environmentObject(viewModel)
                    }
                }
            }
            .refreshable {
                await viewModel.refreshPosts()
            }
            .task {
                await viewModel.loadPosts()
            }
        }
    }
}


// MARK: - Category Button Section
struct CategoryButtonSection: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Main Category Buttons (Single Selection with Dropdown)
            HStack(spacing: 16) {
                ForEach(PostCategory.allCategories) { category in
                    CategoryDropdownButton(
                        category: category,
                        isSelected: viewModel.selectedCategory == category.id,
                        isExpanded: viewModel.selectedCategory == category.id && viewModel.isCategoryExpanded,
                        onTap: {
                            viewModel.selectCategory(category.id)
                        }
                    )
                }
            }
            .padding(.horizontal)
            
            // Subcategory Tags (shown when category is selected and expanded)
            if let selectedCategoryId = viewModel.selectedCategory,
               viewModel.isCategoryExpanded,
               let category = PostCategory.allCategories.first(where: { $0.id == selectedCategoryId }) {
                VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("\(category.displayName) Tags")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Button("Clear All") {
                                viewModel.clearCategory()
                            }
                            .font(.caption2)
                            .foregroundColor(.red)
                        }
                        .padding(.horizontal)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                            ForEach(category.subcategories) { subcategory in
                                Button(action: {
                                    viewModel.toggleTag(subcategory.name)
                                }) {
                                    Text(subcategory.name)
                                        .font(.caption)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(
                                            viewModel.selectedTags.contains(subcategory.name) ?
                                            Color("BrandPrimary").opacity(0.2) : Color(.systemGray6)
                                        )
                                        .foregroundColor(
                                            viewModel.selectedTags.contains(subcategory.name) ?
                                            Color("BrandPrimary") : .secondary
                                        )
                                        .cornerRadius(12)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Active Filter Bar
struct ActiveFilterBar: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        HStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(viewModel.selectedTags), id: \.self) { tag in
                        HStack(spacing: 4) {
                            Text(tag)
                                .font(.caption)
                                .foregroundColor(Color("BrandPrimary"))
                            
                            Button("✕") {
                                viewModel.hideFilterBar()
                            }
                            .font(.caption2)
                            .foregroundColor(Color("BrandPrimary"))
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color("BrandPrimary").opacity(0.1))
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
            }
            
            Button("Clear All") {
                viewModel.clearAllTags()
            }
            .font(.caption)
            .foregroundColor(Color("BrandPrimary"))
        }
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
                .scrollIndicators(.hidden)
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



// MARK: - Offer/Request Toggle
struct OfferRequestToggle: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        HStack(spacing: 0) {
            // Offers Button
            Button(action: {
                if !viewModel.showingOffers {
                    viewModel.togglePostType()
                }
            }) {
                Text("Offers")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(viewModel.showingOffers ? .white : Color("BrandPrimary"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        viewModel.showingOffers ? Color("BrandPrimary") : Color.clear
                    )
            }
            
            // Requests Button
            Button(action: {
                if viewModel.showingOffers {
                    viewModel.togglePostType()
                }
            }) {
                Text("Requests")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(!viewModel.showingOffers ? .white : Color("BrandPrimary"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        !viewModel.showingOffers ? Color("BrandPrimary") : Color.clear
                    )
            }
        }
        .background(Color(.systemGray6))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color("BrandPrimary"), lineWidth: 1)
        )
    }
}

// MARK: - Compact Filter Indicator
struct CompactFilterIndicator: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        HStack {
            HStack(spacing: 8) {
                Image(systemName: "line.3.horizontal.decrease.circle.fill")
                    .font(.caption)
                    .foregroundColor(Color("BrandPrimary"))
                
                Text("Filters Active")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color("BrandPrimary"))
                
                // Show selected category
                if let category = viewModel.selectedCategory {
                    Text("(\(category))")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Button("Show") {
                viewModel.showingFilterBar = true
            }
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(Color("BrandPrimary"))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color("BrandPrimary").opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Category Dropdown Button
struct CategoryDropdownButton: View {
    let category: PostCategory
    let isSelected: Bool
    let isExpanded: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 6) {
                HStack(spacing: 4) {
                    Image(systemName: category.systemIconName)
                        .font(.title3)
                    
                    if isSelected {
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.caption2)
                            .foregroundColor(isSelected ? .white : Color(hex: category.color))
                    }
                }
                
                Text(category.displayName)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundColor(isSelected ? .white : Color(hex: category.color))
            .frame(width: 80, height: 70)
            .background(
                isSelected ? Color(hex: category.color) : Color(hex: category.color)?.opacity(0.1)
            )
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? Color.clear : Color(hex: category.color)?.opacity(0.3) ?? Color.clear,
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthenticationManager())
}

