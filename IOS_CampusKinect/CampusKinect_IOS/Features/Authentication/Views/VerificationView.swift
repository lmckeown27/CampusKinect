//
//  VerificationView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct VerificationView: View {
    let email: String
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var verificationCode = ""
    @State private var isResending = false
    @State private var showingResendSuccess = false
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "envelope.badge")
                .font(.system(size: 60))
                .foregroundColor(Color("PrimaryColor"))
            
            Text("Check Your Email")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(Color("PrimaryColor"))
            
            Text("We've sent a verification code to:")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Text(email)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(Color("AccentColor"))
            
            CustomTextField(
                placeholder: "Enter verification code",
                text: $verificationCode,
                keyboardType: .numberPad
            )
            .padding(.horizontal)
            
            if let error = authManager.error {
                Text(error.userFriendlyMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            CustomButton(
                title: "Verify Email",
                isLoading: authManager.isLoading
            ) {
                Task {
                    await verifyEmail()
                }
            }
            .padding(.horizontal)
            .disabled(verificationCode.isEmpty || authManager.isLoading)
            
            HStack {
                Text("Didn't receive the code?")
                    .foregroundColor(.gray)
                
                Button("Resend") {
                    Task {
                        await resendCode()
                    }
                }
                .foregroundColor(Color("AccentColor"))
                .disabled(isResending)
            }
            
            Spacer()
        }
        .navigationTitle("Verify Email")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Code Sent", isPresented: $showingResendSuccess) {
            Button("OK") { }
        } message: {
            Text("A new verification code has been sent to your email.")
        }
    }
    
    private func verifyEmail() async {
        // This would call the API service to verify the email
        // For now, we'll simulate the verification
        print("Verifying email with code: \(verificationCode)")
    }
    
    private func resendCode() async {
        isResending = true
        
        // Simulate API call
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        isResending = false
        showingResendSuccess = true
    }
}

#Preview {
    NavigationView {
        VerificationView(email: "john.doe@university.edu")
            .environmentObject(AuthenticationManager())
    }
}

