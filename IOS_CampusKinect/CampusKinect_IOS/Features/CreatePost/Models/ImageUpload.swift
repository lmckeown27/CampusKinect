//
//  ImageUpload.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import UIKit

// MARK: - Image Upload Models
struct ImageUploadResponse: Codable {
    let success: Bool
    let message: String?
    let data: ImageUploadData?
}

struct ImageUploadData: Codable {
    let images: [UploadedImage]
}

struct UploadedImage: Codable {
    let url: String
    let id: String?
    let filename: String?
    let order: Int?
}

// MARK: - Local Image Model
struct LocalImage: Identifiable, Equatable {
    let id = UUID()
    let image: UIImage
    let data: Data
    var uploadedURL: String?
    var isUploading: Bool = false
    var uploadError: String?
    
    static func == (lhs: LocalImage, rhs: LocalImage) -> Bool {
        lhs.id == rhs.id
    }
}

