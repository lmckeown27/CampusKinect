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
    @State private var isEmailFocused = false
    @State private var isPasswordFocused = false
    @FocusState private var focusedField: LoginField?
    
    enum LoginField {
        case email, password
    }
    
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
                            CustomTextField(
                                title: "Username or University Email",
                                text: $email,
                                isSecure: false,
                                isFocused: focusedField == .email,
                                keyboardType: .default,
                                onFocusChange: { focused in
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        isEmailFocused = focused
                                        if focused {
                                            focusedField = .email
                                        }
                                    }
                                }
                            )
                            .focused($focusedField, equals: .email)
                            
                            // Password Field
                            CustomSecureField(
                                title: "Password",
                                text: $password,
                                isVisible: isPasswordVisible,
                                isFocused: focusedField == .password,
                                onVisibilityToggle: {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        isPasswordVisible.toggle()
                                    }
                                },
                                onFocusChange: { focused in
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        isPasswordFocused = focused
                                        if focused {
                                            focusedField = .password
                                        }
                                    }
                                }
                            )
                            .focused($focusedField, equals: .password)
                            
                            // Login Button
                            LoadingButton(
                                title: "Sign In",
                                isLoading: authManager.isLoading
                            ) {
                                // Dismiss keyboard before login
                                focusedField = nil
                                
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
            .onTapGesture {
                // Dismiss keyboard when tapping outside
                focusedField = nil
            }
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

// MARK: - Custom Text Field
struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let isSecure: Bool
    let isFocused: Bool
    let keyboardType: UIKeyboardType
    let onFocusChange: (Bool) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isFocused ? Color("BrandPrimary") : Color("BrandPrimary").opacity(0.3),
                        lineWidth: isFocused ? 2 : 1
                    )
                    .frame(height: 56)
                    .animation(.easeInOut(duration: 0.2), value: isFocused)
                
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Text(title)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(isFocused ? Color("BrandPrimary") : .primary)
                            .padding(.horizontal, 4)
                            .background(Color(.systemBackground))
                            .scaleEffect(isFocused || !text.isEmpty ? 1.0 : 0.9)
                            .animation(.easeInOut(duration: 0.2), value: isFocused || !text.isEmpty)
                        Spacer()
                    }
                    .offset(y: -8)
                    .padding(.leading, 12)
                    
                    TextField("", text: $text)
                        .font(.system(size: 16))
                        .textFieldStyle(PlainTextFieldStyle())
                        .keyboardType(keyboardType)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .padding(.horizontal, 16)
                        .padding(.top, -8)
                }
            }
            .contentShape(Rectangle()) // Make entire area tappable
            .onTapGesture {
                onFocusChange(true)
            }
        }
    }
}

// MARK: - Custom Secure Field
struct CustomSecureField: View {
    let title: String
    @Binding var text: String
    let isVisible: Bool
    let isFocused: Bool
    let onVisibilityToggle: () -> Void
    let onFocusChange: (Bool) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isFocused ? Color("BrandPrimary") : Color("BrandPrimary").opacity(0.3),
                        lineWidth: isFocused ? 2 : 1
                    )
                    .frame(height: 56)
                    .animation(.easeInOut(duration: 0.2), value: isFocused)
                
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Text(title)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(isFocused ? Color("BrandPrimary") : .primary)
                            .padding(.horizontal, 4)
                            .background(Color(.systemBackground))
                            .scaleEffect(isFocused || !text.isEmpty ? 1.0 : 0.9)
                            .animation(.easeInOut(duration: 0.2), value: isFocused || !text.isEmpty)
                        Spacer()
                    }
                    .offset(y: -8)
                    .padding(.leading, 12)
                    
                    HStack {
                        if isVisible {
                            TextField("", text: $text)
                                .font(.system(size: 16))
                                .textFieldStyle(PlainTextFieldStyle())
                        } else {
                            SecureField("", text: $text)
                                .font(.system(size: 16))
                                .textFieldStyle(PlainTextFieldStyle())
                        }
                        
                        Button(action: onVisibilityToggle) {
                            Image(systemName: isVisible ? "eye.slash" : "eye")
                                .foregroundColor(Color("BrandPrimary"))
                                .font(.system(size: 16))
                                .scaleEffect(isFocused ? 1.1 : 1.0)
                                .animation(.easeInOut(duration: 0.2), value: isFocused)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, -8)
                }
            }
            .contentShape(Rectangle()) // Make entire area tappable
            .onTapGesture {
                onFocusChange(true)
            }
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

