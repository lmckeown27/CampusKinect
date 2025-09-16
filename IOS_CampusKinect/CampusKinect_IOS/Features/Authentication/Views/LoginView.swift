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
                VStack(spacing: 0) {
                    // Header Section
                    VStack(spacing: 16) {
                        Spacer()
                            .frame(height: 60)
                        
                        // Logo
                        Image("Logo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 48, height: 48)
                            .cornerRadius(12)
                            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                        
                        // Title
                        Text("CampusKinect")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(Color("BrandPrimary"))
                        
                        // Subtitle
                        Text("Your Go-To University Marketplace")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, 40)
                    
                    // Login Form Card
                    VStack(spacing: 0) {
                        VStack(spacing: 24) {
                            // Email Field
                            VStack(alignment: .leading, spacing: 8) {
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color("BrandPrimary"), lineWidth: 2)
                                        .frame(height: 56)
                                    
                                    VStack(alignment: .leading, spacing: 0) {
                                        HStack {
                                            Text("Username or University Email")
                                                .font(.caption)
                                                .fontWeight(.medium)
                                                .foregroundColor(.primary)
                                                .padding(.horizontal, 4)
                                                .background(Color(.systemBackground))
                                            Spacer()
                                        }
                                        .offset(y: -8)
                                        .padding(.leading, 12)
                                        
                                        TextField("", text: $email)
                                            .font(.system(size: 16))
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .keyboardType(.default)
                                            .autocapitalization(.none)
                                            .disableAutocorrection(true)
                                            .padding(.horizontal, 16)
                                            .padding(.top, -8)
                                    }
                                }
                            }
                            
                            // Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color("BrandPrimary"), lineWidth: 2)
                                        .frame(height: 56)
                                    
                                    VStack(alignment: .leading, spacing: 0) {
                                        HStack {
                                            Text("Password")
                                                .font(.caption)
                                                .fontWeight(.medium)
                                                .foregroundColor(.primary)
                                                .padding(.horizontal, 4)
                                                .background(Color(.systemBackground))
                                            Spacer()
                                        }
                                        .offset(y: -8)
                                        .padding(.leading, 12)
                                        
                                        HStack {
                                            if isPasswordVisible {
                                                TextField("", text: $password)
                                                    .font(.system(size: 16))
                                                    .textFieldStyle(PlainTextFieldStyle())
                                            } else {
                                                SecureField("", text: $password)
                                                    .font(.system(size: 16))
                                                    .textFieldStyle(PlainTextFieldStyle())
                                            }
                                            
                                            Button(action: {
                                                isPasswordVisible.toggle()
                                            }) {
                                                Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                                                    .foregroundColor(Color("BrandPrimary"))
                                                    .font(.system(size: 16))
                                            }
                                        }
                                        .padding(.horizontal, 16)
                                        .padding(.top, -8)
                                    }
                                }
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
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 32)
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 4)
                    .padding(.horizontal, 32)
                    
                    // Sign Up Link
                    VStack(spacing: 16) {
                        NavigationLink(destination: RegisterView()) {
                            Text("← Don't have an Account?")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(Color("BrandPrimary"))
                        }
                        
                        // Footer
                        VStack(spacing: 4) {
                            Text("By logging in, you agree to our")
                                .font(.caption)
                                .foregroundColor(Color("BrandPrimary"))
                            
                            HStack(spacing: 4) {
                                Button("Terms of Service") {
                                    // Handle terms navigation
                                }
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(Color("BrandPrimary"))
                                
                                Text("and")
                                    .font(.caption)
                                    .foregroundColor(Color("BrandPrimary"))
                                
                                Button("Privacy Policy") {
                                    // Handle privacy navigation
                                }
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(Color("BrandPrimary"))
                            }
                        }
                    }
                    .padding(.top, 24)
                    
                    Spacer()
                }
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

