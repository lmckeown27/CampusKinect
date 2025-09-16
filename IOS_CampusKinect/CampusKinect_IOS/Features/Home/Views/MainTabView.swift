import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var shouldNavigateToChat = false
    @State private var targetUserId: Int = 0
    @State private var targetUserName: String = ""
    
    enum Tab: String {
        case home = "Home"
        case createPost = "Create Post"
        case messages = "Messages"
        case profile = "Profile"
    }
    
    var body: some View {
        NavigationStack {
            TabView(selection: $selectedTab) {
                HomeView()
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }
                    .tag(Tab.home)
                
                CreatePostView()
                    .tabItem {
                        Label("Create", systemImage: "plus.circle.fill")
                    }
                    .tag(Tab.createPost)
                
                MessagesView()
                    .tabItem {
                        Label("Messages", systemImage: "message.fill")
                    }
                    .tag(Tab.messages)
                
                ProfileView()
                    .tabItem {
                        Label("Profile", systemImage: "person.fill")
                    }
                    .tag(Tab.profile)
            }
            .accentColor(Color("AccentColor"))
            .navigationDestination(isPresented: $shouldNavigateToChat) {
                if targetUserId > 0 {
                    ChatView(
                        userId: targetUserId,
                        userName: targetUserName
                    )
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { notification in
            if let userId = notification.userInfo?["userId"] as? Int {
                targetUserId = userId
                if let userName = notification.userInfo?["userName"] as? String {
                    targetUserName = userName
                }
                selectedTab = .messages // Switch to messages tab
                shouldNavigateToChat = true
            }
        }
    }
} 