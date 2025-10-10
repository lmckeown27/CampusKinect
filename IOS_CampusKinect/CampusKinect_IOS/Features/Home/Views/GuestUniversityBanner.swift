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
                .foregroundColor(Color(hex: "708d81") ?? Color.green)
            
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
                .foregroundColor(Color(hex: "708d81") ?? Color.green)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill((Color(hex: "708d81") ?? Color.green).opacity(0.1))
                )
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill((Color(hex: "708d81") ?? Color.green).opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke((Color(hex: "708d81") ?? Color.green).opacity(0.3), lineWidth: 1)
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
    @State private var universities: [UniversitySearchResult] = []
    @State private var searchText = ""
    @State private var isLoading = true
    
    var filteredUniversities: [UniversitySearchResult] {
        if searchText.isEmpty {
            return universities
        } else {
            return universities.filter { university in
                university.name.localizedCaseInsensitiveContains(searchText) ||
                (university.domain?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "1a1a1a").edgesIgnoringSafeArea(.all)
                    .onTapGesture {
                        // Dismiss keyboard when tapping background
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                
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
                            .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "708d81") ?? Color.green))
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
                                        // Dismiss keyboard before selecting
                                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
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
            let response = try await APIService.shared.fetchAllUniversities()
            await MainActor.run {
                self.universities = response.data.universities
                self.isLoading = false
            }
        } catch {
            print("Failed to load universities: \(error)")
            await MainActor.run {
                self.isLoading = false
            }
        }
    }
    
    private func selectUniversity(_ university: UniversitySearchResult) {
        print("🔄 UniversitySwitcherView: Selecting university ID \(university.id) (\(university.name))")
        authManager.enterGuestMode(universityId: university.id, universityName: university.name)
        
        // Dismiss first, then post notification after a delay
        // This ensures the HomeView is active and the @Published property has propagated
        dismiss()
        
        // Post notification after modal dismissal completes and @Published propagates
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            print("🔄 UniversitySwitcherView: Posting guestUniversityChanged notification for ID \(university.id)")
            print("🔄 UniversitySwitcherView: Verifying AuthManager.shared.guestUniversityId = \(AuthenticationManager.shared.guestUniversityId?.description ?? "nil")")
            NotificationCenter.default.post(name: .guestUniversityChanged, object: university.id)
            print("🔄 UniversitySwitcherView: Notification posted")
        }
    }
}

// MARK: - University Switcher Row
struct UniversitySwitcherRow: View {
    let university: UniversitySearchResult
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // University Info
            VStack(alignment: .leading, spacing: 4) {
                Text(university.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                if let domain = university.domain {
                    Text(domain)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            if isSelected {
                Text("Current")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color(hex: "708d81") ?? Color.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        RoundedRectangle(cornerRadius: 6)
                            .fill((Color(hex: "708d81") ?? Color.green).opacity(0.2))
                    )
            }
        }
        .padding()
        .background(isSelected ? (Color(hex: "708d81") ?? Color.green).opacity(0.1) : (Color(hex: "2d2d2d") ?? Color.gray))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? (Color(hex: "708d81") ?? Color.green) : Color.clear, lineWidth: 2)
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
