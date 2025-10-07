import Toast from "react-native-toast-message";

export const ToastMessage = {

    FillDetail: () => Toast.show({ type: 'error', text1: 'Please Fill the Details.' }),
    
    NetworkError: () => Toast.show({ type: 'error', text1: 'Network Error', text2: 'Please check your internet connection.' }),
    UpdatedSuccessfully: () => Toast.show({ type: 'success', text1: 'Updated Successfully' }),
    Success: (message = 'completed successfully.') => Toast.show({ type: 'success', text1: message }),
    Error: (message = 'An unexpected error occurred.') => Toast.show({ type: 'error', text1: message }),
    TryAgainError: (message = 'An error occurred. Please try again.') => Toast.show({ type: 'error', text1: message }),
    Custom: (type = 'info', text1 = '', text2 = '') => Toast.show({ type, text1, text2 })
}

//ToastMessage.Custom('type', 'head', ' message.')
