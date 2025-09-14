//
//  NewMessageView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var users: [MockUser] = []
    
    var body: some View {
        NavigationView {
            VStack {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    
                    TextField("Search users...", text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()
                
                // Users List
                if filteredUsers.isEmpty {
                    EmptyStateView(
                        title: "No Users Found",
                        message: "Try searching for someone from your campus",
                        systemImage: "person.2"
                    )
                } else {
                    List {
                        ForEach(filteredUsers) { user in
                            UserRow(user: user) {
                                // Start conversation
                                print("Starting conversation with \(user.name)")
                                dismiss()
                            }
                            .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(PlainListStyle())
                }
                
                Spacer()
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                loadMockUsers()
            }
        }
    }
    
    private var filteredUsers: [MockUser] {
        if searchText.isEmpty {
            return users
        } else {
            return users.filter { user in
                user.name.localizedCaseInsensitiveContains(searchText) ||
                user.major.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    private func loadMockUsers() {
        users = [
            MockUser(id: 1, name: "Alex Thompson", major: "Computer Science", year: "Junior"),
            MockUser(id: 2, name: "Jessica Lee", major: "Business", year: "Senior"),
            MockUser(id: 3, name: "David Rodriguez", major: "Engineering", year: "Sophomore"),
            MockUser(id: 4, name: "Rachel Kim", major: "Psychology", year: "Junior"),
            MockUser(id: 5, name: "James Wilson", major: "Biology", year: "Freshman")
        ]
    }
}

// MARK: - User Row
struct UserRow: View {
    let user: MockUser
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Profile Picture
                Circle()
                    .fill(Color("PrimaryColor"))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(user.initials)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(user.name)
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text("\(user.year) • \(user.major)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Mock User Model
struct MockUser: Identifiable {
    let id: Int
    let name: String
    let major: String
    let year: String
    
    var initials: String {
        let components = name.components(separatedBy: " ")
        let firstInitial = components.first?.first?.uppercased() ?? ""
        let lastInitial = components.count > 1 ? components.last?.first?.uppercased() ?? "" : ""
        return "\(firstInitial)\(lastInitial)"
    }
}

#Preview {
    NewMessageView()
}

