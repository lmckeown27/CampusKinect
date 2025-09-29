//
//  ImageMessageView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/29/25.
//

import SwiftUI

struct ImageMessageView: View {
    let message: Message
    let isCurrentUser: Bool
    let otherUserName: String
    
    @State private var showingFullImage = false
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            if !isCurrentUser {
                // Other user avatar
                Circle()
                    .fill(Color.campusSecondary)
                    .frame(width: 32, height: 32)
                    .overlay(
                        Text(String(otherUserName.prefix(1)).uppercased())
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    )
            }
            
            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                if !isCurrentUser {
                    Text(otherUserName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                }
                
                // Image container
                VStack(alignment: .leading, spacing: 8) {
                    if let metadata = message.metadata,
                       let imageUrl = metadata.fullImageURL {
                        AsyncImage(url: metadata.thumbnailImageURL ?? imageUrl) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(maxWidth: 200, maxHeight: 200)
                                .clipped()
                                .cornerRadius(12)
                                .onTapGesture {
                                    showingFullImage = true
                                }
                        } placeholder: {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.gray.opacity(0.3))
                                .frame(width: 200, height: 150)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(0.8)
                                )
                        }
                    } else {
                        // Fallback for missing image
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 200, height: 150)
                            .overlay(
                                VStack {
                                    Image(systemName: "photo")
                                        .font(.title2)
                                        .foregroundColor(.gray)
                                    Text("Image unavailable")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                            )
                    }
                    
                    // Timestamp
                    Text(message.timeAgo)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(isCurrentUser ? Color.campusPrimary.opacity(0.1) : Color.campusBackgroundSecondary)
                )
            }
            
            if isCurrentUser {
                Spacer()
            }
        }
        .sheet(isPresented: $showingFullImage) {
            if let metadata = message.metadata,
               let imageUrl = metadata.fullImageURL {
                FullScreenImageView(imageUrl: imageUrl)
            }
        }
    }
}

struct FullScreenImageView: View {
    let imageUrl: URL
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                AsyncImage(url: imageUrl) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .clipped()
                } placeholder: {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }
}

#Preview {
    let sampleMessage = Message(
        id: 1,
        conversationId: 1,
        senderId: 1,
        content: "Image",
        messageType: .image,
        isRead: true,
        createdAt: Date(),
        metadata: MessageMetadata(
            imageUrl: "/uploads/sample.jpg",
            thumbnailUrl: "/uploads/thumb-sample.jpg",
            systemMessageType: nil
        )
    )
    
    ImageMessageView(
        message: sampleMessage,
        isCurrentUser: false,
        otherUserName: "John Doe"
    )
    .padding()
} 