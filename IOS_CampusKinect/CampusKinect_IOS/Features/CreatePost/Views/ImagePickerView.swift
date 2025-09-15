//
//  ImagePickerView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/15/25.
//

import SwiftUI
import PhotosUI
import UIKit
import AVFoundation

struct ImagePickerView: View {
    @Binding var selectedImages: [LocalImage]
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingAdvancedCamera = false
    @State private var showingActionSheet = false
    @State private var photosPickerItems: [PhotosPickerItem] = []
    @State private var showingPermissionAlert = false
    @State private var permissionAlertMessage = ""
    
    let maxImages = 5
    let useAdvancedCamera = true // Set to true for custom flash control
    
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
                checkCameraPermissionAndOpen()
            }
            
            Button("Choose from Library") {
                showingImagePicker = true
            }
            
            Button("Cancel", role: .cancel) { }
        }
        .alert("Permission Required", isPresented: $showingPermissionAlert) {
            Button("Settings") {
                openAppSettings()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text(permissionAlertMessage)
        }
        .photosPicker(
            isPresented: $showingImagePicker,
            selection: $photosPickerItems,
            maxSelectionCount: maxImages - selectedImages.count,
            matching: .images
        )
        .fullScreenCover(isPresented: $showingCamera) {
            CameraView(
                onImageCaptured: { image in
                    addImage(image)
                },
                flashMode: .off, // Disable flash for faster capture
                cameraDevice: .rear,
                allowsEditing: true
            )
        }
        .fullScreenCover(isPresented: $showingAdvancedCamera) {
            AdvancedCameraView(
                onImageCaptured: { image in
                    addImage(image)
                },
                flashDuration: 0.08, // Very fast flash - 80ms
                flashIntensity: 0.6, // Moderate intensity
                enableCustomFlash: true
            )
        }
        .onChange(of: photosPickerItems) { oldValue, newValue in
            Task {
                await loadPhotosPickerItems(newValue)
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
    
    private func checkCameraPermissionAndOpen() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            if useAdvancedCamera {
                showingAdvancedCamera = true
            } else {
                showingCamera = true
            }
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted {
                        if self.useAdvancedCamera {
                            self.showingAdvancedCamera = true
                        } else {
                            self.showingCamera = true
                        }
                    } else {
                        self.permissionAlertMessage = "Camera access is required to take photos for your posts. Please enable camera access in Settings."
                        self.showingPermissionAlert = true
                    }
                }
            }
        case .denied, .restricted:
            permissionAlertMessage = "Camera access is required to take photos for your posts. Please enable camera access in Settings."
            showingPermissionAlert = true
        @unknown default:
            permissionAlertMessage = "Camera access is required to take photos for your posts. Please enable camera access in Settings."
            showingPermissionAlert = true
        }
    }
    
    private func openAppSettings() {
        if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(settingsUrl)
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
    
    // Camera configuration options
    var flashMode: UIImagePickerController.CameraFlashMode = .auto
    var cameraDevice: UIImagePickerController.CameraDevice = .rear
    var allowsEditing: Bool = true
    
    func makeUIViewController(context: Context) -> CameraViewController {
        let controller = CameraViewController()
        controller.delegate = context.coordinator
        controller.flashMode = flashMode
        controller.initialCameraDevice = cameraDevice
        controller.allowsEditing = allowsEditing
        return controller
    }
    
    func updateUIViewController(_ uiViewController: CameraViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, CameraViewDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func didCaptureImage(_ image: UIImage) {
            parent.onImageCaptured(image)
            parent.dismiss()
        }
        
        func didCancel() {
            parent.dismiss()
        }
    }
}

// MARK: - Camera View Delegate
protocol CameraViewDelegate: AnyObject {
    func didCaptureImage(_ image: UIImage)
    func didCancel()
}

// MARK: - Camera View Controller with Switching
class CameraViewController: UIViewController {
    weak var delegate: CameraViewDelegate?
    
    // Camera configuration
    var flashMode: UIImagePickerController.CameraFlashMode = .auto
    var initialCameraDevice: UIImagePickerController.CameraDevice = .rear
    var allowsEditing: Bool = true
    
    private var imagePicker: UIImagePickerController!
    private var currentCameraDevice: UIImagePickerController.CameraDevice = .rear
    private var flipButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        currentCameraDevice = initialCameraDevice
        setupImagePicker()
        setupUI()
        setupGestures()
    }
    
    private func setupImagePicker() {
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            delegate?.didCancel()
            return
        }
        
        imagePicker.sourceType = .camera
        imagePicker.allowsEditing = allowsEditing
        imagePicker.cameraCaptureMode = .photo
        imagePicker.cameraDevice = currentCameraDevice
        
        // Configure flash mode
        if UIImagePickerController.isFlashAvailable(for: currentCameraDevice) {
            imagePicker.cameraFlashMode = flashMode
        }
        
        // Add image picker as child view controller
        addChild(imagePicker)
        view.addSubview(imagePicker.view)
        imagePicker.view.frame = view.bounds
        imagePicker.didMove(toParent: self)
    }
    
    private func setupUI() {
        // Camera flip button
        flipButton = UIButton(type: .system)
        flipButton.setImage(UIImage(systemName: "camera.rotate"), for: .normal)
        flipButton.tintColor = .white
        flipButton.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        flipButton.layer.cornerRadius = 20
        flipButton.addTarget(self, action: #selector(flipCamera), for: .touchUpInside)
        
        flipButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(flipButton)
        
        // Setup constraints
        NSLayoutConstraint.activate([
            // Flip button - top left
            flipButton.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
            flipButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            flipButton.widthAnchor.constraint(equalToConstant: 40),
            flipButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }
    
    private func setupGestures() {
        // Double tap to flip camera
        let doubleTapGesture = UITapGestureRecognizer(target: self, action: #selector(flipCamera))
        doubleTapGesture.numberOfTapsRequired = 2
        view.addGestureRecognizer(doubleTapGesture)
    }
    
    @objc private func flipCamera() {
        // Toggle camera device
        let newDevice: UIImagePickerController.CameraDevice = (currentCameraDevice == .rear) ? .front : .rear
        
        // Check if the new camera device is available
        guard UIImagePickerController.isCameraDeviceAvailable(newDevice) else {
            print("⚠️ Camera device not available: \(newDevice)")
            return
        }
        
        currentCameraDevice = newDevice
        imagePicker.cameraDevice = currentCameraDevice
        
        // Update flash availability for new camera
        if UIImagePickerController.isFlashAvailable(for: currentCameraDevice) {
            imagePicker.cameraFlashMode = flashMode
        } else {
            imagePicker.cameraFlashMode = .off
        }
        
        // Animate button rotation
        UIView.animate(withDuration: 0.3) {
            self.flipButton.transform = self.flipButton.transform.rotated(by: .pi)
        }
    }
}

// MARK: - Image Picker Delegate
extension CameraViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        if let image = info[.editedImage] as? UIImage ?? info[.originalImage] as? UIImage {
            delegate?.didCaptureImage(image)
        } else {
            delegate?.didCancel()
        }
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        delegate?.didCancel()
    }
}

#Preview {
    ImagePickerView(selectedImages: .constant([]))
}

