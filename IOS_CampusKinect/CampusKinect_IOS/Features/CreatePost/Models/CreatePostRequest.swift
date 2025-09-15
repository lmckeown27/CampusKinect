//
//  CreatePostRequest.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

struct CreatePostRequest: Codable {
    let title: String
    let description: String
    let postType: String
    let durationType: String
    let location: String?
    let tags: [String]
    let images: [String]? // URLs of uploaded images
    
    init(title: String, description: String, postType: String, durationType: String, location: String?, tags: [String], images: [String]? = nil) {
        self.title = title
        self.description = description
        self.postType = postType
        self.durationType = durationType
        self.location = location?.isEmpty == true ? nil : location
        self.tags = tags
        self.images = images
    }
}

