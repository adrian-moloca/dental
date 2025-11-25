"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutingKey = buildRoutingKey;
exports.parseRoutingKey = parseRoutingKey;
exports.matchesPattern = matchesPattern;
function buildRoutingKey(domain, entity, action) {
    const trimmedDomain = validateAndTrimComponent(domain, 'domain');
    const trimmedEntity = validateAndTrimComponent(entity, 'entity');
    const trimmedAction = validateAndTrimComponent(action, 'action');
    return `${trimmedDomain}.${trimmedEntity}.${trimmedAction}`;
}
function parseRoutingKey(routingKey) {
    if (!routingKey || typeof routingKey !== 'string') {
        throw new Error('Routing key must be a non-empty string');
    }
    const trimmed = routingKey.trim();
    if (trimmed.length === 0) {
        throw new Error('Routing key cannot be empty or whitespace');
    }
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
        throw new Error(`Invalid routing key format: expected 'domain.entity.action', got '${routingKey}'`);
    }
    const [domain, entity, action] = parts;
    if (!domain || domain.trim().length === 0) {
        throw new Error('Routing key domain cannot be empty');
    }
    if (!entity || entity.trim().length === 0) {
        throw new Error('Routing key entity cannot be empty');
    }
    if (!action || action.trim().length === 0) {
        throw new Error('Routing key action cannot be empty');
    }
    return {
        domain: domain.trim(),
        entity: entity.trim(),
        action: action.trim(),
    };
}
function validateAndTrimComponent(component, name) {
    if (!component || typeof component !== 'string') {
        throw new Error(`Routing key ${name} must be a non-empty string`);
    }
    const trimmed = component.trim();
    if (trimmed.length === 0) {
        throw new Error(`Routing key ${name} cannot be empty or whitespace`);
    }
    if (trimmed.includes('.')) {
        throw new Error(`Routing key ${name} cannot contain dots: '${component}'`);
    }
    return trimmed;
}
function matchesPattern(routingKey, pattern) {
    const keyParts = routingKey.split('.');
    const patternParts = pattern.split('.');
    let keyIndex = 0;
    let patternIndex = 0;
    while (patternIndex < patternParts.length) {
        const patternPart = patternParts[patternIndex];
        if (patternPart === '#') {
            if (patternIndex === patternParts.length - 1) {
                return true;
            }
            const nextPattern = patternParts[patternIndex + 1];
            while (keyIndex < keyParts.length) {
                if (keyParts[keyIndex] === nextPattern) {
                    patternIndex++;
                    keyIndex++;
                    break;
                }
                keyIndex++;
            }
        }
        else if (patternPart === '*') {
            if (keyIndex >= keyParts.length) {
                return false;
            }
            keyIndex++;
            patternIndex++;
        }
        else {
            if (keyIndex >= keyParts.length || keyParts[keyIndex] !== patternPart) {
                return false;
            }
            keyIndex++;
            patternIndex++;
        }
    }
    return keyIndex === keyParts.length && patternIndex === patternParts.length;
}
//# sourceMappingURL=routing-key.builder.js.map