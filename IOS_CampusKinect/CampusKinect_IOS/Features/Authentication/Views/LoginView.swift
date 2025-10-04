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
    @State private var isPasswordVisible = false
    @State private var shouldNavigateToRegister = false
    @State private var activeAlert: ActiveAlert?
    
    // Derive banned state directly from authManager instead of maintaining separate state
    private var isBanned: Bool {
        if case .accountBanned = authManager.authError {
            return true
        }
        return false
    }
    
    enum ActiveAlert: Identifiable {
        case loginFailed
        case accountBanned
        case forgotPassword
        
        var id: Int {
            switch self {
            case .loginFailed: return 1
            case .accountBanned: return 2
            case .forgotPassword: return 3
            }
        }
    }
    @FocusState private var focusedField: LoginField?
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    // iPad detection
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    enum LoginField {
        case email, password
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 32) {
                        headerSection
                        loginForm
                        loginButton
                        
                        // Banned account message
                        if isBanned {
                            VStack(spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.shield.fill")
                                        .foregroundColor(.red)
                                        .font(.title2)
                                    
                                    Text("Account Banned")
                                        .font(.headline)
                                        .foregroundColor(.red)
                                }
                                
                                Text(authManager.authError?.userFriendlyMessage ?? "Your account has been permanently banned from CampusKinect.")
                                    .font(.body)
                                    .multilineTextAlignment(.center)
                                    .foregroundColor(.primary)
                                
                                Text("For questions or to appeal, please email:")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                
                                Button(action: {
                                    if let url = URL(string: "mailto:campuskinect01@gmail.com") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    Text("campuskinect01@gmail.com")
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.blue)
                                        .underline()
                                }
                            }
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(12)
                            .transition(.opacity)
                        }
                        
                        footerSection
                    }
                    .padding(.horizontal, isIPad ? 40 : 24)
                    .padding(.vertical, 40)
                    .frame(maxWidth: isIPad ? min(geometry.size.width * 0.7, 600) : .infinity)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .background(Color.campusBackground)
            .onTapGesture {
                // Dismiss keyboard when tapping outside text fields
                focusedField = nil
            }
        }
        .navigationBarHidden(true)
        .alert(item: $activeAlert) { alertType in
            switch alertType {
            case .loginFailed:
                return Alert(
                    title: Text("Login Failed"),
                    message: Text(authManager.authError?.userFriendlyMessage ?? "An error occurred"),
                    dismissButton: .default(Text("OK")) {
                        authManager.clearError()
                    }
                )
            case .forgotPassword:
                return Alert(
                    title: Text("Forgot Password"),
                    message: Text("Email campuskinect01@gmail.com"),
                    dismissButton: .default(Text("OK"))
                )
            case .accountBanned:
                // Not used anymore - showing inline text instead
                return Alert(title: Text(""))
            }
        }
    }
    
    // MARK: - Components
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Spacer()
                .frame(height: isIPad ? 60 : 40)
            
            Image("Logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: isIPad ? 100 : 80)
            
            VStack(spacing: 8) {
                Text("Welcome Back")
                    .font(isIPad ? .largeTitle : .title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text("Sign in to your account")
                    .font(isIPad ? .title3 : .subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var loginForm: some View {
        VStack(spacing: 20) {
            // Email Field
            VStack(alignment: .leading, spacing: 8) {
                Text("Username or Email")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                TextField("Enter your username or email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($focusedField, equals: .email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }
            
            // Password Field
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Password")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Spacer()
                    
                    Button("Forgot?") {
                        activeAlert = .forgotPassword
                    }
                    .font(.caption)
                    .foregroundColor(Color("BrandPrimary"))
                }
                
                HStack {
                    if isPasswordVisible {
                        TextField("Enter your password", text: $password)
                            .focused($focusedField, equals: .password)
                    } else {
                        SecureField("Enter your password", text: $password)
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
            }
        }
    }
    
    private var loginButton: some View {
        Button(action: {
            focusedField = nil
            Task {
                await performLogin()
            }
        }) {
            HStack {
                if authManager.isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                        .foregroundColor(.white)
                }
                
                Text(authManager.isLoading ? "Signing In..." : "Sign In")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                isFormValid ? Color.campusPrimary : Color.campusGrey400
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
            
            NavigationLink(destination: RegisterView()) {
                Text("Don't have an account? Sign Up")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Color("BrandPrimary"))
            }
            
            Spacer()
                .frame(height: isIPad ? 40 : 20)
        }
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && password.count >= 6
    }
    
    // MARK: - Methods
    
    private func performLogin() async {
        let success = await authManager.login(email: email, password: password)
        
        if !success {
            // Check if it's NOT a banned account error - show alert for other failures
            if case .accountBanned = authManager.authError {
                // isBanned computed property will automatically return true
                // The view will re-render because authManager.authError changed
            } else {
                await MainActor.run {
                    activeAlert = .loginFailed
                }
            }
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AuthenticationManager())
    }
}
