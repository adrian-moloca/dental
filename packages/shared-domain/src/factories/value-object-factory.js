"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObjectFactory = void 0;
const email_1 = require("../value-objects/email");
const phone_1 = require("../value-objects/phone");
const money_1 = require("../value-objects/money");
const address_1 = require("../value-objects/address");
const person_name_1 = require("../value-objects/person-name");
const date_range_1 = require("../value-objects/date-range");
const time_slot_1 = require("../value-objects/time-slot");
class ValueObjectFactory {
    static createEmail(email) {
        return email_1.Email.create(email);
    }
    static createEmailSafe(email) {
        try {
            return {
                success: true,
                value: email_1.Email.create(email),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createPhone(phone) {
        return phone_1.Phone.create(phone);
    }
    static createPhoneSafe(phone) {
        try {
            return {
                success: true,
                value: phone_1.Phone.create(phone),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createMoney(amount, currency) {
        return money_1.Money.create(amount, currency);
    }
    static createMoneySafe(amount, currency) {
        try {
            return {
                success: true,
                value: money_1.Money.create(amount, currency),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createZeroMoney(currency) {
        return money_1.Money.zero(currency);
    }
    static createAddress(input) {
        return address_1.Address.create(input);
    }
    static createAddressSafe(input) {
        try {
            return {
                success: true,
                value: address_1.Address.create(input),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createPersonName(firstName, lastName, middleName) {
        return person_name_1.PersonName.create(firstName, lastName, middleName);
    }
    static createPersonNameSafe(firstName, lastName, middleName) {
        try {
            return {
                success: true,
                value: person_name_1.PersonName.create(firstName, lastName, middleName),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createDateRange(start, end) {
        return date_range_1.DateRange.create(start, end);
    }
    static createDateRangeSafe(start, end) {
        try {
            return {
                success: true,
                value: date_range_1.DateRange.create(start, end),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createDateRangeForDay(date) {
        return date_range_1.DateRange.forDay(date);
    }
    static createDateRangeForMonth(year, month) {
        return date_range_1.DateRange.forMonth(year, month);
    }
    static createTimeSlot(startTime, endTime) {
        return time_slot_1.TimeSlot.create(startTime, endTime);
    }
    static createTimeSlotSafe(startTime, endTime) {
        try {
            return {
                success: true,
                value: time_slot_1.TimeSlot.create(startTime, endTime),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static createTimeSlotWithDuration(startTime, durationMinutes) {
        return time_slot_1.TimeSlot.withDuration(startTime, durationMinutes);
    }
    static createTimeSlotWithDurationSafe(startTime, durationMinutes) {
        try {
            return {
                success: true,
                value: time_slot_1.TimeSlot.withDuration(startTime, durationMinutes),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.ValueObjectFactory = ValueObjectFactory;
//# sourceMappingURL=value-object-factory.js.map