//
//  PostCategory.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Post Category
struct PostCategory: Codable, Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let icon: String
    let color: String
    let subcategories: [PostSubcategory]
    let isActive: Bool
    
    var displayName: String {
        return name.capitalized
    }
    
    var systemIconName: String {
        switch id {
        case "housing":
            return "house.fill"
        case "goods":
            return "bag.fill"
        case "services":
            return "wrench.and.screwdriver.fill"
        case "events":
            return "calendar"
        case "academic":
            return "book.fill"
        case "social":
            return "person.3.fill"
        default:
            return "tag.fill"
        }
    }
}

// MARK: - Post Subcategory
struct PostSubcategory: Codable, Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let categoryId: String
    let isActive: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case categoryId = "category_id"
        case isActive = "is_active"
    }
    
    var displayName: String {
        return name.capitalized
    }
}

// MARK: - Predefined Categories
extension PostCategory {
    static let housing = PostCategory(
        id: "housing",
        name: "Housing",
        icon: "house.fill",
        color: "#3B82F6",
        subcategories: [
            PostSubcategory(id: "apartment", name: "Apartment", categoryId: "housing", isActive: true),
            PostSubcategory(id: "dorm", name: "Dorm", categoryId: "housing", isActive: true),
            PostSubcategory(id: "roommate", name: "Roommate", categoryId: "housing", isActive: true),
            PostSubcategory(id: "sublease", name: "Sublease", categoryId: "housing", isActive: true)
        ],
        isActive: true
    )
    
    static let goods = PostCategory(
        id: "goods",
        name: "Goods",
        icon: "bag.fill",
        color: "#10B981",
        subcategories: [
            PostSubcategory(id: "textbooks", name: "Textbooks", categoryId: "goods", isActive: true),
            PostSubcategory(id: "electronics", name: "Electronics", categoryId: "goods", isActive: true),
            PostSubcategory(id: "furniture", name: "Furniture", categoryId: "goods", isActive: true),
            PostSubcategory(id: "clothing", name: "Clothing", categoryId: "goods", isActive: true),
            PostSubcategory(id: "household_appliances", name: "Household Appliances", categoryId: "goods", isActive: true),
            PostSubcategory(id: "parking_permits", name: "Parking Permits", categoryId: "goods", isActive: true)
        ],
        isActive: true
    )
    
    static let services = PostCategory(
        id: "services",
        name: "Services",
        icon: "wrench.and.screwdriver.fill",
        color: "#F59E0B",
        subcategories: [
            PostSubcategory(id: "tutoring", name: "Tutoring", categoryId: "services", isActive: true),
            PostSubcategory(id: "rides", name: "Rides", categoryId: "services", isActive: true),
            PostSubcategory(id: "food_delivery", name: "Food Delivery", categoryId: "services", isActive: true),
            PostSubcategory(id: "cleaning", name: "Cleaning", categoryId: "services", isActive: true),
            PostSubcategory(id: "tech_support", name: "Tech Support", categoryId: "services", isActive: true)
        ],
        isActive: true
    )
    
    static let events = PostCategory(
        id: "events",
        name: "Events",
        icon: "calendar",
        color: "#8B5CF6",
        subcategories: [
            PostSubcategory(id: "parties", name: "Parties", categoryId: "events", isActive: true),
            PostSubcategory(id: "study_groups", name: "Study Groups", categoryId: "events", isActive: true),
            PostSubcategory(id: "sports", name: "Sports", categoryId: "events", isActive: true),
            PostSubcategory(id: "clubs", name: "Clubs", categoryId: "events", isActive: true)
        ],
        isActive: true
    )
    
    static let academic = PostCategory(
        id: "academic",
        name: "Academic",
        icon: "book.fill",
        color: "#EF4444",
        subcategories: [
            PostSubcategory(id: "homework_help", name: "Homework Help", categoryId: "academic", isActive: true),
            PostSubcategory(id: "project_partners", name: "Project Partners", categoryId: "academic", isActive: true),
            PostSubcategory(id: "internships", name: "Internships", categoryId: "academic", isActive: true),
            PostSubcategory(id: "research", name: "Research", categoryId: "academic", isActive: true)
        ],
        isActive: true
    )
    
    static let social = PostCategory(
        id: "social",
        name: "Social",
        icon: "person.3.fill",
        color: "#EC4899",
        subcategories: [
            PostSubcategory(id: "meetups", name: "Meetups", categoryId: "social", isActive: true),
            PostSubcategory(id: "dating", name: "Dating", categoryId: "social", isActive: true),
            PostSubcategory(id: "friendships", name: "Friendships", categoryId: "social", isActive: true),
            PostSubcategory(id: "gaming", name: "Gaming", categoryId: "social", isActive: true)
        ],
        isActive: true
    )
    
    static let allCategories: [PostCategory] = [
        .housing, .goods, .services, .events, .academic, .social
    ]
}

// MARK: - Category Extensions
extension PostCategory {
    func subcategory(withId id: String) -> PostSubcategory? {
        return subcategories.first { $0.id == id }
    }
    
    static func category(withId id: String) -> PostCategory? {
        return allCategories.first { $0.id == id }
    }
    
    static func subcategory(withId id: String) -> PostSubcategory? {
        for category in allCategories {
            if let subcategory = category.subcategory(withId: id) {
                return subcategory
            }
        }
        return nil
    }
}

