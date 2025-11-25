"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSlot = void 0;
const value_object_1 = require("./value-object");
class TimeSlot extends value_object_1.ValueObject {
    constructor(startTime, endTime) {
        super();
        this._startTime = new Date(startTime);
        this._endTime = new Date(endTime);
    }
    static create(startTime, endTime) {
        TimeSlot.validateTime(startTime, 'startTime');
        TimeSlot.validateTime(endTime, 'endTime');
        if (endTime <= startTime) {
            throw new Error(`End time (${endTime.toISOString()}) must be after start time (${startTime.toISOString()})`);
        }
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        if (durationMinutes < TimeSlot.MIN_DURATION_MINUTES) {
            throw new Error(`Time slot duration must be at least ${TimeSlot.MIN_DURATION_MINUTES} minute(s)`);
        }
        const maxDurationMinutes = TimeSlot.MAX_DURATION_HOURS * 60;
        if (durationMinutes > maxDurationMinutes) {
            throw new Error(`Time slot duration cannot exceed ${TimeSlot.MAX_DURATION_HOURS} hours`);
        }
        return new TimeSlot(startTime, endTime);
    }
    static withDuration(startTime, durationMinutes) {
        TimeSlot.validateTime(startTime, 'startTime');
        if (typeof durationMinutes !== 'number' || !isFinite(durationMinutes)) {
            throw new Error('Duration must be a finite number');
        }
        if (durationMinutes < TimeSlot.MIN_DURATION_MINUTES) {
            throw new Error(`Duration must be at least ${TimeSlot.MIN_DURATION_MINUTES} minute(s)`);
        }
        const maxDurationMinutes = TimeSlot.MAX_DURATION_HOURS * 60;
        if (durationMinutes > maxDurationMinutes) {
            throw new Error(`Duration cannot exceed ${TimeSlot.MAX_DURATION_HOURS} hours`);
        }
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        return new TimeSlot(startTime, endTime);
    }
    get startTime() {
        return new Date(this._startTime);
    }
    get endTime() {
        return new Date(this._endTime);
    }
    getDuration() {
        return this._endTime.getTime() - this._startTime.getTime();
    }
    getDurationMinutes() {
        return Math.floor(this.getDuration() / (1000 * 60));
    }
    getDurationHours() {
        return this.getDurationMinutes() / 60;
    }
    isWithin(time) {
        TimeSlot.validateTime(time, 'time');
        const timeMs = time.getTime();
        return (timeMs >= this._startTime.getTime() && timeMs < this._endTime.getTime());
    }
    overlaps(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Argument must be a TimeSlot instance');
        }
        return (this._startTime.getTime() < other._endTime.getTime() &&
            this._endTime.getTime() > other._startTime.getTime());
    }
    contains(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Argument must be a TimeSlot instance');
        }
        return (this._startTime.getTime() <= other._startTime.getTime() &&
            this._endTime.getTime() >= other._endTime.getTime());
    }
    isBefore(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Argument must be a TimeSlot instance');
        }
        return this._endTime.getTime() <= other._startTime.getTime();
    }
    isAfter(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Argument must be a TimeSlot instance');
        }
        return this._startTime.getTime() >= other._endTime.getTime();
    }
    isSameDay(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Argument must be a TimeSlot instance');
        }
        const thisDate = this._startTime.toISOString().split('T')[0];
        const otherDate = other._startTime.toISOString().split('T')[0];
        return thisDate === otherDate;
    }
    equals(other) {
        if (!(other instanceof TimeSlot)) {
            return false;
        }
        return (this._startTime.getTime() === other._startTime.getTime() &&
            this._endTime.getTime() === other._endTime.getTime());
    }
    toString() {
        return `${this._startTime.toISOString()} - ${this._endTime.toISOString()}`;
    }
    toFormattedString(locale = 'en-US', timeZone = 'UTC') {
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            timeZone,
        };
        const formatter = new Intl.DateTimeFormat(locale, options);
        return `${formatter.format(this._startTime)} - ${formatter.format(this._endTime)}`;
    }
    static validateTime(time, paramName) {
        value_object_1.ValueObject.checkNotNull(time, paramName);
        if (!(time instanceof Date)) {
            throw new Error(`${paramName} must be a Date instance`);
        }
        if (isNaN(time.getTime())) {
            throw new Error(`${paramName} is an invalid date`);
        }
    }
}
exports.TimeSlot = TimeSlot;
TimeSlot.MIN_DURATION_MINUTES = 1;
TimeSlot.MAX_DURATION_HOURS = 24;
//# sourceMappingURL=time-slot.js.map