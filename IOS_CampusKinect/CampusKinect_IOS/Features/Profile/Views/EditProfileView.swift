//
//  EditProfileView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI
import UIKit

struct EditProfileView: View {
    @StateObject private var viewModel = EditProfileViewModel()
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    @State private var showingSuccessAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Picture Section
                    ProfilePictureEditor(
                        profileImage: $viewModel.profileImage,
                        profileImageUrl: viewModel.profileImageUrl,
                        onTap: viewModel.selectImageSource
                    )
                    
                    // Form Fields
                    VStack(spacing: 16) {
                        // Username Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Username")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter username", text: $viewModel.username)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                        }
                        
                        // Display Name Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Display Name")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter display name", text: $viewModel.displayName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // First Name Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("First Name")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter first name", text: $viewModel.firstName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Last Name Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Last Name")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter last name", text: $viewModel.lastName)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Year Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Year")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter year (e.g., 2)", text: $viewModel.year)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numberPad)
                        }
                        
                        // Major Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Major")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter major", text: $viewModel.major)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Hometown Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Hometown")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter hometown", text: $viewModel.hometown)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Bio Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Bio")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Tell us about yourself", text: $viewModel.bio, axis: .vertical)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .lineLimit(3...6)
                        }
                    }
                    
                    // Save Button
                    Button(action: {
                        Task {
                            await viewModel.updateProfile()
                            if viewModel.error == nil {
                                showingSuccessAlert = true
                            }
                        }
                    }) {
                        if viewModel.isLoading {
                            HStack {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                                Text("Saving...")
                                    .foregroundColor(.white)
                            }
                        } else {
                            Text("Save Changes")
                                .foregroundColor(.white)
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewModel.validateForm() ? Color("BrandPrimary") : Color.gray)
                    .cornerRadius(12)
                    .disabled(!viewModel.validateForm() || viewModel.isLoading)
                }
                .padding()
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                viewModel.setAuthManager(authManager)
                viewModel.loadCurrentUserData()
            }
            .alert("Profile Updated", isPresented: $showingSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Your profile has been successfully updated.")
            }
            .alert("Error", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") {
                    viewModel.error = nil
                }
            } message: {
                Text(viewModel.error?.localizedDescription ?? "An unknown error occurred.")
            }
            .actionSheet(isPresented: $viewModel.showingImageSourceActionSheet) {
                ActionSheet(
                    title: Text("Select Profile Picture"),
                    buttons: [
                        .default(Text("Camera")) {
                            viewModel.openCamera()
                        },
                        .default(Text("Photo Library")) {
                            viewModel.openPhotoLibrary()
                        },
                        .cancel()
                    ]
                )
            }
            .sheet(isPresented: $viewModel.showingImagePicker) {
                ImagePicker(image: $viewModel.profileImage)
            }
            .sheet(isPresented: $viewModel.showingCamera) {
                CameraPicker(image: $viewModel.profileImage)
            }
        }
    }
}

// MARK: - Profile Picture Editor
struct ProfilePictureEditor: View {
    @Binding var profileImage: UIImage?
    let profileImageUrl: String?
    let onTap: () -> Void
    @State private var imageId = UUID() // For cache busting
    
    var body: some View {
        VStack(spacing: 12) {
            Button(action: onTap) {
                ZStack {
                    if let profileImage = profileImage {
                        Image(uiImage: profileImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 120, height: 120)
                            .clipShape(Circle())
                    } else if let profileImageUrl = profileImageUrl, !profileImageUrl.isEmpty {
                        let urlWithCacheBuster = "https://campuskinect.net\(profileImageUrl)?v=\(imageId.uuidString)"
                        AsyncImage(url: URL(string: urlWithCacheBuster)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color("BrandPrimary"))
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(.white)
                                )
                        }
                        .frame(width: 120, height: 120)
                        .clipShape(Circle())
                    } else {
                        Circle()
                            .fill(Color("BrandPrimary"))
                            .frame(width: 120, height: 120)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.white)
                            )
                    }
                    
                    // Camera overlay
                    Circle()
                        .fill(Color.black.opacity(0.3))
                        .frame(width: 120, height: 120)
                        .overlay(
                            Image(systemName: "camera.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                        )
                }
            }
            .buttonStyle(PlainButtonStyle())
            
            Text("Tap to change photo")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .onChange(of: profileImageUrl) { _ in
            // Force image reload when profile picture URL changes
            imageId = UUID()
        }
    }
}

// MARK: - Image Picker
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) private var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        picker.allowsEditing = true
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let editedImage = info[.editedImage] as? UIImage {
                parent.image = editedImage
            } else if let originalImage = info[.originalImage] as? UIImage {
                parent.image = originalImage
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// MARK: - Camera Picker
struct CameraPicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) private var dismiss
    
    typealias UIViewControllerType = CameraViewController
    
    func makeUIViewController(context: Context) -> CameraViewController {
        let controller = CameraViewController()
        controller.delegate = context.coordinator
        controller.flashMode = .auto
        controller.initialCameraDevice = .rear
        controller.allowsEditing = true
        return controller
    }
    
    func updateUIViewController(_ uiViewController: CameraViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, CameraViewDelegate {
        let parent: CameraPicker
        
        init(_ parent: CameraPicker) {
            self.parent = parent
        }
        
        func didCaptureImage(_ image: UIImage) {
            parent.image = image
            parent.dismiss()
        }
        
        func didCancel() {
            parent.dismiss()
        }
    }
}



#Preview {
    EditProfileView()
        .environmentObject(AuthenticationManager())
}

