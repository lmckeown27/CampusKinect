//
//  EditPostViewModel.swift
//  CampusKinect_IOS
//
//  Created by AI Assistant on 10/4/25.
//

import Foundation
import SwiftUI

@MainActor
class EditPostViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    
    private let apiService = APIService.shared
    let post: Post // The post being edited
    
    init(post: Post) {
        self.post = post
    }
    
    func updatePost(
        postId: Int,
        title: String,
        description: String,
        category: PostCategory,
        subcategory: PostSubcategory?,
        location: String,
        offerRequest: String?
    ) async {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        do {
            // Build tags array
            var tags: [String] = []
            
            // Add category as a tag (Goods, Services, Housing)
            if category.id != "events" && !tags.contains(category.displayName) {
                tags.append(category.displayName)
            }
            
            // Add subcategory as a tag
            if let subcategory = subcategory {
                tags.append(subcategory.displayName)
            }
            
            // Add offer/request as a tag if selected (for goods/services/housing)
            if let offerRequest = offerRequest, !offerRequest.isEmpty, category.id != "events" {
                tags.append(offerRequest.capitalized) // "Offer" or "Request"
            }
            
            // postType is always the main category
            let finalPostType = category.id // "goods", "services", "housing", or "events"
            
            // Create update request
            let updateRequest = UpdatePostRequest(
                title: title,
                description: description,
                postType: finalPostType,
                durationType: "recurring",
                location: location.isEmpty ? nil : location,
                tags: tags
            )
            
            print("🔄 Updating post \(postId) with data:")
            print("   Title: \(title)")
            print("   Description: \(description)")
            print("   Post Type: \(finalPostType)")
            print("   Location: \(location)")
            print("   Tags: \(tags)")
            
            _ = try await apiService.updatePost(postId, updateRequest: updateRequest)
            
            await MainActor.run {
                isLoading = false
                successMessage = "Post updated successfully!"
            }
            
        } catch {
            await MainActor.run {
                isLoading = false
                errorMessage = "Failed to update post: \(error.localizedDescription)"
            }
            print("❌ Update post error: \(error)")
        }
    }
}

