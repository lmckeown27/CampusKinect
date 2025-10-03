//
//  CreatePostView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct CreatePostView: View {
    @StateObject private var viewModel = CreatePostViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var title = ""
    @State private var content = ""
    @State private var selectedCategory: PostCategory?
    @State private var selectedSubcategory: PostSubcategory?
    @State private var location = ""
    @State private var showingSuccess = false
    @State private var selectedImages: [LocalImage] = []
    @State private var showingValidationAlert = false
    @State private var validationMessage = ""
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Offer/Request selection (required for Goods, Services, Housing)
    @State private var selectedOfferRequest: String? = nil
    
    // Category selection modal state
    @State private var showingCategorySelection = false
    
    // Category tag display visibility (separate from actual selection)
    @State private var showingCategoryTag = true
    
    // Admin multi-university posting
    @State private var showingUniversitySelector = false
    @State private var selectedUniversities: Set<Int> = []
    @State private var isSelectingAllUniversities = false
    
    // Check if current user is admin (liam_mckeown38 only)
    private var isAdmin: Bool {
        return authManager.currentUser?.username == "liam_mckeown38"
    }
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                VStack(spacing: 20) {
                    titleInputSection
                    contentInputSection
                    categorySelectionSection
                    
                    // Admin University Selection
                    if isAdmin {
                        adminUniversitySelectionSection
                    }
                    
                    locationInputSection
                    ImagePickerView(selectedImages: $selectedImages)
                    Spacer(minLength: 20)
                }
                .padding()
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.7, 700) : .infinity)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.campusBackground)
            .onTapGesture {
                hideKeyboard()
            }
        }
        .navigationTitle("Create Post")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    postButton
                }
            }
            .sheet(isPresented: $showingCategorySelection) {
                CategorySelectionView(
                    selectedCategory: $selectedCategory,
                    selectedSubcategory: $selectedSubcategory,
                    selectedOfferRequest: $selectedOfferRequest,
                    isPresented: $showingCategorySelection
                )
            }
            .sheet(isPresented: $showingUniversitySelector) {
                AdminUniversitySelector(
                    selectedUniversities: $selectedUniversities,
                    isSelectingAll: $isSelectingAllUniversities
                )
            }
            .onChange(of: selectedCategory) { _, _ in
                // Show the tag again when a category is selected
                if selectedCategory != nil {
                    showingCategoryTag = true
                }
            }
            .alert("Post Created!", isPresented: $showingSuccess) {
                Button("OK") {
                    clearForm()
                }
            } message: {
                if isAdmin && isSelectingAllUniversities {
                    Text("Your post has been sent to all universities!")
                } else if isAdmin && !selectedUniversities.isEmpty {
                    Text("Your post has been sent to \(selectedUniversities.count) \(selectedUniversities.count == 1 ? "university" : "universities")!")
                } else {
                    Text("Your post has been shared with the campus community!")
                }
            }
            .alert("Post Requirements", isPresented: $showingValidationAlert) {
                Button("OK") {
                    showingValidationAlert = false
                }
            } message: {
                Text(validationMessage)
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
    }
    
    // MARK: - UI Sections
    
    private var titleInputSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Post Title")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextField("Enter a catchy title for your post", text: $title)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .font(.body)
            
            HStack {
                Spacer()
                Text("\(title.count)/100")
                    .font(.caption)
                    .foregroundColor(title.count > 100 ? .red : .secondary)
            }
        }
    }
    
    private var contentInputSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Description")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextEditor(text: $content)
                .frame(minHeight: 120)
                .padding(12)
                .background(Color.campusBackgroundSecondary)
                .cornerRadius(12)
                .onTapGesture {
                    // Helps with focus management
                }
            
            HStack {
                Spacer()
                Text("\(content.count)/\(AppConstants.maxPostLength)")
                    .font(.caption)
                    .foregroundColor(content.count > AppConstants.maxPostLength ? .red : .secondary)
            }
        }
    }
    
    private var categorySelectionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Category")
                .font(.headline)
                .fontWeight(.semibold)
            
            HStack(spacing: 12) {
                categorySelectionButton
                
                if selectedCategory != nil {
                    Button(action: {
                        // Deselect category and clear related selections
                        selectedCategory = nil
                        selectedSubcategory = nil
                        selectedOfferRequest = nil
                        showingCategoryTag = true // Reset tag visibility
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "xmark")
                                .font(.caption)
                            Text("Clear")
                                .font(.caption)
                        }
                        .foregroundColor(.red)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }
            
            selectedCategoryTag
            offerRequestSelector
        }
    }
    
    private var categorySelectionButton: some View {
        Button(action: {
            showingCategorySelection = true
        }) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if let selectedCategory = selectedCategory {
                        Text(selectedCategory.displayName)
                            .font(.body)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)
                        
                        if let selectedSubcategory = selectedSubcategory {
                            Text(selectedSubcategory.displayName)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        Text("Select Category")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    @ViewBuilder
    private var selectedCategoryTag: some View {
        if let selectedCategory = selectedCategory, showingCategoryTag {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: selectedCategory.systemIconName)
                        .font(.caption)
                    Text(selectedCategory.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                    
                    Button(action: {
                        // Only hide the tag display, don't deselect the category
                        showingCategoryTag = false
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(hex: selectedCategory.color)?.opacity(0.1) ?? Color(.systemGray6))
                .foregroundColor(Color(hex: selectedCategory.color) ?? .primary)
                .cornerRadius(16)
                
                Spacer()
            }
        }
    }
    
    @ViewBuilder
    private var offerRequestSelector: some View {
        if requiresOfferRequestSelection {
            VStack(alignment: .leading, spacing: 8) {
                Text("Type")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
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
            .padding(.top, 8)
        }
    }
    
    private var locationInputSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Location (Optional)")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextField("Add a location...", text: $location)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
    }
    
    // MARK: - Admin University Selection Section
    private var adminUniversitySelectionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Target Universities")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Image(systemName: "crown.fill")
                    .font(.caption)
                    .foregroundColor(.yellow)
            }
            
            Button(action: {
                showingUniversitySelector = true
            }) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        if isSelectingAllUniversities {
                            Text("All Universities")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            Text("Post will be sent to all universities")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        } else if !selectedUniversities.isEmpty {
                            Text("\(selectedUniversities.count) Universities Selected")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            Text("Tap to view or modify selection")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        } else {
                            Text("Select Universities")
                                .font(.body)
                                .foregroundColor(.secondary)
                            Text("Choose which universities will see this post")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.blue.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                )
                .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
    
    private var postButton: some View {
        Button(action: {
            if isValidPost {
                Task {
                    await createPost()
                }
            } else {
                validateAndShowErrors()
            }
        }) {
            HStack {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                        .foregroundColor(.white)
                }
                Text(viewModel.isLoading ? "Posting..." : "Post")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .padding(.vertical, 8)
            .padding(.horizontal, 16)
            .background(
                viewModel.isLoading ? Color.gray : Color("BrandPrimary")
            )
            .cornerRadius(12)
        }
        .disabled(viewModel.isLoading)
    }
    
    private var requiresOfferRequestSelection: Bool {
        guard let category = selectedCategory else { return false }
        return ["goods", "services", "housing"].contains(category.name.lowercased())
    }
    
    private var isValidPost: Bool {
        let hasValidTitle = !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && title.count <= 100
        let hasValidContent = ValidationUtils.isValidPostContent(content)
        let hasCategory = selectedCategory != nil
        
        // If category requires offer/request selection, ensure it's selected
        if requiresOfferRequestSelection {
            let hasOfferRequest = selectedOfferRequest != nil
            return hasValidTitle && hasValidContent && hasCategory && hasOfferRequest
        }
        
        return hasValidTitle && hasValidContent && hasCategory
    }
    
    private func getValidationErrors() -> [String] {
        var errors: [String] = []
        
        // Check title
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedTitle.isEmpty {
            errors.append("• Title is required")
        } else if title.count > 100 {
            errors.append("• Title must be 100 characters or less (currently \(title.count))")
        }
        
        // Check content
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedContent.count < 10 {
            errors.append("• Description must be at least 10 characters (currently \(trimmedContent.count))")
        } else if content.count > AppConstants.maxPostLength {
            errors.append("• Description must be \(AppConstants.maxPostLength) characters or less (currently \(content.count))")
        }
        
        // Check category
        if selectedCategory == nil {
            errors.append("• Please select a category")
        }
        
        // Check offer/request if required
        if requiresOfferRequestSelection && selectedOfferRequest == nil {
            let categoryName = selectedCategory?.displayName ?? "this category"
            errors.append("• Please select either 'Offer' or 'Request' for \(categoryName) posts")
        }
        
        return errors
    }
    
    private func validateAndShowErrors() {
        let errors = getValidationErrors()
        if !errors.isEmpty {
            validationMessage = "Please fix the following issues:\n\n" + errors.joined(separator: "\n")
            showingValidationAlert = true
        }
    }
    
    private func createPost() async {
        guard let selectedCategory = selectedCategory else { return }
        
        await viewModel.createPost(
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            description: content,
            category: selectedCategory,
            subcategory: selectedSubcategory,
            location: location,
            offerRequest: selectedOfferRequest,
            images: selectedImages,
            targetUniversities: isAdmin ? selectedUniversities : nil,
            postToAllUniversities: isAdmin && isSelectingAllUniversities
        )
        
        if viewModel.successMessage != nil {
            showingSuccess = true
        }
    }
    
    private func clearForm() {
        title = ""
        content = ""
        selectedCategory = nil
        selectedSubcategory = nil
        location = ""
        selectedOfferRequest = nil
        selectedImages = []
        selectedUniversities = []
        isSelectingAllUniversities = false
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
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
            .foregroundColor(isSelected ? .white : Color.campusPrimary)
            .frame(width: 80, height: 70)
            .background(
                isSelected ? Color.campusPrimary : Color.campusOlive100
            )
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? Color.clear : Color.campusPrimary.opacity(0.3),
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
                    isSelected ? Color.campusPrimary : Color.campusBackgroundSecondary
                )
                .foregroundColor(
                    isSelected ? .white : .primary
                )
                .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Offer/Request Button
struct OfferRequestButton: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : Color("BrandPrimary"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    isSelected ? Color("BrandPrimary") : Color(.systemGray6)
                )
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color("BrandPrimary"), lineWidth: isSelected ? 0 : 1)
                )
        }
    }
}

#Preview {
    CreatePostView()
}

