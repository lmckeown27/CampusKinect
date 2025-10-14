//
//  MaintenanceModeView.swift
//  CampusKinect_IOS
//
//  Displayed when server enables maintenance mode
//

import SwiftUI

struct MaintenanceModeView: View {
    let message: String
    let estimatedEndTime: String?
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon
            Image(systemName: "wrench.and.screwdriver.fill")
                .font(.system(size: 80))
                .foregroundColor(.campusPrimary)
            
            // Title
            Text("Under Maintenance")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            // Message
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // Estimated end time
            if let endTime = estimatedEndTime {
                Text("Estimated completion: \(endTime)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Retry button
            Button(action: {
                // Trigger config refresh
                Task {
                    await ConfigurationService.shared.fetchConfiguration()
                }
            }) {
                Text("Check Again")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.campusPrimary)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.campusBackground.ignoresSafeArea())
    }
}

#Preview {
    MaintenanceModeView(
        message: "We're performing scheduled maintenance. We'll be back shortly!",
        estimatedEndTime: "10:00 PM PST"
    )
}

