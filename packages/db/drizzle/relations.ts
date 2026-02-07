import { relations } from "drizzle-orm/relations";
import { schUsers, schMembers, schVenues, schClassDefinitions, schClassSchedules, schStaff, schBookings, schMemberships, schMpHrms, schMemberStats, schMpHeartRateData, schMpHrmAssignments, schMpSessionQueues, schSchedules, schRooms } from "./schema";

export const schMembersRelations = relations(schMembers, ({one, many}) => ({
	schUser: one(schUsers, {
		fields: [schMembers.userId],
		references: [schUsers.id]
	}),
	schVenue: one(schVenues, {
		fields: [schMembers.venueId],
		references: [schVenues.id]
	}),
	schBookings: many(schBookings),
	schMemberStats: many(schMemberStats),
	schMpHrmAssignments: many(schMpHrmAssignments),
	schMemberships: many(schMemberships),
	schMpSessionQueues: many(schMpSessionQueues),
}));

export const schUsersRelations = relations(schUsers, ({many}) => ({
	schMembers: many(schMembers),
}));

export const schVenuesRelations = relations(schVenues, ({many}) => ({
	schMembers: many(schMembers),
	schClassDefinitions: many(schClassDefinitions),
	schClassSchedules: many(schClassSchedules),
	schBookings: many(schBookings),
	schMemberships: many(schMemberships),
	schStaffs: many(schStaff),
	schRooms: many(schRooms),
}));

export const schClassDefinitionsRelations = relations(schClassDefinitions, ({one, many}) => ({
	schVenue: one(schVenues, {
		fields: [schClassDefinitions.venueId],
		references: [schVenues.id]
	}),
	schClassSchedules: many(schClassSchedules),
	schBookings: many(schBookings),
}));

export const schClassSchedulesRelations = relations(schClassSchedules, ({one, many}) => ({
	schClassDefinition: one(schClassDefinitions, {
		fields: [schClassSchedules.classId],
		references: [schClassDefinitions.id]
	}),
	schStaff: one(schStaff, {
		fields: [schClassSchedules.staffId],
		references: [schStaff.id]
	}),
	schVenue: one(schVenues, {
		fields: [schClassSchedules.venueId],
		references: [schVenues.id]
	}),
	schBookings: many(schBookings),
	schMpHrmAssignments: many(schMpHrmAssignments),
	schMpSessionQueues: many(schMpSessionQueues),
}));

export const schStaffRelations = relations(schStaff, ({one, many}) => ({
	schClassSchedules: many(schClassSchedules),
	schBookings: many(schBookings),
	schVenue: one(schVenues, {
		fields: [schStaff.venueId],
		references: [schVenues.id]
	}),
	schSchedules: many(schSchedules),
}));

export const schBookingsRelations = relations(schBookings, ({one, many}) => ({
	schMember: one(schMembers, {
		fields: [schBookings.memberId],
		references: [schMembers.id]
	}),
	schStaff: one(schStaff, {
		fields: [schBookings.staffId],
		references: [schStaff.id]
	}),
	schVenue: one(schVenues, {
		fields: [schBookings.venueId],
		references: [schVenues.id]
	}),
	schClassDefinition: one(schClassDefinitions, {
		fields: [schBookings.classId],
		references: [schClassDefinitions.id]
	}),
	schClassSchedule: one(schClassSchedules, {
		fields: [schBookings.scheduleId],
		references: [schClassSchedules.id]
	}),
	schMembership: one(schMemberships, {
		fields: [schBookings.membershipId],
		references: [schMemberships.id]
	}),
	schMpHrm: one(schMpHrms, {
		fields: [schBookings.hrmId],
		references: [schMpHrms.id]
	}),
	schMpHeartRateData: many(schMpHeartRateData),
	schMpHrmAssignments: many(schMpHrmAssignments),
}));

export const schMembershipsRelations = relations(schMemberships, ({one, many}) => ({
	schBookings: many(schBookings),
	schMember: one(schMembers, {
		fields: [schMemberships.memberId],
		references: [schMembers.id]
	}),
	schVenue: one(schVenues, {
		fields: [schMemberships.venueId],
		references: [schVenues.id]
	}),
}));

export const schMpHrmsRelations = relations(schMpHrms, ({many}) => ({
	schBookings: many(schBookings),
	schMpHeartRateData: many(schMpHeartRateData),
	schMpHrmAssignments: many(schMpHrmAssignments),
}));

export const schMemberStatsRelations = relations(schMemberStats, ({one}) => ({
	schMember: one(schMembers, {
		fields: [schMemberStats.memberId],
		references: [schMembers.id]
	}),
}));

export const schMpHeartRateDataRelations = relations(schMpHeartRateData, ({one}) => ({
	schBooking: one(schBookings, {
		fields: [schMpHeartRateData.bookingId],
		references: [schBookings.id]
	}),
	schMpHrm: one(schMpHrms, {
		fields: [schMpHeartRateData.hrmId],
		references: [schMpHrms.id]
	}),
}));

export const schMpHrmAssignmentsRelations = relations(schMpHrmAssignments, ({one}) => ({
	schClassSchedule: one(schClassSchedules, {
		fields: [schMpHrmAssignments.scheduleId],
		references: [schClassSchedules.id]
	}),
	schBooking: one(schBookings, {
		fields: [schMpHrmAssignments.bookingId],
		references: [schBookings.id]
	}),
	schMember: one(schMembers, {
		fields: [schMpHrmAssignments.memberId],
		references: [schMembers.id]
	}),
	schMpHrm: one(schMpHrms, {
		fields: [schMpHrmAssignments.hrmId],
		references: [schMpHrms.id]
	}),
}));

export const schMpSessionQueuesRelations = relations(schMpSessionQueues, ({one}) => ({
	schClassSchedule: one(schClassSchedules, {
		fields: [schMpSessionQueues.scheduleId],
		references: [schClassSchedules.id]
	}),
	schMember: one(schMembers, {
		fields: [schMpSessionQueues.memberId],
		references: [schMembers.id]
	}),
}));

export const schSchedulesRelations = relations(schSchedules, ({one}) => ({
	schStaff: one(schStaff, {
		fields: [schSchedules.staffId],
		references: [schStaff.id]
	}),
}));

export const schRoomsRelations = relations(schRooms, ({one}) => ({
	schVenue: one(schVenues, {
		fields: [schRooms.venueId],
		references: [schVenues.id]
	}),
}));