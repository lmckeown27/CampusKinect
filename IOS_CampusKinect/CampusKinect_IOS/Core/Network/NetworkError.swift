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
    case keychainError
    case accountBanned(String, contactEmail: String)
    case accountInactive(String, contactEmail: String)
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
        case .keychainError:
            return "Authentication failed. Please log in again."
        case .accountBanned(let details, let contactEmail):
            return "\(details)\n\nContact: \(contactEmail)"
        case .accountInactive(let details, let contactEmail):
            return "\(details)\n\nContact: \(contactEmail)"
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
        case .keychainError:
            return "Authentication failed. Please log in again."
        case .accountBanned(let details, _):
            return details
        case .accountInactive(let details, _):
            return details
        case .unknown:
            return "An unexpected error occurred. Please try again."
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .networkError, .serverError, .unknown:
            return true
        case .invalidURL, .invalidResponse, .unauthorized, .badRequest, .notFound, .decodingError, .keychainError, .accountBanned, .accountInactive:
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
        let details: StringOrArray?
        let contactEmail: String?
        let isSuspension: Bool?
        let banUntil: String?
        
        enum StringOrArray: Codable {
            case string(String)
            case array([ValidationDetail])
            
            init(from decoder: Decoder) throws {
                let container = try decoder.singleValueContainer()
                if let stringValue = try? container.decode(String.self) {
                    self = .string(stringValue)
                } else if let arrayValue = try? container.decode([ValidationDetail].self) {
                    self = .array(arrayValue)
                } else {
                    throw DecodingError.typeMismatch(StringOrArray.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Unable to decode details"))
                }
            }
            
            func encode(to encoder: Encoder) throws {
                var container = encoder.singleValueContainer()
                switch self {
                case .string(let value):
                    try container.encode(value)
                case .array(let value):
                    try container.encode(value)
                }
            }
            
            func getStringValue() throws -> String {
                switch self {
                case .string(let value):
                    return value
                case .array:
                    throw NSError(domain: "StringOrArray", code: -1, userInfo: [NSLocalizedDescriptionKey: "Expected string but got array"])
                }
            }
        }
    }
    
    struct ValidationDetail: Codable {
        let field: String
        let message: String
        let value: ValidationValue?
    }
    
    enum ValidationValue: Codable {
        case string(String)
        case array([String])
        case int(Int)
        case bool(Bool)
        
        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            
            if let stringValue = try? container.decode(String.self) {
                self = .string(stringValue)
            } else if let arrayValue = try? container.decode([String].self) {
                self = .array(arrayValue)
            } else if let intValue = try? container.decode(Int.self) {
                self = .int(intValue)
            } else if let boolValue = try? container.decode(Bool.self) {
                self = .bool(boolValue)
            } else {
                throw DecodingError.typeMismatch(ValidationValue.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Unable to decode ValidationValue"))
            }
        }
        
        func encode(to encoder: Encoder) throws {
            var container = encoder.singleValueContainer()
            switch self {
            case .string(let value):
                try container.encode(value)
            case .array(let value):
                try container.encode(value)
            case .int(let value):
                try container.encode(value)
            case .bool(let value):
                try container.encode(value)
            }
        }
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

