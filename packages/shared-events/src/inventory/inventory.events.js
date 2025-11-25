"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOODS_RECEIPT_CREATED_VERSION = exports.PURCHASE_ORDER_CREATED_VERSION = exports.STOCK_EXPIRED_VERSION = exports.STOCK_LOW_VERSION = exports.STOCK_RESTOCKED_VERSION = exports.STOCK_DEDUCTED_VERSION = exports.GOODS_RECEIPT_CREATED_EVENT = exports.PURCHASE_ORDER_CREATED_EVENT = exports.STOCK_EXPIRED_EVENT = exports.STOCK_LOW_EVENT = exports.STOCK_RESTOCKED_EVENT = exports.STOCK_DEDUCTED_EVENT = void 0;
exports.isStockDeductedEvent = isStockDeductedEvent;
exports.createStockDeductedEvent = createStockDeductedEvent;
exports.isStockRestockedEvent = isStockRestockedEvent;
exports.createStockRestockedEvent = createStockRestockedEvent;
exports.isStockLowEvent = isStockLowEvent;
exports.createStockLowEvent = createStockLowEvent;
exports.isStockExpiredEvent = isStockExpiredEvent;
exports.createStockExpiredEvent = createStockExpiredEvent;
exports.isPurchaseOrderCreatedEvent = isPurchaseOrderCreatedEvent;
exports.createPurchaseOrderCreatedEvent = createPurchaseOrderCreatedEvent;
exports.isGoodsReceiptCreatedEvent = isGoodsReceiptCreatedEvent;
exports.createGoodsReceiptCreatedEvent = createGoodsReceiptCreatedEvent;
exports.STOCK_DEDUCTED_EVENT = 'dental.inventory.stock.deducted';
exports.STOCK_RESTOCKED_EVENT = 'dental.inventory.stock.restocked';
exports.STOCK_LOW_EVENT = 'dental.inventory.stock.low';
exports.STOCK_EXPIRED_EVENT = 'dental.inventory.stock.expired';
exports.PURCHASE_ORDER_CREATED_EVENT = 'dental.inventory.purchase-order.created';
exports.GOODS_RECEIPT_CREATED_EVENT = 'dental.inventory.goods-receipt.created';
exports.STOCK_DEDUCTED_VERSION = 1;
exports.STOCK_RESTOCKED_VERSION = 1;
exports.STOCK_LOW_VERSION = 1;
exports.STOCK_EXPIRED_VERSION = 1;
exports.PURCHASE_ORDER_CREATED_VERSION = 1;
exports.GOODS_RECEIPT_CREATED_VERSION = 1;
function isStockDeductedEvent(event) {
    return event.type === exports.STOCK_DEDUCTED_EVENT;
}
function createStockDeductedEvent(payload, metadata, tenantContext) {
    if (!payload.productId) {
        throw new Error('StockDeductedEvent: productId is required');
    }
    if (!payload.productName || payload.productName.trim().length === 0) {
        throw new Error('StockDeductedEvent: productName is required and cannot be empty');
    }
    if (!payload.sku || payload.sku.trim().length === 0) {
        throw new Error('StockDeductedEvent: sku is required and cannot be empty');
    }
    if (payload.quantity === undefined || payload.quantity === null) {
        throw new Error('StockDeductedEvent: quantity is required');
    }
    if (payload.quantity <= 0) {
        throw new Error('StockDeductedEvent: quantity must be positive');
    }
    if (!payload.unitOfMeasure || payload.unitOfMeasure.trim().length === 0) {
        throw new Error('StockDeductedEvent: unitOfMeasure is required and cannot be empty');
    }
    if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
        throw new Error('StockDeductedEvent: lotNumber is required and cannot be empty');
    }
    if (!payload.locationId) {
        throw new Error('StockDeductedEvent: locationId is required');
    }
    if (!payload.providerId) {
        throw new Error('StockDeductedEvent: providerId is required');
    }
    if (!payload.reason) {
        throw new Error('StockDeductedEvent: reason is required');
    }
    if (payload.costValue === undefined || payload.costValue === null) {
        throw new Error('StockDeductedEvent: costValue is required');
    }
    if (payload.costValue < 0) {
        throw new Error('StockDeductedEvent: costValue cannot be negative');
    }
    if (!payload.timestamp) {
        throw new Error('StockDeductedEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('StockDeductedEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('StockDeductedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('StockDeductedEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.STOCK_DEDUCTED_EVENT,
        version: exports.STOCK_DEDUCTED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isStockRestockedEvent(event) {
    return event.type === exports.STOCK_RESTOCKED_EVENT;
}
function createStockRestockedEvent(payload, metadata, tenantContext) {
    if (!payload.productId) {
        throw new Error('StockRestockedEvent: productId is required');
    }
    if (!payload.productName || payload.productName.trim().length === 0) {
        throw new Error('StockRestockedEvent: productName is required and cannot be empty');
    }
    if (payload.quantity === undefined || payload.quantity === null) {
        throw new Error('StockRestockedEvent: quantity is required');
    }
    if (payload.quantity <= 0) {
        throw new Error('StockRestockedEvent: quantity must be positive');
    }
    if (!payload.unitOfMeasure || payload.unitOfMeasure.trim().length === 0) {
        throw new Error('StockRestockedEvent: unitOfMeasure is required and cannot be empty');
    }
    if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
        throw new Error('StockRestockedEvent: lotNumber is required and cannot be empty');
    }
    if (!payload.locationId) {
        throw new Error('StockRestockedEvent: locationId is required');
    }
    if (!payload.receivedBy) {
        throw new Error('StockRestockedEvent: receivedBy is required');
    }
    if (payload.costValue === undefined || payload.costValue === null) {
        throw new Error('StockRestockedEvent: costValue is required');
    }
    if (payload.costValue < 0) {
        throw new Error('StockRestockedEvent: costValue cannot be negative');
    }
    if (!payload.timestamp) {
        throw new Error('StockRestockedEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('StockRestockedEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('StockRestockedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('StockRestockedEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.STOCK_RESTOCKED_EVENT,
        version: exports.STOCK_RESTOCKED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isStockLowEvent(event) {
    return event.type === exports.STOCK_LOW_EVENT;
}
function createStockLowEvent(payload, metadata, tenantContext) {
    if (!payload.productId) {
        throw new Error('StockLowEvent: productId is required');
    }
    if (!payload.productName || payload.productName.trim().length === 0) {
        throw new Error('StockLowEvent: productName is required and cannot be empty');
    }
    if (!payload.sku || payload.sku.trim().length === 0) {
        throw new Error('StockLowEvent: sku is required and cannot be empty');
    }
    if (payload.currentQuantity === undefined || payload.currentQuantity === null) {
        throw new Error('StockLowEvent: currentQuantity is required');
    }
    if (payload.currentQuantity < 0) {
        throw new Error('StockLowEvent: currentQuantity cannot be negative');
    }
    if (payload.reorderPoint === undefined || payload.reorderPoint === null) {
        throw new Error('StockLowEvent: reorderPoint is required');
    }
    if (payload.reorderQuantity === undefined || payload.reorderQuantity === null) {
        throw new Error('StockLowEvent: reorderQuantity is required');
    }
    if (payload.reorderQuantity <= 0) {
        throw new Error('StockLowEvent: reorderQuantity must be positive');
    }
    if (!payload.locationId) {
        throw new Error('StockLowEvent: locationId is required');
    }
    if (payload.autoReorderEnabled === undefined || payload.autoReorderEnabled === null) {
        throw new Error('StockLowEvent: autoReorderEnabled is required');
    }
    if (!payload.timestamp) {
        throw new Error('StockLowEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('StockLowEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('StockLowEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('StockLowEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.STOCK_LOW_EVENT,
        version: exports.STOCK_LOW_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isStockExpiredEvent(event) {
    return event.type === exports.STOCK_EXPIRED_EVENT;
}
function createStockExpiredEvent(payload, metadata, tenantContext) {
    if (!payload.productId) {
        throw new Error('StockExpiredEvent: productId is required');
    }
    if (!payload.productName || payload.productName.trim().length === 0) {
        throw new Error('StockExpiredEvent: productName is required and cannot be empty');
    }
    if (!payload.lotNumber || payload.lotNumber.trim().length === 0) {
        throw new Error('StockExpiredEvent: lotNumber is required and cannot be empty');
    }
    if (payload.quantity === undefined || payload.quantity === null) {
        throw new Error('StockExpiredEvent: quantity is required');
    }
    if (payload.quantity <= 0) {
        throw new Error('StockExpiredEvent: quantity must be positive');
    }
    if (!payload.expirationDate) {
        throw new Error('StockExpiredEvent: expirationDate is required');
    }
    if (!payload.locationId) {
        throw new Error('StockExpiredEvent: locationId is required');
    }
    if (!payload.action) {
        throw new Error('StockExpiredEvent: action is required');
    }
    if (!payload.timestamp) {
        throw new Error('StockExpiredEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('StockExpiredEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('StockExpiredEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('StockExpiredEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.STOCK_EXPIRED_EVENT,
        version: exports.STOCK_EXPIRED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isPurchaseOrderCreatedEvent(event) {
    return event.type === exports.PURCHASE_ORDER_CREATED_EVENT;
}
function createPurchaseOrderCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.purchaseOrderId) {
        throw new Error('PurchaseOrderCreatedEvent: purchaseOrderId is required');
    }
    if (!payload.orderNumber || payload.orderNumber.trim().length === 0) {
        throw new Error('PurchaseOrderCreatedEvent: orderNumber is required and cannot be empty');
    }
    if (!payload.supplierId) {
        throw new Error('PurchaseOrderCreatedEvent: supplierId is required');
    }
    if (!payload.supplierName || payload.supplierName.trim().length === 0) {
        throw new Error('PurchaseOrderCreatedEvent: supplierName is required and cannot be empty');
    }
    if (payload.itemCount === undefined || payload.itemCount === null) {
        throw new Error('PurchaseOrderCreatedEvent: itemCount is required');
    }
    if (payload.itemCount <= 0) {
        throw new Error('PurchaseOrderCreatedEvent: itemCount must be positive');
    }
    if (payload.totalAmount === undefined || payload.totalAmount === null) {
        throw new Error('PurchaseOrderCreatedEvent: totalAmount is required');
    }
    if (payload.totalAmount < 0) {
        throw new Error('PurchaseOrderCreatedEvent: totalAmount cannot be negative');
    }
    if (!payload.createdBy) {
        throw new Error('PurchaseOrderCreatedEvent: createdBy is required');
    }
    if (!payload.urgency) {
        throw new Error('PurchaseOrderCreatedEvent: urgency is required');
    }
    if (!payload.timestamp) {
        throw new Error('PurchaseOrderCreatedEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('PurchaseOrderCreatedEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('PurchaseOrderCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('PurchaseOrderCreatedEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.PURCHASE_ORDER_CREATED_EVENT,
        version: exports.PURCHASE_ORDER_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isGoodsReceiptCreatedEvent(event) {
    return event.type === exports.GOODS_RECEIPT_CREATED_EVENT;
}
function createGoodsReceiptCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.goodsReceiptId) {
        throw new Error('GoodsReceiptCreatedEvent: goodsReceiptId is required');
    }
    if (!payload.receiptNumber || payload.receiptNumber.trim().length === 0) {
        throw new Error('GoodsReceiptCreatedEvent: receiptNumber is required and cannot be empty');
    }
    if (!payload.supplierId) {
        throw new Error('GoodsReceiptCreatedEvent: supplierId is required');
    }
    if (!Array.isArray(payload.itemsReceived)) {
        throw new Error('GoodsReceiptCreatedEvent: itemsReceived must be an array');
    }
    if (payload.itemsReceived.length === 0) {
        throw new Error('GoodsReceiptCreatedEvent: itemsReceived cannot be empty');
    }
    payload.itemsReceived.forEach((item, index) => {
        if (!item.productId) {
            throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].productId is required`);
        }
        if (!item.productName || item.productName.trim().length === 0) {
            throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].productName is required`);
        }
        if (item.quantityReceived === undefined || item.quantityReceived === null) {
            throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].quantityReceived is required`);
        }
        if (item.quantityReceived <= 0) {
            throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].quantityReceived must be positive`);
        }
        if (!item.lotNumber || item.lotNumber.trim().length === 0) {
            throw new Error(`GoodsReceiptCreatedEvent: itemsReceived[${index}].lotNumber is required`);
        }
    });
    if (!payload.receivedBy) {
        throw new Error('GoodsReceiptCreatedEvent: receivedBy is required');
    }
    if (!payload.timestamp) {
        throw new Error('GoodsReceiptCreatedEvent: timestamp is required');
    }
    if (!payload.tenantId) {
        throw new Error('GoodsReceiptCreatedEvent: tenantId is required');
    }
    if (!payload.organizationId) {
        throw new Error('GoodsReceiptCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('GoodsReceiptCreatedEvent: clinicId is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.GOODS_RECEIPT_CREATED_EVENT,
        version: exports.GOODS_RECEIPT_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=inventory.events.js.map