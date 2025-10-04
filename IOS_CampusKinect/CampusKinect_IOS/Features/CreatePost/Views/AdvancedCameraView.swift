//
//  AdvancedCameraView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/15/25.
//

import SwiftUI
import AVFoundation
import UIKit

struct AdvancedCameraView: UIViewControllerRepresentable {
    let onImageCaptured: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss
    
    // Advanced camera configuration
    var flashDuration: Double = 0.1 // Reduced flash duration (default is ~0.5s)
    var flashIntensity: Float = 0.7 // Reduced flash intensity (0.0 to 1.0)
    var enableCustomFlash: Bool = true
    var enablePhotoReview: Bool = true // Enable Snapchat-like review screen
    
    func makeUIViewController(context: Context) -> AdvancedCameraViewController {
        let controller = AdvancedCameraViewController()
        controller.delegate = context.coordinator
        controller.flashDuration = flashDuration
        controller.flashIntensity = flashIntensity
        controller.enableCustomFlash = enableCustomFlash
        controller.enablePhotoReview = enablePhotoReview
        return controller
    }
    
    func updateUIViewController(_ uiViewController: AdvancedCameraViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, AdvancedCameraDelegate {
        let parent: AdvancedCameraView
        
        init(_ parent: AdvancedCameraView) {
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

// MARK: - Advanced Camera Delegate
protocol AdvancedCameraDelegate: AnyObject {
    func didCaptureImage(_ image: UIImage)
    func didCancel()
}

// MARK: - Advanced Camera View Controller
class AdvancedCameraViewController: UIViewController {
    weak var delegate: AdvancedCameraDelegate?
    
    // Camera configuration
    var flashDuration: Double = 0.1
    var flashIntensity: Float = 0.7
    var enableCustomFlash: Bool = true
    var enablePhotoReview: Bool = true
    
    // Camera components
    private var captureSession: AVCaptureSession!
    private var photoOutput: AVCapturePhotoOutput!
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private var captureDevice: AVCaptureDevice!
    private var currentCameraInput: AVCaptureDeviceInput!
    private var currentCameraPosition: AVCaptureDevice.Position = .back
    
    // UI Components
    private var captureButton: UIButton!
    private var cancelButton: UIButton!
    private var flashButton: UIButton!
    private var flipButton: UIButton!
    private var isFlashEnabled = false
    private var isCapturing = false
    
    // Photo review
    private var capturedImage: UIImage?
    private var reviewHostingController: UIHostingController<PhotoReviewView>?
    
    // Zoom functionality
    private var currentZoomFactor: CGFloat = 1.0
    private var beginZoomScale: CGFloat = 1.0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
        setupUI()
        updateFlashButtonVisibility()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startSession()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopSession()
    }
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        captureSession.sessionPreset = .photo
        
        // Setup initial camera input
        setupCameraInput(for: currentCameraPosition)
        
        // Setup photo output
        photoOutput = AVCapturePhotoOutput()
        if captureSession.canAddOutput(photoOutput) {
            captureSession.addOutput(photoOutput)
        }
        
        // Setup preview layer - CRITICAL: resizeAspectFill ensures photo matches preview
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.videoGravity = .resizeAspectFill // Photo will match this exactly
        previewLayer.frame = view.bounds
        view.layer.addSublayer(previewLayer)
    }
    
    private func setupCameraInput(for position: AVCaptureDevice.Position) {
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position) else {
            print("❌ Failed to get camera device for position: \(position)")
            return
        }
        
        captureDevice = camera
        
        do {
            let input = try AVCaptureDeviceInput(device: camera)
            
            // Remove existing input if any
            if let currentInput = currentCameraInput {
                captureSession.removeInput(currentInput)
            }
            
            // Add new input
            if captureSession.canAddInput(input) {
                captureSession.addInput(input)
                currentCameraInput = input
            }
        } catch {
            print("❌ Failed to create camera input: \(error)")
            return
        }
    }
    
    private func setupUI() {
        // Capture button with larger tap area
        captureButton = UIButton(type: .custom)
        captureButton.backgroundColor = .white
        captureButton.layer.cornerRadius = 40 // Updated for 80x80 button
        captureButton.layer.borderWidth = 5 // Slightly thicker border
        captureButton.layer.borderColor = UIColor(red: 0.44, green: 0.55, blue: 0.51, alpha: 1.0).cgColor // Olive Green
        
        // INSTANT CAPTURE: Photo taken the moment button is touched (no animations)
        captureButton.addTarget(self, action: #selector(capturePhotoOnTouchDown), for: .touchDown)
        
        // Visual feedback on button release (doesn't affect capture timing)
        captureButton.addTarget(self, action: #selector(resetCaptureButton), for: .touchUpInside)
        captureButton.addTarget(self, action: #selector(resetCaptureButton), for: .touchUpOutside)
        captureButton.addTarget(self, action: #selector(resetCaptureButton), for: .touchCancel)
        
        // Cancel button
        cancelButton = UIButton(type: .system)
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.titleLabel?.font = .systemFont(ofSize: 18, weight: .medium)
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        
        // Flash button
        flashButton = UIButton(type: .system)
        flashButton.setImage(UIImage(systemName: "bolt.slash"), for: .normal)
        flashButton.tintColor = .white
        flashButton.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        flashButton.layer.cornerRadius = 20
        flashButton.addTarget(self, action: #selector(toggleFlash), for: .touchUpInside)
        
        // Camera flip button
        flipButton = UIButton(type: .system)
        flipButton.setImage(UIImage(systemName: "camera.rotate"), for: .normal)
        flipButton.tintColor = .white
        flipButton.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        flipButton.layer.cornerRadius = 20
        flipButton.addTarget(self, action: #selector(flipCamera), for: .touchUpInside)
        
        // Add buttons to view
        [captureButton, cancelButton, flashButton, flipButton].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview($0)
        }
        
        // Setup constraints
        NSLayoutConstraint.activate([
            // Capture button - bottom center (larger and more accessible)
            captureButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            captureButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -30),
            captureButton.widthAnchor.constraint(equalToConstant: 80),
            captureButton.heightAnchor.constraint(equalToConstant: 80),
            
            // Cancel button - bottom left
            cancelButton.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
            cancelButton.centerYAnchor.constraint(equalTo: captureButton.centerYAnchor),
            
            // Flash button - top right
            flashButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -20),
            flashButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            flashButton.widthAnchor.constraint(equalToConstant: 40),
            flashButton.heightAnchor.constraint(equalToConstant: 40),
            
            // Flip button - top left
            flipButton.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
            flipButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            flipButton.widthAnchor.constraint(equalToConstant: 40),
            flipButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Setup gestures
        setupGestures()
    }
    
    private func setupGestures() {
        // Double tap to flip camera
        let doubleTapGesture = UITapGestureRecognizer(target: self, action: #selector(flipCamera))
        doubleTapGesture.numberOfTapsRequired = 2
        view.addGestureRecognizer(doubleTapGesture)
        
        // Pinch to zoom
        let pinchGesture = UIPinchGestureRecognizer(target: self, action: #selector(handlePinchToZoom(_:)))
        view.addGestureRecognizer(pinchGesture)
    }
    
    @objc private func handlePinchToZoom(_ gesture: UIPinchGestureRecognizer) {
        guard let device = captureDevice else { return }
        
        // Get min and max zoom factors
        let minZoomFactor: CGFloat = 1.0
        let maxZoomFactor: CGFloat = min(device.activeFormat.videoMaxZoomFactor, 10.0) // Cap at 10x
        
        switch gesture.state {
        case .began:
            beginZoomScale = currentZoomFactor
            
        case .changed:
            // Calculate new zoom factor
            var newZoomFactor = beginZoomScale * gesture.scale
            newZoomFactor = max(minZoomFactor, min(newZoomFactor, maxZoomFactor))
            
            // Apply zoom
            do {
                try device.lockForConfiguration()
                device.videoZoomFactor = newZoomFactor
                device.unlockForConfiguration()
                
                currentZoomFactor = newZoomFactor
            } catch {
                print("❌ Error setting zoom: \(error)")
            }
            
        default:
            break
        }
    }
    
    private func startSession() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }
    
    private func stopSession() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.stopRunning()
        }
    }
    
    @objc private func capturePhotoOnTouchDown() {
        // *** ABSOLUTE INSTANT CAPTURE - ZERO LAG ***
        guard !isCapturing else { return }
        
        // CAPTURE - This is the ONLY thing that happens immediately
        let settings = AVCapturePhotoSettings()
        settings.flashMode = .off
        photoOutput.capturePhoto(with: settings, delegate: self)
        
        // Set lock
        isCapturing = true
        
        // Change button to grey immediately after capture is triggered (non-blocking)
        captureButton.backgroundColor = UIColor.systemGray3
        
        // Minimal feedback (flash only, no haptics to avoid lag)
        DispatchQueue.main.async {
            // Flash effect only
            if self.isFlashEnabled && self.enableCustomFlash {
                self.configureCustomFlash()
            }
            
            // Visual shutter feedback (screen flash only)
            UIView.animate(withDuration: 0.03, animations: {
                self.view.backgroundColor = UIColor.white.withAlphaComponent(0.7)
            }) { _ in
                UIView.animate(withDuration: 0.03) {
                    self.view.backgroundColor = UIColor.black
                }
            }
            
            // Reset capture lock
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.isCapturing = false
            }
        }
    }
    
    @objc private func resetCaptureButton() {
        // Reset button to white when user releases
        captureButton.backgroundColor = .white
    }
    
    private func configureCustomFlash() {
        guard captureDevice.hasTorch else { return }
        
        do {
            try captureDevice.lockForConfiguration()
            
            // Enable torch with custom intensity - happens instantly
            try captureDevice.setTorchModeOn(level: flashIntensity)
            
            captureDevice.unlockForConfiguration()
            
            // Schedule torch off after custom duration (non-blocking)
            DispatchQueue.main.asyncAfter(deadline: .now() + flashDuration) { [weak self] in
                guard let self = self else { return }
                do {
                    try self.captureDevice.lockForConfiguration()
                    self.captureDevice.torchMode = .off
                    self.captureDevice.unlockForConfiguration()
                } catch {
                    print("❌ Failed to turn off torch: \(error)")
                }
            }
        } catch {
            print("❌ Failed to configure flash: \(error)")
        }
    }
    
    @objc private func flipCamera() {
        // Toggle camera position
        let newPosition: AVCaptureDevice.Position = (currentCameraPosition == .back) ? .front : .back
        
        // Check if the new camera position is available
        guard AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: newPosition) != nil else {
            print("⚠️ Camera position not available: \(newPosition)")
            return
        }
        
        // Stop session temporarily
        captureSession.beginConfiguration()
        
        // Setup new camera input
        setupCameraInput(for: newPosition)
        currentCameraPosition = newPosition
        
        // Reset zoom when flipping cameras
        currentZoomFactor = 1.0
        beginZoomScale = 1.0
        if let device = captureDevice {
            do {
                try device.lockForConfiguration()
                device.videoZoomFactor = 1.0
                device.unlockForConfiguration()
            } catch {
                print("❌ Error resetting zoom: \(error)")
            }
        }
        
        // Commit configuration
        captureSession.commitConfiguration()
        
        // Update flash button visibility based on camera capabilities
        updateFlashButtonVisibility()
        
        // Animate button rotation
        UIView.animate(withDuration: 0.3) {
            self.flipButton.transform = self.flipButton.transform.rotated(by: .pi)
        }
    }
    
    private func updateFlashButtonVisibility() {
        // Front camera typically doesn't have flash
        let hasFlash = captureDevice.hasTorch
        flashButton.isHidden = !hasFlash
        
        // Reset flash state if no flash available
        if !hasFlash {
            isFlashEnabled = false
            flashButton.setImage(UIImage(systemName: "bolt.slash"), for: .normal)
        }
    }
    
    @objc private func toggleFlash() {
        isFlashEnabled.toggle()
        let imageName = isFlashEnabled ? "bolt" : "bolt.slash"
        flashButton.setImage(UIImage(systemName: imageName), for: .normal)
    }
    
    @objc private func cancelTapped() {
        delegate?.didCancel()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }
}

// MARK: - Photo Capture Delegate
extension AdvancedCameraViewController: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        // Immediate success haptic feedback
        DispatchQueue.main.async {
            let notificationFeedback = UINotificationFeedbackGenerator()
            notificationFeedback.notificationOccurred(.success)
        }
        
        if let error = error {
            print("❌ Photo capture error: \(error)")
            DispatchQueue.main.async {
                let notificationFeedback = UINotificationFeedbackGenerator()
                notificationFeedback.notificationOccurred(.error)
            }
            return
        }
        
        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            print("❌ Failed to create image from photo data")
            DispatchQueue.main.async {
                let notificationFeedback = UINotificationFeedbackGenerator()
                notificationFeedback.notificationOccurred(.error)
            }
            return
        }
        
        // Process image on high priority queue for instant response
        DispatchQueue.global(qos: .userInteractive).async {
            // Fix image orientation
            let orientedImage = image.fixedOrientation()
            
            // Crop image to match preview layer (what user sees)
            let croppedImage = self.cropImageToPreviewBounds(orientedImage)
            
            // Return to main queue for review or immediate callback
            DispatchQueue.main.async {
                if self.enablePhotoReview {
                    // Show review screen instantly (Snapchat-like behavior)
                    self.showPhotoReview(croppedImage)
                } else {
                    // Immediate callback (original behavior)
                    self.delegate?.didCaptureImage(croppedImage)
                }
            }
        }
    }
    
    private func showPhotoReview(_ image: UIImage) {
        // Store captured image
        capturedImage = image
        
        // Stop camera session to save battery
        stopSession()
        
        // Hide camera controls
        captureButton.isHidden = true
        cancelButton.isHidden = true
        flashButton.isHidden = true
        flipButton.isHidden = true
        
        // Create and show review view
        let reviewView = PhotoReviewView(
            capturedImage: image,
            onUsePhoto: { [weak self] in
                self?.confirmPhoto()
            },
            onRetake: { [weak self] in
                self?.retakePhoto()
            },
            onCancel: { [weak self] in
                self?.delegate?.didCancel()
            }
        )
        
        let hostingController = UIHostingController(rootView: reviewView)
        hostingController.view.backgroundColor = .clear
        hostingController.view.frame = view.bounds
        hostingController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)
        
        reviewHostingController = hostingController
    }
    
    private func confirmPhoto() {
        guard let image = capturedImage else { return }
        delegate?.didCaptureImage(image)
    }
    
    private func retakePhoto() {
        // Remove review view
        reviewHostingController?.willMove(toParent: nil)
        reviewHostingController?.view.removeFromSuperview()
        reviewHostingController?.removeFromParent()
        reviewHostingController = nil
        
        // Clear captured image
        capturedImage = nil
        
        // Show camera controls again
        captureButton.isHidden = false
        cancelButton.isHidden = false
        flashButton.isHidden = !captureDevice.hasTorch
        flipButton.isHidden = false
        
        // Restart camera session
        startSession()
    }
    
    // MARK: - Image Cropping to Match Preview
    private func cropImageToPreviewBounds(_ image: UIImage) -> UIImage {
        // Get preview layer bounds
        guard let previewLayer = previewLayer else { return image }
        
        let previewBounds = previewLayer.bounds
        let imageSize = image.size
        
        // Calculate the crop rect to match what's visible in the preview
        // Preview uses resizeAspectFill, so we need to crop the image to match
        let previewAspectRatio = previewBounds.width / previewBounds.height
        let imageAspectRatio = imageSize.width / imageSize.height
        
        var cropRect: CGRect
        
        if imageAspectRatio > previewAspectRatio {
            // Image is wider than preview - crop sides
            let cropWidth = imageSize.height * previewAspectRatio
            let cropX = (imageSize.width - cropWidth) / 2
            cropRect = CGRect(x: cropX, y: 0, width: cropWidth, height: imageSize.height)
        } else {
            // Image is taller than preview - crop top/bottom
            let cropHeight = imageSize.width / previewAspectRatio
            let cropY = (imageSize.height - cropHeight) / 2
            cropRect = CGRect(x: 0, y: cropY, width: imageSize.width, height: cropHeight)
        }
        
        // Perform the crop
        guard let cgImage = image.cgImage?.cropping(to: cropRect) else {
            return image
        }
        
        return UIImage(cgImage: cgImage, scale: image.scale, orientation: image.imageOrientation)
    }
}

#Preview {
    AdvancedCameraView { image in
        print("Captured image: \(image)")
    }
} 