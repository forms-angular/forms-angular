/*
    Script to take json output from npm audit and check that all vulnerabilities have got mitigations logged in package.json
 */

const child = require("child_process");
const path = require("path");
const { program } = require("commander");

program
    .argument('[directory]', 'project directory to audit', '.')
    .option('-s, --severity <level>', 'minimum severity level to include in the report', 'high')
    .parse(process.argv);

const options = program.opts();
const pwd = path.resolve(program.args[0] || '.');
const minSeverity = options.severity.toLowerCase();

const severityHierarchy = {
    'info': 0,
    'low': 1,
    'moderate': 2,
    'high': 3,
    'critical': 4
};

const minSeverityValue = severityHierarchy[minSeverity] !== undefined ? severityHierarchy[minSeverity] : 3;

const logAndAlert = (msg) => {
    console.log(msg);
    child.exec("paplay /usr/share/sounds/freedesktop/stereo/bell.oga");
};


// read package.json
let packageJson;
try {
    packageJson = require(path.join(pwd, "./package.json"));
} catch (e) {
    console.error(`Failed to load package.json from ${pwd}`);
    process.exit(1);
}
const mitigations = packageJson.npmAuditMitigations || {};

// Determine package manager and audit command
const packageManager = (packageJson.packageManager || "npm").split("@")[0];
let auditCommand;
if (packageManager === "pnpm") {
    auditCommand = "pnpm audit --prod --json";
} else {
    auditCommand = "npm audit --omit dev --json";
}

// Shell out and run audit command
child.exec(auditCommand, { cwd: pwd }, (error, stdout, stderr) => {
    if (error && !stdout) {
        console.error(`Audit command failed with error: ${error.message}`);
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        return;
    }

    let concerns;
    try {
        concerns = JSON.parse(stdout);
    } catch (e) {
        console.error("Failed to parse audit output:", e);
        if (stderr) {
            console.error("stderr output from audit command:");
            console.error(stderr);
        }
        if (stdout) {
            console.error("stdout output from audit command (first 200 chars):");
            console.error(stdout.substring(0, 200));
        } else {
            console.error("stdout was empty.");
        }
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
                title: advisory.title,
                severity: advisory.severity
            });
        }
    }

    for (const module in vulnerabilities) {
        let vulns = vulnerabilities[module].via;
        let moduleMitigations = mitigations[module];
        for (let i = 0; i < vulns.length; i++) {
            let vuln = vulns[i];
            let key = (typeof vuln === 'string') ? vuln : vuln.url;
            let severity = (typeof vuln === 'string') ? 'unknown' : (vuln.severity || 'unknown');
            let severityValue = severityHierarchy[severity] !== undefined ? severityHierarchy[severity] : -1;

            if (severityValue < minSeverityValue && severity !== 'unknown') {
                continue;
            }

            // We are not interested in vulns that are due to vulns in other packages we already know about
            if (key && !mitigations[key]) {
                if (!moduleMitigations) {
                    logAndAlert(`Need to look at new ${severity} ${module} vuln: ${key} ${vuln.title || ''}`);
                } else {
                    let mitigation = moduleMitigations.find(o => {
                        return !!o[key];
                    });
                    if (mitigation) {
                        mitigation = mitigation[key];
                        if (mitigation.nextReview) {
                            const reviewDate = new Date(mitigation.nextReview);
                            if (reviewDate < new Date()) {
                                logAndAlert(`Need to review ${severity} ${module} vuln at: ${key} ${mitigation.reviewBy}`);
                            }
                        }
                    } else {
                        logAndAlert(`Need to look at new ${severity} ${module} vuln: ${key} ${vuln.title || ''}`);
                    }
                }
            }
        }
    }
});