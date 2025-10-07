//
//  GuestUniversityBanner.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 10/7/25.
//

import SwiftUI

struct GuestUniversityBanner: View {
    let universityName: String
    let universityId: Int
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingUniversitySelector = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Eye icon to indicate guest view
            Image(systemName: "eye.fill")
                .font(.system(size: 16))
                .foregroundColor(.blue)
            
            // University info
            VStack(alignment: .leading, spacing: 2) {
                Text("Browsing as Guest")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                
                Text(universityName)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            // Switch University Button
            Button(action: {
                showingUniversitySelector = true
            }) {
                HStack(spacing: 6) {
                    Text("Switch")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Image(systemName: "arrow.triangle.2.circlepath")
                        .font(.system(size: 14))
                }
                .foregroundColor(.blue)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.blue.opacity(0.1))
                )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.blue.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                )
        )
        .sheet(isPresented: $showingUniversitySelector) {
            UniversitySwitcherView()
                .environmentObject(authManager)
        }
    }
}

// MARK: - University Switcher View
struct UniversitySwitcherView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var universities: [University] = []
    @State private var searchText = ""
    @State private var isLoading = true
    
    var filteredUniversities: [University] {
        if searchText.isEmpty {
            return universities
        } else {
            return universities.filter { university in
                university.name.localizedCaseInsensitiveContains(searchText) ||
                university.domain.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "1a1a1a").edgesIgnoringSafeArea(.all)
                
                VStack(spacing: 0) {
                    // Current Selection Header
                    if let currentName = authManager.guestUniversityName {
                        VStack(spacing: 8) {
                            Text("Currently Viewing")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(currentName)
                                .font(.headline)
                                .foregroundColor(Color(hex: "708d81"))
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(hex: "2d2d2d"))
                    }
                    
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search universities...", text: $searchText)
                            .foregroundColor(.white)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                        
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding()
                    .background(Color(hex: "2d2d2d"))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    .padding(.vertical, 16)
                    
                    // Universities List
                    if isLoading {
                        Spacer()
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "708d81")))
                            .scaleEffect(1.5)
                        Spacer()
                    } else if filteredUniversities.isEmpty {
                        Spacer()
                        VStack(spacing: 12) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 50))
                                .foregroundColor(.gray)
                            Text("No universities found")
                                .font(.headline)
                                .foregroundColor(.gray)
                            Text("Try a different search term")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredUniversities) { university in
                                    UniversitySwitcherRow(
                                        university: university,
                                        isSelected: university.id == authManager.guestUniversityId
                                    )
                                    .onTapGesture {
                                        selectUniversity(university)
                                    }
                                }
                            }
                            .padding(.horizontal)
                            .padding(.bottom, 20)
                        }
                    }
                }
            }
            .navigationTitle("Switch University")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Color(hex: "708d81"))
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
            let fetchedUniversities = try await APIService.shared.fetchUniversities()
            await MainActor.run {
                self.universities = fetchedUniversities
                self.isLoading = false
            }
        } catch {
            print("Failed to load universities: \(error)")
            await MainActor.run {
                self.isLoading = false
            }
        }
    }
    
    private func selectUniversity(_ university: University) {
        authManager.enterGuestMode(universityId: university.id, universityName: university.name)
        dismiss()
    }
}

// MARK: - University Switcher Row
struct UniversitySwitcherRow: View {
    let university: University
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            // University Icon
            ZStack {
                Circle()
                    .fill(isSelected ? Color(hex: "708d81") : Color(hex: "708d81").opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "building.columns.fill")
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? .white : Color(hex: "708d81"))
            }
            
            // University Info
            VStack(alignment: .leading, spacing: 4) {
                Text(university.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Text(university.domain)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            if isSelected {
                Text("Current")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color(hex: "708d81"))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color(hex: "708d81").opacity(0.2))
                    )
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(isSelected ? Color(hex: "708d81").opacity(0.1) : Color(hex: "2d2d2d"))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color(hex: "708d81") : Color.clear, lineWidth: 2)
        )
    }
}

// MARK: - Preview
#Preview {
    GuestUniversityBanner(universityName: "Cal Poly", universityId: 1)
        .environmentObject(AuthenticationManager())
        .padding()
        .background(Color(hex: "1a1a1a"))
}
