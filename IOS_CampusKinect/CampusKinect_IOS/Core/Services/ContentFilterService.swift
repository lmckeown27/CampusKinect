//
//  ContentFilterService.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/24/25.
//

import Foundation

/// Service for filtering objectionable content
class ContentFilterService {
    static let shared = ContentFilterService()
    
    private init() {}
    
    // MARK: - Content Filtering
    
    /// Check if content contains objectionable material
    func containsObjectionableContent(_ text: String) -> Bool {
        let lowercaseText = text.lowercased()
        
        // Check against prohibited keywords
        for keyword in prohibitedKeywords {
            if lowercaseText.contains(keyword.lowercased()) {
                return true
            }
        }
        
        // Check for patterns that might indicate spam or scams
        if containsSpamPatterns(lowercaseText) {
            return true
        }
        
        // Check for excessive capitalization (potential spam)
        if containsExcessiveCapitalization(text) {
            return true
        }
        
        return false
    }
    
    /// Filter and clean content by removing or replacing objectionable parts
    func filterContent(_ text: String) -> String {
        var filteredText = text
        
        // Replace prohibited keywords with asterisks
        for keyword in prohibitedKeywords {
            let replacement = String(repeating: "*", count: keyword.count)
            filteredText = filteredText.replacingOccurrences(
                of: keyword,
                with: replacement,
                options: .caseInsensitive
            )
        }
        
        return filteredText
    }
    
    /// Get content safety score (0-100, where 100 is completely safe)
    func getContentSafetyScore(_ text: String) -> Int {
        var score = 100
        let lowercaseText = text.lowercased()
        
        // Deduct points for prohibited keywords
        for keyword in prohibitedKeywords {
            if lowercaseText.contains(keyword.lowercased()) {
                score -= 20
            }
        }
        
        // Deduct points for spam patterns
        if containsSpamPatterns(lowercaseText) {
            score -= 15
        }
        
        // Deduct points for excessive capitalization
        if containsExcessiveCapitalization(text) {
            score -= 10
        }
        
        // Deduct points for excessive punctuation
        if containsExcessivePunctuation(text) {
            score -= 5
        }
        
        return max(0, score)
    }
    
    // MARK: - Private Methods
    
    private func containsSpamPatterns(_ text: String) -> Bool {
        let spamPatterns = [
            "click here",
            "limited time",
            "act now",
            "free money",
            "get rich quick",
            "work from home",
            "make money fast",
            "guaranteed income",
            "no experience needed",
            "earn $",
            "100% free",
            "risk free",
            "call now",
            "urgent",
            "congratulations you've won"
        ]
        
        for pattern in spamPatterns {
            if text.contains(pattern) {
                return true
            }
        }
        
        return false
    }
    
    private func containsExcessiveCapitalization(_ text: String) -> Bool {
        let uppercaseCount = text.filter { $0.isUppercase }.count
        let totalLetters = text.filter { $0.isLetter }.count
        
        guard totalLetters > 0 else { return false }
        
        let uppercaseRatio = Double(uppercaseCount) / Double(totalLetters)
        return uppercaseRatio > 0.7 && totalLetters > 10
    }
    
    private func containsExcessivePunctuation(_ text: String) -> Bool {
        let punctuationCount = text.filter { "!?.,;:".contains($0) }.count
        return punctuationCount > text.count / 4
    }
    
    // MARK: - Prohibited Keywords
    
    private let prohibitedKeywords = [
        // Hate speech and discrimination
        "hate", "racist", "sexist", "homophobic", "transphobic",
        
        // Harassment and bullying
        "kill yourself", "kys", "die", "worthless", "loser",
        
        // Sexual content (keeping it minimal for educational context)
        "explicit", "nsfw", "adult content",
        
        // Violence and threats
        "bomb", "weapon", "violence", "hurt", "harm",
        
        // Scam indicators
        "nigerian prince", "inheritance", "lottery winner", "tax refund",
        "verify account", "suspended account", "click link",
        
        // Drug-related content
        "illegal drugs", "buy drugs", "sell drugs",
        
        // Spam indicators
        "mlm", "pyramid scheme", "get rich", "easy money"
    ]
}

// MARK: - Content Safety Extensions

extension String {
    /// Check if the string contains objectionable content
    var containsObjectionableContent: Bool {
        return ContentFilterService.shared.containsObjectionableContent(self)
    }
    
    /// Get filtered version of the string
    var filtered: String {
        return ContentFilterService.shared.filterContent(self)
    }
    
    /// Get content safety score (0-100)
    var safetyScore: Int {
        return ContentFilterService.shared.getContentSafetyScore(self)
    }
} 