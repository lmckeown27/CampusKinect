import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var isMessagesPreloaded = false
    @State private var showingDirectChat = false
    @State private var directChatUser: (id: Int, name: String)?
    
    enum Tab: String, CaseIterable {
        case home = "Home"
        case createPost = "Create"
        case messages = "Messages"
        case profile = "Profile"
    }
    
    var body: some View {
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
        }
        .accentColor(Color("AccentColor"))
        .fullScreenCover(isPresented: $showingDirectChat) {
            if let user = directChatUser {
                NavigationView {
                    ChatView(userId: user.id, userName: user.name)
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Messages") {
                                    showingDirectChat = false
                                    selectedTab = .messages
                                }
                            }
                        }
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { notification in
            print("📱 MainTabView: Received navigateToChat notification - opening direct chat")
            
            if let userId = notification.userInfo?["userId"] as? Int,
               let userName = notification.userInfo?["userName"] as? String {
                print("📱 MainTabView: Opening direct chat for user: \(userName) (ID: \(userId))")
                directChatUser = (id: userId, name: userName)
                showingDirectChat = true
            } else {
                print("❌ MainTabView: Failed to extract user info, falling back to Messages tab")
                selectedTab = .messages
            }
        }
    }
} 