//
//  CampusKinectColors.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/29/25.
//

import SwiftUI

extension Color {
    // MARK: - CampusKinect Brand Colors (matching Web version)
    
    /// Primary olive green - #708d81
    static let campusPrimary = Color("BrandPrimary")
    
    /// Secondary olive green - #5a7268
    static let campusSecondary = Color("BrandSecondary")
    
    /// Primary background grey - #525252
    static let campusBackground = Color("BackgroundPrimary")
    
    /// Secondary background light grey - #e5e5e5 (light mode) / #b6b6b6 (dark mode)
    static let campusBackgroundSecondary = Color("BackgroundSecondary")
    
    // MARK: - Neutral Greys (matching Web neutral colors)
    
    /// Very light grey - #fafafa
    static let campusGrey50 = Color(red: 0.98, green: 0.98, blue: 0.98)
    
    /// Light grey - #f5f5f5
    static let campusGrey100 = Color(red: 0.96, green: 0.96, blue: 0.96)
    
    /// Medium light grey - #e5e5e5
    static let campusGrey200 = Color(red: 0.898, green: 0.898, blue: 0.898)
    
    /// Medium grey - #d4d4d4
    static let campusGrey300 = Color(red: 0.831, green: 0.831, blue: 0.831)
    
    /// Dark medium grey - #a3a3a3
    static let campusGrey400 = Color(red: 0.639, green: 0.639, blue: 0.639)
    
    /// Dark grey - #737373
    static let campusGrey500 = Color(red: 0.451, green: 0.451, blue: 0.451)
    
    /// Primary dark grey - #525252 (main background)
    static let campusGrey600 = Color(red: 0.322, green: 0.322, blue: 0.322)
    
    /// Darker grey - #404040
    static let campusGrey700 = Color(red: 0.251, green: 0.251, blue: 0.251)
    
    /// Very dark grey - #262626
    static let campusGrey800 = Color(red: 0.149, green: 0.149, blue: 0.149)
    
    /// Almost black - #171717
    static let campusGrey900 = Color(red: 0.090, green: 0.090, blue: 0.090)
    
    // MARK: - Olive Green Variations
    
    /// Very light olive - #f2f5f4
    static let campusOlive50 = Color(red: 0.949, green: 0.961, blue: 0.957)
    
    /// Light olive - #e6ebea
    static let campusOlive100 = Color(red: 0.902, green: 0.922, blue: 0.918)
    
    /// Lighter olive - #bfcdc8
    static let campusOlive200 = Color(red: 0.749, green: 0.804, blue: 0.784)
    
    /// Light olive - #99afa7
    static let campusOlive300 = Color(red: 0.600, green: 0.686, blue: 0.655)
    
    /// Main olive green - #708d81
    static let campusOlive400 = Color(red: 0.439, green: 0.553, blue: 0.506)
    
    /// Medium olive - #5a7268
    static let campusOlive500 = Color(red: 0.353, green: 0.447, blue: 0.408)
    
    /// Darker olive - #445750
    static let campusOlive600 = Color(red: 0.267, green: 0.341, blue: 0.314)
    
    /// Dark olive - #2e3c38
    static let campusOlive700 = Color(red: 0.180, green: 0.235, blue: 0.220)
    
    /// Very dark olive - #172120
    static let campusOlive800 = Color(red: 0.090, green: 0.129, blue: 0.125)
    
    /// Almost black olive - #0b1110
    static let campusOlive900 = Color(red: 0.043, green: 0.067, blue: 0.063)
    
    // MARK: - Semantic Colors
    
    /// Success green - #22c55e
    static let campusSuccess = Color(red: 0.133, green: 0.773, blue: 0.369)
    
    /// Warning amber - #f59e0b
    static let campusWarning = Color(red: 0.961, green: 0.620, blue: 0.043)
    
    /// Error red - #ef4444
    static let campusError = Color(red: 0.937, green: 0.267, blue: 0.267)
    
    /// Info blue - #3b82f6
    static let campusInfo = Color(red: 0.231, green: 0.510, blue: 0.965)
    
    // MARK: - Text Colors (adaptive)
    
    /// Primary text color - white on dark backgrounds, dark on light backgrounds
    static let campusTextPrimary = Color.primary
    
    /// Secondary text color - slightly transparent
    static let campusTextSecondary = Color.secondary
    
    /// Text on olive backgrounds - always white
    static let campusTextOnOlive = Color.white
    
    /// Text on grey backgrounds - white
    static let campusTextOnGrey = Color.white
}

// MARK: - Color Scheme Helper
struct CampusKinectColorScheme {
    
    /// Returns appropriate text color for given background
    static func textColor(for backgroundColor: Color) -> Color {
        // For olive and dark backgrounds, use white text
        return Color.white
    }
    
    /// Returns appropriate background color for cards/components
    static func cardBackground(for colorScheme: ColorScheme) -> Color {
        return colorScheme == .dark ? .campusGrey700 : .campusBackgroundSecondary
    }
    
    /// Returns appropriate button background for primary actions
    static func primaryButtonBackground(isPressed: Bool = false) -> Color {
        return isPressed ? .campusSecondary : .campusPrimary
    }
    
    /// Returns appropriate button background for secondary actions
    static func secondaryButtonBackground(isPressed: Bool = false) -> Color {
        return isPressed ? .campusGrey500 : .campusGrey400
    }
} 