import { z } from 'zod';
import { ContactMethod } from '@dentalos/shared-types';
export declare const PersonNameSchema: z.ZodObject<{
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    preferredName: z.ZodOptional<z.ZodString>;
    suffix: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    title?: string | undefined;
    middleName?: string | undefined;
    preferredName?: string | undefined;
    suffix?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    title?: string | undefined;
    middleName?: string | undefined;
    preferredName?: string | undefined;
    suffix?: string | undefined;
}>;
export declare const PhoneTypeSchema: z.ZodEnum<["mobile", "home", "work", "fax", "other"]>;
export declare const PhoneContactSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["mobile", "home", "work", "fax", "other"]>>;
    number: z.ZodString;
    extension: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    number: string;
    type: "other" | "mobile" | "home" | "work" | "fax";
    isPrimary: boolean;
    isVerified: boolean;
    notes?: string | undefined;
    extension?: string | undefined;
}, {
    number: string;
    type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
    isPrimary?: boolean | undefined;
    notes?: string | undefined;
    extension?: string | undefined;
    isVerified?: boolean | undefined;
}>;
export declare const EmailTypeSchema: z.ZodEnum<["personal", "work", "other"]>;
export declare const EmailContactSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["personal", "work", "other"]>>;
    address: z.ZodString;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    verifiedAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "other" | "work" | "personal";
    isPrimary: boolean;
    address: string;
    isVerified: boolean;
    notes?: string | undefined;
    verifiedAt?: string | undefined;
}, {
    address: string;
    type?: "other" | "work" | "personal" | undefined;
    isPrimary?: boolean | undefined;
    notes?: string | undefined;
    isVerified?: boolean | undefined;
    verifiedAt?: string | undefined;
}>;
export declare const AddressTypeSchema: z.ZodEnum<["home", "work", "billing", "shipping", "other"]>;
export declare const PhysicalAddressSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["home", "work", "billing", "shipping", "other"]>>;
    street1: z.ZodString;
    street2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "billing" | "other" | "home" | "work" | "shipping";
    isPrimary: boolean;
    city: string;
    country: string;
    street1: string;
    state?: string | undefined;
    postalCode?: string | undefined;
    notes?: string | undefined;
    street2?: string | undefined;
}, {
    city: string;
    street1: string;
    type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
    state?: string | undefined;
    isPrimary?: boolean | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    notes?: string | undefined;
    street2?: string | undefined;
}>;
export declare const PatientContactsSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    phones: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["mobile", "home", "work", "fax", "other"]>>;
        number: z.ZodString;
        extension: z.ZodOptional<z.ZodString>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        number: string;
        type: "other" | "mobile" | "home" | "work" | "fax";
        isPrimary: boolean;
        isVerified: boolean;
        notes?: string | undefined;
        extension?: string | undefined;
    }, {
        number: string;
        type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        extension?: string | undefined;
        isVerified?: boolean | undefined;
    }>, "many">>;
    emails: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["personal", "work", "other"]>>;
        address: z.ZodString;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        verifiedAt: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "other" | "work" | "personal";
        isPrimary: boolean;
        address: string;
        isVerified: boolean;
        notes?: string | undefined;
        verifiedAt?: string | undefined;
    }, {
        address: string;
        type?: "other" | "work" | "personal" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        isVerified?: boolean | undefined;
        verifiedAt?: string | undefined;
    }>, "many">>;
    addresses: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["home", "work", "billing", "shipping", "other"]>>;
        street1: z.ZodString;
        street2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }, {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }>, "many">>;
    preferredContactMethod: z.ZodDefault<z.ZodNativeEnum<typeof ContactMethod>>;
}, "strip", z.ZodTypeAny, {
    phones: {
        number: string;
        type: "other" | "mobile" | "home" | "work" | "fax";
        isPrimary: boolean;
        isVerified: boolean;
        notes?: string | undefined;
        extension?: string | undefined;
    }[];
    emails: {
        type: "other" | "work" | "personal";
        isPrimary: boolean;
        address: string;
        isVerified: boolean;
        notes?: string | undefined;
        verifiedAt?: string | undefined;
    }[];
    addresses: {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[];
    preferredContactMethod: ContactMethod;
}, {
    phones?: {
        number: string;
        type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        extension?: string | undefined;
        isVerified?: boolean | undefined;
    }[] | undefined;
    emails?: {
        address: string;
        type?: "other" | "work" | "personal" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        isVerified?: boolean | undefined;
        verifiedAt?: string | undefined;
    }[] | undefined;
    addresses?: {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[] | undefined;
    preferredContactMethod?: ContactMethod | undefined;
}>, {
    phones: {
        number: string;
        type: "other" | "mobile" | "home" | "work" | "fax";
        isPrimary: boolean;
        isVerified: boolean;
        notes?: string | undefined;
        extension?: string | undefined;
    }[];
    emails: {
        type: "other" | "work" | "personal";
        isPrimary: boolean;
        address: string;
        isVerified: boolean;
        notes?: string | undefined;
        verifiedAt?: string | undefined;
    }[];
    addresses: {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[];
    preferredContactMethod: ContactMethod;
}, {
    phones?: {
        number: string;
        type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        extension?: string | undefined;
        isVerified?: boolean | undefined;
    }[] | undefined;
    emails?: {
        address: string;
        type?: "other" | "work" | "personal" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        isVerified?: boolean | undefined;
        verifiedAt?: string | undefined;
    }[] | undefined;
    addresses?: {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[] | undefined;
    preferredContactMethod?: ContactMethod | undefined;
}>, {
    phones: {
        number: string;
        type: "other" | "mobile" | "home" | "work" | "fax";
        isPrimary: boolean;
        isVerified: boolean;
        notes?: string | undefined;
        extension?: string | undefined;
    }[];
    emails: {
        type: "other" | "work" | "personal";
        isPrimary: boolean;
        address: string;
        isVerified: boolean;
        notes?: string | undefined;
        verifiedAt?: string | undefined;
    }[];
    addresses: {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[];
    preferredContactMethod: ContactMethod;
}, {
    phones?: {
        number: string;
        type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        extension?: string | undefined;
        isVerified?: boolean | undefined;
    }[] | undefined;
    emails?: {
        address: string;
        type?: "other" | "work" | "personal" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        isVerified?: boolean | undefined;
        verifiedAt?: string | undefined;
    }[] | undefined;
    addresses?: {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[] | undefined;
    preferredContactMethod?: ContactMethod | undefined;
}>, {
    phones: {
        number: string;
        type: "other" | "mobile" | "home" | "work" | "fax";
        isPrimary: boolean;
        isVerified: boolean;
        notes?: string | undefined;
        extension?: string | undefined;
    }[];
    emails: {
        type: "other" | "work" | "personal";
        isPrimary: boolean;
        address: string;
        isVerified: boolean;
        notes?: string | undefined;
        verifiedAt?: string | undefined;
    }[];
    addresses: {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[];
    preferredContactMethod: ContactMethod;
}, {
    phones?: {
        number: string;
        type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        extension?: string | undefined;
        isVerified?: boolean | undefined;
    }[] | undefined;
    emails?: {
        address: string;
        type?: "other" | "work" | "personal" | undefined;
        isPrimary?: boolean | undefined;
        notes?: string | undefined;
        isVerified?: boolean | undefined;
        verifiedAt?: string | undefined;
    }[] | undefined;
    addresses?: {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }[] | undefined;
    preferredContactMethod?: ContactMethod | undefined;
}>;
export declare const EthnicitySchema: z.ZodEnum<["hispanic_latino", "not_hispanic_latino", "american_indian_alaska_native", "asian", "black_african_american", "native_hawaiian_pacific_islander", "white", "other", "prefer_not_to_say"]>;
export declare const DemographicsSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    dateOfBirth: z.ZodEffects<z.ZodString, string, string>;
    gender: z.ZodNativeEnum<typeof import("@dentalos/shared-types").Gender>;
    maritalStatus: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").MaritalStatus>>;
    ethnicity: z.ZodOptional<z.ZodEnum<["hispanic_latino", "not_hispanic_latino", "american_indian_alaska_native", "asian", "black_african_american", "native_hawaiian_pacific_islander", "white", "other", "prefer_not_to_say"]>>;
    race: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferredLanguage: z.ZodDefault<z.ZodString>;
    occupation: z.ZodOptional<z.ZodString>;
    employer: z.ZodOptional<z.ZodString>;
    socialSecurityNumber: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    race: string[];
    preferredLanguage: string;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    race?: string[] | undefined;
    preferredLanguage?: string | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}>, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    race: string[];
    preferredLanguage: string;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    race?: string[] | undefined;
    preferredLanguage?: string | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}>, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    race: string[];
    preferredLanguage: string;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}, {
    dateOfBirth: string;
    gender: import("@dentalos/shared-types").Gender;
    photoUrl?: string | undefined;
    maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
    ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
    race?: string[] | undefined;
    preferredLanguage?: string | undefined;
    occupation?: string | undefined;
    employer?: string | undefined;
    socialSecurityNumber?: string | undefined;
}>;
export declare const MedicalSeveritySchema: z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>;
export declare const MedicalFlagsSchema: z.ZodObject<{
    allergies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        allergen: z.ZodString;
        severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
        reaction: z.ZodOptional<z.ZodString>;
        verifiedDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        allergen: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        reaction?: string | undefined;
        verifiedDate?: string | undefined;
    }, {
        allergen: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        reaction?: string | undefined;
        verifiedDate?: string | undefined;
    }>, "many">>;
    medications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodOptional<z.ZodString>;
        frequency: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        endDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        prescribedBy: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
        notes?: string | undefined;
        frequency?: string | undefined;
        dosage?: string | undefined;
        prescribedBy?: string | undefined;
    }, {
        name: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
        notes?: string | undefined;
        frequency?: string | undefined;
        dosage?: string | undefined;
        prescribedBy?: string | undefined;
    }>, "many">>;
    conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        diagnosedDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        status: z.ZodOptional<z.ZodEnum<["active", "resolved", "chronic"]>>;
        severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        status?: "active" | "resolved" | "chronic" | undefined;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        diagnosedDate?: string | undefined;
    }, {
        name: string;
        status?: "active" | "resolved" | "chronic" | undefined;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        diagnosedDate?: string | undefined;
    }>, "many">>;
    alerts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["allergy", "medical", "behavioral", "administrative"]>;
        message: z.ZodString;
        severity: z.ZodDefault<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
        createdAt: z.ZodString;
        createdBy: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "allergy" | "medical" | "behavioral" | "administrative";
        createdAt: string;
        severity: "mild" | "moderate" | "severe" | "life_threatening";
        createdBy: string;
        expiresAt?: string | undefined;
    }, {
        message: string;
        type: "allergy" | "medical" | "behavioral" | "administrative";
        createdAt: string;
        createdBy: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        expiresAt?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    conditions: {
        name: string;
        status?: "active" | "resolved" | "chronic" | undefined;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        diagnosedDate?: string | undefined;
    }[];
    allergies: {
        allergen: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        reaction?: string | undefined;
        verifiedDate?: string | undefined;
    }[];
    medications: {
        name: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
        notes?: string | undefined;
        frequency?: string | undefined;
        dosage?: string | undefined;
        prescribedBy?: string | undefined;
    }[];
    alerts: {
        message: string;
        type: "allergy" | "medical" | "behavioral" | "administrative";
        createdAt: string;
        severity: "mild" | "moderate" | "severe" | "life_threatening";
        createdBy: string;
        expiresAt?: string | undefined;
    }[];
}, {
    conditions?: {
        name: string;
        status?: "active" | "resolved" | "chronic" | undefined;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        diagnosedDate?: string | undefined;
    }[] | undefined;
    allergies?: {
        allergen: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        notes?: string | undefined;
        reaction?: string | undefined;
        verifiedDate?: string | undefined;
    }[] | undefined;
    medications?: {
        name: string;
        startDate?: string | undefined;
        endDate?: string | undefined;
        notes?: string | undefined;
        frequency?: string | undefined;
        dosage?: string | undefined;
        prescribedBy?: string | undefined;
    }[] | undefined;
    alerts?: {
        message: string;
        type: "allergy" | "medical" | "behavioral" | "administrative";
        createdAt: string;
        createdBy: string;
        severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
        expiresAt?: string | undefined;
    }[] | undefined;
}>;
export declare const InsuranceCoverageTypeSchema: z.ZodEnum<["primary", "secondary", "tertiary"]>;
export declare const RelationshipToSubscriberSchema: z.ZodEnum<["self", "spouse", "child", "parent", "other"]>;
export declare const InsuranceInfoSchema: z.ZodEffects<z.ZodObject<{
    provider: z.ZodString;
    policyNumber: z.ZodString;
    groupNumber: z.ZodOptional<z.ZodString>;
    subscriberName: z.ZodString;
    subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
    effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    planName: z.ZodOptional<z.ZodString>;
    planType: z.ZodOptional<z.ZodString>;
    insurancePhone: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: string;
    policyNumber: string;
    isActive: boolean;
    subscriberName: string;
    relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
    coverageType: "primary" | "secondary" | "tertiary";
    notes?: string | undefined;
    groupNumber?: string | undefined;
    effectiveDate?: string | undefined;
    subscriberDateOfBirth?: string | undefined;
    terminationDate?: string | undefined;
    planName?: string | undefined;
    planType?: string | undefined;
    insurancePhone?: string | undefined;
}, {
    provider: string;
    policyNumber: string;
    subscriberName: string;
    notes?: string | undefined;
    groupNumber?: string | undefined;
    effectiveDate?: string | undefined;
    isActive?: boolean | undefined;
    subscriberDateOfBirth?: string | undefined;
    relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
    terminationDate?: string | undefined;
    coverageType?: "primary" | "secondary" | "tertiary" | undefined;
    planName?: string | undefined;
    planType?: string | undefined;
    insurancePhone?: string | undefined;
}>, {
    provider: string;
    policyNumber: string;
    isActive: boolean;
    subscriberName: string;
    relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
    coverageType: "primary" | "secondary" | "tertiary";
    notes?: string | undefined;
    groupNumber?: string | undefined;
    effectiveDate?: string | undefined;
    subscriberDateOfBirth?: string | undefined;
    terminationDate?: string | undefined;
    planName?: string | undefined;
    planType?: string | undefined;
    insurancePhone?: string | undefined;
}, {
    provider: string;
    policyNumber: string;
    subscriberName: string;
    notes?: string | undefined;
    groupNumber?: string | undefined;
    effectiveDate?: string | undefined;
    isActive?: boolean | undefined;
    subscriberDateOfBirth?: string | undefined;
    relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
    terminationDate?: string | undefined;
    coverageType?: "primary" | "secondary" | "tertiary" | undefined;
    planName?: string | undefined;
    planType?: string | undefined;
    insurancePhone?: string | undefined;
}>;
export declare const PatientInsuranceSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    primary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
        subscriberName: z.ZodString;
        subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
        effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        planName: z.ZodOptional<z.ZodString>;
        planType: z.ZodOptional<z.ZodString>;
        insurancePhone: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>>;
    secondary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
        subscriberName: z.ZodString;
        subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
        effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        planName: z.ZodOptional<z.ZodString>;
        planType: z.ZodOptional<z.ZodString>;
        insurancePhone: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>>;
    tertiary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
        subscriberName: z.ZodString;
        subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
        effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        planName: z.ZodOptional<z.ZodString>;
        planType: z.ZodOptional<z.ZodString>;
        insurancePhone: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>, {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    primary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}, {
    primary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}>, {
    primary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}, {
    primary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}>, {
    primary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        isActive: boolean;
        subscriberName: string;
        relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
        coverageType: "primary" | "secondary" | "tertiary";
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        subscriberDateOfBirth?: string | undefined;
        terminationDate?: string | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}, {
    primary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    secondary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
    tertiary?: {
        provider: string;
        policyNumber: string;
        subscriberName: string;
        notes?: string | undefined;
        groupNumber?: string | undefined;
        effectiveDate?: string | undefined;
        isActive?: boolean | undefined;
        subscriberDateOfBirth?: string | undefined;
        relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
        terminationDate?: string | undefined;
        coverageType?: "primary" | "secondary" | "tertiary" | undefined;
        planName?: string | undefined;
        planType?: string | undefined;
        insurancePhone?: string | undefined;
    } | undefined;
}>;
export declare const CommunicationChannelSchema: z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>;
export declare const CommunicationPreferencesSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    preferredChannel: z.ZodDefault<z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>>;
    enabledChannels: z.ZodArray<z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>, "many">;
    appointmentReminders: z.ZodDefault<z.ZodBoolean>;
    recallReminders: z.ZodDefault<z.ZodBoolean>;
    treatmentUpdates: z.ZodDefault<z.ZodBoolean>;
    marketingCommunications: z.ZodDefault<z.ZodBoolean>;
    educationalContent: z.ZodDefault<z.ZodBoolean>;
    surveyRequests: z.ZodDefault<z.ZodBoolean>;
    preferredContactTime: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    doNotContact: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    appointmentReminders: boolean;
    treatmentUpdates: boolean;
    surveyRequests: boolean;
    preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    recallReminders: boolean;
    marketingCommunications: boolean;
    educationalContent: boolean;
    doNotContact: boolean;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
}, {
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    surveyRequests?: boolean | undefined;
    preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
    recallReminders?: boolean | undefined;
    marketingCommunications?: boolean | undefined;
    educationalContent?: boolean | undefined;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
    doNotContact?: boolean | undefined;
}>, {
    appointmentReminders: boolean;
    treatmentUpdates: boolean;
    surveyRequests: boolean;
    preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    recallReminders: boolean;
    marketingCommunications: boolean;
    educationalContent: boolean;
    doNotContact: boolean;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
}, {
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    surveyRequests?: boolean | undefined;
    preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
    recallReminders?: boolean | undefined;
    marketingCommunications?: boolean | undefined;
    educationalContent?: boolean | undefined;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
    doNotContact?: boolean | undefined;
}>, {
    appointmentReminders: boolean;
    treatmentUpdates: boolean;
    surveyRequests: boolean;
    preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    recallReminders: boolean;
    marketingCommunications: boolean;
    educationalContent: boolean;
    doNotContact: boolean;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
}, {
    enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    surveyRequests?: boolean | undefined;
    preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
    recallReminders?: boolean | undefined;
    marketingCommunications?: boolean | undefined;
    educationalContent?: boolean | undefined;
    preferredContactTime?: {
        start: string;
        end: string;
    } | undefined;
    doNotContact?: boolean | undefined;
}>;
export declare const ConsentTypeSchema: z.ZodEnum<["treatment", "privacy_notice", "hipaa", "financial_policy", "photography", "communication", "research", "minors"]>;
export declare const ConsentRecordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["treatment", "privacy_notice", "hipaa", "financial_policy", "photography", "communication", "research", "minors"]>;
    granted: z.ZodBoolean;
    grantedAt: z.ZodString;
    grantedBy: z.ZodString;
    revokedAt: z.ZodOptional<z.ZodString>;
    revokedBy: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    signatureType: z.ZodDefault<z.ZodEnum<["digital", "paper", "verbal"]>>;
    signatureData: z.ZodOptional<z.ZodString>;
    documentUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    version: string;
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    signatureType: "digital" | "paper" | "verbal";
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    documentUrl?: string | undefined;
}, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    version?: string | undefined;
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    signatureType?: "digital" | "paper" | "verbal" | undefined;
    documentUrl?: string | undefined;
}>, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    version: string;
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    signatureType: "digital" | "paper" | "verbal";
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    documentUrl?: string | undefined;
}, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    version?: string | undefined;
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    signatureType?: "digital" | "paper" | "verbal" | undefined;
    documentUrl?: string | undefined;
}>, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    version: string;
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    signatureType: "digital" | "paper" | "verbal";
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    documentUrl?: string | undefined;
}, {
    type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
    grantedAt: string;
    granted: boolean;
    grantedBy: string;
    version?: string | undefined;
    expiresAt?: string | undefined;
    notes?: string | undefined;
    signatureData?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    signatureType?: "digital" | "paper" | "verbal" | undefined;
    documentUrl?: string | undefined;
}>;
export declare const EmergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    relationship: z.ZodString;
    phoneNumber: z.ZodString;
    alternatePhoneNumber: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["home", "work", "billing", "shipping", "other"]>>;
        street1: z.ZodString;
        street2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }, {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    }>>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isPrimary: boolean;
    phoneNumber: string;
    relationship: string;
    email?: string | undefined;
    address?: {
        type: "billing" | "other" | "home" | "work" | "shipping";
        isPrimary: boolean;
        city: string;
        country: string;
        street1: string;
        state?: string | undefined;
        postalCode?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    alternatePhoneNumber?: string | undefined;
}, {
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary?: boolean | undefined;
    email?: string | undefined;
    address?: {
        city: string;
        street1: string;
        type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
        state?: string | undefined;
        isPrimary?: boolean | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        notes?: string | undefined;
        street2?: string | undefined;
    } | undefined;
    notes?: string | undefined;
    alternatePhoneNumber?: string | undefined;
}>;
export declare const PatientStatusSchema: z.ZodEnum<["active", "inactive", "archived", "deceased", "merged"]>;
export declare const PatientSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    patientNumber: z.ZodString;
    name: z.ZodObject<{
        firstName: z.ZodString;
        middleName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodString;
        preferredName: z.ZodOptional<z.ZodString>;
        suffix: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    }>;
    demographics: z.ZodEffects<z.ZodEffects<z.ZodObject<{
        dateOfBirth: z.ZodEffects<z.ZodString, string, string>;
        gender: z.ZodNativeEnum<typeof import("@dentalos/shared-types").Gender>;
        maritalStatus: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").MaritalStatus>>;
        ethnicity: z.ZodOptional<z.ZodEnum<["hispanic_latino", "not_hispanic_latino", "american_indian_alaska_native", "asian", "black_african_american", "native_hawaiian_pacific_islander", "white", "other", "prefer_not_to_say"]>>;
        race: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        preferredLanguage: z.ZodDefault<z.ZodString>;
        occupation: z.ZodOptional<z.ZodString>;
        employer: z.ZodOptional<z.ZodString>;
        socialSecurityNumber: z.ZodOptional<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }>, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }>, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }, {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    }>;
    contacts: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        phones: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["mobile", "home", "work", "fax", "other"]>>;
            number: z.ZodString;
            extension: z.ZodOptional<z.ZodString>;
            isPrimary: z.ZodDefault<z.ZodBoolean>;
            isVerified: z.ZodDefault<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }, {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }>, "many">>;
        emails: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["personal", "work", "other"]>>;
            address: z.ZodString;
            isPrimary: z.ZodDefault<z.ZodBoolean>;
            isVerified: z.ZodDefault<z.ZodBoolean>;
            verifiedAt: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }, {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }>, "many">>;
        addresses: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["home", "work", "billing", "shipping", "other"]>>;
            street1: z.ZodString;
            street2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodDefault<z.ZodString>;
            isPrimary: z.ZodDefault<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }, {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }>, "many">>;
        preferredContactMethod: z.ZodDefault<z.ZodNativeEnum<typeof ContactMethod>>;
    }, "strip", z.ZodTypeAny, {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    }, {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    }>, {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    }, {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    }>, {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    }, {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    }>, {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    }, {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    }>;
    emergencyContacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phoneNumber: z.ZodString;
        alternatePhoneNumber: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["home", "work", "billing", "shipping", "other"]>>;
            street1: z.ZodString;
            street2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodDefault<z.ZodString>;
            isPrimary: z.ZodDefault<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }, {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }>>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isPrimary: boolean;
        phoneNumber: string;
        relationship: string;
        email?: string | undefined;
        address?: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }, {
        name: string;
        phoneNumber: string;
        relationship: string;
        isPrimary?: boolean | undefined;
        email?: string | undefined;
        address?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }>, "many">>;
    insurance: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        primary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            provider: z.ZodString;
            policyNumber: z.ZodString;
            groupNumber: z.ZodOptional<z.ZodString>;
            subscriberName: z.ZodString;
            subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
            effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            planName: z.ZodOptional<z.ZodString>;
            planType: z.ZodOptional<z.ZodString>;
            insurancePhone: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>>;
        secondary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            provider: z.ZodString;
            policyNumber: z.ZodString;
            groupNumber: z.ZodOptional<z.ZodString>;
            subscriberName: z.ZodString;
            subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
            effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            planName: z.ZodOptional<z.ZodString>;
            planType: z.ZodOptional<z.ZodString>;
            insurancePhone: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>>;
        tertiary: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            provider: z.ZodString;
            policyNumber: z.ZodString;
            groupNumber: z.ZodOptional<z.ZodString>;
            subscriberName: z.ZodString;
            subscriberDateOfBirth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            relationshipToSubscriber: z.ZodDefault<z.ZodEnum<["self", "spouse", "child", "parent", "other"]>>;
            effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            terminationDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            coverageType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "tertiary"]>>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            planName: z.ZodOptional<z.ZodString>;
            planType: z.ZodOptional<z.ZodString>;
            insurancePhone: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>, {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }, {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }, {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }>, {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }, {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }>, {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }, {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    }>>;
    medical: z.ZodOptional<z.ZodObject<{
        allergies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            allergen: z.ZodString;
            severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
            reaction: z.ZodOptional<z.ZodString>;
            verifiedDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }, {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }>, "many">>;
        medications: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            dosage: z.ZodOptional<z.ZodString>;
            frequency: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            endDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            prescribedBy: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }, {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }>, "many">>;
        conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            diagnosedDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            status: z.ZodOptional<z.ZodEnum<["active", "resolved", "chronic"]>>;
            severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }, {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }>, "many">>;
        alerts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["allergy", "medical", "behavioral", "administrative"]>;
            message: z.ZodString;
            severity: z.ZodDefault<z.ZodEnum<["mild", "moderate", "severe", "life_threatening"]>>;
            createdAt: z.ZodString;
            createdBy: z.ZodString;
            expiresAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            severity: "mild" | "moderate" | "severe" | "life_threatening";
            createdBy: string;
            expiresAt?: string | undefined;
        }, {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            createdBy: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            expiresAt?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        conditions: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[];
        allergies: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[];
        medications: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[];
        alerts: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            severity: "mild" | "moderate" | "severe" | "life_threatening";
            createdBy: string;
            expiresAt?: string | undefined;
        }[];
    }, {
        conditions?: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[] | undefined;
        allergies?: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[] | undefined;
        medications?: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[] | undefined;
        alerts?: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            createdBy: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            expiresAt?: string | undefined;
        }[] | undefined;
    }>>;
    communicationPreferences: z.ZodEffects<z.ZodEffects<z.ZodObject<{
        preferredChannel: z.ZodDefault<z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>>;
        enabledChannels: z.ZodArray<z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>, "many">;
        appointmentReminders: z.ZodDefault<z.ZodBoolean>;
        recallReminders: z.ZodDefault<z.ZodBoolean>;
        treatmentUpdates: z.ZodDefault<z.ZodBoolean>;
        marketingCommunications: z.ZodDefault<z.ZodBoolean>;
        educationalContent: z.ZodDefault<z.ZodBoolean>;
        surveyRequests: z.ZodDefault<z.ZodBoolean>;
        preferredContactTime: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        doNotContact: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    }, {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    }>, {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    }, {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    }>, {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    }, {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    }>;
    consents: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["treatment", "privacy_notice", "hipaa", "financial_policy", "photography", "communication", "research", "minors"]>;
        granted: z.ZodBoolean;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
        revokedAt: z.ZodOptional<z.ZodString>;
        revokedBy: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        signatureType: z.ZodDefault<z.ZodEnum<["digital", "paper", "verbal"]>>;
        signatureData: z.ZodOptional<z.ZodString>;
        documentUrl: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }>, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }>, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }, {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }>, "many">>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "archived", "deceased", "merged"]>>;
    assignedProviderId: z.ZodOptional<z.ZodString>;
    referralSource: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodString;
    updatedBy: z.ZodString;
    deletedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "archived" | "deceased" | "merged";
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    tags: string[];
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    };
    emergencyContacts: {
        name: string;
        isPrimary: boolean;
        phoneNumber: string;
        relationship: string;
        email?: string | undefined;
        address?: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[];
    communicationPreferences: {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    };
    consents: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }[];
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    medical?: {
        conditions: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[];
        allergies: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[];
        medications: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[];
        alerts: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            severity: "mild" | "moderate" | "severe" | "life_threatening";
            createdBy: string;
            expiresAt?: string | undefined;
        }[];
    } | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}, {
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    };
    communicationPreferences: {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    };
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    emergencyContacts?: {
        name: string;
        phoneNumber: string;
        relationship: string;
        isPrimary?: boolean | undefined;
        email?: string | undefined;
        address?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[] | undefined;
    medical?: {
        conditions?: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[] | undefined;
        allergies?: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[] | undefined;
        medications?: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[] | undefined;
        alerts?: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            createdBy: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            expiresAt?: string | undefined;
        }[] | undefined;
    } | undefined;
    consents?: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }[] | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}>, {
    status: "active" | "inactive" | "archived" | "deceased" | "merged";
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    tags: string[];
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    };
    emergencyContacts: {
        name: string;
        isPrimary: boolean;
        phoneNumber: string;
        relationship: string;
        email?: string | undefined;
        address?: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[];
    communicationPreferences: {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    };
    consents: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }[];
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    medical?: {
        conditions: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[];
        allergies: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[];
        medications: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[];
        alerts: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            severity: "mild" | "moderate" | "severe" | "life_threatening";
            createdBy: string;
            expiresAt?: string | undefined;
        }[];
    } | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}, {
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    };
    communicationPreferences: {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    };
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    emergencyContacts?: {
        name: string;
        phoneNumber: string;
        relationship: string;
        isPrimary?: boolean | undefined;
        email?: string | undefined;
        address?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[] | undefined;
    medical?: {
        conditions?: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[] | undefined;
        allergies?: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[] | undefined;
        medications?: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[] | undefined;
        alerts?: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            createdBy: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            expiresAt?: string | undefined;
        }[] | undefined;
    } | undefined;
    consents?: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }[] | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}>, {
    status: "active" | "inactive" | "archived" | "deceased" | "merged";
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    tags: string[];
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        race: string[];
        preferredLanguage: string;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones: {
            number: string;
            type: "other" | "mobile" | "home" | "work" | "fax";
            isPrimary: boolean;
            isVerified: boolean;
            notes?: string | undefined;
            extension?: string | undefined;
        }[];
        emails: {
            type: "other" | "work" | "personal";
            isPrimary: boolean;
            address: string;
            isVerified: boolean;
            notes?: string | undefined;
            verifiedAt?: string | undefined;
        }[];
        addresses: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[];
        preferredContactMethod: ContactMethod;
    };
    emergencyContacts: {
        name: string;
        isPrimary: boolean;
        phoneNumber: string;
        relationship: string;
        email?: string | undefined;
        address?: {
            type: "billing" | "other" | "home" | "work" | "shipping";
            isPrimary: boolean;
            city: string;
            country: string;
            street1: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[];
    communicationPreferences: {
        appointmentReminders: boolean;
        treatmentUpdates: boolean;
        surveyRequests: boolean;
        preferredChannel: "email" | "phone" | "sms" | "portal" | "mail";
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        recallReminders: boolean;
        marketingCommunications: boolean;
        educationalContent: boolean;
        doNotContact: boolean;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
    };
    consents: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        version: string;
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        signatureType: "digital" | "paper" | "verbal";
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        documentUrl?: string | undefined;
    }[];
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            isActive: boolean;
            subscriberName: string;
            relationshipToSubscriber: "other" | "self" | "spouse" | "child" | "parent";
            coverageType: "primary" | "secondary" | "tertiary";
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            subscriberDateOfBirth?: string | undefined;
            terminationDate?: string | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    medical?: {
        conditions: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[];
        allergies: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[];
        medications: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[];
        alerts: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            severity: "mild" | "moderate" | "severe" | "life_threatening";
            createdBy: string;
            expiresAt?: string | undefined;
        }[];
    } | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}, {
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    updatedBy: string;
    createdBy: string;
    patientNumber: string;
    demographics: {
        dateOfBirth: string;
        gender: import("@dentalos/shared-types").Gender;
        photoUrl?: string | undefined;
        maritalStatus?: import("@dentalos/shared-types").MaritalStatus | undefined;
        ethnicity?: "hispanic_latino" | "not_hispanic_latino" | "american_indian_alaska_native" | "asian" | "black_african_american" | "native_hawaiian_pacific_islander" | "white" | "other" | "prefer_not_to_say" | undefined;
        race?: string[] | undefined;
        preferredLanguage?: string | undefined;
        occupation?: string | undefined;
        employer?: string | undefined;
        socialSecurityNumber?: string | undefined;
    };
    contacts: {
        phones?: {
            number: string;
            type?: "other" | "mobile" | "home" | "work" | "fax" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            extension?: string | undefined;
            isVerified?: boolean | undefined;
        }[] | undefined;
        emails?: {
            address: string;
            type?: "other" | "work" | "personal" | undefined;
            isPrimary?: boolean | undefined;
            notes?: string | undefined;
            isVerified?: boolean | undefined;
            verifiedAt?: string | undefined;
        }[] | undefined;
        addresses?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        }[] | undefined;
        preferredContactMethod?: ContactMethod | undefined;
    };
    communicationPreferences: {
        enabledChannels: ("email" | "phone" | "sms" | "portal" | "mail")[];
        appointmentReminders?: boolean | undefined;
        treatmentUpdates?: boolean | undefined;
        surveyRequests?: boolean | undefined;
        preferredChannel?: "email" | "phone" | "sms" | "portal" | "mail" | undefined;
        recallReminders?: boolean | undefined;
        marketingCommunications?: boolean | undefined;
        educationalContent?: boolean | undefined;
        preferredContactTime?: {
            start: string;
            end: string;
        } | undefined;
        doNotContact?: boolean | undefined;
    };
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    insurance?: {
        primary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        secondary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
        tertiary?: {
            provider: string;
            policyNumber: string;
            subscriberName: string;
            notes?: string | undefined;
            groupNumber?: string | undefined;
            effectiveDate?: string | undefined;
            isActive?: boolean | undefined;
            subscriberDateOfBirth?: string | undefined;
            relationshipToSubscriber?: "other" | "self" | "spouse" | "child" | "parent" | undefined;
            terminationDate?: string | undefined;
            coverageType?: "primary" | "secondary" | "tertiary" | undefined;
            planName?: string | undefined;
            planType?: string | undefined;
            insurancePhone?: string | undefined;
        } | undefined;
    } | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
    emergencyContacts?: {
        name: string;
        phoneNumber: string;
        relationship: string;
        isPrimary?: boolean | undefined;
        email?: string | undefined;
        address?: {
            city: string;
            street1: string;
            type?: "billing" | "other" | "home" | "work" | "shipping" | undefined;
            state?: string | undefined;
            isPrimary?: boolean | undefined;
            postalCode?: string | undefined;
            country?: string | undefined;
            notes?: string | undefined;
            street2?: string | undefined;
        } | undefined;
        notes?: string | undefined;
        alternatePhoneNumber?: string | undefined;
    }[] | undefined;
    medical?: {
        conditions?: {
            name: string;
            status?: "active" | "resolved" | "chronic" | undefined;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            diagnosedDate?: string | undefined;
        }[] | undefined;
        allergies?: {
            allergen: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            notes?: string | undefined;
            reaction?: string | undefined;
            verifiedDate?: string | undefined;
        }[] | undefined;
        medications?: {
            name: string;
            startDate?: string | undefined;
            endDate?: string | undefined;
            notes?: string | undefined;
            frequency?: string | undefined;
            dosage?: string | undefined;
            prescribedBy?: string | undefined;
        }[] | undefined;
        alerts?: {
            message: string;
            type: "allergy" | "medical" | "behavioral" | "administrative";
            createdAt: string;
            createdBy: string;
            severity?: "mild" | "moderate" | "severe" | "life_threatening" | undefined;
            expiresAt?: string | undefined;
        }[] | undefined;
    } | undefined;
    consents?: {
        type: "treatment" | "privacy_notice" | "hipaa" | "financial_policy" | "photography" | "communication" | "research" | "minors";
        grantedAt: string;
        granted: boolean;
        grantedBy: string;
        version?: string | undefined;
        expiresAt?: string | undefined;
        notes?: string | undefined;
        signatureData?: string | undefined;
        revokedAt?: string | undefined;
        revokedBy?: string | undefined;
        signatureType?: "digital" | "paper" | "verbal" | undefined;
        documentUrl?: string | undefined;
    }[] | undefined;
    assignedProviderId?: string | undefined;
    referralSource?: string | undefined;
}>;
export type PersonNameInput = z.input<typeof PersonNameSchema>;
export type PersonNameOutput = z.output<typeof PersonNameSchema>;
export type PhoneContactInput = z.input<typeof PhoneContactSchema>;
export type PhoneContactOutput = z.output<typeof PhoneContactSchema>;
export type EmailContactInput = z.input<typeof EmailContactSchema>;
export type EmailContactOutput = z.output<typeof EmailContactSchema>;
export type PhysicalAddressInput = z.input<typeof PhysicalAddressSchema>;
export type PhysicalAddressOutput = z.output<typeof PhysicalAddressSchema>;
export type PatientContactsInput = z.input<typeof PatientContactsSchema>;
export type PatientContactsOutput = z.output<typeof PatientContactsSchema>;
export type DemographicsInput = z.input<typeof DemographicsSchema>;
export type DemographicsOutput = z.output<typeof DemographicsSchema>;
export type MedicalFlagsInput = z.input<typeof MedicalFlagsSchema>;
export type MedicalFlagsOutput = z.output<typeof MedicalFlagsSchema>;
export type InsuranceInfoInput = z.input<typeof InsuranceInfoSchema>;
export type InsuranceInfoOutput = z.output<typeof InsuranceInfoSchema>;
export type PatientInsuranceInput = z.input<typeof PatientInsuranceSchema>;
export type PatientInsuranceOutput = z.output<typeof PatientInsuranceSchema>;
export type CommunicationPreferencesInput = z.input<typeof CommunicationPreferencesSchema>;
export type CommunicationPreferencesOutput = z.output<typeof CommunicationPreferencesSchema>;
export type ConsentRecordInput = z.input<typeof ConsentRecordSchema>;
export type ConsentRecordOutput = z.output<typeof ConsentRecordSchema>;
export type EmergencyContactInput = z.input<typeof EmergencyContactSchema>;
export type EmergencyContactOutput = z.output<typeof EmergencyContactSchema>;
export type PatientInput = z.input<typeof PatientSchema>;
export type PatientOutput = z.output<typeof PatientSchema>;
