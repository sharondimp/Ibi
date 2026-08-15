// Weighted eligibility scoring between a student profile and an opportunity.
// Kept dependency-free and synchronous so it can run client-side on a list of listings.

const WEIGHTS = {
  level: 25,
  department: 30,
  location: 20,
  skills: 25,
}

function norm(str = '') {
  return str.toString().trim().toLowerCase()
}

export function computeMatch(student, opportunity) {
  if (!student) return { score: 0, reasons: [], gaps: [] }

  const reasons = []
  const gaps = []
  let score = 0

  // Level: exact match, or "any level" opportunities always pass
  if (
    !opportunity.requiredLevel ||
    norm(opportunity.requiredLevel) === 'any' ||
    norm(opportunity.requiredLevel) === norm(student.level)
  ) {
    score += WEIGHTS.level
    reasons.push(`${student.level} level`)
  } else {
    gaps.push(`Requires ${opportunity.requiredLevel} level`)
  }

  // Department: match against a list of tags on the opportunity
  const deptTags = (opportunity.departmentTags || []).map(norm)
  if (deptTags.length === 0 || deptTags.includes(norm(student.department))) {
    score += WEIGHTS.department
    reasons.push(student.department)
  } else {
    gaps.push(`Looking for ${opportunity.departmentTags?.join(', ')}`)
  }

  // Location: match, or remote/hybrid opportunities always pass
  const mode = norm(opportunity.mode)
  if (
    mode === 'remote' ||
    !opportunity.location ||
    norm(opportunity.location).includes(norm(student.location)) ||
    norm(student.location).includes(norm(opportunity.location))
  ) {
    score += WEIGHTS.location
    reasons.push(opportunity.location || 'Remote')
  } else {
    gaps.push(`Based in ${opportunity.location}`)
  }

  // Skills: overlap between student skills and opportunity's desired skills
  const wanted = (opportunity.skillsWanted || []).map(norm)
  const have = (student.skills || []).map(norm)
  if (wanted.length === 0) {
    score += WEIGHTS.skills
  } else {
    const overlap = wanted.filter((w) => have.includes(w))
    const ratio = overlap.length / wanted.length
    score += Math.round(WEIGHTS.skills * ratio)
    if (overlap.length > 0) reasons.push(`${overlap.length}/${wanted.length} skills matched`)
    if (ratio < 1) gaps.push(`Missing: ${wanted.filter((w) => !have.includes(w)).join(', ')}`)
  }

  return { score: Math.min(100, score), reasons, gaps }
}
