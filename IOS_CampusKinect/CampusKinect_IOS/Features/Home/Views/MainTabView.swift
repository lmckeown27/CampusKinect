import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    
    enum Tab: String {
        case home = "Home"
        case createPost = "Create Post"
        case messages = "Messages"
        case profile = "Profile"
    }
    
    var body: some View {
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
        .onAppear {
            // Preload MessagesView to ensure it's ready for navigation
            print("📱 MainTabView: Preloading MessagesView for first-boot navigation readiness")
            let currentTab = selectedTab
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                selectedTab = .messages
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    selectedTab = currentTab
                    print("📱 MainTabView: MessagesView preloaded, returned to \(currentTab)")
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { _ in
            // Switch to Messages tab when navigateToChat notification is received
            print("📱 MainTabView: Received navigateToChat notification - switching to Messages tab")
            withAnimation(.easeInOut(duration: 0.3)) {
                selectedTab = .messages
            }
        }
    }
} 