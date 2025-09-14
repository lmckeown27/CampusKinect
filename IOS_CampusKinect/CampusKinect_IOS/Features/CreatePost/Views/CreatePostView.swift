//
//  CreatePostView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct CreatePostView: View {
    @State private var content = ""
    @State private var selectedCategory: PostCategory?
    @State private var selectedSubcategory: PostSubcategory?
    @State private var location = ""
    @State private var isPosting = false
    @State private var showingSuccess = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Content Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("What's happening on campus?")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextEditor(text: $content)
                            .frame(minHeight: 120)
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        
                        HStack {
                            Spacer()
                            Text("\(content.count)/\(AppConstants.maxPostLength)")
                                .font(.caption)
                                .foregroundColor(content.count > AppConstants.maxPostLength ? .red : .secondary)
                        }
                    }
                    
                    // Category Selection
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Category")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(PostCategory.allCategories, id: \.id) { category in
                                    CategoryButton(
                                        category: category,
                                        isSelected: selectedCategory?.id == category.id
                                    ) {
                                        selectedCategory = category
                                        selectedSubcategory = nil
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                        
                        // Subcategory Selection
                        if let selectedCategory = selectedCategory {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(selectedCategory.subcategories, id: \.id) { subcategory in
                                        SubcategoryButton(
                                            subcategory: subcategory,
                                            isSelected: selectedSubcategory?.id == subcategory.id
                                        ) {
                                            selectedSubcategory = subcategory
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                    
                    // Location Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Location (Optional)")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextField("Add a location...", text: $location)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    Spacer(minLength: 20)
                }
                .padding()
            }
            .navigationTitle("Create Post")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task {
                            await createPost()
                        }
                    }) {
                        Text("Post")
                            .fontWeight(.semibold)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 16)
                            .background(
                                isPosting ? Color.gray : Color("PrimaryColor")
                            )
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .disabled(!isValidPost || isPosting)
                }
            }
            .alert("Post Created!", isPresented: $showingSuccess) {
                Button("OK") {
                    clearForm()
                }
            } message: {
                Text("Your post has been shared with the campus community!")
            }
        }
    }
    
    private var isValidPost: Bool {
        return ValidationUtils.isValidPostContent(content) && selectedCategory != nil
    }
    
    private func createPost() async {
        isPosting = true
        
        // Simulate API call
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        
        isPosting = false
        showingSuccess = true
    }
    
    private func clearForm() {
        content = ""
        selectedCategory = nil
        selectedSubcategory = nil
        location = ""
    }
}

// MARK: - Category Button
struct CategoryButton: View {
    let category: PostCategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 6) {
                Image(systemName: category.systemIconName)
                    .font(.title3)
                
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

// MARK: - Subcategory Button
struct SubcategoryButton: View {
    let subcategory: PostSubcategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(subcategory.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    isSelected ? Color("PrimaryColor") : Color(.systemGray6)
                )
                .foregroundColor(
                    isSelected ? .white : .primary
                )
                .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    CreatePostView()
}

