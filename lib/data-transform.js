"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformVenue = transformVenue;
exports.transformVenues = transformVenues;
exports.transformBooking = transformBooking;
exports.transformBookings = transformBookings;
exports.transformParkingArea = transformParkingArea;
exports.transformParkingAreas = transformParkingAreas;
exports.transformRoad = transformRoad;
exports.transformRoads = transformRoads;
exports.transformTriggerLog = transformTriggerLog;
exports.transformTriggerLogs = transformTriggerLogs;
exports.transformOverrideLog = transformOverrideLog;
exports.transformOverrideLogs = transformOverrideLogs;
// Transform snake_case to camelCase for venues
function transformVenue(venue) {
    return {
        id: venue.id,
        name: venue.name,
        type: venue.type,
        maxPopulation: venue.max_population,
        ownerName: venue.owner_name,
        ownerContact: venue.owner_contact,
        address: venue.address,
        aboutVenue: venue.about_venue,
        features: venue.features || [],
        activities: venue.activities || [],
        image: venue.image,
        createdAt: venue.created_at
    };
}
// Transform multiple venues
function transformVenues(venues) {
    return venues.map(transformVenue);
}
// Transform snake_case to camelCase for bookings
function transformBooking(booking) {
    return {
        id: booking.id,
        venueId: booking.venue_id,
        title: booking.title,
        description: booking.description,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        expectedAttendance: booking.expected_attendance,
        riskLevel: booking.risk_level,
        amplifiedNoise: booking.amplified_noise,
        liquorLicense: booking.liquor_license,
        organizer: booking.organizer,
        status: booking.status,
        conflicts: booking.conflicts || [],
        overrideReason: booking.override_reason,
        overriddenBy: booking.overridden_by,
        overriddenAt: booking.overridden_at,
        createdBy: booking.created_by,
        createdAt: booking.created_at
    };
}
// Transform multiple bookings
function transformBookings(bookings) {
    return bookings.map(transformBooking);
}
// Transform snake_case to camelCase for parking areas
function transformParkingArea(parkingArea) {
    return {
        id: parkingArea.id,
        name: parkingArea.name,
        totalSpaces: parkingArea.total_spaces,
        allocatedSpaces: parkingArea.allocated_spaces,
        location: parkingArea.location,
        linkedVenueIds: parkingArea.linked_venue_ids
    };
}
function transformParkingAreas(parkingAreas) {
    return parkingAreas.map(transformParkingArea);
}
// Transform snake_case to camelCase for roads
function transformRoad(road) {
    return {
        id: road.id,
        name: road.name,
        status: road.status,
        closureReason: road.closure_reason,
        closureStart: road.closure_start,
        closureEnd: road.closure_end,
        linkedVenueIds: road.linked_venue_ids
    };
}
function transformRoads(roads) {
    return roads.map(transformRoad);
}
// Transform snake_case to camelCase for trigger logs
function transformTriggerLog(log) {
    return {
        id: log.id,
        bookingId: log.booking_id,
        type: log.trigger_type,
        severity: log.severity,
        message: log.message,
        timestamp: log.created_at,
        resolved: log.resolved || false
    };
}
function transformTriggerLogs(logs) {
    return logs.map(transformTriggerLog);
}
// Transform snake_case to camelCase for override logs
function transformOverrideLog(log) {
    return {
        id: log.id,
        bookingId: log.booking_id,
        operatorName: log.operator_name || log.overridden_by,
        reason: log.reason,
        conflicts: log.conflicts || [],
        timestamp: log.created_at
    };
}
function transformOverrideLogs(logs) {
    return logs.map(transformOverrideLog);
}
