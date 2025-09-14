//
//  ValidationUtils.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Validation Utils
struct ValidationUtils {
    
    // MARK: - Email Validation
    static func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    static func isUniversityEmail(_ email: String) -> Bool {
        return email.hasSuffix(".edu") || isValidEmail(email)
    }
    
    // MARK: - Password Validation
    static func isPasswordStrong(_ password: String) -> Bool {
        return password.count >= AppConstants.minPasswordLength
    }
    
    static func passwordStrengthScore(_ password: String) -> Int {
        var score = 0
        
        // Length check
        if password.count >= 8 { score += 1 }
        if password.count >= 12 { score += 1 }
        
        // Character variety checks
        if password.rangeOfCharacter(from: .lowercaseLetters) != nil { score += 1 }
        if password.rangeOfCharacter(from: .uppercaseLetters) != nil { score += 1 }
        if password.rangeOfCharacter(from: .decimalDigits) != nil { score += 1 }
        if password.rangeOfCharacter(from: CharacterSet(charactersIn: "!@#$%^&*()_+-=[]{}|;:,.<>?")) != nil { score += 1 }
        
        return min(score, 5) // Max score of 5
    }
    
    static func passwordStrengthText(_ password: String) -> String {
        let score = passwordStrengthScore(password)
        switch score {
        case 0...1:
            return "Very Weak"
        case 2:
            return "Weak"
        case 3:
            return "Fair"
        case 4:
            return "Good"
        case 5:
            return "Strong"
        default:
            return "Unknown"
        }
    }
    
    // MARK: - Name Validation
    static func isValidName(_ name: String) -> Bool {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmedName.count >= 2 && trimmedName.count <= 50
    }
    
    static func isValidDisplayName(_ displayName: String) -> Bool {
        let trimmedName = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmedName.count >= 3 && trimmedName.count <= 30
    }
    
    // MARK: - Post Content Validation
    static func isValidPostContent(_ content: String) -> Bool {
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmedContent.count >= 10 && trimmedContent.count <= AppConstants.maxPostLength
    }
    
    static func postContentCharacterCount(_ content: String) -> Int {
        return content.count
    }
    
    static func remainingCharacters(_ content: String) -> Int {
        return AppConstants.maxPostLength - content.count
    }
    
    // MARK: - Message Validation
    static func isValidMessage(_ message: String) -> Bool {
        let trimmedMessage = message.trimmingCharacters(in: .whitespacesAndNewlines)
        return !trimmedMessage.isEmpty && trimmedMessage.count <= 1000
    }
    
    // MARK: - Profile Validation
    static func isValidBio(_ bio: String) -> Bool {
        return bio.count <= 500
    }
    
    static func isValidYear(_ year: String) -> Bool {
        let validYears = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "PhD"]
        return validYears.contains(year)
    }
    
    // MARK: - Image Validation
    static func isValidImageSize(_ imageData: Data) -> Bool {
        return imageData.count <= AppConstants.maxImageSize
    }
    
    static func formatFileSize(_ bytes: Int) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useMB, .useKB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
    
    // MARK: - General Validation
    static func isEmpty(_ text: String?) -> Bool {
        guard let text = text else { return true }
        return text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    static func isNotEmpty(_ text: String?) -> Bool {
        return !isEmpty(text)
    }
    
    // MARK: - Phone Number Validation (Optional)
    static func isValidPhoneNumber(_ phoneNumber: String) -> Bool {
        let phoneRegex = "^[+]?[1-9]\\d{1,14}$"
        let phonePredicate = NSPredicate(format: "SELF MATCHES %@", phoneRegex)
        return phonePredicate.evaluate(with: phoneNumber.replacingOccurrences(of: " ", with: ""))
    }
    
    // MARK: - URL Validation
    static func isValidURL(_ urlString: String) -> Bool {
        guard let url = URL(string: urlString) else { return false }
        return UIApplication.shared.canOpenURL(url)
    }
}

// MARK: - Validation Error Types
enum ValidationError: LocalizedError {
    case invalidEmail
    case weakPassword
    case invalidName
    case invalidDisplayName
    case invalidPostContent
    case invalidMessage
    case invalidBio
    case invalidYear
    case imageTooLarge
    case invalidPhoneNumber
    case invalidURL
    case fieldRequired(String)
    case fieldTooLong(String, Int)
    case fieldTooShort(String, Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidEmail:
            return "Please enter a valid email address"
        case .weakPassword:
            return "Password must be at least \(AppConstants.minPasswordLength) characters"
        case .invalidName:
            return "Name must be between 2 and 50 characters"
        case .invalidDisplayName:
            return "Display name must be between 3 and 30 characters"
        case .invalidPostContent:
            return "Post content must be between 10 and \(AppConstants.maxPostLength) characters"
        case .invalidMessage:
            return "Message cannot be empty and must be less than 1000 characters"
        case .invalidBio:
            return "Bio must be less than 500 characters"
        case .invalidYear:
            return "Please select a valid academic year"
        case .imageTooLarge:
            return "Image size must be less than \(ValidationUtils.formatFileSize(AppConstants.maxImageSize))"
        case .invalidPhoneNumber:
            return "Please enter a valid phone number"
        case .invalidURL:
            return "Please enter a valid URL"
        case .fieldRequired(let field):
            return "\(field) is required"
        case .fieldTooLong(let field, let maxLength):
            return "\(field) must be less than \(maxLength) characters"
        case .fieldTooShort(let field, let minLength):
            return "\(field) must be at least \(minLength) characters"
        }
    }
}
