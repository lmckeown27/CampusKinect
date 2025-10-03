//
//  CreatePostViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import SwiftUI

@MainActor
class CreatePostViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    
    private let apiService = APIService.shared
    
    func createPost(
        title: String,
        description: String,
        category: PostCategory,
        subcategory: PostSubcategory?,
        location: String,
        offerRequest: String?,
        images: [LocalImage] = [],
        targetUniversities: Set<Int>? = nil,
        postToAllUniversities: Bool = false
    ) async {
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        do {
            var imageUrls: [String] = []
            
            // Upload images first if any
            if !images.isEmpty {
                print("🖼️ Uploading \(images.count) images...")
                let imageDataArray = images.map { $0.data }
                imageUrls = try await apiService.uploadImages(imageDataArray)
                print("✅ Images uploaded successfully: \(imageUrls)")
            }
            
            // Build tags array
            var tags: [String] = []
            
            // Add subcategory as primary tag
            if let subcategory = subcategory {
                tags.append(subcategory.displayName)
            }
            
            // Add offer/request tag if applicable
            if let offerRequest = offerRequest {
                tags.append(offerRequest.lowercased())
            }
            
            // Map category to postType
            let postType: String
            switch category.id {
            case "goods":
                postType = "goods"
            case "services":
                postType = "services"
            case "events":
                postType = "events"
            case "housing":
                postType = "housing"
            default:
                postType = "goods" // fallback
            }
            
            // Prepare admin multi-university fields
            let universities = (postToAllUniversities || targetUniversities == nil || targetUniversities!.isEmpty) 
                ? nil 
                : Array(targetUniversities!)
            let postToAll = postToAllUniversities ? true : nil
            
            // Create the request
            let request = CreatePostRequest(
                title: title,
                description: description,
                postType: postType,
                durationType: offerRequest ?? "request", // Use offer/request, default to "request"
                location: location,
                tags: tags,
                images: imageUrls.isEmpty ? nil : imageUrls,
                targetUniversities: universities,
                postToAllUniversities: postToAll
            )
            
            print("🔍 Creating post with request: \(request)")
            
            // Make API call
            let createdPost = try await apiService.createPost(request)
            
            print("✅ Post created successfully: \(createdPost.id)")
            successMessage = "Post created successfully!"
            
        } catch {
            print("❌ Failed to create post: \(error)")
            
            if let apiError = error as? APIError {
                switch apiError {
                case .unauthorized:
                    errorMessage = "Please log in to create a post"
                case .serverError:
                    errorMessage = "Server error. Please try again later"
                case .networkError(let message):
                    errorMessage = "Network error: \(message)"
                case .decodingError(let message):
                    errorMessage = "Data parsing error: \(message)"
                case .invalidResponse:
                    errorMessage = "Invalid server response"
                case .badRequest(let message):
                    errorMessage = message
                case .invalidURL:
                    errorMessage = "Invalid URL"
                case .notFound:
                    errorMessage = "Resource not found"
                case .keychainError:
                    errorMessage = "Authentication error"
                case .accountBanned(let details, _):
                    errorMessage = details
                case .accountInactive(let details, _):
                    errorMessage = details
                case .unknown(let code):
                    errorMessage = "Unknown error (code: \(code))"
                }
            } else {
                errorMessage = "Failed to create post. Please try again."
            }
        }
        
        isLoading = false
    }
}

