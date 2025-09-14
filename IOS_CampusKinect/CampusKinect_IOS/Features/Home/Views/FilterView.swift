//
//  FilterView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct FilterView: View {
    @ObservedObject var viewModel: HomeViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedCategory: PostCategory?
    @State private var selectedSubcategory: PostSubcategory?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 16) {
                    Text("Filter Posts")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Choose categories and subcategories to filter your feed")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                
                Divider()
                
                // Content
                ScrollView {
                    LazyVStack(spacing: 20) {
                        // Categories
                        CategorySection(
                            selectedCategory: $selectedCategory,
                            selectedSubcategory: $selectedSubcategory
                        )
                        
                        // Subcategories
                        if let selectedCategory = selectedCategory {
                            SubcategorySection(
                                category: selectedCategory,
                                selectedSubcategory: $selectedSubcategory
                            )
                        }
                    }
                    .padding()
                }
                
                Spacer()
                
                // Actions
                VStack(spacing: 12) {
                    Button(action: {
                        viewModel.applyFilter(
                            category: selectedCategory,
                            subcategory: selectedSubcategory
                        )
                        dismiss()
                    }) {
                        Text("Apply Filters")
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.blue)
                            .cornerRadius(8)
                    }
                    
                    Button("Clear All Filters") {
                        selectedCategory = nil
                        selectedSubcategory = nil
                        viewModel.clearSearch()
                        dismiss()
                    }
                    .foregroundColor(.red)
                }
                .padding()
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            selectedCategory = viewModel.selectedCategory
            selectedSubcategory = viewModel.selectedSubcategory
        }
    }
}

// MARK: - Category Section
struct CategorySection: View {
    @Binding var selectedCategory: PostCategory?
    @Binding var selectedSubcategory: PostSubcategory?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Categories")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(PostCategory.allCategories, id: \.id) { category in
                    CategoryCard(
                        category: category,
                        isSelected: selectedCategory?.id == category.id
                    ) {
                        if selectedCategory?.id == category.id {
                            selectedCategory = nil
                            selectedSubcategory = nil
                        } else {
                            selectedCategory = category
                            selectedSubcategory = nil
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Subcategory Section
struct SubcategorySection: View {
    let category: PostCategory
    @Binding var selectedSubcategory: PostSubcategory?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Subcategories")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(category.subcategories, id: \.id) { subcategory in
                    SubcategoryChip(
                        subcategory: subcategory,
                        isSelected: selectedSubcategory?.id == subcategory.id
                    ) {
                        if selectedSubcategory?.id == subcategory.id {
                            selectedSubcategory = nil
                        } else {
                            selectedSubcategory = subcategory
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Category Card
struct CategoryCard: View {
    let category: PostCategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                Image(systemName: category.systemIconName)
                    .font(.title2)
                    .foregroundColor(isSelected ? .white : Color(hex: category.color))
                
                Text(category.displayName)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(isSelected ? .white : .primary)
            }
            .frame(height: 80)
            .frame(maxWidth: .infinity)
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

// MARK: - Subcategory Chip
struct SubcategoryChip: View {
    let subcategory: PostSubcategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(subcategory.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    isSelected ? Color("PrimaryColor") : Color(.systemGray6)
                )
                .foregroundColor(
                    isSelected ? .white : .primary
                )
                .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    FilterView(viewModel: HomeViewModel())
}

