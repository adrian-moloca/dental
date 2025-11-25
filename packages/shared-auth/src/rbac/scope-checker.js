"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractScopes = extractScopes;
exports.hasScope = hasScope;
exports.hasScopeForResource = hasScopeForResource;
exports.hasAllScopes = hasAllScopes;
exports.hasAnyScope = hasAnyScope;
exports.toScope = toScope;
function extractScopes(user) {
    if (!user || !user.permissions) {
        return [];
    }
    return user.permissions.map((permission) => `${permission.resource.toLowerCase()}:${permission.action.toLowerCase()}`);
}
function hasScope(user, scope) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!scope || typeof scope !== 'string') {
        throw new Error('scope must be a non-empty string');
    }
    const [resource, action] = scope.split(':');
    if (!resource || !action) {
        throw new Error('scope must be in format "resource:action"');
    }
    return user.permissions.some((p) => p.resource.toLowerCase() === resource.toLowerCase() &&
        p.action.toLowerCase() === action.toLowerCase());
}
function hasScopeForResource(user, resource) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!resource || typeof resource !== 'string') {
        throw new Error('resource must be a non-empty string');
    }
    return user.permissions.some((p) => p.resource.toLowerCase() === resource.toLowerCase());
}
function hasAllScopes(user, scopes) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!scopes || scopes.length === 0) {
        throw new Error('scopes array must contain at least one scope');
    }
    return scopes.every((scope) => hasScope(user, scope));
}
function hasAnyScope(user, scopes) {
    if (!user || !user.permissions) {
        return false;
    }
    if (!scopes || scopes.length === 0) {
        throw new Error('scopes array must contain at least one scope');
    }
    return scopes.some((scope) => hasScope(user, scope));
}
function toScope(resource, action) {
    if (!resource) {
        throw new Error('resource is required');
    }
    if (!action) {
        throw new Error('action is required');
    }
    return `${resource.toLowerCase()}:${action.toLowerCase()}`;
}
//# sourceMappingURL=scope-checker.js.map