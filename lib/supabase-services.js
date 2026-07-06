"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVenues = fetchVenues;
exports.createVenue = createVenue;
exports.updateVenue = updateVenue;
exports.deleteVenue = deleteVenue;
exports.fetchBookings = fetchBookings;
exports.createBooking = createBooking;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
exports.createTriggerLog = createTriggerLog;
exports.fetchTriggerLogs = fetchTriggerLogs;
exports.createOverrideLog = createOverrideLog;
exports.fetchOverrideLogs = fetchOverrideLogs;
exports.fetchParkingAreas = fetchParkingAreas;
exports.fetchRoads = fetchRoads;
exports.subscribeToBookings = subscribeToBookings;
exports.subscribeToVenues = subscribeToVenues;
exports.subscribeToTriggerLogs = subscribeToTriggerLogs;
exports.subscribeToOverrideLogs = subscribeToOverrideLogs;
exports.fetchInitialData = fetchInitialData;
const supabase_client_1 = require("./supabase-client");
const data_transform_1 = require("./data-transform");
// Supabase service functions for database operations
// Venue operations
async function fetchVenues() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');
    if (error)
        throw error;
    return (0, data_transform_1.transformVenues)(data || []);
}
async function createVenue(venue) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('venues')
        .insert({
        id: `v${Date.now()}`,
        name: venue.name,
        type: venue.type,
        max_population: venue.maxPopulation,
        owner_name: venue.ownerName,
        owner_contact: venue.ownerContact,
        address: venue.address,
        about_venue: venue.aboutVenue || null,
        features: venue.features || [],
        activities: venue.activities || [],
        image: venue.image,
        created_at: new Date().toISOString()
    })
        .select()
        .single();
    if (error)
        throw error;
    return (0, data_transform_1.transformVenue)(data);
}
async function updateVenue(venue) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const updatePayload = {
        name: venue.name,
        type: venue.type,
        max_population: venue.maxPopulation,
        owner_name: venue.ownerName,
        owner_contact: venue.ownerContact,
        address: venue.address,
        about_venue: venue.aboutVenue || null,
        features: venue.features || [],
        activities: venue.activities || [],
        image: venue.image,
    };
    const { data, error } = await supabase
        .from('venues')
        .update(updatePayload)
        .eq('id', venue.id)
        .select()
        .single();
    if (error)
        throw error;
    return (0, data_transform_1.transformVenue)(data);
}
async function deleteVenue(id) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
}
// Booking operations
async function fetchBookings() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('bookings')
        .select(`
      *,
      venues:venue_id (
        id,
        name
      )
    `)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    // Transform the data to match our types
    return (0, data_transform_1.transformBookings)(data || []);
}
async function createBooking(booking) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data: { user } } = await supabase.auth.getUser();
    const bookingData = {
        id: `b${Date.now()}`,
        venue_id: booking.venueId,
        title: booking.title,
        description: booking.description,
        date: booking.date,
        start_time: booking.startTime,
        end_time: booking.endTime,
        expected_attendance: booking.expectedAttendance,
        organizer: booking.organizer,
        risk_level: booking.riskLevel,
        amplified_noise: booking.amplifiedNoise,
        liquor_license: booking.liquorLicense,
        status: booking.status,
        override_reason: booking.overrideReason,
        overridden_by: booking.overriddenBy,
        overridden_at: booking.overriddenAt,
        conflicts: booking.conflicts,
        created_by: user?.id || null,
        created_at: new Date().toISOString()
    };
    const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
    if (error)
        throw error;
    return (0, data_transform_1.transformBooking)(data);
}
async function updateBooking(booking) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const bookingData = {
        venue_id: booking.venueId,
        title: booking.title,
        description: booking.description,
        date: booking.date,
        start_time: booking.startTime,
        end_time: booking.endTime,
        expected_attendance: booking.expectedAttendance,
        organizer: booking.organizer,
        risk_level: booking.riskLevel,
        amplified_noise: booking.amplifiedNoise,
        liquor_license: booking.liquorLicense,
        status: booking.status,
        override_reason: booking.overrideReason,
        overridden_by: booking.overriddenBy,
        overridden_at: booking.overriddenAt,
        conflicts: booking.conflicts,
    };
    const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', booking.id)
        .select()
        .single();
    if (error)
        throw error;
    return (0, data_transform_1.transformBooking)(data);
}
async function deleteBooking(id) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
    if (error)
        throw error;
}
// Trigger log operations
async function createTriggerLog(log) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('trigger_logs')
        .insert({
        ...log,
        id: `tl${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString()
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
async function fetchTriggerLogs() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('trigger_logs')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return (0, data_transform_1.transformTriggerLogs)(data || []);
}
// Override log operations
async function createOverrideLog(log) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('override_logs')
        .insert({
        ...log,
        id: `ol${Date.now()}`,
        timestamp: new Date().toISOString()
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
async function fetchOverrideLogs() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('override_logs')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return (0, data_transform_1.transformOverrideLogs)(data || []);
}
// Parking area operations
async function fetchParkingAreas() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('parking_areas')
        .select('*')
        .order('name');
    if (error)
        throw error;
    return (0, data_transform_1.transformParkingAreas)(data || []);
}
// Road operations
async function fetchRoads() {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    const { data, error } = await supabase
        .from('roads')
        .select('*')
        .order('name');
    if (error)
        throw error;
    return (0, data_transform_1.transformRoads)(data || []);
}
// Real-time subscription functions
function subscribeToBookings(callback) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    return supabase
        .channel('bookings')
        .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
    }, (payload) => {
        if (payload.new) {
            callback((0, data_transform_1.transformBooking)(payload.new));
        }
    })
        .subscribe();
}
function subscribeToVenues(callback) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    return supabase
        .channel('venues')
        .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'venues'
    }, (payload) => {
        if (payload.new) {
            const newVenue = payload.new;
            const venue = {
                id: newVenue.id,
                name: newVenue.name,
                type: newVenue.type,
                maxPopulation: newVenue.max_population,
                ownerName: newVenue.owner_name,
                ownerContact: newVenue.owner_contact,
                address: newVenue.address,
                image: newVenue.image,
                createdAt: newVenue.created_at
            };
            callback(venue);
        }
    })
        .subscribe();
}
function subscribeToTriggerLogs(callback) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    return supabase
        .channel('trigger_logs')
        .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trigger_logs'
    }, (payload) => {
        if (payload.new) {
            const newLog = payload.new;
            const log = {
                id: newLog.id,
                bookingId: newLog.booking_id,
                type: newLog.type,
                severity: newLog.severity,
                message: newLog.message,
                timestamp: newLog.timestamp,
                resolved: newLog.resolved
            };
            callback(log);
        }
    })
        .subscribe();
}
function subscribeToOverrideLogs(callback) {
    const supabase = (0, supabase_client_1.getSupabaseClient)();
    return supabase
        .channel('override_logs')
        .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'override_logs'
    }, (payload) => {
        if (payload.new) {
            const newLog = payload.new;
            const log = {
                id: newLog.id,
                bookingId: newLog.booking_id,
                operatorName: newLog.operator_name,
                reason: newLog.reason,
                conflicts: newLog.conflicts || [],
                timestamp: newLog.timestamp
            };
            callback(log);
        }
    })
        .subscribe();
}
// Initial data fetch function
async function fetchInitialData() {
    try {
        // Fetch core data first (venues and bookings)
        const [venues, bookings] = await Promise.all([
            fetchVenues(),
            fetchBookings()
        ]);
        // Try to fetch optional data, but don't fail if permissions are blocked
        let parkingAreas = [];
        let roads = [];
        let triggerLogs = [];
        let overrideLogs = [];
        try {
            parkingAreas = await fetchParkingAreas();
        }
        catch (error) {
            console.warn('Parking areas not accessible:', error.message);
        }
        try {
            roads = await fetchRoads();
        }
        catch (error) {
            console.warn('Roads not accessible:', error.message);
        }
        try {
            triggerLogs = await fetchTriggerLogs();
        }
        catch (error) {
            console.warn('Trigger logs not accessible:', error.message);
        }
        try {
            overrideLogs = await fetchOverrideLogs();
        }
        catch (error) {
            console.warn('Override logs not accessible:', error.message);
        }
        return {
            venues,
            bookings,
            parkingAreas,
            roads,
            triggerLogs,
            overrideLogs
        };
    }
    catch (error) {
        console.error('Error fetching initial data:', error);
        // Return empty state as fallback
        return {
            venues: [],
            bookings: [],
            parkingAreas: [],
            roads: [],
            triggerLogs: [],
            overrideLogs: []
        };
    }
}
