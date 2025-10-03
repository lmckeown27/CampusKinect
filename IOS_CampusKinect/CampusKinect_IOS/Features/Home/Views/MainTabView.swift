import SwiftUI
import UIKit

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var isMessagesPreloaded = false
    @Environment(\.horizontalSizeClass) var horizontalSizeClass
    @Environment(\.verticalSizeClass) var verticalSizeClass
    
    enum Tab: Int, CaseIterable {
        case home = 0
        case createPost = 1
        case messages = 2
        case profile = 3
        
        var title: String {
            switch self {
            case .home: return "Home"
            case .createPost: return "Create"
            case .messages: return "Messages"
            case .profile: return "Profile"
            }
        }
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
                
                // Main TabView with custom tab bar controller
                CustomTabBarController(selectedTab: $selectedTab, isIPad: isIPad)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.campusBackground)
        }
        .accentColor(Color.campusPrimary)
        .onReceive(NotificationCenter.default.publisher(for: .navigateToChat)) { _ in
            // Switch to Messages tab when navigateToChat notification is received
            print("📱 MainTabView: Received navigateToChat notification - switching to Messages tab")
            withAnimation(.easeInOut(duration: 0.3)) {
                selectedTab = .messages
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .navigateToHome)) { _ in
            // Switch to Home tab when navigateToHome notification is received
            print("📱 MainTabView: Received navigateToHome notification - switching to Home tab")
            withAnimation(.easeInOut(duration: 0.3)) {
                selectedTab = .home
            }
        }
    }
}

// MARK: - Custom Tab Bar Controller
struct CustomTabBarController: UIViewControllerRepresentable {
    @Binding var selectedTab: MainTabView.Tab
    let isIPad: Bool
    
    func makeUIViewController(context: Context) -> UITabBarController {
        let tabBarController = TabBarControllerWithDelegate()
        tabBarController.delegate = context.coordinator
        
        // Create view controllers for each tab
        let homeVC = UIHostingController(rootView: HomeView())
        homeVC.tabBarItem = UITabBarItem(title: "Home", image: UIImage(systemName: "house.fill"), tag: 0)
        
        let createPostVC = UIHostingController(rootView: CreatePostView())
        createPostVC.tabBarItem = UITabBarItem(title: "Create", image: UIImage(systemName: "plus.circle.fill"), tag: 1)
        
        let messagesVC = UIHostingController(rootView: MessagesView())
        messagesVC.tabBarItem = UITabBarItem(title: "Messages", image: UIImage(systemName: "message.fill"), tag: 2)
        
        let profileVC = UIHostingController(rootView: ProfileView())
        profileVC.tabBarItem = UITabBarItem(title: "Profile", image: UIImage(systemName: "person.fill"), tag: 3)
        
        tabBarController.viewControllers = [homeVC, createPostVC, messagesVC, profileVC]
        tabBarController.selectedIndex = selectedTab.rawValue
        
        // Style the tab bar
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        tabBarController.tabBar.standardAppearance = appearance
        tabBarController.tabBar.scrollEdgeAppearance = appearance
        tabBarController.tabBar.tintColor = UIColor(named: "BrandPrimary")
        
        return tabBarController
    }
    
    func updateUIViewController(_ uiViewController: UITabBarController, context: Context) {
        uiViewController.selectedIndex = selectedTab.rawValue
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UITabBarControllerDelegate {
        var parent: CustomTabBarController
        
        init(_ parent: CustomTabBarController) {
            self.parent = parent
        }
        
        func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
            guard let index = tabBarController.viewControllers?.firstIndex(of: viewController),
                  let tab = MainTabView.Tab(rawValue: index) else {
                return true
            }
            
            // Check if tapping the already-selected tab
            if tab.rawValue == tabBarController.selectedIndex {
                // Tapping same tab
                if tab == .home {
                    // Tapping home while already on home - scroll to top
                    print("📱 TabBarController: Tapped home tab while already on home - scrolling to top")
                    NotificationCenter.default.post(name: .scrollToTopHome, object: nil)
                }
                // Don't change selection
                return false
            } else {
                // Switching to different tab - update binding
                DispatchQueue.main.async {
                    self.parent.selectedTab = tab
                }
                return true
            }
        }
    }
}

// Custom UITabBarController subclass
class TabBarControllerWithDelegate: UITabBarController {
    // This subclass exists to ensure proper delegate behavior
} 