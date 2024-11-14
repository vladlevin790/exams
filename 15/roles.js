const roles = {
    admin: ['view_dashboard', 'view_admin_page', 'view_user_page'],
    user: ['view_dashboard', 'view_user_page']
};

function hasPermission(role, permission) {
    return roles[role] && roles[role].includes(permission);
}

module.exports = { roles, hasPermission };
