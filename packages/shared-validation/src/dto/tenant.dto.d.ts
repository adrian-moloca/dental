import { z } from 'zod';
export declare const CreateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    logoUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodDefault<z.ZodString>;
        locale: z.ZodDefault<z.ZodString>;
        currency: z.ZodDefault<z.ZodString>;
        dateFormat: z.ZodDefault<z.ZodString>;
        timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
        weekStartsOn: z.ZodDefault<z.ZodNumber>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
        branding: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            logoUrl: z.ZodOptional<z.ZodString>;
            faviconUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    logoUrl?: string | undefined;
}, {
    name: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    logoUrl?: string | undefined;
}>;
export declare const UpdateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    logoUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodDefault<z.ZodString>;
        locale: z.ZodDefault<z.ZodString>;
        currency: z.ZodDefault<z.ZodString>;
        dateFormat: z.ZodDefault<z.ZodString>;
        timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
        weekStartsOn: z.ZodDefault<z.ZodNumber>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
        branding: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            logoUrl: z.ZodOptional<z.ZodString>;
            faviconUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "suspended" | undefined;
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    slug?: string | undefined;
    logoUrl?: string | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    slug?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const OrganizationResponseDtoSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    logoUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodDefault<z.ZodString>;
        locale: z.ZodDefault<z.ZodString>;
        currency: z.ZodDefault<z.ZodString>;
        dateFormat: z.ZodDefault<z.ZodString>;
        timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
        weekStartsOn: z.ZodDefault<z.ZodNumber>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
        branding: z.ZodOptional<z.ZodObject<{
            primaryColor: z.ZodOptional<z.ZodString>;
            secondaryColor: z.ZodOptional<z.ZodString>;
            logoUrl: z.ZodOptional<z.ZodString>;
            faviconUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }, {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone: string;
        locale: string;
        currency: string;
        dateFormat: string;
        timeFormat: "12h" | "24h";
        weekStartsOn: number;
        features: Record<string, boolean>;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    logoUrl?: string | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        currency?: string | undefined;
        dateFormat?: string | undefined;
        timeFormat?: "12h" | "24h" | undefined;
        weekStartsOn?: number | undefined;
        features?: Record<string, boolean> | undefined;
        branding?: {
            logoUrl?: string | undefined;
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            faviconUrl?: string | undefined;
        } | undefined;
    } | undefined;
    logoUrl?: string | undefined;
}>;
export declare const CreateClinicDtoSchema: z.ZodObject<{
    organizationId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>>;
    contact: z.ZodOptional<z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        operatingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            openTime: z.ZodString;
            closeTime: z.ZodString;
            isClosed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }>, "many">>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    name: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    } | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}, {
    organizationId: string;
    name: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}>;
export declare const UpdateClinicDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>>;
    contact: z.ZodOptional<z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        operatingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            openTime: z.ZodString;
            closeTime: z.ZodString;
            isClosed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }>, "many">>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "suspended" | undefined;
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    } | undefined;
    slug?: string | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    slug?: string | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}>;
export declare const ClinicResponseDtoSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>>;
    contact: z.ZodOptional<z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    settings: z.ZodOptional<z.ZodObject<{
        timezone: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        operatingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            openTime: z.ZodString;
            closeTime: z.ZodString;
            isClosed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }, {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }>, "many">>;
        features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    }, {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        features: Record<string, boolean>;
        appointmentDuration: number;
        timezone?: string | undefined;
        locale?: string | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[] | undefined;
    } | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    settings?: {
        timezone?: string | undefined;
        locale?: string | undefined;
        features?: Record<string, boolean> | undefined;
        appointmentDuration?: number | undefined;
        operatingHours?: {
            dayOfWeek: number;
            openTime: string;
            closeTime: string;
            isClosed?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
}>;
export declare const OrganizationQueryParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["name", "slug", "createdAt"]>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "active" | "inactive" | "suspended" | undefined;
    search?: string | undefined;
    sortBy?: "name" | "createdAt" | "slug" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "name" | "createdAt" | "slug" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const ClinicQueryParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["name", "slug", "createdAt"]>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
    organizationId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "active" | "inactive" | "suspended" | undefined;
    organizationId?: string | undefined;
    search?: string | undefined;
    sortBy?: "name" | "createdAt" | "slug" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    organizationId?: string | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "name" | "createdAt" | "slug" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const UpdateOrganizationStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    reason?: string | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    reason?: string | undefined;
}>;
export declare const UpdateClinicStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    reason?: string | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    reason?: string | undefined;
}>;
export type CreateOrganizationDtoInput = z.input<typeof CreateOrganizationDtoSchema>;
export type CreateOrganizationDtoOutput = z.output<typeof CreateOrganizationDtoSchema>;
export type UpdateOrganizationDtoInput = z.input<typeof UpdateOrganizationDtoSchema>;
export type UpdateOrganizationDtoOutput = z.output<typeof UpdateOrganizationDtoSchema>;
export type OrganizationResponseDtoInput = z.input<typeof OrganizationResponseDtoSchema>;
export type OrganizationResponseDtoOutput = z.output<typeof OrganizationResponseDtoSchema>;
export type CreateClinicDtoInput = z.input<typeof CreateClinicDtoSchema>;
export type CreateClinicDtoOutput = z.output<typeof CreateClinicDtoSchema>;
export type UpdateClinicDtoInput = z.input<typeof UpdateClinicDtoSchema>;
export type UpdateClinicDtoOutput = z.output<typeof UpdateClinicDtoSchema>;
export type ClinicResponseDtoInput = z.input<typeof ClinicResponseDtoSchema>;
export type ClinicResponseDtoOutput = z.output<typeof ClinicResponseDtoSchema>;
export type OrganizationQueryParamsInput = z.input<typeof OrganizationQueryParamsSchema>;
export type OrganizationQueryParamsOutput = z.output<typeof OrganizationQueryParamsSchema>;
export type ClinicQueryParamsInput = z.input<typeof ClinicQueryParamsSchema>;
export type ClinicQueryParamsOutput = z.output<typeof ClinicQueryParamsSchema>;
export type UpdateOrganizationStatusDtoInput = z.input<typeof UpdateOrganizationStatusDtoSchema>;
export type UpdateOrganizationStatusDtoOutput = z.output<typeof UpdateOrganizationStatusDtoSchema>;
export type UpdateClinicStatusDtoInput = z.input<typeof UpdateClinicStatusDtoSchema>;
export type UpdateClinicStatusDtoOutput = z.output<typeof UpdateClinicStatusDtoSchema>;
