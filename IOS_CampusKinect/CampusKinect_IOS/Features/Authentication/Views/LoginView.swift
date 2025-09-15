//
//  LoginView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var password = ""
    @State private var showingAlert = false
    @State private var isPasswordVisible = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Logo and Title
                    VStack(spacing: 16) {
                        Image(systemName: "graduationcap.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)
                        
                        Text("CampusKinect")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Connect with your campus community")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Login Form
                    VStack(spacing: 20) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Username or Email")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            TextField("Enter your username or email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.default)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                        }
                        
                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            HStack {
                                if isPasswordVisible {
                                    TextField("Enter your password", text: $password)
                                } else {
                                    SecureField("Enter your password", text: $password)
                                }
                                
                                Button(action: {
                                    isPasswordVisible.toggle()
                                }) {
                                    Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        // Login Button
                        LoadingButton(
                            title: "Sign In",
                            isLoading: authManager.isLoading
                        ) {
                            Task {
                                let success = await authManager.login(
                                    email: email,
                                    password: password
                                )
                                
                                if !success {
                                    showingAlert = true
                                }
                            }
                        }
                        .disabled(email.isEmpty || password.isEmpty)
                        
                        // Forgot Password
                        Button("Forgot Password?") {
                            // Navigate to forgot password
                        }
                        .font(.subheadline)
                        .foregroundColor(.blue)
                    }
                    .padding(.horizontal, 20)
                    
                    // Sign Up Link
                    HStack {
                        Text("Don't have an account?")
                            .foregroundColor(.secondary)
                        
                        NavigationLink("Sign Up", destination: RegisterView())
                            .fontWeight(.medium)
                    }
                    .font(.subheadline)
                    
                    Spacer()
                }
            }
            .navigationBarHidden(true)
        }
        .alert("Login Failed", isPresented: $showingAlert) {
            Button("OK") {
                authManager.clearError()
            }
        } message: {
            Text(authManager.authError?.userFriendlyMessage ?? "An error occurred")
        }
    }
}

// MARK: - Authentication Flow Container
struct AuthenticationFlow: View {
    var body: some View {
        LoginView()
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthenticationManager())
}

