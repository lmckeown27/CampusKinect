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
    
    enum RegisterField {
        case username, firstName, lastName, email, password, confirmPassword
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 0) {
                        headerSection
                        formSection
                        registerButtonSection
                    }
                    .padding()
                }
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
        }
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
            focusedField = nil
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
    
    // MARK: - View Components
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Spacer()
                .frame(height: 40)
            
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 80)
            
            VStack(spacing: 8) {
                Text("Join CampusKinect")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text("Connect with your campus community")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
                .frame(height: 20)
        }
    }
    
    private var formSection: some View {
        VStack(spacing: 20) {
            usernameField
            nameFields
            emailField
            passwordFields
        }
    }
    
    private var usernameField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Username")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextField("Choose a username", text: $username)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .username)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
    }
    
    private var nameFields: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                Text("First Name")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                TextField("First name", text: $firstName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($focusedField, equals: .firstName)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Last Name")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                TextField("Last name", text: $lastName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($focusedField, equals: .lastName)
            }
        }
    }
    
    private var emailField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("University Email")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextField("your.email@university.edu", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
    }
    
    private var passwordFields: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Password")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                if isPasswordVisible {
                    TextField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .focused($focusedField, equals: .password)
                } else {
                    SecureField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .focused($focusedField, equals: .password)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Confirm Password")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                if isConfirmPasswordVisible {
                    TextField("Confirm Password", text: $confirmPassword)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .focused($focusedField, equals: .confirmPassword)
                } else {
                    SecureField("Confirm Password", text: $confirmPassword)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .focused($focusedField, equals: .confirmPassword)
                }
            }
        }
    }
    
    private var registerButtonSection: some View {
        VStack(spacing: 16) {
            Button(action: {
                Task {
                    await registerUser()
                }
            }) {
                HStack {
                    if authManager.isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                            .foregroundColor(.white)
                    }
                    Text(authManager.isLoading ? "Creating Account..." : "Create Account")
                        .fontWeight(.semibold)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(
                    isFormValid ? Color("BrandPrimary") : Color.gray
                )
                .cornerRadius(12)
            }
            .disabled(!isFormValid || authManager.isLoading)
            
            Spacer()
                .frame(height: 40)
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
    
    private func registerUser() async {
        // Dismiss keyboard before registration
        focusedField = nil
        
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

