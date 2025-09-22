import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var isMessagesPreloaded = false
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    enum Tab: String, CaseIterable {
        case home = "Home"
        case createPost = "Create"
        case messages = "Messages"
        case profile = "Profile"
    }
    
    // Computed property to determine if we're on iPad
    private var isIPad: Bool {
        horizontalSizeClass == .regular && verticalSizeClass == .regular
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Hidden MessagesView for seamless preloading (invisible to user)
                if !isMessagesPreloaded {
                    MessagesView()
                        .opacity(0)
                        .allowsHitTesting(false)
                        .accessibility(hidden: true)
                        .onAppear {
                            print("📱 MainTabView: Hidden MessagesView initialized for preloading")
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                isMessagesPreloaded = true
                                print("📱 MainTabView: MessagesView preloading completed seamlessly")
                            }
                        }
                }
                
                // Main TabView (visible to user)
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
                .frame(maxWidth: isIPad ? min(geometry.size.width * 0.8, 800) : .infinity)
                .frame(maxHeight: .infinity)
                .clipped()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground))
        }
        .accentColor(Color("AccentColor"))
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { _ in
            // Switch to Messages tab when navigateToChat notification is received
            print("📱 MainTabView: Received navigateToChat notification - switching to Messages tab")
            withAnimation(.easeInOut(duration: 0.3)) {
                selectedTab = .messages
            }
        }
    }
} 