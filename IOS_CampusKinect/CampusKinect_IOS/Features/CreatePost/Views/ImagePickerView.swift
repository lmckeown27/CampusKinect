//
//  ImagePickerView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/15/25.
//

import SwiftUI
import PhotosUI
import UIKit

struct ImagePickerView: View {
    @Binding var selectedImages: [LocalImage]
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingActionSheet = false
    @State private var photosPickerItems: [PhotosPickerItem] = []
    
    let maxImages = 5
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Photos")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                if selectedImages.count < maxImages {
                    Button(action: {
                        showingActionSheet = true
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "plus")
                                .font(.system(size: 14, weight: .medium))
                            Text("Add Photo")
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color("BrandPrimary"))
                        .cornerRadius(8)
                    }
                }
            }
            
            if selectedImages.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    
                    Text("Add photos to your post")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Button(action: {
                        showingActionSheet = true
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "camera")
                            Text("Add Photos")
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color("BrandPrimary"))
                        .cornerRadius(10)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .background(Color(.systemGray6))
                .cornerRadius(12)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(selectedImages) { localImage in
                            ImageThumbnailView(
                                localImage: localImage,
                                onRemove: {
                                    removeImage(localImage)
                                }
                            )
                        }
                        
                        if selectedImages.count < maxImages {
                            Button(action: {
                                showingActionSheet = true
                            }) {
                                VStack(spacing: 8) {
                                    Image(systemName: "plus")
                                        .font(.title2)
                                        .foregroundColor(.gray)
                                    
                                    Text("Add")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                .frame(width: 80, height: 80)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 4)
                }
                
                Text("\(selectedImages.count)/\(maxImages) photos")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .confirmationDialog("Add Photo", isPresented: $showingActionSheet) {
            Button("Take Photo") {
                showingCamera = true
            }
            
            Button("Choose from Library") {
                showingImagePicker = true
            }
            
            Button("Cancel", role: .cancel) { }
        }
        .photosPicker(
            isPresented: $showingImagePicker,
            selection: $photosPickerItems,
            maxSelectionCount: maxImages - selectedImages.count,
            matching: .images
        )
        .fullScreenCover(isPresented: $showingCamera) {
            CameraView { image in
                addImage(image)
            }
        }
        .onChange(of: photosPickerItems) { items in
            Task {
                await loadPhotosPickerItems(items)
            }
        }
    }
    
    private func addImage(_ image: UIImage) {
        guard selectedImages.count < maxImages else { return }
        
        if let imageData = image.jpegData(compressionQuality: 0.8) {
            let localImage = LocalImage(
                image: image,
                data: imageData
            )
            selectedImages.append(localImage)
        }
    }
    
    private func removeImage(_ localImage: LocalImage) {
        selectedImages.removeAll { $0.id == localImage.id }
    }
    
    private func loadPhotosPickerItems(_ items: [PhotosPickerItem]) async {
        for item in items {
            guard selectedImages.count < maxImages else { break }
            
            if let data = try? await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                await MainActor.run {
                    addImage(image)
                }
            }
        }
        
        await MainActor.run {
            photosPickerItems = []
        }
    }
}

struct ImageThumbnailView: View {
    let localImage: LocalImage
    let onRemove: () -> Void
    
    var body: some View {
        ZStack(alignment: .topTrailing) {
            Image(uiImage: localImage.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 80, height: 80)
                .clipped()
                .cornerRadius(8)
            
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.white)
                    .background(Color.black.opacity(0.6))
                    .clipShape(Circle())
            }
            .offset(x: 8, y: -8)
        }
        .overlay(
            // Upload status overlay
            Group {
                if localImage.isUploading {
                    Color.black.opacity(0.5)
                        .overlay(
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        )
                        .cornerRadius(8)
                } else if localImage.uploadError != nil {
                    Color.red.opacity(0.7)
                        .overlay(
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.white)
                                .font(.title3)
                        )
                        .cornerRadius(8)
                }
            }
        )
    }
}

struct CameraView: UIViewControllerRepresentable {
    let onImageCaptured: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        picker.allowsEditing = true
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.editedImage] as? UIImage ?? info[.originalImage] as? UIImage {
                parent.onImageCaptured(image)
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

#Preview {
    ImagePickerView(selectedImages: .constant([]))
}

