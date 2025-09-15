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
    @Published var messageRequests: [MessageRequest] = []
    @Published var sentMessageRequests: [MessageRequest] = []
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
    
    func loadMessageRequests() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchMessageRequests()
            await MainActor.run {
                self.messageRequests = response.data.requests
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    func loadSentMessageRequests() async {
        isLoading = true
        error = nil
        
        do {
            let response = try await apiService.fetchSentMessageRequests()
            await MainActor.run {
                self.sentMessageRequests = response.data.requests
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.error = error as? APIError
                self.isLoading = false
            }
        }
    }
    
    func refreshMessageRequests() async {
        await loadMessageRequests()
    }
    
    func refreshSentMessageRequests() async {
        await loadSentMessageRequests()
    }
}

