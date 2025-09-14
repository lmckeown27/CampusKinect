//
//  ForgotPasswordView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ForgotPasswordView: View {
    @State private var email = ""
    @State private var isLoading = false
    @State private var showingSuccess = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Text("Forgot Password?")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(Color("PrimaryColor"))
            
            Text("Enter your email address and we'll send you a link to reset your password.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            CustomTextField(
                placeholder: "Email",
                text: $email,
                keyboardType: .emailAddress
            )
            .padding(.horizontal)
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            CustomButton(
                title: "Send Reset Link",
                isLoading: isLoading
            ) {
                Task {
                    await sendResetLink()
                }
            }
            .padding(.horizontal)
            .disabled(email.isEmpty || isLoading)
            
            Spacer()
        }
        .navigationTitle("Reset Password")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Check Your Email", isPresented: $showingSuccess) {
            Button("OK") { }
        } message: {
            Text("We've sent a password reset link to \(email)")
        }
    }
    
    private func sendResetLink() async {
        guard ValidationUtils.isValidEmail(email) else {
            errorMessage = "Please enter a valid email address"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate API call
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        isLoading = false
        showingSuccess = true
    }
}

#Preview {
    NavigationView {
        ForgotPasswordView()
    }
}

