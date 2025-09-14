//
//  NetworkError.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - API Error Types
enum APIError: LocalizedError, Equatable {
    case invalidURL
    case invalidResponse
    case unauthorized
    case badRequest(String)
    case notFound
    case serverError
    case networkError(String)
    case decodingError(String)
    case unknown(Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Please log in again"
        case .badRequest(let message):
            return message
        case .notFound:
            return "Resource not found"
        case .serverError:
            return "Server error. Please try again later"
        case .networkError(let message):
            return "Network error: \(message)"
        case .decodingError(let message):
            return "Data parsing error: \(message)"
        case .unknown(let code):
            return "Unknown error (Code: \(code))"
        }
    }
    
    var userFriendlyMessage: String {
        switch self {
        case .invalidURL, .invalidResponse, .decodingError:
            return "Something went wrong. Please try again."
        case .unauthorized:
            return "Your session has expired. Please log in again."
        case .badRequest(let message):
            return message
        case .notFound:
            return "The requested content could not be found."
        case .serverError:
            return "Our servers are experiencing issues. Please try again in a few minutes."
        case .networkError:
            return "Please check your internet connection and try again."
        case .unknown:
            return "An unexpected error occurred. Please try again."
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .networkError, .serverError, .unknown:
            return true
        case .invalidURL, .invalidResponse, .unauthorized, .badRequest, .notFound, .decodingError:
            return false
        }
    }
}

// MARK: - Error Response Model
struct ErrorResponse: Codable {
    let success: Bool
    let error: ErrorDetail
    
    struct ErrorDetail: Codable {
        let message: String
        let code: String?
        let details: [String: String]?
    }
}

// MARK: - Network Status
enum NetworkStatus {
    case connected
    case disconnected
    case unknown
    
    var isConnected: Bool {
        return self == .connected
    }
}

// MARK: - Request Result
enum RequestResult<T> {
    case success(T)
    case failure(APIError)
    
    var isSuccess: Bool {
        switch self {
        case .success:
            return true
        case .failure:
            return false
        }
    }
    
    var data: T? {
        switch self {
        case .success(let data):
            return data
        case .failure:
            return nil
        }
    }
    
    var error: APIError? {
        switch self {
        case .success:
            return nil
        case .failure(let error):
            return error
        }
    }
}

