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
            
            let updatedUser = try await apiService.updateProfile(updateRequest)
            
            // Update the auth manager with new user data
            await authManager?.updateCurrentUser(updatedUser)
            
            isLoading = false
        } catch {
            self.error = error as? APIError ?? APIError.unknown
            isLoading = false
        }
    }
    
    private func uploadProfileImage(_ image: UIImage) async {
        do {
            guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                throw APIError.invalidData
            }
            
            // Upload the image
            let uploadedUrls = try await apiService.uploadImages([imageData])
            guard let imageUrl = uploadedUrls.first else {
                throw APIError.invalidData
            }
            
            // Update profile picture
            let updatedUser = try await apiService.updateProfilePicture(imageUrl)
            await authManager?.updateCurrentUser(updatedUser)
            
        } catch {
            self.error = error as? APIError ?? APIError.unknown
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

