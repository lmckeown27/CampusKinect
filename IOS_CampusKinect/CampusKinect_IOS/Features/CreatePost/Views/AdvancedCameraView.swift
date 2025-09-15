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
        // Capture button
        captureButton = UIButton(type: .custom)
        captureButton.backgroundColor = .white
        captureButton.layer.cornerRadius = 35
        captureButton.layer.borderWidth = 4
        captureButton.layer.borderColor = UIColor.systemBlue.cgColor
        captureButton.addTarget(self, action: #selector(capturePhoto), for: .touchUpInside)
        
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
            // Capture button - bottom center
            captureButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            captureButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -30),
            captureButton.widthAnchor.constraint(equalToConstant: 70),
            captureButton.heightAnchor.constraint(equalToConstant: 70),
            
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
        let settings = AVCapturePhotoSettings()
        
        // Configure flash with custom duration and intensity
        if isFlashEnabled && enableCustomFlash {
            configureCustomFlash()
        } else {
            settings.flashMode = .off
        }
        
        photoOutput.capturePhoto(with: settings, delegate: self)
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
        if let error = error {
            print("❌ Photo capture error: \(error)")
            return
        }
        
        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            print("❌ Failed to create image from photo data")
            return
        }
        
        delegate?.didCaptureImage(image)
    }
}

#Preview {
    AdvancedCameraView { image in
        print("Captured image: \(image)")
    }
} 