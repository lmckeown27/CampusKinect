import SwiftUI
import Combine

struct ReportDetailView: View {
    let report: ContentReport
    let viewModel: AdminDashboardViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showingActionSheet = false
    @State private var moderatorNotes = ""
    @State private var selectedAction: ModerationAction?
    @State private var selectedBanDuration: BanDuration = .indefinite
    @State private var showingBanDurationPicker = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Report Header
                    reportHeader
                    
                    Divider()
                    
                    // Reported Content
                    reportedContent
                    
                    Divider()
                    
                    // Report Details
                    reportDetails
                    
                    Divider()
                    
                    // User Information
                    userInformation
                    
                    Divider()
                    
                    // Moderator Notes Section
                    moderatorNotesSection
                    
                    // Action Buttons
                    actionButtons
                }
                .padding()
            }
            .background(Color(.systemBackground))
            .onTapGesture {
                hideKeyboard()
            }
            .navigationTitle("Report Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .confirmationDialog(
                "Moderate Report",
                isPresented: $showingActionSheet,
                titleVisibility: .visible
            ) {
                Button("Dismiss Report") {
                    selectedAction = .dismiss()
                    handleModerationAction()
                }
                
                // Only show "Delete Post" options if reporter is not the post owner
                if !(report.isReporterPostOwner ?? false) {
                    Button("Delete Post Only", role: .destructive) {
                        selectedAction = .deletePostOnly()
                        handleModerationAction()
                    }
                }
                
                Button("Ban User Only", role: .destructive) {
                    showingBanDurationPicker = true
                }
                
                // Only show "Delete Post & Ban User" if reporter is not the post owner
                if !(report.isReporterPostOwner ?? false) {
                    Button("Delete Post & Ban User", role: .destructive) {
                        selectedAction = .deleteAndBan()
                        handleModerationAction()
                    }
                }
                
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Choose an action for this report. This action cannot be undone.")
            }
            .sheet(isPresented: $showingBanDurationPicker) {
                BanDurationPickerView(
                    selectedDuration: $selectedBanDuration,
                    onConfirm: {
                        selectedAction = .banUserOnly(duration: selectedBanDuration.apiValue)
                        showingBanDurationPicker = false
                        handleModerationAction()
                    }
                )
            }
        }
    }
    
    // MARK: - Report Header
    private var reportHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: report.contentType.iconName)
                    .font(.title)
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(report.contentTitle)
                        .font(.title2)
                        .fontWeight(.bold)
                        .lineLimit(3)
                    
                    Text(report.contentType.displayName)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                TimeRemainingBadge(report: report)
            }
            
            // Urgency Alert
            if report.isOverdue || report.isUrgent {
                HStack {
                    Image(systemName: report.isOverdue ? "exclamationmark.triangle.fill" : "clock.fill")
                        .foregroundColor(report.isOverdue ? .red : .orange)
                    
                    Text(report.isOverdue ? "This report is overdue and requires immediate attention!" : "This report is urgent and needs attention soon.")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(report.isOverdue ? .red : .orange)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill((report.isOverdue ? Color.red : Color.orange).opacity(0.1))
                )
            }
        }
    }
    
    // MARK: - Reported Content
    private var reportedContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Reported Content")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: report.contentType.iconName)
                        .foregroundColor(.blue)
                    Text(report.contentType.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                // Text content
                if !report.fullContentDescription.isEmpty {
                    Text(report.fullContentDescription)
                        .font(.body)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(.systemGray6))
                        )
                }
                
                // Post image if available
                if report.contentType == .post, let imageUrl = report.fullPostImageUrl {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Attached Image")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        AsyncImage(url: URL(string: imageUrl)) { phase in
                            switch phase {
                            case .empty:
                                ProgressView()
                                    .frame(maxWidth: .infinity, minHeight: 200)
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .cornerRadius(8)
                            case .failure:
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundColor(.secondary)
                                    .frame(maxWidth: .infinity, minHeight: 200)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                            @unknown default:
                                EmptyView()
                            }
                        }
                    }
                }
                
                // Conversation history if available
                if report.contentType == .message, let history = report.conversationHistory, !history.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Conversation History")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        VStack(spacing: 8) {
                            ForEach(history) { message in
                                HStack(alignment: .top, spacing: 8) {
                                    // User indicator
                                    VStack {
                                        Circle()
                                            .fill(Color.blue.opacity(0.2))
                                            .frame(width: 32, height: 32)
                                            .overlay(
                                                Text((message.displayName ?? message.username ?? "U").prefix(1).uppercased())
                                                    .font(.caption)
                                                    .fontWeight(.semibold)
                                            )
                                        Spacer()
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        // Name and time
                                        HStack {
                                            Text(message.displayName ?? message.username ?? "Unknown")
                                                .font(.caption)
                                                .fontWeight(.semibold)
                                            
                                            Text(formatMessageTime(message.createdAt))
                                                .font(.caption2)
                                                .foregroundColor(.secondary)
                                        }
                                        
                                        // Message content
                                        if let content = message.content, !content.isEmpty {
                                            Text(content)
                                                .font(.body)
                                        }
                                        
                                        // Message image if available
                                        if let mediaUrl = message.fullMediaUrl {
                                            AsyncImage(url: URL(string: mediaUrl)) { phase in
                                                switch phase {
                                                case .success(let image):
                                                    image
                                                        .resizable()
                                                        .aspectRatio(contentMode: .fit)
                                                        .frame(maxWidth: 200)
                                                        .cornerRadius(8)
                                                case .failure, .empty:
                                                    Image(systemName: "photo")
                                                        .foregroundColor(.secondary)
                                                @unknown default:
                                                    EmptyView()
                                                }
                                            }
                                        }
                                    }
                                    
                                    Spacer()
                                }
                                .padding(8)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                        }
                    }
                    .padding(.top, 8)
                }
            }
        }
    }
    
    // Helper to format message timestamp
    private func formatMessageTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .short
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
    
    // MARK: - Report Details
    private var reportDetails: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Report Information")
                .font(.headline)
            
            
            // Display all selected reasons
            VStack(alignment: .leading, spacing: 8) {
                Text("Reason(s)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                FlowLayout(alignment: .leading, spacing: 8) {
                    ForEach(report.reasons, id: \.self) { reason in
                        ReasonBadge(reason: reason)
                    }
                }
            }
            
            DetailRow(title: "Status", value: report.status.displayName) {
                StatusBadge(status: report.status)
            }
            
            DetailRow(title: "Reported At", value: formatFullDate(report.createdAt))
            
            // Only show user's typed notes in Additional Details
            if let details = report.details, !details.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Additional Details")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text(details)
                        .font(.body)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color(.systemGray6))
                        )
                }
            }
        }
    }
    
    // MARK: - User Information
    private var userInformation: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("User Information")
                .font(.headline)
            
            // Reporter Info
            VStack(alignment: .leading, spacing: 8) {
                Text("Reporter")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                HStack {
                    Image(systemName: "person.circle")
                        .foregroundColor(.blue)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(report.reporterDisplayName ?? "Unknown User")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        if let username = report.reporterUsername {
                            Text("@\(username)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color(.systemGray6))
                )
            }
            
            // Reported User Info
            VStack(alignment: .leading, spacing: 8) {
                Text("Reported User")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                HStack {
                    Image(systemName: "person.circle.fill")
                        .foregroundColor(.red)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(report.reportedDisplayName ?? "Unknown User")
                            .font(.body)
                            .fontWeight(.medium)
                        
                        if let username = report.reportedUsername {
                            Text("@\(username)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.red.opacity(0.1))
                )
            }
        }
    }
    
    // MARK: - Moderator Notes Section
    private var moderatorNotesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Moderator Notes")
                .font(.headline)
            
            Text("Add notes about your moderation decision (optional)")
                .font(.caption)
                .foregroundColor(.secondary)
            
            TextField("Enter your notes here...", text: $moderatorNotes)
                .textFieldStyle(.roundedBorder)
                .lineLimit(5)
        }
    }
    
    // MARK: - Action Buttons
    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Top row: Delete Post Only | Ban User Only
            HStack(spacing: 12) {
                Button(action: {
                    selectedAction = .deletePostOnly()
                    handleModerationAction()
                }) {
                    HStack {
                        Image(systemName: "doc.text.fill")
                        Text("Delete Post Only")
                            .fontWeight(.semibold)
                            .font(.subheadline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(viewModel.isLoadingAction)
                
                Button(action: {
                    showingBanDurationPicker = true
                }) {
                    HStack {
                        Image(systemName: "person.fill.xmark")
                        Text("Ban User Only")
                            .fontWeight(.semibold)
                            .font(.subheadline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.yellow.opacity(0.8))
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(viewModel.isLoadingAction)
            }
            
            // Delete Post & Ban User
            Button(action: {
                selectedAction = .deleteAndBan()
                handleModerationAction()
            }) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("Delete Post & Ban User")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(viewModel.isLoadingAction)
            
            // Dismiss Report
            Button(action: {
                selectedAction = .dismiss()
                handleModerationAction()
            }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                    Text("Dismiss Report")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .disabled(viewModel.isLoadingAction)
            
            if viewModel.isLoadingAction {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Processing...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
            }
        }
    }
    
    // MARK: - Helper Methods
    private func handleModerationAction() {
        guard let action = selectedAction else { return }
        
        // Call the moderation method
        viewModel.handleReportModeration(report, action: action)
        
        // Close the detail view
        dismiss()
    }
    
    private func formatFullDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .full
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

// MARK: - Supporting Views
struct DetailRow<Content: View>: View {
    let title: String
    let value: String
    let content: (() -> Content)?
    
    init(title: String, value: String, @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.value = value
        self.content = content
    }
    
    init(title: String, value: String) where Content == EmptyView {
        self.title = title
        self.value = value
        self.content = nil
    }
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            
            Spacer()
            
            if let content = content {
                content()
            } else {
                Text(value)
                    .font(.body)
            }
        }
    }
}

struct StatusBadge: View {
    let status: ContentReport.ReportStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(statusColor.opacity(0.2))
            )
            .foregroundColor(statusColor)
    }
    
    private var statusColor: Color {
        switch status {
        case .pending: return .orange
        case .reviewed: return .blue
        case .resolved: return .green
        case .dismissed: return .gray
        }
    }
}

#Preview {
    ReportDetailView(
        report: ContentReport(
            id: 12345678,
            reporterId: 101,
            reportedUserId: 201,
            contentId: "301",
            contentType: .post,
            reason: "harassment, spam",
            details: "User typed notes go here",
            status: .pending,
            moderatorId: nil,
            moderatorNotes: nil,
            createdAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(-2 * 3600)),
            resolvedAt: nil,
            reporterUsername: "reporter_user",
            reporterDisplayName: "Reporter User",
            reportedUsername: "bad_user",
            reportedDisplayName: "Bad User",
            postTitle: "Urgent Housing Offer",
            postDescription: "Selling banned substances on campus. Meet me behind the library at midnight. Cash only. No questions asked.",
            postImageUrl: nil,
            messageContent: nil,
            conversationHistory: nil,
            isReporterPostOwner: nil
        ),
        viewModel: AdminDashboardViewModel()
    )
} 
 

// MARK: - Ban Duration Picker View
struct BanDurationPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedDuration: BanDuration
    let onConfirm: () -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Select Ban Duration")) {
                    ForEach(BanDuration.allCases) { duration in
                        Button(action: {
                            selectedDuration = duration
                        }) {
                            HStack {
                                Text(duration.displayName)
                                    .foregroundColor(.primary)
                                Spacer()
                                if selectedDuration == duration {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                }
                
                Section {
                    Text("Selected: \(selectedDuration.displayName)")
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Ban Duration")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Confirm") {
                        onConfirm()
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
        }
    }
}

// MARK: - Ban Duration Enum
enum BanDuration: String, CaseIterable, Identifiable {
    case oneDay = "1d"
    case oneWeek = "7d"
    case oneMonth = "30d"
    case oneYear = "365d"
    case indefinite = "indefinite"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .oneDay: return "1 Day"
        case .oneWeek: return "1 Week"
        case .oneMonth: return "1 Month"
        case .oneYear: return "1 Year"
        case .indefinite: return "Indefinite"
        }
    }
    
    var apiValue: String? {
        return self == .indefinite ? nil : rawValue
    }
}

// MARK: - FlowLayout Helper
struct FlowLayout: Layout {
    var alignment: Alignment = .center
    var spacing: CGFloat = 10
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            alignment: alignment,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            alignment: alignment,
            spacing: spacing
        )
        for row in result.rows {
            let rowXOffset = bounds.minX + (bounds.width - row.frame.width) / 2
            for index in row.range {
                let xPos = rowXOffset + result.frames[index].minX
                let yPos = bounds.minY + result.frames[index].minY
                let position = CGPoint(x: xPos, y: yPos)
                subviews[index].place(at: position, anchor: .topLeading, proposal: .unspecified)
            }
        }
    }
    
    struct FlowResult {
        var size = CGSize.zero
        var rows = [Row]()
        var frames = [CGRect]()
        
        struct Row {
            var range: Range<Int>
            var frame: CGRect
        }
        
        init(in maxWidth: CGFloat, subviews: Subviews, alignment: Alignment, spacing: CGFloat) {
            var itemsInRow = 0
            var currentX = 0.0
            var currentY = 0.0
            var rowHeight = 0.0
            var rowStartIndex = 0
            
            for (index, subview) in subviews.enumerated() {
                let size = subview.sizeThatFits(.unspecified)
                
                if currentX + size.width > maxWidth && itemsInRow > 0 {
                    // Start new row
                    rows.append(Row(range: rowStartIndex..<index, frame: CGRect(x: 0, y: currentY, width: currentX - spacing, height: rowHeight)))
                    rowStartIndex = index
                    currentX = 0
                    currentY += rowHeight + spacing
                    rowHeight = 0
                    itemsInRow = 0
                }
                
                frames.append(CGRect(x: currentX, y: currentY, width: size.width, height: size.height))
                currentX += size.width + spacing
                rowHeight = max(rowHeight, size.height)
                itemsInRow += 1
            }
            
            // Last row
            if itemsInRow > 0 {
                rows.append(Row(range: rowStartIndex..<subviews.count, frame: CGRect(x: 0, y: currentY, width: currentX - spacing, height: rowHeight)))
            }
            
            size = CGSize(width: maxWidth, height: currentY + rowHeight)
        }
    }
}
