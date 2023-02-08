export default () => ({
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,
    SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    JWT: {
        SECRET: process.env.JWT_SECRET || 'shhh',
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
    },
    GLOBAL_PREFIX: 'v1'
});
