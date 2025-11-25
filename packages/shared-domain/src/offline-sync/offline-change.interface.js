"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolutionStrategy = exports.ChangeOperation = void 0;
var ChangeOperation;
(function (ChangeOperation) {
    ChangeOperation["INSERT"] = "INSERT";
    ChangeOperation["UPDATE"] = "UPDATE";
    ChangeOperation["DELETE"] = "DELETE";
})(ChangeOperation || (exports.ChangeOperation = ChangeOperation = {}));
var ConflictResolutionStrategy;
(function (ConflictResolutionStrategy) {
    ConflictResolutionStrategy["SERVER_WINS"] = "SERVER_WINS";
    ConflictResolutionStrategy["CLIENT_WINS"] = "CLIENT_WINS";
    ConflictResolutionStrategy["MERGE"] = "MERGE";
})(ConflictResolutionStrategy || (exports.ConflictResolutionStrategy = ConflictResolutionStrategy = {}));
//# sourceMappingURL=offline-change.interface.js.map