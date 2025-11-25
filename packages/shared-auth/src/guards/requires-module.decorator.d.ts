import 'reflect-metadata';
import { ModuleCode } from '../jwt/jwt-payload.types';
export declare const MODULE_METADATA_KEY = "auth:required-module";
export interface ModuleMetadata {
    readonly moduleCode: ModuleCode;
}
export declare function RequiresModule(moduleCode: ModuleCode): MethodDecorator & ClassDecorator;
export declare function getModuleMetadata(target: object | Function): ModuleMetadata | undefined;
