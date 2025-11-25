"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRange = void 0;
const value_object_1 = require("./value-object");
class DateRange extends value_object_1.ValueObject {
    constructor(start, end) {
        super();
        this._start = new Date(start);
        this._end = new Date(end);
    }
    static create(start, end) {
        DateRange.validateDate(start, 'start');
        DateRange.validateDate(end, 'end');
        if (end < start) {
            throw new Error(`End date (${end.toISOString()}) cannot be before start date (${start.toISOString()})`);
        }
        return new DateRange(start, end);
    }
    static forDay(date) {
        DateRange.validateDate(date, 'date');
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return new DateRange(start, end);
    }
    static forMonth(year, month) {
        if (month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12');
        }
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        return new DateRange(start, end);
    }
    get start() {
        return new Date(this._start);
    }
    get end() {
        return new Date(this._end);
    }
    getDuration() {
        return this._end.getTime() - this._start.getTime();
    }
    getDurationDays() {
        const milliseconds = this.getDuration();
        return Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    }
    getDurationHours() {
        const milliseconds = this.getDuration();
        return Math.floor(milliseconds / (1000 * 60 * 60));
    }
    contains(date) {
        DateRange.validateDate(date, 'date');
        const time = date.getTime();
        return time >= this._start.getTime() && time <= this._end.getTime();
    }
    overlaps(other) {
        if (!(other instanceof DateRange)) {
            throw new Error('Argument must be a DateRange instance');
        }
        return (this._start.getTime() <= other._end.getTime() &&
            this._end.getTime() >= other._start.getTime());
    }
    includes(other) {
        if (!(other instanceof DateRange)) {
            throw new Error('Argument must be a DateRange instance');
        }
        return (this._start.getTime() <= other._start.getTime() &&
            this._end.getTime() >= other._end.getTime());
    }
    isBefore(other) {
        if (!(other instanceof DateRange)) {
            throw new Error('Argument must be a DateRange instance');
        }
        return this._end.getTime() < other._start.getTime();
    }
    isAfter(other) {
        if (!(other instanceof DateRange)) {
            throw new Error('Argument must be a DateRange instance');
        }
        return this._start.getTime() > other._end.getTime();
    }
    equals(other) {
        if (!(other instanceof DateRange)) {
            return false;
        }
        return (this._start.getTime() === other._start.getTime() &&
            this._end.getTime() === other._end.getTime());
    }
    toString() {
        return `${this._start.toISOString()} to ${this._end.toISOString()}`;
    }
    static validateDate(date, paramName) {
        value_object_1.ValueObject.checkNotNull(date, paramName);
        if (!(date instanceof Date)) {
            throw new Error(`${paramName} must be a Date instance`);
        }
        if (isNaN(date.getTime())) {
            throw new Error(`${paramName} is an invalid date`);
        }
    }
}
exports.DateRange = DateRange;
//# sourceMappingURL=date-range.js.map