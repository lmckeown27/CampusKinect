import SwiftUI

// MARK: - Preference Keys for Scroll Detection
struct ViewOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct ContentHeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct TermsOfServiceView: View {
    @Binding var isPresented: Bool
    @State private var hasScrolledToBottom = false
    @State private var shouldRememberChoice = false
    @State private var scrollOffset: CGFloat = 0
    @State private var contentHeight: CGFloat = 0
    @State private var scrollViewHeight: CGFloat = 0
    
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
                
                // Scrollable Terms Content with reliable scroll detection
                GeometryReader { geometry in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            Text(TermsOfServiceContent.content)
                                .font(.system(size: 14, weight: .regular))
                                .lineSpacing(4)
                                .padding()
                            
                            // Bottom detection marker
                            Color.clear
                                .frame(height: 1)
                                .background(
                                    GeometryReader { geo in
                                        Color.clear
                                            .preference(key: ViewOffsetKey.self, value: geo.frame(in: .named("scroll")).minY)
                                    }
                                )
                            
                            // Extra space to ensure scrolling is always required
                            Spacer()
                                .frame(height: 200)
                        }
                        .background(
                            GeometryReader { geo in
                                Color.clear
                                    .preference(key: ContentHeightKey.self, value: geo.size.height)
                            }
                        )
                    }
                    .coordinateSpace(name: "scroll")
                    .onPreferenceChange(ViewOffsetKey.self) { offset in
                        // Check if user has scrolled close to the bottom
                        let threshold: CGFloat = 50 // Allow some margin
                        if offset <= threshold && !hasScrolledToBottom {
                            hasScrolledToBottom = true
                            print("📋 User has scrolled to bottom - Accept button enabled")
                        }
                    }
                    .onPreferenceChange(ContentHeightKey.self) { height in
                        contentHeight = height
                    }
                    .onAppear {
                        hasScrolledToBottom = false
                        scrollViewHeight = geometry.size.height
                        print("📋 Terms view loaded - Accept disabled until scroll to bottom")
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
                            Text("You must scroll through and read all terms to continue")
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
                            onAccept(shouldRememberChoice)
                            isPresented = false
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