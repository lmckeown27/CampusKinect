//
//  ProfileImageView.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import SwiftUI

struct ProfileImageView: View {
    let imageUrl: String?
    let size: ProfileImageSize
    
    enum ProfileImageSize {
        case small, medium, large
        
        var dimension: CGFloat {
            switch self {
            case .small: return 32
            case .medium: return 48
            case .large: return 80
            }
        }
    }
    
    var body: some View {
        AsyncImage(url: URL(string: imageUrl ?? "")) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
        } placeholder: {
            Circle()
                .fill(Color(.systemGray4))
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: size.dimension * 0.4))
                        .foregroundColor(.white)
                )
        }
        .frame(width: size.dimension, height: size.dimension)
        .clipShape(Circle())
    }
}

struct ProfileImageView_Previews: PreviewProvider {
    static var previews: some View {
        HStack(spacing: 16) {
            ProfileImageView(imageUrl: nil, size: .small)
            ProfileImageView(imageUrl: nil, size: .medium)
            ProfileImageView(imageUrl: nil, size: .large)
        }
        .padding()
    }
}

