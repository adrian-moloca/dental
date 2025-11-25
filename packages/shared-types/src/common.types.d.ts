export type Brand<T, TBrand extends string> = T & {
    readonly __brand: TBrand;
};
export type UUID = Brand<string, 'UUID'>;
export type ISODateString = Brand<string, 'ISODateString'>;
export type Email = Brand<string, 'Email'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type URL = Brand<string, 'URL'>;
export type PositiveInt = Brand<number, 'PositiveInt'>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type NonNullable<T> = T extends null | undefined ? never : T;
export type ValueOf<T> = T[keyof T];
export type AtLeastOne<T> = {
    [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];
export type ExactlyOne<T> = {
    [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type StrictPick<T, K extends keyof T> = Pick<T, K>;
export type JSONValue = string | number | boolean | null | JSONValue[] | {
    [key: string]: JSONValue;
};
export type JSONObject = {
    [key: string]: JSONValue;
};
export type Metadata = Record<string, JSONValue>;
export type SortOrder = 'asc' | 'desc';
export interface SortConfig<T = string> {
    field: T;
    order: SortOrder;
}
