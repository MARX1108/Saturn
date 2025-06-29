import SwiftUI

struct PostCreationView: View {
    @StateObject private var viewModel = PostCreationViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                VStack(spacing: 0) {
                    ZStack(alignment: .bottomTrailing) {
                        TextEditor(text: $viewModel.postContent)
                            .font(.body)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                                    .stroke(Color(.systemGray4), lineWidth: 1)
                            )
                            .frame(minHeight: 120)
                        
                        Text("\(viewModel.characterCount) / 280")
                            .font(.caption)
                            .foregroundColor(viewModel.characterCountColor)
                            .padding(.trailing, 8)
                            .padding(.bottom, 8)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    
                    if let errorMessage = viewModel.errorMessage {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .onTapGesture {
                            viewModel.clearError()
                        }
                    }
                    
                    Spacer()
                }
                .disabled(viewModel.isLoading)
                
                if viewModel.isLoading {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                    
                    VStack {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                            .scaleEffect(1.2)
                        Text("Posting...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 8)
                }
            }
            .navigationTitle("New Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Post") {
                        Task {
                            await viewModel.submitPost()
                        }
                    }
                    .disabled(!viewModel.isSubmitEnabled)
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .onChange(of: viewModel.didSuccessfullyPost) { _, didPost in
            if didPost {
                dismiss()
            }
        }
        .onAppear {
            viewModel.resetState()
        }
    }
}

#Preview {
    PostCreationView()
}