module.exports = {
    name: 'Development',
    db: {
        name: 'forms-ng_dev',
        host: '192.168.1.7'
    },
    port: process.env.PORT || 80,
    staticroutes: [
        '../app'
    ],
    uploadDir: '../app/tmp',
    errorConfig: {
    },
    dfhConfig: {
        urlPrefix : '/api/'
    }
}