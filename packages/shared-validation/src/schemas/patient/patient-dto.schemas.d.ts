import { z } from 'zod';
export declare const CreatePatientDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    patientNumber: z.ZodOptional<z.ZodString>;
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
        preferredContactMethod: z.ZodDefault<z.ZodNativeEnum<typeof import("@dentalos/shared-types").ContactMethod>>;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
    assignedProviderId: z.ZodOptional<z.ZodString>;
    referralSource: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    tenantId: string;
    tags: string[];
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
    patientNumber?: string | undefined;
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
    tenantId: string;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
    clinicId?: string | undefined;
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
    patientNumber?: string | undefined;
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
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    tenantId: string;
    tags: string[];
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
    patientNumber?: string | undefined;
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
    tenantId: string;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
    clinicId?: string | undefined;
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
    patientNumber?: string | undefined;
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
    organizationId: string;
    name: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    };
    tenantId: string;
    tags: string[];
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
    patientNumber?: string | undefined;
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
    tenantId: string;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
    clinicId?: string | undefined;
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
    patientNumber?: string | undefined;
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
export declare const UpdatePatientDtoSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodObject<{
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
    }>>;
    demographics: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
    }>>;
    contacts: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
        preferredContactMethod: z.ZodDefault<z.ZodNativeEnum<typeof import("@dentalos/shared-types").ContactMethod>>;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
    }>>;
    emergencyContacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    communicationPreferences: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
    }>>;
    consents: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "archived", "deceased", "merged"]>>;
    assignedProviderId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    referralSource: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    version: number;
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    name?: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    } | undefined;
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
    tags?: string[] | undefined;
    notes?: string | undefined;
    demographics?: {
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
    } | undefined;
    contacts?: {
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
    } | undefined;
    emergencyContacts?: {
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
    }[] | undefined;
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
    communicationPreferences?: {
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
    } | undefined;
    consents?: {
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
    }[] | undefined;
    assignedProviderId?: string | null | undefined;
    referralSource?: string | undefined;
}, {
    version: number;
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    name?: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    } | undefined;
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
    demographics?: {
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
    } | undefined;
    contacts?: {
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
    } | undefined;
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
    communicationPreferences?: {
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
    assignedProviderId?: string | null | undefined;
    referralSource?: string | undefined;
}>, {
    version: number;
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    name?: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    } | undefined;
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
    tags?: string[] | undefined;
    notes?: string | undefined;
    demographics?: {
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
    } | undefined;
    contacts?: {
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
        preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
    } | undefined;
    emergencyContacts?: {
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
    }[] | undefined;
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
    communicationPreferences?: {
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
    } | undefined;
    consents?: {
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
    }[] | undefined;
    assignedProviderId?: string | null | undefined;
    referralSource?: string | undefined;
}, {
    version: number;
    status?: "active" | "inactive" | "archived" | "deceased" | "merged" | undefined;
    name?: {
        firstName: string;
        lastName: string;
        title?: string | undefined;
        middleName?: string | undefined;
        preferredName?: string | undefined;
        suffix?: string | undefined;
    } | undefined;
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
    demographics?: {
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
    } | undefined;
    contacts?: {
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
        preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
    } | undefined;
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
    communicationPreferences?: {
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
    assignedProviderId?: string | null | undefined;
    referralSource?: string | undefined;
}>;
export declare const PatientQueryDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    tenantId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    includeAllClinics: z.ZodDefault<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    patientNumber: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    updatedAfter: z.ZodOptional<z.ZodString>;
    updatedBefore: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["active", "inactive", "archived", "deceased", "merged"]>, "many">>;
    hasInsurance: z.ZodOptional<z.ZodBoolean>;
    hasActiveConsent: z.ZodOptional<z.ZodBoolean>;
    assignedProviderId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    matchAllTags: z.ZodDefault<z.ZodBoolean>;
    minAge: z.ZodOptional<z.ZodNumber>;
    maxAge: z.ZodOptional<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["patientNumber", "lastName", "firstName", "dateOfBirth", "createdAt", "updatedAt", "lastVisit"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    includeDeleted: z.ZodDefault<z.ZodBoolean>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    page: number;
    sortBy: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit";
    sortOrder: "asc" | "desc";
    pageSize: number;
    includeDeleted: boolean;
    includeAllClinics: boolean;
    matchAllTags: boolean;
    includeInactive: boolean;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    minAge?: number | undefined;
}, {
    organizationId: string;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    pageSize?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    includeDeleted?: boolean | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    includeAllClinics?: boolean | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    matchAllTags?: boolean | undefined;
    minAge?: number | undefined;
    includeInactive?: boolean | undefined;
}>, {
    organizationId: string;
    page: number;
    sortBy: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit";
    sortOrder: "asc" | "desc";
    pageSize: number;
    includeDeleted: boolean;
    includeAllClinics: boolean;
    matchAllTags: boolean;
    includeInactive: boolean;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    minAge?: number | undefined;
}, {
    organizationId: string;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    pageSize?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    includeDeleted?: boolean | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    includeAllClinics?: boolean | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    matchAllTags?: boolean | undefined;
    minAge?: number | undefined;
    includeInactive?: boolean | undefined;
}>, {
    organizationId: string;
    page: number;
    sortBy: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit";
    sortOrder: "asc" | "desc";
    pageSize: number;
    includeDeleted: boolean;
    includeAllClinics: boolean;
    matchAllTags: boolean;
    includeInactive: boolean;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    minAge?: number | undefined;
}, {
    organizationId: string;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    pageSize?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    includeDeleted?: boolean | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    includeAllClinics?: boolean | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    matchAllTags?: boolean | undefined;
    minAge?: number | undefined;
    includeInactive?: boolean | undefined;
}>, {
    organizationId: string;
    page: number;
    sortBy: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit";
    sortOrder: "asc" | "desc";
    pageSize: number;
    includeDeleted: boolean;
    includeAllClinics: boolean;
    matchAllTags: boolean;
    includeInactive: boolean;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    minAge?: number | undefined;
}, {
    organizationId: string;
    status?: ("active" | "inactive" | "archived" | "deceased" | "merged")[] | undefined;
    clinicId?: string | undefined;
    tenantId?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    maxAge?: number | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "dateOfBirth" | "patientNumber" | "lastVisit" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: string | undefined;
    pageSize?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    includeDeleted?: boolean | undefined;
    patientNumber?: string | undefined;
    assignedProviderId?: string | undefined;
    includeAllClinics?: boolean | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
    hasInsurance?: boolean | undefined;
    hasActiveConsent?: boolean | undefined;
    matchAllTags?: boolean | undefined;
    minAge?: number | undefined;
    includeInactive?: boolean | undefined;
}>;
export declare const RelationshipTypeSchema: z.ZodEnum<["spouse", "parent", "child", "sibling", "guardian", "grandparent", "grandchild", "partner", "other"]>;
export declare const CreateRelationshipDtoSchema: z.ZodEffects<z.ZodObject<{
    patientId: z.ZodString;
    relatedPatientId: z.ZodString;
    relationshipType: z.ZodEnum<["spouse", "parent", "child", "sibling", "guardian", "grandparent", "grandchild", "partner", "other"]>;
    isPrimaryContact: z.ZodDefault<z.ZodBoolean>;
    isEmergencyContact: z.ZodDefault<z.ZodBoolean>;
    canAccessRecords: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    relatedPatientId: string;
    relationshipType: "other" | "spouse" | "child" | "parent" | "sibling" | "guardian" | "grandparent" | "grandchild" | "partner";
    isPrimaryContact: boolean;
    isEmergencyContact: boolean;
    canAccessRecords: boolean;
    notes?: string | undefined;
}, {
    patientId: string;
    relatedPatientId: string;
    relationshipType: "other" | "spouse" | "child" | "parent" | "sibling" | "guardian" | "grandparent" | "grandchild" | "partner";
    notes?: string | undefined;
    isPrimaryContact?: boolean | undefined;
    isEmergencyContact?: boolean | undefined;
    canAccessRecords?: boolean | undefined;
}>, {
    patientId: string;
    relatedPatientId: string;
    relationshipType: "other" | "spouse" | "child" | "parent" | "sibling" | "guardian" | "grandparent" | "grandchild" | "partner";
    isPrimaryContact: boolean;
    isEmergencyContact: boolean;
    canAccessRecords: boolean;
    notes?: string | undefined;
}, {
    patientId: string;
    relatedPatientId: string;
    relationshipType: "other" | "spouse" | "child" | "parent" | "sibling" | "guardian" | "grandparent" | "grandchild" | "partner";
    notes?: string | undefined;
    isPrimaryContact?: boolean | undefined;
    isEmergencyContact?: boolean | undefined;
    canAccessRecords?: boolean | undefined;
}>;
export declare const MergePatientsDtoSchema: z.ZodEffects<z.ZodObject<{
    sourcePatientId: z.ZodString;
    targetPatientId: z.ZodString;
    organizationId: z.ZodString;
    conflictResolution: z.ZodDefault<z.ZodObject<{
        preferSourceDemographics: z.ZodDefault<z.ZodBoolean>;
        preferSourceContacts: z.ZodDefault<z.ZodBoolean>;
        mergeInsurance: z.ZodDefault<z.ZodBoolean>;
        mergeMedicalHistory: z.ZodDefault<z.ZodBoolean>;
        mergeAppointments: z.ZodDefault<z.ZodBoolean>;
        mergeTreatments: z.ZodDefault<z.ZodBoolean>;
        mergeDocuments: z.ZodDefault<z.ZodBoolean>;
        mergeTags: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        preferSourceDemographics: boolean;
        preferSourceContacts: boolean;
        mergeInsurance: boolean;
        mergeMedicalHistory: boolean;
        mergeAppointments: boolean;
        mergeTreatments: boolean;
        mergeDocuments: boolean;
        mergeTags: boolean;
    }, {
        preferSourceDemographics?: boolean | undefined;
        preferSourceContacts?: boolean | undefined;
        mergeInsurance?: boolean | undefined;
        mergeMedicalHistory?: boolean | undefined;
        mergeAppointments?: boolean | undefined;
        mergeTreatments?: boolean | undefined;
        mergeDocuments?: boolean | undefined;
        mergeTags?: boolean | undefined;
    }>>;
    reason: z.ZodString;
    performedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    reason: string;
    performedBy: string;
    sourcePatientId: string;
    targetPatientId: string;
    conflictResolution: {
        preferSourceDemographics: boolean;
        preferSourceContacts: boolean;
        mergeInsurance: boolean;
        mergeMedicalHistory: boolean;
        mergeAppointments: boolean;
        mergeTreatments: boolean;
        mergeDocuments: boolean;
        mergeTags: boolean;
    };
}, {
    organizationId: string;
    reason: string;
    performedBy: string;
    sourcePatientId: string;
    targetPatientId: string;
    conflictResolution?: {
        preferSourceDemographics?: boolean | undefined;
        preferSourceContacts?: boolean | undefined;
        mergeInsurance?: boolean | undefined;
        mergeMedicalHistory?: boolean | undefined;
        mergeAppointments?: boolean | undefined;
        mergeTreatments?: boolean | undefined;
        mergeDocuments?: boolean | undefined;
        mergeTags?: boolean | undefined;
    } | undefined;
}>, {
    organizationId: string;
    reason: string;
    performedBy: string;
    sourcePatientId: string;
    targetPatientId: string;
    conflictResolution: {
        preferSourceDemographics: boolean;
        preferSourceContacts: boolean;
        mergeInsurance: boolean;
        mergeMedicalHistory: boolean;
        mergeAppointments: boolean;
        mergeTreatments: boolean;
        mergeDocuments: boolean;
        mergeTags: boolean;
    };
}, {
    organizationId: string;
    reason: string;
    performedBy: string;
    sourcePatientId: string;
    targetPatientId: string;
    conflictResolution?: {
        preferSourceDemographics?: boolean | undefined;
        preferSourceContacts?: boolean | undefined;
        mergeInsurance?: boolean | undefined;
        mergeMedicalHistory?: boolean | undefined;
        mergeAppointments?: boolean | undefined;
        mergeTreatments?: boolean | undefined;
        mergeDocuments?: boolean | undefined;
        mergeTags?: boolean | undefined;
    } | undefined;
}>;
export declare const ExportFormatSchema: z.ZodEnum<["json", "csv", "pdf", "hl7", "fhir"]>;
export declare const ExportPatientDtoSchema: z.ZodObject<{
    patientIds: z.ZodArray<z.ZodString, "many">;
    organizationId: z.ZodString;
    format: z.ZodDefault<z.ZodEnum<["json", "csv", "pdf", "hl7", "fhir"]>>;
    includeFields: z.ZodOptional<z.ZodArray<z.ZodEnum<["demographics", "contacts", "insurance", "medical", "appointments", "treatments", "documents", "consents", "notes"]>, "many">>;
    excludeFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    anonymize: z.ZodDefault<z.ZodBoolean>;
    includeAuditTrail: z.ZodDefault<z.ZodBoolean>;
    requestedBy: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    format: "json" | "csv" | "pdf" | "hl7" | "fhir";
    requestedBy: string;
    patientIds: string[];
    anonymize: boolean;
    includeAuditTrail: boolean;
    purpose: string;
    includeFields?: ("insurance" | "notes" | "demographics" | "contacts" | "medical" | "consents" | "appointments" | "treatments" | "documents")[] | undefined;
    excludeFields?: string[] | undefined;
}, {
    organizationId: string;
    requestedBy: string;
    patientIds: string[];
    purpose: string;
    format?: "json" | "csv" | "pdf" | "hl7" | "fhir" | undefined;
    includeFields?: ("insurance" | "notes" | "demographics" | "contacts" | "medical" | "consents" | "appointments" | "treatments" | "documents")[] | undefined;
    excludeFields?: string[] | undefined;
    anonymize?: boolean | undefined;
    includeAuditTrail?: boolean | undefined;
}>;
export declare const AnonymizePatientDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    organizationId: z.ZodString;
    reason: z.ZodString;
    requestedBy: z.ZodString;
    retainFields: z.ZodDefault<z.ZodArray<z.ZodEnum<["dateOfBirth", "gender", "appointmentHistory", "treatmentHistory", "billingHistory"]>, "many">>;
    performedBy: z.ZodString;
    legalBasis: z.ZodString;
    confirmIrreversible: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
    requestedBy: string;
    retainFields: ("dateOfBirth" | "gender" | "appointmentHistory" | "treatmentHistory" | "billingHistory")[];
    legalBasis: string;
    confirmIrreversible: true;
}, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
    requestedBy: string;
    legalBasis: string;
    confirmIrreversible: true;
    retainFields?: ("dateOfBirth" | "gender" | "appointmentHistory" | "treatmentHistory" | "billingHistory")[] | undefined;
}>;
export declare const ImportSourceSchema: z.ZodEnum<["csv", "excel", "hl7", "fhir", "legacy_system"]>;
export declare const BulkImportPatientDtoSchema: z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["csv", "excel", "hl7", "fhir", "legacy_system"]>;
    patients: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clinicId: z.ZodOptional<z.ZodString>;
        patientNumber: z.ZodOptional<z.ZodString>;
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
            preferredContactMethod: z.ZodDefault<z.ZodNativeEnum<typeof import("@dentalos/shared-types").ContactMethod>>;
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        assignedProviderId: z.ZodOptional<z.ZodString>;
        referralSource: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        name: {
            firstName: string;
            lastName: string;
            title?: string | undefined;
            middleName?: string | undefined;
            preferredName?: string | undefined;
            suffix?: string | undefined;
        };
        tenantId: string;
        tags: string[];
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        patientNumber?: string | undefined;
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
        tenantId: string;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        clinicId?: string | undefined;
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
        patientNumber?: string | undefined;
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
        organizationId: string;
        name: {
            firstName: string;
            lastName: string;
            title?: string | undefined;
            middleName?: string | undefined;
            preferredName?: string | undefined;
            suffix?: string | undefined;
        };
        tenantId: string;
        tags: string[];
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        patientNumber?: string | undefined;
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
        tenantId: string;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        clinicId?: string | undefined;
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
        patientNumber?: string | undefined;
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
        organizationId: string;
        name: {
            firstName: string;
            lastName: string;
            title?: string | undefined;
            middleName?: string | undefined;
            preferredName?: string | undefined;
            suffix?: string | undefined;
        };
        tenantId: string;
        tags: string[];
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        patientNumber?: string | undefined;
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
        tenantId: string;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        clinicId?: string | undefined;
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
        patientNumber?: string | undefined;
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
    }>, "many">;
    importedBy: z.ZodString;
    validateOnly: z.ZodDefault<z.ZodBoolean>;
    skipDuplicates: z.ZodDefault<z.ZodBoolean>;
    updateExisting: z.ZodDefault<z.ZodBoolean>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    source: "csv" | "hl7" | "fhir" | "excel" | "legacy_system";
    organizationId: string;
    dryRun: boolean;
    patients: {
        organizationId: string;
        name: {
            firstName: string;
            lastName: string;
            title?: string | undefined;
            middleName?: string | undefined;
            preferredName?: string | undefined;
            suffix?: string | undefined;
        };
        tenantId: string;
        tags: string[];
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
            preferredContactMethod: import("@dentalos/shared-types").ContactMethod;
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
        patientNumber?: string | undefined;
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
    }[];
    importedBy: string;
    validateOnly: boolean;
    skipDuplicates: boolean;
    updateExisting: boolean;
    clinicId?: string | undefined;
}, {
    source: "csv" | "hl7" | "fhir" | "excel" | "legacy_system";
    organizationId: string;
    patients: {
        organizationId: string;
        name: {
            firstName: string;
            lastName: string;
            title?: string | undefined;
            middleName?: string | undefined;
            preferredName?: string | undefined;
            suffix?: string | undefined;
        };
        tenantId: string;
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
            preferredContactMethod?: import("@dentalos/shared-types").ContactMethod | undefined;
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
        clinicId?: string | undefined;
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
        patientNumber?: string | undefined;
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
    }[];
    importedBy: string;
    clinicId?: string | undefined;
    dryRun?: boolean | undefined;
    validateOnly?: boolean | undefined;
    skipDuplicates?: boolean | undefined;
    updateExisting?: boolean | undefined;
}>;
export declare const ArchivePatientDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    organizationId: z.ZodString;
    reason: z.ZodString;
    performedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
}, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
}>;
export declare const RestorePatientDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    organizationId: z.ZodString;
    reason: z.ZodString;
    performedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
}, {
    organizationId: string;
    reason: string;
    patientId: string;
    performedBy: string;
}>;
export declare const SendPatientCommunicationDtoSchema: z.ZodEffects<z.ZodObject<{
    patientId: z.ZodString;
    organizationId: z.ZodString;
    channel: z.ZodEnum<["email", "sms", "phone", "portal", "mail"]>;
    subject: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    templateId: z.ZodOptional<z.ZodString>;
    sendAt: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    requiresConsent: z.ZodDefault<z.ZodBoolean>;
    sentBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    organizationId: string;
    priority: "low" | "normal" | "high" | "urgent";
    patientId: string;
    channel: "email" | "phone" | "sms" | "portal" | "mail";
    requiresConsent: boolean;
    sentBy: string;
    subject?: string | undefined;
    templateId?: string | undefined;
    sendAt?: string | undefined;
}, {
    message: string;
    organizationId: string;
    patientId: string;
    channel: "email" | "phone" | "sms" | "portal" | "mail";
    sentBy: string;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    subject?: string | undefined;
    templateId?: string | undefined;
    sendAt?: string | undefined;
    requiresConsent?: boolean | undefined;
}>, {
    message: string;
    organizationId: string;
    priority: "low" | "normal" | "high" | "urgent";
    patientId: string;
    channel: "email" | "phone" | "sms" | "portal" | "mail";
    requiresConsent: boolean;
    sentBy: string;
    subject?: string | undefined;
    templateId?: string | undefined;
    sendAt?: string | undefined;
}, {
    message: string;
    organizationId: string;
    patientId: string;
    channel: "email" | "phone" | "sms" | "portal" | "mail";
    sentBy: string;
    priority?: "low" | "normal" | "high" | "urgent" | undefined;
    subject?: string | undefined;
    templateId?: string | undefined;
    sendAt?: string | undefined;
    requiresConsent?: boolean | undefined;
}>;
export type CreatePatientDtoInput = z.input<typeof CreatePatientDtoSchema>;
export type CreatePatientDtoOutput = z.output<typeof CreatePatientDtoSchema>;
export type UpdatePatientDtoInput = z.input<typeof UpdatePatientDtoSchema>;
export type UpdatePatientDtoOutput = z.output<typeof UpdatePatientDtoSchema>;
export type PatientQueryDtoInput = z.input<typeof PatientQueryDtoSchema>;
export type PatientQueryDtoOutput = z.output<typeof PatientQueryDtoSchema>;
export type CreateRelationshipDtoInput = z.input<typeof CreateRelationshipDtoSchema>;
export type CreateRelationshipDtoOutput = z.output<typeof CreateRelationshipDtoSchema>;
export type MergePatientsDtoInput = z.input<typeof MergePatientsDtoSchema>;
export type MergePatientsDtoOutput = z.output<typeof MergePatientsDtoSchema>;
export type ExportPatientDtoInput = z.input<typeof ExportPatientDtoSchema>;
export type ExportPatientDtoOutput = z.output<typeof ExportPatientDtoSchema>;
export type AnonymizePatientDtoInput = z.input<typeof AnonymizePatientDtoSchema>;
export type AnonymizePatientDtoOutput = z.output<typeof AnonymizePatientDtoSchema>;
export type BulkImportPatientDtoInput = z.input<typeof BulkImportPatientDtoSchema>;
export type BulkImportPatientDtoOutput = z.output<typeof BulkImportPatientDtoSchema>;
export type ArchivePatientDtoInput = z.input<typeof ArchivePatientDtoSchema>;
export type ArchivePatientDtoOutput = z.output<typeof ArchivePatientDtoSchema>;
export type RestorePatientDtoInput = z.input<typeof RestorePatientDtoSchema>;
export type RestorePatientDtoOutput = z.output<typeof RestorePatientDtoSchema>;
export type SendPatientCommunicationDtoInput = z.input<typeof SendPatientCommunicationDtoSchema>;
export type SendPatientCommunicationDtoOutput = z.output<typeof SendPatientCommunicationDtoSchema>;
