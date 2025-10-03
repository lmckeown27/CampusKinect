//
//  AdminUniversitySelector.swift
//  CampusKinect_IOS
//
//  Created for Admin Multi-University Posting
//

import SwiftUI

struct AdminUniversitySelector: View {
    @Binding var selectedUniversities: Set<Int>
    @Binding var isSelectingAll: Bool
    @Environment(\.dismiss) private var dismiss
    
    @State private var universities: [UniversitySearchResult] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @State private var errorMessage: String?
    
    var filteredUniversities: [UniversitySearchResult] {
        if searchText.isEmpty {
            return universities.sorted { $0.name < $1.name }
        } else {
            return universities
                .filter { $0.name.localizedCaseInsensitiveContains(searchText) }
                .sorted { $0.name < $1.name }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Search universities...", text: $searchText)
                        .textFieldStyle(.plain)
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()
                
                // Select All Option
                VStack(spacing: 0) {
                    Button(action: toggleSelectAll) {
                        HStack {
                            Image(systemName: isSelectingAll ? "checkmark.square.fill" : "square")
                                .font(.title3)
                                .foregroundColor(isSelectingAll ? .blue : .secondary)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Post to All Universities")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                Text("Send to all \(universities.count) universities")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                        .padding()
                        .background(Color(.systemGroupedBackground))
                    }
                    
                    Divider()
                }
                
                if isLoading {
                    Spacer()
                    ProgressView("Loading universities...")
                    Spacer()
                } else if let error = errorMessage {
                    Spacer()
                    VStack(spacing: 12) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.red)
                        Text(error)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    Spacer()
                } else {
                    // Universities List
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(filteredUniversities) { university in
                                UniversitySelectorRow(
                                    university: university,
                                    isSelected: isSelectingAll || selectedUniversities.contains(university.id),
                                    isDisabled: isSelectingAll,
                                    onToggle: {
                                        toggleUniversity(university.id)
                                    }
                                )
                                
                                if university.id != filteredUniversities.last?.id {
                                    Divider()
                                        .padding(.leading, 60)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Select Universities")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .fontWeight(.semibold)
                    .disabled(!isSelectingAll && selectedUniversities.isEmpty)
                }
            }
        }
        .task {
            await loadUniversities()
        }
    }
    
    private func loadUniversities() async {
        isLoading = true
        do {
            let response = try await APIService.shared.fetchAllUniversities()
            universities = response.data.universities
            print("🎓 Loaded \(universities.count) universities for admin selection")
        } catch {
            print("❌ Failed to load universities: \(error)")
            errorMessage = "Failed to load universities. Please try again."
        }
        isLoading = false
    }
    
    private func toggleSelectAll() {
        isSelectingAll.toggle()
        if isSelectingAll {
            selectedUniversities.removeAll()
        }
    }
    
    private func toggleUniversity(_ id: Int) {
        if isSelectingAll { return } // Can't toggle individual when "All" is selected
        
        if selectedUniversities.contains(id) {
            selectedUniversities.remove(id)
        } else {
            selectedUniversities.insert(id)
        }
    }
}

// MARK: - University Selector Row
struct UniversitySelectorRow: View {
    let university: UniversitySearchResult
    let isSelected: Bool
    let isDisabled: Bool
    let onToggle: () -> Void
    
    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 12) {
                // Checkbox
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(isSelected ? .blue : .secondary)
                
                // University Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(university.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    
                    HStack(spacing: 8) {
                        Text("ID: \(university.id)")
                            .font(.caption2)
                            .foregroundColor(.blue)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(4)
                        
                        Text("\(university.userCount) users")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .opacity(isDisabled ? 0.5 : 1.0)
        .disabled(isDisabled)
    }
}

#Preview {
    AdminUniversitySelector(
        selectedUniversities: .constant([1, 2, 3]),
        isSelectingAll: .constant(false)
    )
}

