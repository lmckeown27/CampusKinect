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
    @State private var username = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var isPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    @State private var showingVerification = false
    @FocusState private var focusedField: RegisterField?
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    enum RegisterField {
        case username, firstName, lastName, email, password, confirmPassword
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
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
                            // Username Field
                            CustomTextFieldWithPlaceholder(
                                title: "Username",
                                text: $username,
                                isSecure: false,
                                isFocused: focusedField == .username,
                                keyboardType: .default,
                                onFocusChange: { focused in
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        if focused {
                                            focusedField = .username
                                        }
                                    }
                                },
                                placeholder: "your_username"
                            )
                            .focused($focusedField, equals: .username)
                            
                            // Name Fields Row
                            HStack(spacing: 12) {
                                // First Name
                                CustomTextField(
                                    title: "First Name",
                                    text: $firstName,
                                    isSecure: false,
                                    isFocused: focusedField == .firstName,
                                    keyboardType: .default,
                                    onFocusChange: { focused in
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            if focused {
                                                focusedField = .firstName
                                            }
                                        }
                                    }
                                )
                                .focused($focusedField, equals: .firstName)
                                
                                // Last Name
                                CustomTextField(
                                    title: "Last Name",
                                    text: $lastName,
                                    isSecure: false,
                                    isFocused: focusedField == .lastName,
                                    keyboardType: .default,
                                    onFocusChange: { focused in
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            if focused {
                                                focusedField = .lastName
                                            }
                                        }
                                    }
                                )
                                .focused($focusedField, equals: .lastName)
                            }
                            
                            // University Email Field
                            VStack(alignment: .leading, spacing: 8) {
                                CustomTextFieldWithPlaceholder(
                                    title: "University Email",
                                    text: $email,
                                    isSecure: false,
                                    isFocused: focusedField == .email,
                                    keyboardType: .emailAddress,
                                    onFocusChange: { focused in
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            if focused {
                                                focusedField = .email
                                            }
                                        }
                                    },
                                    placeholder: "yourname@yourcollege.edu"
                                )
                                .focused($focusedField, equals: .email)
                                
                                if !email.isEmpty && !isValidUniversityEmail {
                                    HStack {
                                        Image(systemName: "exclamationmark.triangle.fill")
                                            .foregroundColor(.red)
                                            .font(.caption)
                                        Text("Please use your university email address")
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                    .padding(.leading, 4)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                                }
                            }
                            
                            // Password Field
                            VStack(alignment: .leading, spacing: 8) {
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
                                            if focused {
                                                focusedField = .password
                                            }
                                        }
                                    }
                                )
                                .focused($focusedField, equals: .password)
                                
                                if !password.isEmpty && password.count < AppConstants.minPasswordLength {
                                    HStack {
                                        Image(systemName: "exclamationmark.triangle.fill")
                                            .foregroundColor(.red)
                                            .font(.caption)
                                        Text("Password must be at least \(AppConstants.minPasswordLength) characters")
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                    .padding(.leading, 4)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                                }
                            }
                            
                            // Confirm Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                CustomSecureField(
                                    title: "Confirm Password",
                                    text: $confirmPassword,
                                    isVisible: isConfirmPasswordVisible,
                                    isFocused: focusedField == .confirmPassword,
                                    onVisibilityToggle: {
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            isConfirmPasswordVisible.toggle()
                                        }
                                    },
                                    onFocusChange: { focused in
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            if focused {
                                                focusedField = .confirmPassword
                                            }
                                        }
                                    }
                                )
                                .focused($focusedField, equals: .confirmPassword)
                                
                                if !confirmPassword.isEmpty && password != confirmPassword {
                                    HStack {
                                        Image(systemName: "exclamationmark.triangle.fill")
                                            .foregroundColor(.red)
                                            .font(.caption)
                                        Text("Passwords do not match")
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                    .padding(.leading, 4)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                                }
                            }
                            
                            // Register Button
                            LoadingButton(
                                title: "Create Account",
                                isLoading: authManager.isLoading
                            ) {
                                // Dismiss keyboard before registration
                                focusedField = nil
                                
                                Task {
                                    let success = await authManager.register(
                                        username: username,
                                        email: email,
                                        password: password,
                                        firstName: firstName,
                                        lastName: lastName
                                    )
                                    
                                    if success {
                                        // Navigate to verification view
                                        showingVerification = true
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
            .onTapGesture {
                // Dismiss keyboard when tapping outside
                focusedField = nil
            }
            .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
            .frame(maxHeight: .infinity)
            .clipped()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
            .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
            .frame(maxHeight: .infinity)
            .clipped()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        }
        .alert("Registration Failed", isPresented: $showingAlert) {
            Button("OK") {
                authManager.clearError()
            }
        } message: {
            Text(authManager.authError?.userFriendlyMessage ?? "An error occurred")
        }
        .fullScreenCover(isPresented: $showingVerification) {
            VerificationView(email: email)
        }
    }
    
    // MARK: - Computed Properties
    private var isValidUniversityEmail: Bool {
        email.contains("@") && email.hasSuffix(".edu")
    }
    
    private var isFormValid: Bool {
        !username.isEmpty &&
        username.count >= 3 &&
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        isValidUniversityEmail &&
        password.count >= AppConstants.minPasswordLength &&
        password == confirmPassword
    }
}

// MARK: - Enhanced Custom Text Field with Placeholder Support
struct CustomTextFieldWithPlaceholder: View {
    let title: String
    @Binding var text: String
    let isSecure: Bool
    let isFocused: Bool
    let keyboardType: UIKeyboardType
    let onFocusChange: (Bool) -> Void
    let placeholder: String
    
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
                    
                    TextField(placeholder, text: $text)
                        .font(.system(size: 16))
                        .textFieldStyle(PlainTextFieldStyle())
                        .keyboardType(keyboardType)
                        .autocapitalization(.none)
                        .disableAutocorrection(keyboardType != .emailAddress)
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

#Preview {
    RegisterView()
        .environmentObject(AuthenticationManager())
}

