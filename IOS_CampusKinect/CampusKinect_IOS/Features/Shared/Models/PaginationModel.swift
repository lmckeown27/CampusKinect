//
//  PaginationModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Pagination Info
struct PaginationInfo: Codable {
    let currentPage: Int
    let totalPages: Int
    let hasNext: Bool
    let hasPrevious: Bool
    let totalCount: Int
    
    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case hasNext = "has_next"
        case hasPrevious = "has_previous"
        case totalCount = "total_count"
    }
}

// MARK: - Paginated Response
struct PaginatedResponse<T: Codable>: Codable {
    let success: Bool
    let data: [T]
    let pagination: PaginationInfo
    let message: String?
    
    enum CodingKeys: String, CodingKey {
        case success
        case data
        case pagination
        case message
    }
}

