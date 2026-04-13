export const DEFAULT_ROLE = '<undefined>'
export const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  GROUP_LEADER: 'group_leader',
  TUTOR: 'tutor',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
})

export const GROUP_ROLES = Object.freeze({
  MEMBER: 'member',
  OWNER: 'owner',
  MODERATOR: 'moderator',
})

export const STUDY_MAJORS = Object.freeze({
  UNDECLARED: 'undeclared',
  ACCOUNTING: 'accounting',
  BIOLOGY: 'biology',
  BUSINESS: 'business',
  CHEMISTRY: 'chemistry',
  COMMUNICATIONS: 'communications',
  COMPUTER_SCIENCE: 'computer_science',
  CRIMINAL_JUSTICE: 'criminal_justice',
  CYBERSECURITY: 'cybersecurity',
  DATA_SCIENCE: 'data_science',
  ECONOMICS: 'economics',
  EDUCATION: 'education',
  ENGINEERING: 'engineering',
  ENGLISH: 'english',
  FINANCE: 'finance',
  HISTORY: 'history',
  INFORMATION_SYSTEMS: 'information_systems',
  MARKETING: 'marketing',
  MATHEMATICS: 'mathematics',
  NURSING: 'nursing',
  PHYSICS: 'physics',
  POLITICAL_SCIENCE: 'political_science',
  PSYCHOLOGY: 'psychology',
  SOCIAL_WORK: 'social_work',
  STATISTICS: 'statistics',
})

export function createEmptyUserProfile() {
  return {
    uid: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    studyMajor: STUDY_MAJORS.UNDECLARED,
    groups: [],
    role: DEFAULT_ROLE,
    createdAt: null,
    updatedAt: null,
  }
}

export function createUserProfileFromSignup({
  uid,
  username,
  email,
  role = DEFAULT_ROLE,
}) {
  const normalizedUsername = username?.trim() ?? ''
  const normalizedEmail = email?.trim() ?? ''
  const now = new Date().toISOString()

  return {
    uid,
    username: normalizedUsername || normalizedEmail,
    email: normalizedEmail,
    firstName: '',
    lastName: '',
    studyMajor: STUDY_MAJORS.UNDECLARED,
    groups: [],
    role,
    createdAt: now,
    updatedAt: now,
  }
}

export function createUserProfileFromFirebaseUser(firebaseUser, profile = {}) {
  return {
    uid: firebaseUser?.uid ?? profile.uid ?? '',
    username: profile.username ?? firebaseUser?.email ?? '',
    email: firebaseUser?.email ?? profile.email ?? '',
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    studyMajor: profile.studyMajor ?? STUDY_MAJORS.UNDECLARED,
    groups: Array.isArray(profile.groups) ? profile.groups : [],
    role: profile.role ?? DEFAULT_ROLE,
    createdAt: profile.createdAt ?? null,
    updatedAt: profile.updatedAt ?? null,
  }
}

export function createLoginCredentials() {
  return {
    email: '',
    password: '',
    rememberMe: false,
  }
}

export function createSignupCredentials() {
  return {
    username: '',
    email: '',
    password: '',
  }
}
