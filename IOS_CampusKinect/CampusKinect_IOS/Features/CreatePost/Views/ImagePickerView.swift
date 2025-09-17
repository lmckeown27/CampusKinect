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
    
    let maxImages = 4
    let useAdvancedCamera = true // Set to true for custom flash control
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Photos")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
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
                    HStack(spacing: 8) { // Reduced spacing since we have padding on thumbnails
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
                                .frame(width: 120, height: 120) // Match new thumbnail size
                                .background(Color(.systemGray6))
                                .cornerRadius(12) // Match new corner radius
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            }
                            .padding(.top, 16) // Match thumbnail padding
                            .padding(.trailing, 16) // Match thumbnail padding
                        }
                    }
                    .padding(.horizontal, 4)
                    .padding(.top, 0) // Remove extra top padding since thumbnails have their own
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
        
        // Add haptic feedback for immediate response
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
        
        // Create a temporary LocalImage with immediate visual feedback
        let tempLocalImage = LocalImage(
            image: image,
            data: Data(), // Temporary empty data
            isUploading: true
        )
        
        // Add to UI immediately for instant feedback
        selectedImages.append(tempLocalImage)
        
        // Process image data in background
        Task {
            // Optimize image processing
            let processedImage = await optimizeImage(image)
            
            if let imageData = processedImage.jpegData(compressionQuality: 0.85) { // Slightly higher quality
                await MainActor.run {
                    // Update the image with actual data
                    if let index = selectedImages.firstIndex(where: { $0.id == tempLocalImage.id }) {
                        selectedImages[index] = LocalImage(
                            image: processedImage,
                            data: imageData,
                            isUploading: false
                        )
                    }
                }
            } else {
                await MainActor.run {
                    // Remove if processing failed
                    selectedImages.removeAll { $0.id == tempLocalImage.id }
                }
            }
        }
    }
    
    @MainActor
    private func optimizeImage(_ image: UIImage) async -> UIImage {
        return await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                // Optimize image size and orientation
                let maxDimension: CGFloat = 2048
                let optimizedImage: UIImage
                
                // Fix orientation first
                let orientationFixedImage = image.fixedOrientation()
                
                // Resize if needed
                if max(orientationFixedImage.size.width, orientationFixedImage.size.height) > maxDimension {
                    let scale = maxDimension / max(orientationFixedImage.size.width, orientationFixedImage.size.height)
                    let newSize = CGSize(
                        width: orientationFixedImage.size.width * scale,
                        height: orientationFixedImage.size.height * scale
                    )
                    
                    UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
                    orientationFixedImage.draw(in: CGRect(origin: .zero, size: newSize))
                    optimizedImage = UIGraphicsGetImageFromCurrentImageContext() ?? orientationFixedImage
                    UIGraphicsEndImageContext()
                } else {
                    optimizedImage = orientationFixedImage
                }
                
                continuation.resume(returning: optimizedImage)
            }
        }
    }
    
    private func removeImage(_ localImage: LocalImage) {
        selectedImages.removeAll { $0.id == localImage.id }
    }
    
    private func loadPhotosPickerItems(_ items: [PhotosPickerItem]) async {
        // Add haptic feedback for selection
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
        
        for item in items {
            guard selectedImages.count < maxImages else { break }
            
            // Create placeholder image immediately
            let placeholderImage = UIImage(systemName: "photo") ?? UIImage()
            let tempLocalImage = LocalImage(
                image: placeholderImage,
                data: Data(),
                isUploading: true
            )
            
            // Add placeholder to UI immediately
            await MainActor.run {
                selectedImages.append(tempLocalImage)
            }
            
            // Load actual image data in background
            if let data = try? await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                
                // Process the image
                let processedImage = await optimizeImage(image)
                
                await MainActor.run {
                    // Replace placeholder with actual image
                    if let index = selectedImages.firstIndex(where: { $0.id == tempLocalImage.id }) {
                        selectedImages[index] = LocalImage(
                            image: processedImage,
                            data: processedImage.jpegData(compressionQuality: 0.85) ?? data,
                            isUploading: false
                        )
                    }
                }
            } else {
                // Remove placeholder if loading failed
                await MainActor.run {
                    selectedImages.removeAll { $0.id == tempLocalImage.id }
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
    @State private var showingFullImage = false
    
    var body: some View {
        ZStack {
            // Main image with tap to expand
            Button(action: {
                showingFullImage = true
            }) {
                Image(uiImage: localImage.image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 120, height: 120)
                    .clipped()
                    .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())
            .allowsHitTesting(true) // Allow tapping on image
            .overlay(
                // Upload status overlay
                Group {
                    if localImage.isUploading {
                        Color.black.opacity(0.6)
                            .overlay(
                                VStack(spacing: 8) {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(1.2)
                                    
                                    Text("Uploading...")
                                        .font(.caption2)
                                        .foregroundColor(.white)
                                        .fontWeight(.medium)
                                }
                            )
                            .cornerRadius(12)
                            .transition(.opacity)
                            .allowsHitTesting(false) // Don't block X button
                    } else if localImage.uploadError != nil {
                        Color.red.opacity(0.8)
                            .overlay(
                                VStack(spacing: 4) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(.white)
                                        .font(.title3)
                                    
                                    Text("Failed")
                                        .font(.caption2)
                                        .foregroundColor(.white)
                                        .fontWeight(.medium)
                                }
                            )
                            .cornerRadius(12)
                            .transition(.opacity)
                            .allowsHitTesting(false) // Don't block X button
                    } else if localImage.uploadedURL != nil {
                        // Success indicator
                        VStack {
                            Spacer()
                            HStack {
                                Spacer()
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                    .background(Color.white)
                                    .clipShape(Circle())
                                    .font(.title3)
                                    .shadow(color: Color.black.opacity(0.2), radius: 2, x: 0, y: 1)
                            }
                        }
                        .padding(8)
                        .allowsHitTesting(false) // Don't block X button
                    }
                }
            )
            
            // Enhanced X button positioned to overlap beyond image bounds
            // This is placed after the image in the ZStack so it appears on top
            VStack {
                HStack {
                    Spacer()
                    Button(action: {
                        // Add haptic feedback
                        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                        impactFeedback.impactOccurred()
                        onRemove()
                    }) {
                        ZStack {
                            // Background circle for better visibility
                            Circle()
                                .fill(Color.black.opacity(0.8))
                                .frame(width: 32, height: 32)
                            
                            // White border for contrast
                            Circle()
                                .stroke(Color.white, lineWidth: 2)
                                .frame(width: 32, height: 32)
                            
                            // X mark icon
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                    .shadow(color: Color.black.opacity(0.4), radius: 4, x: 0, y: 2)
                    .offset(x: 16, y: -16) // Positioned to extend beyond image bounds
                    .zIndex(1) // Ensure X button is on top
                }
                Spacer()
            }
        }
        .frame(width: 120, height: 120) // Maintain image size
        .padding(.top, 16) // Add padding to accommodate overlapping X button
        .padding(.trailing, 16) // Add padding to accommodate overlapping X button
        .fullScreenCover(isPresented: $showingFullImage) {
            FullImageView(image: localImage.image)
        }
    }
}

// MARK: - Full Image View
struct FullImageView: View {
    let image: UIImage
    @Environment(\.dismiss) private var dismiss
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .scaleEffect(scale)
                .offset(offset)
                .gesture(
                    SimultaneousGesture(
                        MagnificationGesture()
                            .onChanged { value in
                                scale = max(1.0, min(value, 4.0))
                            },
                        DragGesture()
                            .onChanged { value in
                                offset = CGSize(
                                    width: lastOffset.width + value.translation.width,
                                    height: lastOffset.height + value.translation.height
                                )
                            }
                            .onEnded { _ in
                                lastOffset = offset
                            }
                    )
                )
                .onTapGesture(count: 2) {
                    withAnimation(.spring()) {
                        if scale > 1.0 {
                            scale = 1.0
                            offset = .zero
                            lastOffset = .zero
                        } else {
                            scale = 2.0
                        }
                    }
                }
            
            // Close button
            VStack {
                HStack {
                    Spacer()
                    Button(action: {
                        dismiss()
                    }) {
                        ZStack {
                            Circle()
                                .fill(Color.black.opacity(0.6))
                                .frame(width: 44, height: 44)
                            
                            Image(systemName: "xmark")
                                .font(.system(size: 18, weight: .medium))
                                .foregroundColor(.white)
                        }
                    }
                    .padding()
                }
                Spacer()
            }
        }
        .onTapGesture {
            dismiss()
        }
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
            // Fix image orientation to ensure proper display
            let orientedImage = image.fixedOrientation()
            delegate?.didCaptureImage(orientedImage)
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

