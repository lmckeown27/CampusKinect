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
        case "goods":
            return "bag.fill"
        case "services":
            return "wrench.and.screwdriver.fill"
        case "housing":
            return "house.fill"
        case "events":
            return "calendar"
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
    static let goods = PostCategory(
        id: "goods",
        name: "Goods",
        icon: "bag.fill",
        color: "#10B981",
        subcategories: [
            PostSubcategory(id: "clothing", name: "Clothing", categoryId: "goods", isActive: true),
            PostSubcategory(id: "parking_permits", name: "Parking Permits", categoryId: "goods", isActive: true),
            PostSubcategory(id: "household_appliances", name: "Household Appliances", categoryId: "goods", isActive: true),
            PostSubcategory(id: "electronics", name: "Electronics", categoryId: "goods", isActive: true),
            PostSubcategory(id: "furniture", name: "Furniture", categoryId: "goods", isActive: true),
            PostSubcategory(id: "concert_tickets", name: "Concert Tickets", categoryId: "goods", isActive: true),
            PostSubcategory(id: "kitchen_items", name: "Kitchen Items", categoryId: "goods", isActive: true),
            PostSubcategory(id: "school_supplies", name: "School Supplies", categoryId: "goods", isActive: true),
            PostSubcategory(id: "sports_equipment", name: "Sports Equipment", categoryId: "goods", isActive: true),
            PostSubcategory(id: "automotive", name: "Automotive", categoryId: "goods", isActive: true),
            PostSubcategory(id: "pets", name: "Pets", categoryId: "goods", isActive: true),
            PostSubcategory(id: "pet_supplies", name: "Pet Supplies", categoryId: "goods", isActive: true),
            PostSubcategory(id: "other", name: "Other", categoryId: "goods", isActive: true)
        ],
        isActive: true
    )
    
    static let services = PostCategory(
        id: "services",
        name: "Services",
        icon: "wrench.and.screwdriver.fill",
        color: "#F59E0B",
        subcategories: [
            PostSubcategory(id: "transportation", name: "Transportation", categoryId: "services", isActive: true),
            PostSubcategory(id: "tutoring", name: "Tutoring", categoryId: "services", isActive: true),
            PostSubcategory(id: "fitness_training", name: "Fitness Training", categoryId: "services", isActive: true),
            PostSubcategory(id: "meal_delivery", name: "Meal Delivery", categoryId: "services", isActive: true),
            PostSubcategory(id: "cleaning", name: "Cleaning", categoryId: "services", isActive: true),
            PostSubcategory(id: "photography", name: "Photography", categoryId: "services", isActive: true),
            PostSubcategory(id: "graphic_design", name: "Graphic Design", categoryId: "services", isActive: true),
            PostSubcategory(id: "tech_support", name: "Tech Support", categoryId: "services", isActive: true),
            PostSubcategory(id: "web_development", name: "Web Development", categoryId: "services", isActive: true),
            PostSubcategory(id: "writing_editing", name: "Writing & Editing", categoryId: "services", isActive: true),
            PostSubcategory(id: "translation", name: "Translation", categoryId: "services", isActive: true),
            PostSubcategory(id: "towing", name: "Towing", categoryId: "services", isActive: true),
            PostSubcategory(id: "other", name: "Other", categoryId: "services", isActive: true)
        ],
        isActive: true
    )
    
    static let housing = PostCategory(
        id: "housing",
        name: "Housing",
        icon: "house.fill",
        color: "#3B82F6",
        subcategories: [
            PostSubcategory(id: "leasing", name: "Leasing", categoryId: "housing", isActive: true),
            PostSubcategory(id: "subleasing", name: "Subleasing", categoryId: "housing", isActive: true),
            PostSubcategory(id: "roommate_search", name: "Roommate Search", categoryId: "housing", isActive: true),
            PostSubcategory(id: "storage_space", name: "Storage Space", categoryId: "housing", isActive: true),
            PostSubcategory(id: "other", name: "Other", categoryId: "housing", isActive: true)
        ],
        isActive: true
    )
    
    static let events = PostCategory(
        id: "events",
        name: "Events",
        icon: "calendar",
        color: "#8B5CF6",
        subcategories: [
            PostSubcategory(id: "sports_events", name: "Sports Events", categoryId: "events", isActive: true),
            PostSubcategory(id: "study_groups", name: "Study Groups", categoryId: "events", isActive: true),
            PostSubcategory(id: "rush", name: "Rush", categoryId: "events", isActive: true),
            PostSubcategory(id: "pickup_basketball", name: "Pickup Basketball", categoryId: "events", isActive: true),
            PostSubcategory(id: "philanthropy", name: "Philanthropy", categoryId: "events", isActive: true),
            PostSubcategory(id: "cultural_events", name: "Cultural Events", categoryId: "events", isActive: true),
            PostSubcategory(id: "workshops", name: "Workshops", categoryId: "events", isActive: true),
            PostSubcategory(id: "conferences", name: "Conferences", categoryId: "events", isActive: true),
            PostSubcategory(id: "meetups", name: "Meetups", categoryId: "events", isActive: true),
            PostSubcategory(id: "game_nights", name: "Game Nights", categoryId: "events", isActive: true),
            PostSubcategory(id: "movie_nights", name: "Movie Nights", categoryId: "events", isActive: true),
            PostSubcategory(id: "hiking_trips", name: "Hiking Trips", categoryId: "events", isActive: true),
            PostSubcategory(id: "volunteer_events", name: "Volunteer Events", categoryId: "events", isActive: true),
            PostSubcategory(id: "career_fairs", name: "Career Fairs", categoryId: "events", isActive: true),
            PostSubcategory(id: "other", name: "Other", categoryId: "events", isActive: true)
        ],
        isActive: true
    )
    
    static let allCategories: [PostCategory] = [
        .goods, .services, .housing, .events
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

