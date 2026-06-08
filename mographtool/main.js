var csInterface = new CSInterface();

function run(cmd) {
    csInterface.evalScript("mographTools('" + cmd + "')", function(result) {
        if (result === "EvalScript error.") {
            console.error("ExtendScript error on command: " + cmd);
        }
    });
}
