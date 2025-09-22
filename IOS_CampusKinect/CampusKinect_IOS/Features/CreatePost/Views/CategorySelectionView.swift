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
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Category Selection
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Select Category")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2), spacing: 12) {
                            ForEach(PostCategory.allCategories, id: \.id) { category in
                                CategoryButton(
                                    category: category,
                                    isSelected: selectedCategory?.id == category.id
                                ) {
                                    selectedCategory = category
                                    selectedSubcategory = nil
                                    // Clear offer/request selection when changing categories
                                    selectedOfferRequest = nil
                                }
                            }
                        }
                    }
                    
                    // Subcategory Selection
                    if let selectedCategory = selectedCategory {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Select Subcategory")
                                .font(.headline)
                                .fontWeight(.semibold)
                            
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
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
                    
                    // Offer/Request Selection (for Goods, Services, Housing only)
                    if requiresOfferRequestSelection {
                        VStack(alignment: .leading, spacing: 12) {
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
                    
                    Spacer(minLength: 40)
                }
                .padding()
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
    }
    
    private var requiresOfferRequestSelection: Bool {
        guard let category = selectedCategory else { return false }
        return ["goods", "services", "housing"].contains(category.name.lowercased())
    }
}

#Preview {
    CategorySelectionView(
        selectedCategory: .constant(nil),
        selectedSubcategory: .constant(nil),
        selectedOfferRequest: .constant(nil),
        isPresented: .constant(true)
    )
}

}
