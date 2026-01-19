import departmentUserService from '../api/admin_api/departmentUserService';

class UserService {
  async fetchUsers(limit = 100) {
    try {
      const res = await departmentUserService.listUsers({ page: 1, limit });
      const payload = res.data || res;
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

