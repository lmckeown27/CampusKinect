//
//  EditPostView.swift
//  CampusKinect_IOS
//
//  Created by AI Assistant on 10/4/25.
//

import SwiftUI

struct EditPostView: View {
    @StateObject private var viewModel: EditPostViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var title: String
    @State private var content: String
    @State private var location: String
    @State private var selectedCategory: PostCategory?
    @State private var selectedSubcategory: PostSubcategory?
    @State private var selectedOfferRequest: String?
    
    @State private var showingSuccessAlert = false
    @State private var showingErrorAlert = false
    
    init(post: Post) {
        _viewModel = StateObject(wrappedValue: EditPostViewModel(post: post))
        
        // Initialize state from post
        _title = State(initialValue: post.title)
        _content = State(initialValue: post.description)
        _location = State(initialValue: post.location ?? "")
        
        // Determine category from postType
        let category = PostCategory.allCategories.first { $0.id == post.postType }
        _selectedCategory = State(initialValue: category)
        
        // Determine subcategory from tags (if any match)
        if let category = category {
            let subcategory = category.subcategories.first { sub in
                post.tags.contains(sub.name) || post.tags.contains(sub.displayName)
            }
            _selectedSubcategory = State(initialValue: subcategory)
        }
        
        // Determine offer/request from tags
        if post.tags.contains(where: { $0.lowercased() == "offer" }) {
            _selectedOfferRequest = State(initialValue: "offer")
        } else if post.tags.contains(where: { $0.lowercased() == "request" }) {
            _selectedOfferRequest = State(initialValue: "request")
        }
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Title Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Title")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        TextField("Enter post title", text: $title)
                            .textFieldStyle(.roundedBorder)
                            .autocapitalization(.words)
                    }
                    
                    // Description Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        TextEditor(text: $content)
                            .frame(minHeight: 120)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                    
                    // Category Selection
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Category")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 2), spacing: 16) {
                            ForEach(PostCategory.allCategories) { category in
                                CategoryButton(
                                    category: category,
                                    isSelected: selectedCategory?.id == category.id,
                                    onTap: {
                                        selectedCategory = category
                                        selectedSubcategory = nil
                                        if category.id == "events" {
                                            selectedOfferRequest = nil
                                        }
                                    }
                                )
                            }
                        }
                    }
                    
                    // Offer/Request Selection (for non-events)
                    if let category = selectedCategory, category.id != "events" {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Type")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            HStack(spacing: 16) {
                                OfferRequestButton(
                                    title: "Offer",
                                    isSelected: selectedOfferRequest == "offer",
                                    onTap: { selectedOfferRequest = "offer" }
                                )
                                
                                OfferRequestButton(
                                    title: "Request",
                                    isSelected: selectedOfferRequest == "request",
                                    onTap: { selectedOfferRequest = "request" }
                                )
                            }
                        }
                    }
                    
                    // Subcategory Selection
                    if let category = selectedCategory, !category.subcategories.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("\(category.displayName) Subcategory")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2), spacing: 12) {
                                ForEach(category.subcategories) { subcategory in
                                    SubcategoryButton(
                                        subcategory: subcategory,
                                        isSelected: selectedSubcategory?.id == subcategory.id,
                                        onTap: {
                                            selectedSubcategory = subcategory
                                        }
                                    )
                                }
                            }
                        }
                    }
                    
                    // Location Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Location (Optional)")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        TextField("Enter location", text: $location)
                            .textFieldStyle(.roundedBorder)
                            .autocapitalization(.words)
                    }
                    
                    // Note about images
                    Text("Note: Images cannot be changed after posting")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding()
            }
            .navigationTitle("Edit Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: saveChanges) {
                        if viewModel.isLoading {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Text("Save")
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(viewModel.isLoading || !isValid)
                }
            }
            .alert("Success", isPresented: $showingSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text(viewModel.successMessage ?? "Post updated successfully!")
            }
            .alert("Error", isPresented: $showingErrorAlert) {
                Button("OK") { }
            } message: {
                Text(viewModel.errorMessage ?? "Failed to update post")
            }
            .onChange(of: viewModel.successMessage) { oldValue, newValue in
                if newValue != nil {
                    showingSuccessAlert = true
                }
            }
            .onChange(of: viewModel.errorMessage) { oldValue, newValue in
                if newValue != nil {
                    showingErrorAlert = true
                }
            }
        }
    }
    
    private var isValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        content.count >= 10 &&
        selectedCategory != nil &&
        (selectedCategory?.id == "events" || selectedOfferRequest != nil)
    }
    
    private func saveChanges() {
        guard let category = selectedCategory else { return }
        
        Task {
            await viewModel.updatePost(
                postId: viewModel.post.id,
                title: title,
                description: content,
                category: category,
                subcategory: selectedSubcategory,
                location: location,
                offerRequest: selectedOfferRequest
            )
        }
    }
}

// MARK: - Supporting Views
private struct OfferRequestButton: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : Color.campusPrimary)
                .frame(maxWidth: .infinity)
                .padding()
                .background(isSelected ? Color.campusPrimary : Color.campusOlive100)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.campusPrimary, lineWidth: isSelected ? 0 : 1)
                )
        }
    }
}

private struct SubcategoryButton: View {
    let subcategory: PostSubcategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(subcategory.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : Color.campusPrimary)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(isSelected ? Color.campusPrimary : Color.campusOlive100)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.campusPrimary, lineWidth: isSelected ? 0 : 1)
                )
        }
    }
}

