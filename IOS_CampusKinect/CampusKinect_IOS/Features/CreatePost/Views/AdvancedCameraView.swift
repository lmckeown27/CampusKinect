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
    
    func makeUIViewController(context: Context) -> AdvancedCameraViewController {
        let controller = AdvancedCameraViewController()
        controller.delegate = context.coordinator
        controller.flashDuration = flashDuration
        controller.flashIntensity = flashIntensity
        controller.enableCustomFlash = enableCustomFlash
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
        
        // Setup preview layer
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.videoGravity = .resizeAspectFill
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
        
        // Only use touchUpInside to prevent double captures
        captureButton.addTarget(self, action: #selector(capturePhoto), for: .touchUpInside)
        
        // Add visual feedback for touch down/up without triggering capture
        captureButton.addTarget(self, action: #selector(captureButtonTouchDown), for: .touchDown)
        captureButton.addTarget(self, action: #selector(captureButtonTouchUp), for: .touchUpInside)
        captureButton.addTarget(self, action: #selector(captureButtonTouchUp), for: .touchUpOutside)
        captureButton.addTarget(self, action: #selector(captureButtonTouchUp), for: .touchCancel)
        
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
    
    @objc private func capturePhoto() {
        // Prevent multiple rapid captures with shorter delay
        guard !isCapturing else { return }
        isCapturing = true
        
        // Stronger haptic feedback for capture confirmation
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
        
        // Enhanced visual feedback - simulate camera shutter
        UIView.animate(withDuration: 0.05, animations: {
            // Quick flash effect
            self.view.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        }) { _ in
            UIView.animate(withDuration: 0.05) {
                self.view.backgroundColor = UIColor.black
            }
        }
        
        let settings = AVCapturePhotoSettings()
        
        // Configure flash with custom duration and intensity
        if isFlashEnabled && enableCustomFlash {
            configureCustomFlash()
        } else {
            settings.flashMode = .off
        }
        
        photoOutput.capturePhoto(with: settings, delegate: self)
        
        // Shorter reset delay for better responsiveness
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            self.isCapturing = false
        }
    }
    
    @objc private func captureButtonTouchDown() {
        // Light haptic feedback on touch down
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
        
        // Visual feedback - button press animation
        UIView.animate(withDuration: 0.1, delay: 0, options: [.allowUserInteraction], animations: {
            self.captureButton.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
            self.captureButton.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        })
    }
    
    @objc private func captureButtonTouchUp() {
        // Return button to normal state
        UIView.animate(withDuration: 0.15, delay: 0, options: [.allowUserInteraction], animations: {
            self.captureButton.transform = CGAffineTransform.identity
            self.captureButton.backgroundColor = .white
        })
    }
    
    private func configureCustomFlash() {
        guard captureDevice.hasTorch else { return }
        
        do {
            try captureDevice.lockForConfiguration()
            
            // Enable torch with custom intensity
            try captureDevice.setTorchModeOn(level: flashIntensity)
            
            captureDevice.unlockForConfiguration()
            
            // Schedule torch off after custom duration
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
        
        // Process image on background queue for faster response
        DispatchQueue.global(qos: .userInitiated).async {
            // Fix image orientation to ensure proper display
            let orientedImage = image.fixedOrientation()
            
            // Return to main queue for delegate callback
            DispatchQueue.main.async {
                self.delegate?.didCaptureImage(orientedImage)
            }
        }
    }
}

#Preview {
    AdvancedCameraView { image in
        print("Captured image: \(image)")
    }
} 