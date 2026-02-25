import departmentUsersApi from '../api/admin_api/departmentUsersApi';

class UserService {
  async fetchUsers(limit = 100) {
    try {
      const res = await departmentUsersApi.listUsers({ page: 1, limit });
      const payload = res?.users ? res : (res?.data || res);
      const names = (payload.users || []).map(u => u.username).filter(Boolean);
      return { usernames: names, error: null };
    } catch (err) {
      return { 
        usernames: [], 
        error: err?.message || 'Failed to load users' 
      };
    }
  }
}

export default UserService;

