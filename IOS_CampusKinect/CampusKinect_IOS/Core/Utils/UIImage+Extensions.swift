//
//  UIImage+Extensions.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import UIKit

extension UIImage {
    /// Fixes the orientation of the image to always be up
    func fixedOrientation() -> UIImage {
        // If the image is already in the correct orientation, return it
        if imageOrientation == .up {
            return self
        }
        
        // Create a graphics context with the correct size
        UIGraphicsBeginImageContextWithOptions(size, false, scale)
        defer { UIGraphicsEndImageContext() }
        
        // Draw the image in the correct orientation
        draw(in: CGRect(origin: .zero, size: size))
        
        // Get the correctly oriented image
        return UIGraphicsGetImageFromCurrentImageContext() ?? self
    }
    
    /// Normalizes the image orientation and ensures proper display
    func normalizedImage() -> UIImage {
        // If the image is already up, return it
        if imageOrientation == .up {
            return self
        }
        
        // Calculate the transform needed to rotate the image
        var transform = CGAffineTransform.identity
        
        switch imageOrientation {
        case .down, .downMirrored:
            transform = transform.translatedBy(x: size.width, y: size.height)
            transform = transform.rotated(by: .pi)
        case .left, .leftMirrored:
            transform = transform.translatedBy(x: size.width, y: 0)
            transform = transform.rotated(by: .pi / 2)
        case .right, .rightMirrored:
            transform = transform.translatedBy(x: 0, y: size.height)
            transform = transform.rotated(by: -.pi / 2)
        default:
            break
        }
        
        switch imageOrientation {
        case .upMirrored, .downMirrored:
            transform = transform.translatedBy(x: size.width, y: 0)
            transform = transform.scaledBy(x: -1, y: 1)
        case .leftMirrored, .rightMirrored:
            transform = transform.translatedBy(x: size.height, y: 0)
            transform = transform.scaledBy(x: -1, y: 1)
        default:
            break
        }
        
        // Create the context and apply the transform
        guard let cgImage = cgImage else { return self }
        let context = CGContext(
            data: nil,
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: cgImage.bitsPerComponent,
            bytesPerRow: 0,
            space: cgImage.colorSpace ?? CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: cgImage.bitmapInfo.rawValue
        )
        
        context?.concatenate(transform)
        
        switch imageOrientation {
        case .left, .leftMirrored, .right, .rightMirrored:
            context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: size.height, height: size.width))
        default:
            context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: size.width, height: size.height))
        }
        
        guard let newCGImage = context?.makeImage() else { return self }
        return UIImage(cgImage: newCGImage)
    }
}

