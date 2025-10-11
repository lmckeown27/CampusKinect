//
//  ThemeManager.swift
//  CampusKinect_IOS
//
//  Manages dynamic theming from server configuration
//

import Foundation
import SwiftUI

class ThemeManager: ObservableObject {
    static let shared = ThemeManager()
    
    @Published var currentTheme: ThemeConfiguration?
    
    private var configService = ConfigurationService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        // Subscribe to configuration changes
        configService.$configuration
            .sink { [weak self] config in
                self?.currentTheme = config?.theme
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Colors
    var primaryColor: Color {
        currentTheme?.colors.primaryColor ?? Color(hex: "#708d81") ?? .green
    }
    
    var primaryDarkColor: Color {
        currentTheme?.colors.primaryDarkColor ?? Color(hex: "#5a7268") ?? .green
    }
    
    var backgroundColor: Color {
        currentTheme?.colors.backgroundColor ?? Color(hex: "#525252") ?? .black
    }
    
    var backgroundLightColor: Color {
        currentTheme?.colors.backgroundLightColor ?? Color(hex: "#1a1a1a") ?? .gray
    }
    
    var textColor: Color {
        currentTheme?.colors.textColor ?? .white
    }
    
    var textSecondaryColor: Color {
        currentTheme?.colors.textSecondaryColor ?? .gray
    }
    
    var errorColor: Color {
        currentTheme?.colors.errorColor ?? .red
    }
    
    var successColor: Color {
        currentTheme?.colors.successColor ?? .green
    }
    
    // MARK: - Spacing
    var spacingXS: CGFloat {
        currentTheme?.spacing.xs ?? 4
    }
    
    var spacingSM: CGFloat {
        currentTheme?.spacing.sm ?? 8
    }
    
    var spacingMD: CGFloat {
        currentTheme?.spacing.md ?? 16
    }
    
    var spacingLG: CGFloat {
        currentTheme?.spacing.lg ?? 24
    }
    
    var spacingXL: CGFloat {
        currentTheme?.spacing.xl ?? 32
    }
    
    // MARK: - Border Radius
    var borderRadiusSM: CGFloat {
        currentTheme?.borderRadius.sm ?? 4
    }
    
    var borderRadiusMD: CGFloat {
        currentTheme?.borderRadius.md ?? 8
    }
    
    var borderRadiusLG: CGFloat {
        currentTheme?.borderRadius.lg ?? 12
    }
    
    var borderRadiusXL: CGFloat {
        currentTheme?.borderRadius.xl ?? 16
    }
}

// MARK: - SwiftUI Environment Extension
struct ThemeEnvironmentKey: EnvironmentKey {
    static let defaultValue = ThemeManager.shared
}

extension EnvironmentValues {
    var theme: ThemeManager {
        get { self[ThemeEnvironmentKey.self] }
        set { self[ThemeEnvironmentKey.self] = newValue }
    }
}

// MARK: - View Extension for Easy Access
extension View {
    func withServerDrivenTheme() -> some View {
        self.environment(\.theme, ThemeManager.shared)
    }
}

import Combine

