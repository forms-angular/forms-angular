/*
    Script to take json output from npm audit and check that all vulnerabilities have got mitigations logged in package.json
 */
const child = require("child_process");

const logAndAlert = (msg) => {
    console.log(msg);
    child.exec("paplay /usr/share/sounds/freedesktop/stereo/bell.oga");
};


// read package.json
const packageJson = require("./package.json");
const mitigations = packageJson.npmAuditMitigations;

// Shell out and run "npm audit"
child.exec("npm audit --omit dev --json", (error, stdout, stderr) => {
    const concerns = JSON.parse(stdout);
    for (const module in concerns.vulnerabilities) {
        let vulns = concerns.vulnerabilities[module].via;
        let moduleMitigations = mitigations[module];
        for (let i = 0; i < vulns.length; i++) {
            let key = vulns[i].url;
            if (key) {
                if (!moduleMitigations) {
                    logAndAlert(`Need to look at new ${module} vuln: ${key} ${vulns[i].title}`);
                } else {
                    let mitigation = moduleMitigations.find(o => {
                        return !!o[key];
                    });
                    if (mitigation) {
                        mitigation = mitigation[key];
                        if (mitigation.nextReview) {
                            const reviewDate = new Date(mitigation.nextReview);
                            if (reviewDate < new Date()) {
                                logAndAlert(`Need to review at ${module} vuln: ${key} ${mitigation.reviewBy}`);
                            }
                        }
                    } else {
                        logAndAlert(`Need to look at new ${module} vuln: ${key} ${vulns[i].title}`);
                    }
                }
            }
        }
    }
});