"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFacturaDocumentType = exports.EFacturaStatus = void 0;
var EFacturaStatus;
(function (EFacturaStatus) {
    EFacturaStatus["DRAFT"] = "DRAFT";
    EFacturaStatus["SUBMITTED"] = "SUBMITTED";
    EFacturaStatus["ACCEPTED"] = "ACCEPTED";
    EFacturaStatus["REJECTED"] = "REJECTED";
    EFacturaStatus["CANCELED"] = "CANCELED";
})(EFacturaStatus || (exports.EFacturaStatus = EFacturaStatus = {}));
var EFacturaDocumentType;
(function (EFacturaDocumentType) {
    EFacturaDocumentType["INVOICE"] = "INVOICE";
    EFacturaDocumentType["CREDIT_NOTE"] = "CREDIT_NOTE";
    EFacturaDocumentType["DEBIT_NOTE"] = "DEBIT_NOTE";
})(EFacturaDocumentType || (exports.EFacturaDocumentType = EFacturaDocumentType = {}));
//# sourceMappingURL=efactura.interface.js.map