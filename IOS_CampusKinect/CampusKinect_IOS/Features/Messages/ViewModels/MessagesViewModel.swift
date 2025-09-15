//
//  MessagesViewModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

@MainActor
class MessagesViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var error: APIError?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Public Methods
    func loadConversations() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchConversations()
            await MainActor.run {
                self.conversations = response.data.conversations
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    func refreshConversations() async {
        await loadConversations()
    }
}

