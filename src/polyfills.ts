import "core-js/client/shim";
import "reflect-metadata";
import "ts-helpers";
require("zone.js/dist/zone");

//noinspection TypeScriptUnresolvedVariable
if (process.env.ENV === "production") {
    // Production
    console.log("Evelium Production Build");

} else {
    // Development
    console.log("Evelium Development Build");

    Error["stackTraceLimit"] = Infinity;

    //noinspection TypeScriptUnresolvedFunction
    require("zone.js/dist/long-stack-trace-zone");
}
