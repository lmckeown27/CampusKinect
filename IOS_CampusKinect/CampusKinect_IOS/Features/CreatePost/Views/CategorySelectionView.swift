//
//  CategorySelectionView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct CategorySelectionView: View {
    @Binding var selectedCategory: PostCategory?
    @Binding var selectedSubcategory: PostSubcategory?
    @Binding var selectedOfferRequest: String?
    @Binding var isPresented: Bool
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 24) {
                        categorySection
                        subcategorySection
                        offerRequestSection
                    }
                    .padding(.horizontal, isIPad ? 40 : 24)
                    .padding(.vertical, 32)
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.7, 700) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
        }
        .navigationTitle("Category")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: {
                    isPresented = false
                }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                }
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    isPresented = false
                }
                .fontWeight(.semibold)
                .foregroundColor(Color("BrandPrimary"))
            }
        }
    }
    
    // MARK: - Components
    
    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Select Category")
                .font(.title2)
                .fontWeight(.bold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: isIPad ? 3 : 2), spacing: 12) {
                ForEach(PostCategory.allCategories, id: \.id) { category in
                    CategoryButton(
                        category: category,
                        isSelected: selectedCategory?.id == category.id
                    ) {
                        selectedCategory = category
                        selectedSubcategory = nil
                        selectedOfferRequest = nil
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    private var subcategorySection: some View {
        if let selectedCategory = selectedCategory {
            VStack(alignment: .leading, spacing: 16) {
                Text("Select Subcategory")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: isIPad ? 3 : 2), spacing: 8) {
                    ForEach(selectedCategory.subcategories, id: \.id) { subcategory in
                        SubcategoryButton(
                            subcategory: subcategory,
                            isSelected: selectedSubcategory?.id == subcategory.id
                        ) {
                            selectedSubcategory = subcategory
                        }
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    private var offerRequestSection: some View {
        if requiresOfferRequestSelection {
            VStack(alignment: .leading, spacing: 16) {
                Text("Select Type")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                HStack(spacing: 12) {
                    OfferRequestButton(
                        title: "Offer",
                        isSelected: selectedOfferRequest == "offer"
                    ) {
                        selectedOfferRequest = "offer"
                    }
                    
                    OfferRequestButton(
                        title: "Request",
                        isSelected: selectedOfferRequest == "request"
                    ) {
                        selectedOfferRequest = "request"
                    }
                }
            }
        }
    }
    
    // MARK: - Computed Properties
    
    private var requiresOfferRequestSelection: Bool {
        guard let category = selectedCategory else { return false }
        return ["goods", "services", "housing"].contains(category.name.lowercased())
    }
}

// Note: CategoryButton, SubcategoryButton, and OfferRequestButton are defined in CreatePostView.swift

struct CategorySelectionView_Previews: PreviewProvider {
    static var previews: some View {
        CategorySelectionView(
            selectedCategory: .constant(nil),
            selectedSubcategory: .constant(nil),
            selectedOfferRequest: .constant(nil),
            isPresented: .constant(true)
        )
    }
}
