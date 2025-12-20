/*
    Script to take json output from npm audit and check that all vulnerabilities have got mitigations logged in package.json
 */
const child = require("child_process");

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
                    console.log(`Need to look at new ${module} vuln: ${key} ${vulns[i].title}`);
                } else {
                    let mitigation = moduleMitigations.find(o => {
                        return !!o[key];
                    });
                    if (mitigation) {
                        mitigation = mitigation[key];
                        if (mitigation.nextReview) {
                            const reviewDate = new Date(mitigation.nextReview);
                            if (reviewDate < new Date()) {
                                console.log(`Need to review at ${module} vuln: ${key} ${mitigation.reviewBy}`);
                            }
                        }
                    } else {
                        console.log(`Need to look at new ${module} vuln: ${key} ${vulns[i].title}`);
                    }
                }
            }
        }
    }
});