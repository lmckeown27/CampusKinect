import SwiftUI

struct TermsOfServiceView: View {
    @Binding var isPresented: Bool
    @State private var hasScrolledToBottom = false
    @State private var showingRememberChoicePopup = false
    
    let onAccept: (Bool) -> Void // Bool parameter for shouldRememberChoice
    let onDecline: () -> Void // Callback for when user declines terms
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                    
                    Text(TermsOfServiceContent.title)
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                    
                    Text("Please read our terms and community guidelines")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
                .background(Color(.systemGroupedBackground))
                
                Divider()
                
                // Simple, reliable scroll detection
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 16) {
                        Text(TermsOfServiceContent.content)
                            .font(.system(size: 14, weight: .regular))
                            .lineSpacing(4)
                            .padding()
                        
                        // Simple bottom marker that appears when scrolled to
                        HStack {
                            Spacer()
                            Text("End of Terms")
                                .font(.caption)
                                .foregroundColor(.gray)
                                .padding()
                                .onAppear {
                                    hasScrolledToBottom = true
                                    print("📋 ✅ User reached bottom - Accept button enabled")
                                }
                                .onDisappear {
                                    hasScrolledToBottom = false
                                    print("📋 ❌ User scrolled away from bottom - Accept button disabled")
                                }
                            Spacer()
                        }
                        
                        // Extra padding to ensure the "End of Terms" marker is below the fold
                        Color.clear
                            .frame(height: 100)
                    }
                }
                .onAppear {
                    hasScrolledToBottom = false
                    print("📋 Terms view loaded - Accept button starts disabled")
                }
                
                Divider()
                
                // Bottom Controls
                VStack(spacing: 16) {
                    // Scroll Progress Indicator
                    if !hasScrolledToBottom {
                        HStack {
                            Image(systemName: "arrow.down.circle.fill")
                                .foregroundColor(.orange)
                            Text("You must scroll through and read all terms to continue")
                                .font(.caption)
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal)
                    }
                    

                    
                    // Action Buttons
                    HStack(spacing: 12) {
                        // Decline Button
                        Button("Decline") {
                            onDecline()
                            isPresented = false
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                        
                        // Accept Button
                        Button("Accept") {
                            // Add small delay to prevent state conflicts
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                                showingRememberChoicePopup = true
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(hasScrolledToBottom ? Color(red: 0.5, green: 0.5, blue: 0.0) : Color(.systemGray4))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .disabled(!hasScrolledToBottom)
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
                .background(Color(.systemGroupedBackground))
            }
            .navigationTitle("Terms of Service")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarHidden(true)
        }
        .interactiveDismissDisabled() // Prevent swipe to dismiss
        .alert("Terms of Service Accepted", isPresented: $showingRememberChoicePopup) {
            Button("Show every time") {
                // User wants to see terms popup every login
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onAccept(false) // shouldRememberChoice = false
                    isPresented = false
                }
            }
            
            Button("Don't show again") {
                // User wants to disable future popups
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onAccept(true) // shouldRememberChoice = true
                    isPresented = false
                }
            }
        } message: {
            Text("Would you like to disable the Terms of Service popup for future logins?\n\nNote: You can always review the terms in Settings.")
        }
    }
}

// MARK: - Preview
#Preview {
    TermsOfServiceView(isPresented: .constant(true)) { shouldRemember in
        print("Terms accepted, remember choice: \(shouldRemember)")
    } onDecline: {
        print("Terms declined")
    }
} 