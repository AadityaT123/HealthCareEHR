const createUser = ({ username, passwordHash, roleId }) => {
    return {
        id: Date.now().toString(),
        username, 
        passwordHash,
        roleId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Data().toISOString()
    };
};

export { createUser };