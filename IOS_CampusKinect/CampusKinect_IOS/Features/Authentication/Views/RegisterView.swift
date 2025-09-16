//
//  RegisterView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var displayName = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var isPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header Section
                    VStack(spacing: 16) {
                        Spacer()
                            .frame(height: 40)
                        
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
                        Text("Create your account to get started")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, 32)
                    
                    // Registration Form Card
                    VStack(spacing: 0) {
                        VStack(spacing: 20) {
                            // Name Fields Row
                            HStack(spacing: 12) {
                                // First Name
                                VStack(alignment: .leading, spacing: 8) {
                                    ZStack(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(Color("BrandPrimary"), lineWidth: 2)
                                            .frame(height: 56)
                                        
                                        VStack(alignment: .leading, spacing: 0) {
                                            HStack {
                                                Text("First Name")
                                                    .font(.caption)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(.primary)
                                                    .padding(.horizontal, 4)
                                                    .background(Color(.systemBackground))
                                                Spacer()
                                            }
                                            .offset(y: -8)
                                            .padding(.leading, 12)
                                            
                                            TextField("", text: $firstName)
                                                .font(.system(size: 16))
                                                .textFieldStyle(PlainTextFieldStyle())
                                                .padding(.horizontal, 16)
                                                .padding(.top, -8)
                                        }
                                    }
                                }
                                
                                // Last Name
                                VStack(alignment: .leading, spacing: 8) {
                                    ZStack(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(Color("BrandPrimary"), lineWidth: 2)
                                            .frame(height: 56)
                                        
                                        VStack(alignment: .leading, spacing: 0) {
                                            HStack {
                                                Text("Last Name")
                                                    .font(.caption)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(.primary)
                                                    .padding(.horizontal, 4)
                                                    .background(Color(.systemBackground))
                                                Spacer()
                                            }
                                            .offset(y: -8)
                                            .padding(.leading, 12)
                                            
                                            TextField("", text: $lastName)
                                                .font(.system(size: 16))
                                                .textFieldStyle(PlainTextFieldStyle())
                                                .padding(.horizontal, 16)
                                                .padding(.top, -8)
                                        }
                                    }
                                }
                            }
                            
                            // Display Name Field
                            VStack(alignment: .leading, spacing: 8) {
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color("BrandPrimary"), lineWidth: 2)
                                        .frame(height: 56)
                                    
                                    VStack(alignment: .leading, spacing: 0) {
                                        HStack {
                                            Text("Display Name")
                                                .font(.caption)
                                                .fontWeight(.medium)
                                                .foregroundColor(.primary)
                                                .padding(.horizontal, 4)
                                                .background(Color(.systemBackground))
                                            Spacer()
                                        }
                                        .offset(y: -8)
                                        .padding(.leading, 12)
                                        
                                        TextField("How others will see you", text: $displayName)
                                            .font(.system(size: 16))
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(.horizontal, 16)
                                            .padding(.top, -8)
                                    }
                                }
                            }
                            
                            // University Email Field
                            VStack(alignment: .leading, spacing: 8) {
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color("BrandPrimary"), lineWidth: 2)
                                        .frame(height: 56)
                                    
                                    VStack(alignment: .leading, spacing: 0) {
                                        HStack {
                                            Text("University Email")
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
                                            TextField("yourname@yourcollege.edu", text: $email)
                                                .font(.system(size: 16))
                                                .textFieldStyle(PlainTextFieldStyle())
                                                .keyboardType(.emailAddress)
                                                .autocapitalization(.none)
                                                .disableAutocorrection(true)
                                            
                                            if !email.isEmpty && !isValidUniversityEmail {
                                                Text("Use university email")
                                                    .font(.caption)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(.red)
                                            }
                                        }
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
                                
                                if !password.isEmpty && password.count < AppConstants.minPasswordLength {
                                    Text("Password must be at least \(AppConstants.minPasswordLength) characters")
                                        .font(.caption)
                                        .foregroundColor(.red)
                                        .padding(.leading, 4)
                                }
                            }
                            
                            // Confirm Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color("BrandPrimary"), lineWidth: 2)
                                        .frame(height: 56)
                                    
                                    VStack(alignment: .leading, spacing: 0) {
                                        HStack {
                                            Text("Confirm Password")
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
                                            if isConfirmPasswordVisible {
                                                TextField("", text: $confirmPassword)
                                                    .font(.system(size: 16))
                                                    .textFieldStyle(PlainTextFieldStyle())
                                            } else {
                                                SecureField("", text: $confirmPassword)
                                                    .font(.system(size: 16))
                                                    .textFieldStyle(PlainTextFieldStyle())
                                            }
                                            
                                            Button(action: {
                                                isConfirmPasswordVisible.toggle()
                                            }) {
                                                Image(systemName: isConfirmPasswordVisible ? "eye.slash" : "eye")
                                                    .foregroundColor(Color("BrandPrimary"))
                                                    .font(.system(size: 16))
                                            }
                                            
                                            if !confirmPassword.isEmpty && password != confirmPassword {
                                                Text("Passwords must match")
                                                    .font(.caption)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(.red)
                                            }
                                        }
                                        .padding(.horizontal, 16)
                                        .padding(.top, -8)
                                    }
                                }
                                
                                if !confirmPassword.isEmpty && password != confirmPassword {
                                    Text("Passwords do not match")
                                        .font(.caption)
                                        .foregroundColor(.red)
                                        .padding(.leading, 4)
                                }
                            }
                            
                            // Register Button
                            LoadingButton(
                                title: "Create Account",
                                isLoading: authManager.isLoading
                            ) {
                                Task {
                                    let success = await authManager.register(
                                        email: email,
                                        password: password,
                                        firstName: firstName,
                                        lastName: lastName
                                    )
                                    
                                    if success {
                                        // Navigate to verification view
                                    } else {
                                        showingAlert = true
                                    }
                                }
                            }
                            .disabled(!isFormValid)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 32)
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.1), radius: 16, x: 0, y: 4)
                    .padding(.horizontal, 32)
                    
                    // Sign In Link
                    VStack(spacing: 16) {
                        Button(action: { dismiss() }) {
                            Text("← Have an Account?")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(Color("BrandPrimary"))
                        }
                        
                        // Footer
                        VStack(spacing: 4) {
                            Text("By creating an account, you agree to our")
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
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Color("BrandPrimary"))
                }
            }
        }
        .alert("Registration Failed", isPresented: $showingAlert) {
            Button("OK") {
                authManager.clearError()
            }
        } message: {
            Text(authManager.authError?.userFriendlyMessage ?? "An error occurred")
        }
    }
    
    // MARK: - Computed Properties
    private var isValidUniversityEmail: Bool {
        email.contains("@") && email.hasSuffix(".edu")
    }
    
    private var isFormValid: Bool {
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        !displayName.isEmpty &&
        isValidUniversityEmail &&
        password.count >= AppConstants.minPasswordLength &&
        password == confirmPassword
    }
}

#Preview {
    RegisterView()
        .environmentObject(AuthenticationManager())
}

