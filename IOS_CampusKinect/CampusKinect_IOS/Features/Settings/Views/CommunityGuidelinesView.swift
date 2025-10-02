import SwiftUI

struct CommunityGuidelinesView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(TermsOfServiceContent.content)
                        .font(.system(size: 14, weight: .regular))
                        .lineSpacing(4)
                }
                .padding()
            }
            .navigationTitle("Community Guidelines")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    CommunityGuidelinesView()
} 