//
//  HomeView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @StateObject private var universitySwitcher = AdminUniversitySwitcher.shared
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    @State private var scrollToTopTrigger = 0
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    Spacer(minLength: 0)
                    
                    VStack(spacing: 0) {
                        // Category Button Section with collapse/expand arrow
                        VStack(spacing: 0) {
                            // Main Category Buttons (always visible)
                            MainCategoryButtons()
                                .environmentObject(viewModel)
                            
                            // Subcategory Tags (shown when category is selected and expanded)
                            if let selectedCategoryId = viewModel.selectedCategory,
                               viewModel.isCategoryExpanded,
                               let category = PostCategory.allCategories.first(where: { $0.id == selectedCategoryId }) {
                                SubcategoryTagsSection(category: category)
                                    .environmentObject(viewModel)
                            }
                            
                            // Collapse/Expand Arrow (only shows when main category is selected)
                            CategoryToggleArrow()
                                .environmentObject(viewModel)
                        }
                        
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
                        
                        }
                        
                        // Admin University Viewing Banner
                        if let universityName = universitySwitcher.currentViewingUniversityName,
                           let universityId = universitySwitcher.currentViewingUniversityId {
                            AdminUniversityBanner(
                                universityName: universityName,
                                universityId: universityId,
                                onReset: {
                                    universitySwitcher.clearViewingUniversity()
                                }
                            )
                            .padding(.horizontal)
                            .padding(.top, 8)
                        }
                        
                        // Guest University Banner
                        if authManager.isGuest,
                           let universityName = authManager.guestUniversityName,
                           let universityId = authManager.guestUniversityId {
                            GuestUniversityBanner(
                                universityName: universityName,
                                universityId: universityId
                            )
                            .padding(.horizontal)
                            .padding(.top, 8)
                        }
                        
                        // Posts List
                        PostsList(scrollToTopTrigger: $scrollToTopTrigger)
                            .environmentObject(viewModel)
                    }
                    .frame(maxWidth: isIPad ? min(geometry.size.width * 0.85, 900) : .infinity)
                    .frame(maxHeight: .infinity)
                    .clipped()
                    
                    Spacer(minLength: 0)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.campusBackground)
        .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                // Clear All button on the left
                ToolbarItem(placement: .navigationBarLeading) {
                    if !viewModel.selectedTags.isEmpty {
                        Button(action: {
                            viewModel.clearCategoryTagsOnly()
                        }) {
                            Text("Clear All")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(Color.campusPrimary)
                        }
                    }
                }
                
                // Logo in the center
                ToolbarItem(placement: .principal) {
                    if let universityName = universitySwitcher.currentViewingUniversityName {
                        // Admin is viewing a different university - show in toolbar
                        VStack(spacing: 2) {
                            Text(universityName)
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.blue)
                                .lineLimit(1)
                            Text("Admin View")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        // Normal logo - tap to scroll to top
                        Button(action: {
                            scrollToTopTrigger += 1
                        }) {
                            Image("Logo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: 32)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                
                // Offer/Request toggle on the right
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
            .onReceive(NotificationCenter.default.publisher(for: .scrollToTopHome)) { _ in
                // Scroll to top when notification is received
                scrollToTopTrigger += 1
            }
        }
    }
}


// MARK: - Main Category Buttons (Always Visible)
struct MainCategoryButtons: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Main Category Buttons (Visual Style from CreatePost)
            HStack(spacing: 16) {
                ForEach(PostCategory.allCategories) { category in
                    CategoryButton(
                        category: category,
                        isSelected: viewModel.selectedCategory == category.id,
                        onTap: {
                            viewModel.selectCategory(category.id)
                        }
                    )
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Subcategory Tags Section
struct SubcategoryTagsSection: View {
    @EnvironmentObject var viewModel: HomeViewModel
    let category: PostCategory
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("\(category.displayName) Tags")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                ForEach(category.subcategories) { subcategory in
                    Button(action: {
                        viewModel.toggleTag(subcategory.name)
                    }) {
                        Text(subcategory.name)
                            .font(.caption)
                            .fontWeight(.medium)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(
                                viewModel.selectedTags.contains(subcategory.name) ?
                                Color.campusPrimary : Color.campusOlive100
                            )
                            .foregroundColor(
                                viewModel.selectedTags.contains(subcategory.name) ?
                                .white : Color.campusPrimary
                            )
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(
                                        viewModel.selectedTags.contains(subcategory.name) ?
                                        Color.clear : Color.campusPrimary.opacity(0.3),
                                        lineWidth: 1
                                    )
                            )
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 12)
        .transition(.opacity.combined(with: .move(edge: .top)))
        .animation(.easeInOut(duration: 0.2), value: viewModel.selectedCategory)
    }
}

// MARK: - Active Filter Bar
struct ActiveFilterBar: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(viewModel.selectedTags), id: \.self) { tag in
                    HStack(spacing: 4) {
                        Text(tag)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        Button("✕") {
                            viewModel.toggleTag(tag) // Deselect the tag
                        }
                        .font(.caption2)
                        .foregroundColor(.white)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.campusPrimary) // Olive green background
                    .cornerRadius(12)
                }
            }
        }
    }
}

// MARK: - Posts List
struct PostsList: View {
    @EnvironmentObject var viewModel: HomeViewModel
    @Binding var scrollToTopTrigger: Int
    
    var body: some View {
        content
            .overlay(errorOverlay)
            .id(viewModel.currentUniversityId) // Force rebuild when university changes
    }
    
    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading && viewModel.posts.isEmpty {
            LoadingView()
        } else if viewModel.posts.isEmpty {
            EmptyStateView(
                title: "No Posts Yet",
                message: "Be the first to share something with your campus community!",
                systemImage: "doc.text"
            )
        } else {
            postsListWithScroll
        }
    }
    
    private var postsListWithScroll: some View {
        ScrollViewReader { proxy in
            postsList
                .onChange(of: scrollToTopTrigger) { oldValue, newValue in
                    withAnimation {
                        proxy.scrollTo("top", anchor: .top)
                    }
                }
        }
    }
    
    private var postsList: some View {
        List {
            postsForEach
            
            if viewModel.isLoading && !viewModel.posts.isEmpty {
                loadingIndicator
            }
        }
        .listStyle(PlainListStyle())
        .scrollIndicators(.hidden)
    }
    
    private var postsForEach: some View {
        ForEach(viewModel.filteredPosts) { post in
            postRow(for: post)
        }
    }
    
    private func postRow(for post: Post) -> some View {
        let rowId: AnyHashable = (post.id == viewModel.filteredPosts.first?.id) ? "top" : post.id
        
        return PostCardView(post: post)
            .listRowSeparator(.hidden)
            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
            .id(rowId)
            .onAppear {
                if post.id == viewModel.posts.last?.id {
                    Task {
                        await viewModel.loadMorePosts()
                    }
                }
            }
    }
    
    private var loadingIndicator: some View {
        HStack {
            Spacer()
            ProgressView()
                .padding()
            Spacer()
        }
        .listRowSeparator(.hidden)
    }
    
    @ViewBuilder
    private var errorOverlay: some View {
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
}




// MARK: - Offer/Request Toggle
struct OfferRequestToggle: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        HStack(spacing: 0) {
            // Offers Button
            Button(action: {
                viewModel.selectOfferRequest("offer")
            }) {
                Text("Offers")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(viewModel.selectedOfferRequest == "offer" ? .white : Color("BrandPrimary"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        viewModel.selectedOfferRequest == "offer" ? Color("BrandPrimary") : Color.clear
                    )
            }
            
            // Requests Button
            Button(action: {
                viewModel.selectOfferRequest("request")
            }) {
                Text("Requests")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(viewModel.selectedOfferRequest == "request" ? .white : Color("BrandPrimary"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        viewModel.selectedOfferRequest == "request" ? Color("BrandPrimary") : Color.clear
                    )
            }
        }
        .background(Color.campusBackgroundSecondary)
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
                
                // Show count of selected categories
                if viewModel.selectedCategory != nil {
                    Text("(\(PostCategory.allCategories.first(where: { $0.id == viewModel.selectedCategory })?.displayName ?? viewModel.selectedCategory ?? ""))")
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



// MARK: - Category Toggle Arrow
struct CategoryToggleArrow: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    var body: some View {
        // Only show arrow when a main category is selected
        if viewModel.selectedCategory != nil {
            Button(action: {
                withAnimation(.easeInOut(duration: 0.3)) {
                    viewModel.toggleSubcategoryVisibility()
                }
            }) {
                HStack {
                    Spacer()
                    
                    Image(systemName: viewModel.isCategoryExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                .padding(.vertical, 8)
                .background(Color.campusBackgroundSecondary.opacity(0.5))
            }
            .buttonStyle(PlainButtonStyle())
            .gesture(
                DragGesture(minimumDistance: 20)
                    .onEnded { value in
                        withAnimation(.easeInOut(duration: 0.3)) {
                            if value.translation.height < 0 {
                                // Swipe up - collapse
                                viewModel.isCategoryExpanded = false
                            } else if value.translation.height > 0 {
                                // Swipe down - expand
                                viewModel.isCategoryExpanded = true
                            }
                        }
                    }
            )
        }
    }
}

// MARK: - Admin University Banner
struct AdminUniversityBanner: View {
    let universityName: String
    let universityId: Int
    let onReset: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "eye.fill")
                .font(.title3)
                .foregroundColor(.white)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Viewing University")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.9))
                
                Text(universityName)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                
                Text("ID: \(universityId)")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
            
            Button(action: onReset) {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.uturn.backward")
                    Text("Reset")
                }
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.2))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.blue, Color.blue.opacity(0.8)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 4, y: 2)
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthenticationManager())
}


