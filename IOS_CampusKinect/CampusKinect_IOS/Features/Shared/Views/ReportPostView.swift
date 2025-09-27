import SwiftUI

struct ReportPostView: View {
    let post: Post
    @Binding var isPresented: Bool
    @State private var selectedReason: ReportReason?
    @State private var customReason: String = ""
    @State private var isSubmitting = false
    @State private var showingSuccessAlert = false
    @State private var showingErrorAlert = false
    @State private var errorMessage = ""
    @EnvironmentObject var authManager: AuthenticationManager
    
    private let apiService = APIService.shared
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Post Preview
                    postPreviewSection
                    
                    // Report Reasons
                    reportReasonsSection
                    
                    // Custom Reason (if "Other" selected)
                    if selectedReason == .other {
                        customReasonSection
                    }
                    
                    // Submit Button
                    submitButtonSection
                }
                .padding()
            }
            .navigationTitle("Report Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
            }
        }
        .alert("Report Submitted", isPresented: $showingSuccessAlert) {
            Button("OK") {
                isPresented = false
            }
        } message: {
            Text("Thank you for helping keep our community safe. We'll review this report within 24 hours.")
        }
        .alert("Error", isPresented: $showingErrorAlert) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Post Preview Section
    private var postPreviewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Reporting this post:")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("@\(post.poster.username ?? "unknown")")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(post.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(post.content)
                    .font(.body)
                    .lineLimit(3)
                
                if !post.tags.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(post.tags, id: \.self) { tag in
                                Text("#\(tag)")
                                    .font(.caption)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(8)
                            }
                        }
                        .padding(.horizontal, 1)
                    }
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
    
    // MARK: - Report Reasons Section
    private var reportReasonsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Why are you reporting this post?")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text("Your report helps us maintain a safe and respectful community.")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            LazyVStack(spacing: 12) {
                ForEach(ReportReason.allCases, id: \.self) { reason in
                    PostReportReasonRow(
                        reason: reason,
                        isSelected: selectedReason == reason,
                        onTap: {
                            selectedReason = reason
                            if reason != .other {
                                customReason = ""
                            }
                        }
                    )
                }
            }
        }
    }
    
    // MARK: - Custom Reason Section
    private var customReasonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Please specify your concern:")
                .font(.subheadline)
                .fontWeight(.medium)
            
            TextEditor(text: $customReason)
                .frame(minHeight: 100)
                .padding(8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )
        }
    }
    
    // MARK: - Submit Button Section
    private var submitButtonSection: some View {
        VStack(spacing: 16) {
            Button(action: submitReport) {
                HStack {
                    if isSubmitting {
                        ProgressView()
                            .scaleEffect(0.8)
                    }
                    
                    Text(isSubmitting ? "Submitting..." : "Submit Report")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(canSubmit ? Color.red : Color(.systemGray4))
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!canSubmit || isSubmitting)
            
            Text("Reports are reviewed within 24 hours. False reports may result in account restrictions.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }
    
    // MARK: - Computed Properties
    private var canSubmit: Bool {
        guard let reason = selectedReason else { return false }
        if reason == .other {
            return !customReason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
        return true
    }
    
    // MARK: - Methods
    private func submitReport() {
        guard let reason = selectedReason else { return }
        
        isSubmitting = true
        
        let reportRequest = CreateReportRequest(
            postId: String(post.id),
            reason: reason,
            customReason: reason == .other ? customReason.trimmingCharacters(in: .whitespacesAndNewlines) : nil
        )
        
        Task {
            do {
                try await apiService.submitPostReport(reportRequest)
                
                await MainActor.run {
                    isSubmitting = false
                    showingSuccessAlert = true
                }
            } catch {
                await MainActor.run {
                    isSubmitting = false
                    errorMessage = error.localizedDescription
                    showingErrorAlert = true
                }
            }
        }
    }
}

// MARK: - Report Reason Row (Custom for Post Reports)
struct PostReportReasonRow: View {
    let reason: ReportReason
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(isSelected ? .red : .secondary)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reason.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(reason.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
            }
            .padding()
            .background(isSelected ? Color.red.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.red : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Preview
#Preview {
    // Create a sample post for preview
    let sampleUser = PostUser(
        id: 1,
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        displayName: "Test User",
        profilePicture: nil
    )
    
    let samplePost = Post(
        id: 1,
        userId: 1,
        title: "Sample Post",
        description: "This is a sample post content for preview",
        postType: "general",
        durationType: "permanent",
        location: nil,
        repostFrequency: nil,
        isRecurring: false,
        originalPostId: nil,
        expiresAt: nil,
        eventStart: nil,
        eventEnd: nil,
        isFulfilled: false,
        viewCount: 0,
        createdAt: Date(),
        updatedAt: Date(),
        poster: sampleUser,
        university: PostUniversity(id: 1, name: "Test University", city: "Test City", state: "CA"),
        images: [],
        imageCount: "0",
        tags: ["sample", "preview"]
    )
    
    ReportPostView(
        post: samplePost,
        isPresented: .constant(true)
    )
    .environmentObject(AuthenticationManager())
} 