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

// Determine package manager and audit command
const packageManager = (packageJson.packageManager || "npm").split("@")[0];
let auditCommand;
if (packageManager === "pnpm") {
    auditCommand = "pnpm audit --prod --json";
} else {
    auditCommand = "npm audit --omit dev --json";
}

// Shell out and run audit command
child.exec(auditCommand, (error, stdout, stderr) => {
    let concerns;
    try {
        concerns = JSON.parse(stdout);
    } catch (e) {
        console.error("Failed to parse audit output:", e);
        return;
    }

    // Normalise output: npm v7+ uses vulnerabilities, pnpm uses advisories
    let vulnerabilities = {};
    if (concerns.vulnerabilities) {
        // npm format
        vulnerabilities = concerns.vulnerabilities;
    } else if (concerns.advisories) {
        // pnpm format - convert advisories to a similar structure
        for (const id in concerns.advisories) {
            const advisory = concerns.advisories[id];
            const moduleName = advisory.module_name;
            if (!vulnerabilities[moduleName]) {
                vulnerabilities[moduleName] = { via: [] };
            }
            vulnerabilities[moduleName].via.push({
                url: advisory.url,
                title: advisory.title
            });
        }
    }

    for (const module in vulnerabilities) {
        let vulns = vulnerabilities[module].via;
        let moduleMitigations = mitigations[module];
        for (let i = 0; i < vulns.length; i++) {
            let key = (typeof vulns[i] === 'string') ? vulns[i] : vulns[i].url;
            if (key) {
                if (!moduleMitigations) {
                    logAndAlert(`Need to look at new ${module} vuln: ${key} ${vulns[i].title || ''}`);
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
                        logAndAlert(`Need to look at new ${module} vuln: ${key} ${vulns[i].title || ''}`);
                    }
                }
            }
        }
    }
});