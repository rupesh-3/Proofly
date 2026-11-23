import { User, Evidence, Project, Opportunity, Application, ProjectProposal, InAppNotification } from '../types';

/**
 * Production / Live Data Store Initializers
 * All mock users, mock evidences, and mock profiles have been cleared.
 * Live data is retrieved from Supabase and pgvector.
 */
export const MOCK_USERS: User[] = [];
export const MOCK_EVIDENCES: Evidence[] = [];
export const INSTITUTIONAL_PROJECT_ARCHIVE: Project[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_APPLICATIONS: Application[] = [];
export const MOCK_PROPOSALS: ProjectProposal[] = [];
export const MOCK_NOTIFICATIONS: InAppNotification[] = [];
