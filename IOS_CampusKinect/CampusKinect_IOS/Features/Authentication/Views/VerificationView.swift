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
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Reduced top spacing
                    Spacer(minLength: 20)
                    
                    // Header Section
                    VStack(spacing: 16) {
                        Image(systemName: "envelope.badge.fill")
                            .font(.system(size: 64))
                            .foregroundColor(Color("BrandPrimary"))
                        
                        Text("Check Your Email")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(Color("BrandPrimary"))
                        
                        Text("We've sent a 6-digit verification code to:")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                        
                        Text(email)
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(Color("BrandPrimary"))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color("BrandPrimary").opacity(0.1))
                            .cornerRadius(8)
                    }
                    
                    // Email Guidance
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "info.circle.fill")
                                .foregroundColor(Color("BrandPrimary"))
                                .font(.caption)
                            
                            Text("Can't find the email?")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            
                            Spacer()
                        }
                        
                        Text("Check your spam or junk folder if you don't see the verification email in your primary inbox.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                    .padding(.horizontal, 32)
                    
                    // Verification Form Card
                    VStack(spacing: 24) {
                        VStack(spacing: 12) {
                            // Center the "Verification Code" label
                            Text("Verification Code")
                                .font(.headline)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                                .frame(maxWidth: .infinity, alignment: .center)
                            
                            TextField("", text: $verificationCode)
                                .keyboardType(.numberPad)
                                .font(.system(size: 28, weight: .semibold, design: .monospaced))
                                .tracking(verificationCode.isEmpty ? 0 : 20) // Add spacing between digits
                                .multilineTextAlignment(.center)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding(.horizontal, 16)
                                .padding(.vertical, 20)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color("BrandPrimary").opacity(0.3), lineWidth: 2)
                                )
                                .onChange(of: verificationCode) { _, newValue in
                                    // Limit to 6 digits and only allow numbers
                                    let filtered = newValue.filter { $0.isNumber }
                                    if filtered.count > 6 {
                                        verificationCode = String(filtered.prefix(6))
                                    } else {
                                        verificationCode = filtered
                                    }
                                }
                        }
                        
                        if let error = authManager.authError {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                Text(error.userFriendlyMessage)
                                    .foregroundColor(.red)
                                    .font(.caption)
                                Spacer()
                            }
                            .padding(.horizontal, 4)
                        }
                        
                        LoadingButton(
                            title: "Verify Email",
                            isLoading: authManager.isLoading
                        ) {
                            Task {
                                await verifyEmail()
                            }
                        }
                        .disabled(verificationCode.count != 6)
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 4)
                    .padding(.horizontal, 32)
                    
                    // Resend Section
                    VStack(spacing: 16) {
                        HStack(spacing: 8) {
                            Text("Didn't receive the code?")
                                .foregroundColor(.secondary)
                            
                            Button("Resend Code") {
                                Task {
                                    await resendCode()
                                }
                            }
                            .font(.body)
                            .fontWeight(.medium)
                            .foregroundColor(Color("BrandPrimary"))
                            .disabled(isResending)
                        }
                        
                        if isResending {
                            HStack(spacing: 8) {
                                ProgressView()
                                    .scaleEffect(0.8)
                                Text("Sending new code...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    
                    Spacer()
                }
            }
            .onTapGesture {
                // Dismiss keyboard when tapping outside
                hideKeyboard()
            }
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color("BrandPrimary").opacity(0.05),
                        Color.clear,
                        Color("BrandPrimary").opacity(0.1)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .navigationTitle("Verify Email")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Back") {
                        dismiss()
                    }
                    .foregroundColor(Color("BrandPrimary"))
                }
            }
            .alert("Code Sent", isPresented: $showingResendSuccess) {
                Button("OK") { }
            } message: {
                Text("A new verification code has been sent to your email.")
            }
        }
    }
    
    // MARK: - Helper Functions
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    private func verifyEmail() async {
        guard verificationCode.count == 6 else { return }
        
        let success = await authManager.verifyEmail(email: email, code: verificationCode)
        if success {
            // Verification successful - AuthenticationManager will handle navigation
            dismiss()
        } else {
            // Error will be displayed through authManager.authError
        }
    }
    
    private func resendCode() async {
        isResending = true
        
        let success = await authManager.resendVerificationCode(email: email)
        
        isResending = false
        if success {
            showingResendSuccess = true
        }
        // Error will be displayed through authManager.authError if failed
    }
}

#Preview {
    NavigationView {
        VerificationView(email: "john.doe@university.edu")
            .environmentObject(AuthenticationManager())
    }
}

