//
//  ErrorView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ErrorView: View {
    let error: APIError
    let onRetry: (() -> Void)?
    
    init(error: APIError, onRetry: (() -> Void)? = nil) {
        self.error = error
        self.onRetry = onRetry
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: errorIcon)
                .font(.system(size: 60))
                .foregroundColor(.red)
            
            VStack(spacing: 8) {
                Text("Oops!")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text(error.userFriendlyMessage)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            if let onRetry = onRetry, error.isRetryable {
                CustomButton(
                    title: "Try Again",
                    action: onRetry
                )
                .padding(.horizontal, 40)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
    
    private var errorIcon: String {
        switch error {
        case .networkError:
            return "wifi.slash"
        case .serverError:
            return "server.rack"
        case .unauthorized:
            return "lock.slash"
        case .notFound:
            return "questionmark.circle"
        default:
            return "exclamationmark.triangle"
        }
    }
}

// MARK: - Inline Error View
struct InlineErrorView: View {
    let error: APIError
    let onRetry: (() -> Void)?
    
    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle")
                .foregroundColor(.red)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Error")
                    .font(.headline)
                    .foregroundColor(.red)
                
                Text(error.userFriendlyMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if let onRetry = onRetry, error.isRetryable {
                Button("Retry", action: onRetry)
                    .font(.caption)
                    .foregroundColor(Color("AccentColor"))
            }
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.red.opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    ErrorView(
        error: .networkError("No internet connection"),
        onRetry: {
            print("Retry tapped")
        }
    )
}

