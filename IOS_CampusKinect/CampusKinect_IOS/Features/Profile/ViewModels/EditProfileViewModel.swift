//
//  EditProfileViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import UIKit

@MainActor
class EditProfileViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var displayName: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var year: String = ""
    @Published var major: String = ""
    @Published var hometown: String = ""
    @Published var bio: String = ""
    @Published var profileImage: UIImage?
    @Published var profileImageUrl: String?
    
    @Published var isLoading = false
    @Published var error: APIError?
    @Published var showingImagePicker = false
    @Published var showingCamera = false
    @Published var showingImageSourceActionSheet = false
    
    private let apiService = APIService.shared
    private var authManager: AuthenticationManager?
    
    func setAuthManager(_ authManager: AuthenticationManager) {
        self.authManager = authManager
    }
    
    func loadCurrentUserData() {
        guard let user = authManager?.currentUser else { return }
        
        username = user.username ?? ""
        displayName = user.displayName
        firstName = user.firstName
        lastName = user.lastName
        year = user.year ?? ""
        major = user.major ?? ""
        hometown = user.hometown ?? ""
        bio = user.bio ?? ""
        profileImageUrl = user.profilePicture
    }
    
    func updateProfile() async {
        isLoading = true
        error = nil
        
        do {
            // First, upload profile image if changed
            if let profileImage = profileImage {
                await uploadProfileImage(profileImage)
            }
            
            // Then update profile data
            let updateRequest = UpdateProfileRequest(
                username: username.isEmpty ? nil : username,
                displayName: displayName.isEmpty ? nil : displayName,
                firstName: firstName.isEmpty ? nil : firstName,
                lastName: lastName.isEmpty ? nil : lastName,
                year: year.isEmpty ? nil : year,
                major: major.isEmpty ? nil : major,
                hometown: hometown.isEmpty ? nil : hometown,
                bio: bio.isEmpty ? nil : bio
            )
            
            guard let currentUser = authManager?.currentUser else {
                throw APIError.decodingError("No current user available")
            }
            
            let updatedUser = try await apiService.updateProfile(updateRequest, currentUser: currentUser)
            
            // Update the auth manager with new user data
            await authManager?.updateCurrentUser(updatedUser)
            
            isLoading = false
        } catch {
            self.error = error as? APIError ?? APIError.unknown(0)
            isLoading = false
        }
    }
    
    private func uploadProfileImage(_ image: UIImage) async {
        do {
            guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                throw APIError.decodingError("Failed to convert image to JPEG data")
            }
            
            // Upload the image
            let uploadedUrls = try await apiService.uploadImages([imageData])
            guard let imageUrl = uploadedUrls.first else {
                throw APIError.decodingError("No image URL returned from upload")
            }
            
            // Update profile picture
            guard let currentUser = authManager?.currentUser else {
                throw APIError.decodingError("No current user available")
            }
            
            // Try to update profile picture and refresh user
            do {
                let updatedUser = try await apiService.updateProfilePicture(imageUrl, currentUser: currentUser)
                await authManager?.updateCurrentUser(updatedUser)
            } catch {
                // Ignore decoding errors - the backend update succeeded (we got imageUrl)
                // The profile picture is already updated on the server
            }
            
            // Update the local profileImageUrl to trigger UI refresh
            self.profileImageUrl = imageUrl
            
        } catch {
            // Only show error if image upload failed (before we got imageUrl)
            self.error = error as? APIError ?? APIError.unknown(0)
        }
    }
    
    func selectImageSource() {
        showingImageSourceActionSheet = true
    }
    
    func openCamera() {
        showingCamera = true
        showingImageSourceActionSheet = false
    }
    
    func openPhotoLibrary() {
        showingImagePicker = true
        showingImageSourceActionSheet = false
    }
    
    func validateForm() -> Bool {
        return !displayName.trimmingCharacters(in: .whitespaces).isEmpty &&
               !firstName.trimmingCharacters(in: .whitespaces).isEmpty &&
               !lastName.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    func resetForm() {
        loadCurrentUserData()
        profileImage = nil
        error = nil
    }
}

