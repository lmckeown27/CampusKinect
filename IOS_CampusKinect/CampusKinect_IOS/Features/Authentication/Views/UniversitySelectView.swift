//
//  UniversitySelectView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 10/7/25.
//

import SwiftUI

struct UniversitySelectView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var universities: [University] = []
    @State private var searchText = ""
    @State private var isLoading = true
    @State private var selectedUniversity: University?
    
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
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "graduationcap.fill")
                            .font(.system(size: 60))
                            .foregroundColor(Color(hex: "708d81"))
                        
                        Text("Welcome to CampusKinect")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Select your university to browse your campus community")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding(.top, 40)
                    .padding(.bottom, 24)
                    
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
                    .padding(.bottom, 16)
                    
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
                                    UniversityRow(university: university)
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
            .navigationBarHidden(true)
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
    }
}

// MARK: - University Row
struct UniversityRow: View {
    let university: University
    
    var body: some View {
        HStack(spacing: 16) {
            // University Icon
            ZStack {
                Circle()
                    .fill(Color(hex: "708d81").opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: "building.columns.fill")
                    .font(.system(size: 24))
                    .foregroundColor(Color(hex: "708d81"))
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
            
            // Arrow
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color(hex: "2d2d2d"))
        .cornerRadius(12)
    }
}

// MARK: - Preview
#Preview {
    UniversitySelectView()
        .environmentObject(AuthenticationManager())
}
