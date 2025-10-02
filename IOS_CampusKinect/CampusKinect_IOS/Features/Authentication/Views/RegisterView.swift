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
    @State private var agreeToTerms = false
    @State private var showingAlert = false
    @State private var isPasswordVisible = false
    @State private var isConfirmPasswordVisible = false
    @State private var showingVerification = false
    @State private var showingTerms = false
    @State private var showingPrivacy = false
    @FocusState private var focusedField: RegisterField?
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
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
                    VStack(spacing: 32) {
                        headerSection
                        registrationForm
                        complianceBanner
                        termsAgreementSection
                        registerButton
                        footerSection
                    }
                    .padding(.horizontal, isIPad ? 40 : 24)
                    .padding(.vertical, 40)
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.7, 600) : .infinity)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
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
        .sheet(isPresented: $showingTerms) {
            TermsOfServiceView(isPresented: $showingTerms) { shouldRememberChoice in
                // For registration, we don't need to remember choice since this is first-time acceptance
                print("📋 Terms accepted during registration")
                agreeToTerms = true // Automatically check the agreement checkbox
            } onDecline: {
                // User declined terms during registration - they stay on registration page
                print("📋 Terms declined during registration")
                agreeToTerms = false // Ensure checkbox is unchecked
            }
        }
        .sheet(isPresented: $showingPrivacy) {
            NavigationView {
                PrivacyView()
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Done") {
                                showingPrivacy = false
                            }
                        }
                    }
            }
        }
    }
    
    // MARK: - Components
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Spacer()
                .frame(height: isIPad ? 40 : 20)
            
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: isIPad ? 80 : 60)
            
            VStack(spacing: 8) {
                Text("Join CampusKinect")
                    .font(isIPad ? .largeTitle : .title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text("Connect with your campus community")
                    .font(isIPad ? .title3 : .subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    private var registrationForm: some View {
        VStack(spacing: 20) {
            // Username Field
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
            
            // Name Fields
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
            
            // Email Field
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
                
                if !email.isEmpty && !isValidUniversityEmail {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                            .font(.caption)
                        Text("Please use your university email address")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
            }
            
            // Password Fields
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        if isPasswordVisible {
                            TextField("Password", text: $password)
                                .focused($focusedField, equals: .password)
                        } else {
                            SecureField("Password", text: $password)
                                .focused($focusedField, equals: .password)
                        }
                        
                        Button(action: {
                            isPasswordVisible.toggle()
                        }) {
                            Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    if !password.isEmpty && password.count < 6 {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                                .font(.caption)
                            Text("Password must be at least 6 characters")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm Password")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        if isConfirmPasswordVisible {
                            TextField("Confirm Password", text: $confirmPassword)
                                .focused($focusedField, equals: .confirmPassword)
                        } else {
                            SecureField("Confirm Password", text: $confirmPassword)
                                .focused($focusedField, equals: .confirmPassword)
                        }
                        
                        Button(action: {
                            isConfirmPasswordVisible.toggle()
                        }) {
                            Image(systemName: isConfirmPasswordVisible ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    if !confirmPassword.isEmpty && password != confirmPassword {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                                .font(.caption)
                            Text("Passwords do not match")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }
            }
        }
    }
    
    private var registerButton: some View {
        Button(action: {
            focusedField = nil
            Task {
                await performRegistration()
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
    }
    
    private var footerSection: some View {
        VStack(spacing: 16) {
            HStack {
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.secondary.opacity(0.3))
                
                Text("or")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 16)
                
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.secondary.opacity(0.3))
            }
            
            Button(action: { dismiss() }) {
                Text("Already have an account? Sign In")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Color("BrandPrimary"))
            }
            
            Spacer()
                .frame(height: isIPad ? 40 : 20)
        }
    }
    
    // MARK: - Apple Guideline 1.2 Compliance Banner
    private var complianceBanner: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "shield.fill")
                    .foregroundColor(.red)
                    .font(.title2)
                
                VStack(alignment: .leading, spacing: 6) {
                    Text("ZERO TOLERANCE POLICY")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.red)
                    
                    Text("CampusKinect maintains ABSOLUTE ZERO TOLERANCE for objectionable content or abusive behavior of any kind.")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        CompliancePoint("All content is actively monitored and filtered")
                        CompliancePoint("Reports are reviewed and acted upon within 24 hours")
                        CompliancePoint("Violating users are immediately ejected from the platform")
                        CompliancePoint("Content removal is swift and permanent")
                    }
                    .padding(.top, 4)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.red.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.red.opacity(0.3), lineWidth: 2)
                )
        )
    }
    
    private var termsAgreementSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                Button(action: {
                    agreeToTerms.toggle()
                }) {
                    Image(systemName: agreeToTerms ? "checkmark.square.fill" : "square")
                        .foregroundColor(agreeToTerms ? Color("BrandPrimary") : .secondary)
                        .font(.title3)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("I agree to the Terms of Service and Privacy Policy")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    // Flowing text with inline tappable links
                    ViewThatFits {
                        // Try single line first
                        HStack(spacing: 0) {
                            Text("By creating an account, you agree to our ")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Button(action: { showingTerms = true }) {
                                Text("Terms of Service")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(Color("BrandPrimary"))
                                    .underline()
                            }
                            
                            Text(" and ")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Button(action: { showingPrivacy = true }) {
                                Text("Privacy Policy")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(Color("BrandPrimary"))
                                    .underline()
                            }
                            
                            Text(".")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        // Wrap if needed
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 0) {
                                Text("By creating an account, you agree to our ")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Button(action: { showingTerms = true }) {
                                    Text("Terms of Service")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(Color("BrandPrimary"))
                                        .underline()
                                }
                            }
                            
                            HStack(spacing: 0) {
                                Text("and ")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Button(action: { showingPrivacy = true }) {
                                    Text("Privacy Policy")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(Color("BrandPrimary"))
                                        .underline()
                                }
                                
                                Text(".")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
            
            // Additional compliance notice
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.orange)
                    .font(.caption)
                
                Text("Agreement to these terms includes acknowledgment of our zero-tolerance policy for objectionable content and abusive behavior. Violations result in immediate account termination.")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.top, 8)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
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
        password.count >= 6 &&
        password == confirmPassword &&
        agreeToTerms // ✅ MANDATORY TERMS AGREEMENT
    }
    
    // MARK: - Methods
    
    private func performRegistration() async {
        let success = await authManager.register(
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        )
        
        if success {
            showingVerification = true
        } else {
            showingAlert = true
        }
    }
}

// MARK: - Supporting Views

struct CompliancePoint: View {
    let text: String
    
    init(_ text: String) {
        self.text = text
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 6) {
            Text("•")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.red)
            
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

struct RegisterView_Previews: PreviewProvider {
    static var previews: some View {
        RegisterView()
            .environmentObject(AuthenticationManager())
    }
}

