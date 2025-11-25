"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION = exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE = void 0;
exports.isClinicalRoomPrepRequiredEvent = isClinicalRoomPrepRequiredEvent;
exports.createClinicalRoomPrepRequiredEvent = createClinicalRoomPrepRequiredEvent;
exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE = 'dental.clinical.room.prep.required';
exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION = 1;
function isClinicalRoomPrepRequiredEvent(event) {
    return event.type === exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE;
}
function createClinicalRoomPrepRequiredEvent(payload, metadata, tenantContext) {
    return {
        id: crypto.randomUUID(),
        type: exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE,
        version: exports.CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=clinical-room-prep-required.event.js.map