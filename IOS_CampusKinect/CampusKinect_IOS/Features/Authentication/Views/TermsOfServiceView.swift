import SwiftUI

struct TermsOfServiceView: View {
    @Binding var isPresented: Bool
    @State private var hasScrolledToBottom = false
    @State private var shouldRememberChoice = false
    
    let onAccept: (Bool) -> Void // Bool parameter for shouldRememberChoice
    
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
                
                // Scrollable Terms Content
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            Text(TermsOfServiceContent.content)
                                .font(.system(size: 14, weight: .regular))
                                .lineSpacing(4)
                                .padding()
                            
                            // Bottom marker for scroll detection
                            Color.clear
                                .frame(height: 1)
                                .id("bottom")
                                .onAppear {
                                    hasScrolledToBottom = true
                                }
                        }
                    }
                    .onAppear {
                        // Auto-scroll to bottom after a delay to show user they need to scroll
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                            withAnimation(.easeInOut(duration: 0.5)) {
                                proxy.scrollTo("bottom", anchor: .bottom)
                            }
                        }
                    }
                }
                
                Divider()
                
                // Bottom Controls
                VStack(spacing: 16) {
                    // Scroll Progress Indicator
                    if !hasScrolledToBottom {
                        HStack {
                            Image(systemName: "arrow.down.circle.fill")
                                .foregroundColor(.orange)
                            Text("Please scroll to the bottom to continue")
                                .font(.caption)
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal)
                    }
                    
                    // Remember Choice Toggle
                    HStack {
                        Toggle("Remove for future logins?", isOn: $shouldRememberChoice)
                            .font(.subheadline)
                    }
                    .padding(.horizontal)
                    
                    // Action Buttons
                    HStack(spacing: 12) {
                        // Decline Button
                        Button("Decline") {
                            isPresented = false
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                        
                        // Accept Button
                        Button("Accept") {
                            onAccept(shouldRememberChoice)
                            isPresented = false
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(hasScrolledToBottom ? Color.blue : Color(.systemGray4))
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
    }
}

// MARK: - Preview
#Preview {
    TermsOfServiceView(isPresented: .constant(true)) { shouldRemember in
        print("Terms accepted, remember choice: \(shouldRemember)")
    }
} 