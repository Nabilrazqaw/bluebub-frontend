const API_URL = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('bluebub_token');

// Get all users
async function loadUsers(page = 1) {
    showLoading('Memuat Data', 'Mengambil data user...');
    
    try {
        const response = await fetch(`${API_URL}/users?page=${page}&per_page=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        closeLoading();
        
        if (data.success) {
            displayUsers(data.data.users);
            displayPagination(data.data);
            showToast('success', 'Data berhasil dimuat!');
        } else {
            showError('Gagal Memuat Data', data.error || 'Unknown error');
        }
    } catch (error) {
        closeLoading();
        console.error('Error loading users:', error);
        showError('Koneksi Error', 'Tidak dapat terhubung ke server');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="color: #999;">
                        <i style="font-size: 48px;">👥</i>
                        <p style="margin-top: 10px;">Belum ada user terdaftar</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id || user._id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>${user.full_name || '-'}</td>
                <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
                <td>${user.is_active ? '✅' : '❌'}</td>
                <td>
                    <button onclick="editUser('${user.id || user._id}')" class="btn-edit" title="Edit User">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteUser('${user.id || user._id}', '${user.username}')" class="btn-delete" title="Hapus User">
                        🗑️ Hapus
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Create user
async function createUser() {
    const { value: formValues } = await Swal.fire({
        title: '➕ Tambah User Baru',
        html:
            '<input id="swal-username" class="swal2-input" placeholder="Username">' +
            '<input id="swal-email" class="swal2-input" placeholder="Email" type="email">' +
            '<input id="swal-password" class="swal2-input" placeholder="Password" type="password">' +
            '<input id="swal-fullname" class="swal2-input" placeholder="Nama Lengkap">' +
            '<select id="swal-role" class="swal2-input">' +
                '<option value="user">User</option>' +
                '<option value="admin">Admin</option>' +
            '</select>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#088395',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '✅ Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const username = document.getElementById('swal-username').value;
            const email = document.getElementById('swal-email').value;
            const password = document.getElementById('swal-password').value;
            const full_name = document.getElementById('swal-fullname').value;
            const role = document.getElementById('swal-role').value;
            
            if (!username || !email || !password) {
                Swal.showValidationMessage('Username, email, dan password wajib diisi!');
                return false;
            }
            
            return { username, email, password, full_name, role };
        }
    });

    if (formValues) {
        showLoading('Membuat User', 'Menyimpan data...');
        
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formValues)
            });

            const data = await response.json();
            closeLoading();
            
            if (data.success) {
                showSuccess('Berhasil!', `User "${formValues.username}" berhasil ditambahkan`);
                loadUsers();
            } else {
                showError('Gagal Membuat User', data.error || 'Unknown error');
            }
        } catch (error) {
            closeLoading();
            console.error('Error creating user:', error);
            showError('Koneksi Error', 'Tidak dapat terhubung ke server');
        }
    }
}

// Edit user
async function editUser(userId) {
    // Get user data first
    showLoading('Memuat Data', 'Mengambil data user...');
    
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        closeLoading();
        
        if (!result.success) {
            showError('Error', 'User tidak ditemukan');
            return;
        }
        
        const user = result.data;
        
        const { value: formValues } = await Swal.fire({
            title: '✏️ Edit User',
            html:
                `<input id="swal-username" class="swal2-input" placeholder="Username" value="${user.username}">` +
                `<input id="swal-email" class="swal2-input" placeholder="Email" type="email" value="${user.email}">` +
                `<input id="swal-fullname" class="swal2-input" placeholder="Nama Lengkap" value="${user.full_name || ''}">` +
                '<select id="swal-role" class="swal2-input">' +
                    `<option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>` +
                    `<option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>` +
                '</select>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#088395',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '💾 Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                return {
                    username: document.getElementById('swal-username').value,
                    email: document.getElementById('swal-email').value,
                    full_name: document.getElementById('swal-fullname').value,
                    role: document.getElementById('swal-role').value
                };
            }
        });

        if (formValues) {
            showLoading('Menyimpan', 'Memperbarui data user...');
            
            const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formValues)
            });

            const updateData = await updateResponse.json();
            closeLoading();
            
            if (updateData.success) {
                showSuccess('Berhasil!', 'Data user berhasil diperbarui');
                loadUsers();
            } else {
                showError('Gagal Update', updateData.error || 'Unknown error');
            }
        }
        
    } catch (error) {
        closeLoading();
        console.error('Error editing user:', error);
        showError('Error', 'Terjadi kesalahan saat mengupdate user');
    }
}

// Delete user
async function deleteUser(userId, username) {
    const result = await showDeleteConfirm(`User "${username}"`);
    
    if (result.isConfirmed) {
        showLoading('Menghapus', 'Menghapus user...');
        
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            closeLoading();
            
            if (data.success) {
                showSuccess('Terhapus!', `User "${username}" telah dihapus`);
                loadUsers();
            } else {
                showError('Gagal Hapus', data.error || 'Unknown error');
            }
        } catch (error) {
            closeLoading();
            console.error('Error deleting user:', error);
            showError('Koneksi Error', 'Tidak dapat terhubung ke server');
        }
    }
}

// Search users
async function searchUsers() {
    const { value: query } = await showInput('🔍 Cari User', 'Username atau email...');
    
    if (query) {
        showLoading('Mencari', 'Mencari user...');
        
        try {
            const response = await fetch(`${API_URL}/users/search?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            closeLoading();
            
            if (data.success) {
                displayUsers(data.data);
                showToast('success', `Ditemukan ${data.data.length} user`);
            } else {
                showError('Pencarian Gagal', data.error);
            }
        } catch (error) {
            closeLoading();
            console.error('Error searching:', error);
            showError('Koneksi Error', 'Tidak dapat terhubung ke server');
        }
    }
}

// Load users on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
