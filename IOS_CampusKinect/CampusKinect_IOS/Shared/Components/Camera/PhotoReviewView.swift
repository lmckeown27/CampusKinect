//
//  PhotoReviewView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown
//

import SwiftUI
import UIKit

/// A Snapchat-like photo review screen that displays a captured image
/// and allows the user to either use it or retake the photo
struct PhotoReviewView: View {
    let capturedImage: UIImage
    let onUsePhoto: () -> Void
    let onRetake: () -> Void
    let onCancel: () -> Void
    
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    
    var body: some View {
        ZStack {
            // Background
            Color.black
                .ignoresSafeArea()
            
            // Captured image with zoom/pan gestures
            Image(uiImage: capturedImage)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .scaleEffect(scale)
                .offset(offset)
                .gesture(
                    SimultaneousGesture(
                        MagnificationGesture()
                            .onChanged { value in
                                scale = max(1.0, min(value, 4.0))
                            }
                            .onEnded { _ in
                                // Reset zoom after gesture ends
                                withAnimation(.spring(response: 0.3)) {
                                    scale = 1.0
                                }
                            },
                        DragGesture()
                            .onChanged { value in
                                if scale > 1.0 {
                                    offset = CGSize(
                                        width: lastOffset.width + value.translation.width,
                                        height: lastOffset.height + value.translation.height
                                    )
                                }
                            }
                            .onEnded { _ in
                                lastOffset = offset
                                // Reset position when zoom is reset
                                if scale <= 1.0 {
                                    withAnimation(.spring(response: 0.3)) {
                                        offset = .zero
                                        lastOffset = .zero
                                    }
                                }
                            }
                    )
                )
                .onTapGesture(count: 2) {
                    // Double tap to zoom
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
            
            // Top bar with cancel button
            VStack {
                HStack {
                    Button(action: {
                        // Haptic feedback
                        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                        impactFeedback.impactOccurred()
                        onCancel()
                    }) {
                        ZStack {
                            Circle()
                                .fill(Color.black.opacity(0.6))
                                .frame(width: 40, height: 40)
                            
                            Image(systemName: "xmark")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.leading, 20)
                    
                    Spacer()
                }
                .padding(.top, 20)
                
                Spacer()
            }
            
            // Bottom action buttons
            VStack {
                Spacer()
                
                HStack(spacing: 40) {
                    // Retake button
                    Button(action: {
                        // Haptic feedback
                        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                        impactFeedback.impactOccurred()
                        onRetake()
                    }) {
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.2))
                                    .frame(width: 60, height: 60)
                                
                                Image(systemName: "arrow.counterclockwise")
                                    .font(.system(size: 24, weight: .medium))
                                    .foregroundColor(.white)
                            }
                            
                            Text("Retake")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                        }
                    }
                    
                    // Use Photo button (primary action)
                    Button(action: {
                        // Haptic feedback
                        let notificationFeedback = UINotificationFeedbackGenerator()
                        notificationFeedback.notificationOccurred(.success)
                        onUsePhoto()
                    }) {
                        VStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color("BrandPrimary"))
                                    .frame(width: 70, height: 70)
                                
                                Image(systemName: "checkmark")
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            .shadow(color: Color("BrandPrimary").opacity(0.4), radius: 10, x: 0, y: 5)
                            
                            Text("Use Photo")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        }
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .statusBar(hidden: true)
    }
}

// MARK: - Preview
#Preview {
    PhotoReviewView(
        capturedImage: UIImage(systemName: "photo")!,
        onUsePhoto: { print("Use photo tapped") },
        onRetake: { print("Retake tapped") },
        onCancel: { print("Cancel tapped") }
    )
}

