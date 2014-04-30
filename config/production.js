module.exports = {
    name: 'Production',
    db: {
        name: 'forms-ng_prod',
        host: '192.168.1.7'
    },
    port: process.env.PORT || 80,
    staticroutes: [
        '../dist',
        '../app'
    ],
    uploadDir: '../dist/tmp',
    errorConfig: {
    },
    dfhConfig: {
        urlPrefix : '/api/'//,
        //authentication : ensureAuthenticated
    }
}