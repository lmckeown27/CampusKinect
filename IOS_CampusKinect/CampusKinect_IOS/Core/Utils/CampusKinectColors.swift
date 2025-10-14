//
//  CampusKinectColors.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/29/25.
//
//  🚀 SERVER-DRIVEN COLORS: All colors now read from backend config!
//  Change colors by editing backend/src/routes/config.js, no app rebuild needed!
//

import SwiftUI

extension Color {
    // MARK: - CampusKinect Brand Colors (SERVER-DRIVEN)
    
    /// Primary olive green - reads from server config (default: #708d81)
    static var campusPrimary: Color {
        ThemeManager.shared.primaryColor
    }
    
    /// Secondary olive green - reads from server config (default: #5a7268)
    static var campusSecondary: Color {
        ThemeManager.shared.primaryDarkColor
    }
    
    /// Primary background grey - reads from server config (default: #525252)
    static var campusBackground: Color {
        ThemeManager.shared.backgroundColor
    }
    
    /// Secondary background light grey - reads from server config
    static var campusBackgroundSecondary: Color {
        ThemeManager.shared.backgroundLightColor
    }
    
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
    
    // MARK: - Semantic Colors (SERVER-DRIVEN)
    
    /// Success green - reads from server config (default: #22c55e)
    static var campusSuccess: Color {
        ThemeManager.shared.successColor
    }
    
    /// Warning amber - reads from server config (default: #f59e0b)
    static var campusWarning: Color {
        ThemeManager.shared.currentTheme?.colors.warningColor ?? Color(red: 0.961, green: 0.620, blue: 0.043)
    }
    
    /// Error red - reads from server config (default: #ef4444)
    static var campusError: Color {
        ThemeManager.shared.errorColor
    }
    
    /// Info blue - reads from server config (default: #3b82f6)
    static var campusInfo: Color {
        ThemeManager.shared.currentTheme?.colors.infoColor ?? Color(red: 0.231, green: 0.510, blue: 0.965)
    }
    
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