// ===== SWEETALERT2 HELPER FUNCTIONS =====

// Success Alert
function showSuccess(title, message = '') {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#088395',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
    });
}

// Error Alert
function showError(title, message = '') {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
    });
}

// Warning Alert
function showWarning(title, message = '') {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'OK'
    });
}

// Info Alert
function showInfo(title, message = '') {
    return Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#088395',
        confirmButtonText: 'OK'
    });
}

// Confirm Dialog (Yes/No)
function showConfirm(title, message = '', confirmText = 'Ya', cancelText = 'Batal') {
    return Swal.fire({
        title: title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#088395',
        cancelButtonColor: '#6c757d',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true
    });
}

// Delete Confirmation (lebih mencolok)
function showDeleteConfirm(itemName = 'item ini') {
    return Swal.fire({
        title: 'Yakin hapus?',
        text: `${itemName} akan dihapus permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '🗑️ Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true
    });
}

// Loading/Progress Alert
function showLoading(title = 'Loading...', message = 'Mohon tunggu') {
    Swal.fire({
        title: title,
        text: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// Close Loading
function closeLoading() {
    Swal.close();
}

// Toast Notification (pojok kanan atas)
function showToast(icon, title) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: title
    });
}

// Input Dialog
function showInput(title, inputPlaceholder = '', inputType = 'text') {
    return Swal.fire({
        title: title,
        input: inputType,
        inputPlaceholder: inputPlaceholder,
        showCancelButton: true,
        confirmButtonColor: '#088395',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'OK',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
            if (!value) {
                return 'Field tidak boleh kosong!';
            }
        }
    });
}
