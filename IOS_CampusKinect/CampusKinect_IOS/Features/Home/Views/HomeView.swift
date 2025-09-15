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
                // Tag Filter Section
                TagFilterSection()
                    .environmentObject(viewModel)
                
                // Active Filter Bar (only shows when tags are selected)
                if viewModel.hasTagsSelected {
                    ActiveFilterBar()
                        .environmentObject(viewModel)
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


// MARK: - Tag Filter Section
struct TagFilterSection: View {
    @EnvironmentObject var viewModel: HomeViewModel
    
    let categories = [
        ("goods", "Goods"),
        ("services", "Services"), 
        ("housing", "Housing"),
        ("events", "Events")
    ]
    
    let subcategories: [String: [String]] = [
        "goods": ["Clothing", "Parking Permits", "Household Appliances", "Electronics", "Furniture", "Concert Tickets", "Kitchen Items", "School Supplies", "Sports Equipment", "Automotive", "Pets", "Pet Supplies", "Other"],
        "services": ["Transportation", "Tutoring", "Fitness Training", "Meal Delivery", "Cleaning", "Photography", "Graphic Design", "Tech Support", "Web Development", "Writing & Editing", "Translation", "Towing", "Other"],
        "events": ["Sports Events", "Study Groups", "Rush", "Pickup Basketball", "Philanthropy", "Cultural Events", "Workshops", "Conferences", "Meetups", "Game Nights", "Movie Nights", "Hiking Trips", "Volunteer Events", "Career Fairs", "Other"],
        "housing": ["Leasing", "Subleasing", "Roommate Search", "Storage Space", "Other"]
    ]
    
    var body: some View {
        VStack(spacing: 12) {
            // Main Category Buttons
            HStack(spacing: 12) {
                ForEach(categories, id: \.0) { categoryId, categoryName in
                    Button(action: {
                        viewModel.toggleCategory(categoryId)
                    }) {
                        Text(categoryName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                viewModel.openCategories.contains(categoryId) ? 
                                Color("BrandPrimary") : Color(.systemGray6)
                            )
                            .foregroundColor(
                                viewModel.openCategories.contains(categoryId) ? 
                                .white : .primary
                            )
                            .cornerRadius(20)
                    }
                }
            }
            .padding(.horizontal)
            
            // Subcategory Tags (shown when category is open)
            ForEach(categories, id: \.0) { categoryId, _ in
                if viewModel.openCategories.contains(categoryId) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("\(categoryId.capitalized) Tags")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Button("✕") {
                                viewModel.toggleCategory(categoryId)
                            }
                            .font(.caption)
                            .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                            ForEach(subcategories[categoryId] ?? [], id: \.self) { tag in
                                Button(action: {
                                    viewModel.toggleTag(tag)
                                }) {
                                    Text(tag)
                                        .font(.caption)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(
                                            viewModel.selectedTags.contains(tag) ?
                                            Color("BrandPrimary").opacity(0.2) : Color(.systemGray6)
                                        )
                                        .foregroundColor(
                                            viewModel.selectedTags.contains(tag) ?
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
        .animation(.easeInOut(duration: 0.2), value: viewModel.openCategories)
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
                                viewModel.toggleTag(tag)
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

#Preview {
    HomeView()
        .environmentObject(AuthenticationManager())
}

