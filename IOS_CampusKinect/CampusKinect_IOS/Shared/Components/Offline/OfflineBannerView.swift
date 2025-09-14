import SwiftUI

struct OfflineBannerView: View {
    @State private var isVisible = false
    
    var body: some View {
        HStack {
            Image(systemName: "wifi.slash")
                .foregroundColor(.white)
            
            Text("No Internet Connection")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.red)
        .offset(y: isVisible ? 0 : -100)
        .animation(.spring(response: 0.6, dampingFraction: 0.8), value: isVisible)
        .onAppear {
            withAnimation {
                isVisible = true
            }
        }
    }
}

#Preview {
    OfflineBannerView()
}

