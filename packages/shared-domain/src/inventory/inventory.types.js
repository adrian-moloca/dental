"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierStatus = exports.PurchaseOrderStatus = exports.LotStatus = exports.MovementType = exports.StockStatus = exports.ProductStatus = exports.UnitOfMeasure = exports.ProductCategory = void 0;
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["CONSUMABLE"] = "consumable";
    ProductCategory["INSTRUMENT"] = "instrument";
    ProductCategory["MATERIAL"] = "material";
    ProductCategory["MEDICATION"] = "medication";
    ProductCategory["EQUIPMENT"] = "equipment";
    ProductCategory["DISPOSABLE"] = "disposable";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
var UnitOfMeasure;
(function (UnitOfMeasure) {
    UnitOfMeasure["UNIT"] = "unit";
    UnitOfMeasure["BOX"] = "box";
    UnitOfMeasure["PACK"] = "pack";
    UnitOfMeasure["BOTTLE"] = "bottle";
    UnitOfMeasure["TUBE"] = "tube";
    UnitOfMeasure["SYRINGE"] = "syringe";
    UnitOfMeasure["VIAL"] = "vial";
    UnitOfMeasure["KG"] = "kg";
    UnitOfMeasure["G"] = "g";
    UnitOfMeasure["ML"] = "ml";
    UnitOfMeasure["L"] = "l";
})(UnitOfMeasure || (exports.UnitOfMeasure = UnitOfMeasure = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["DISCONTINUED"] = "discontinued";
    ProductStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductStatus["BACKORDERED"] = "backordered";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var StockStatus;
(function (StockStatus) {
    StockStatus["AVAILABLE"] = "available";
    StockStatus["RESERVED"] = "reserved";
    StockStatus["EXPIRED"] = "expired";
    StockStatus["DAMAGED"] = "damaged";
    StockStatus["RECALLED"] = "recalled";
    StockStatus["IN_TRANSIT"] = "in_transit";
})(StockStatus || (exports.StockStatus = StockStatus = {}));
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "in";
    MovementType["OUT"] = "out";
    MovementType["TRANSFER"] = "transfer";
    MovementType["ADJUSTMENT"] = "adjustment";
    MovementType["DEDUCTION"] = "deduction";
    MovementType["RETURN"] = "return";
    MovementType["WASTE"] = "waste";
    MovementType["EXPIRED"] = "expired";
})(MovementType || (exports.MovementType = MovementType = {}));
var LotStatus;
(function (LotStatus) {
    LotStatus["ACTIVE"] = "active";
    LotStatus["EXPIRED"] = "expired";
    LotStatus["RECALLED"] = "recalled";
    LotStatus["QUARANTINE"] = "quarantine";
})(LotStatus || (exports.LotStatus = LotStatus = {}));
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "draft";
    PurchaseOrderStatus["SUBMITTED"] = "submitted";
    PurchaseOrderStatus["APPROVED"] = "approved";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "partially_received";
    PurchaseOrderStatus["RECEIVED"] = "received";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
    PurchaseOrderStatus["CLOSED"] = "closed";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
var SupplierStatus;
(function (SupplierStatus) {
    SupplierStatus["ACTIVE"] = "active";
    SupplierStatus["INACTIVE"] = "inactive";
    SupplierStatus["SUSPENDED"] = "suspended";
})(SupplierStatus || (exports.SupplierStatus = SupplierStatus = {}));
//# sourceMappingURL=inventory.types.js.map