const EXPLICIT_PATTERN =
  /\b(f+u+c+k+|s+h+i+t+|a+s+s+h+o+l+e+|b+i+t+c+h+|c+u+n+t+|d+i+c+k+|w+h+o+r+e+|n+i+g+g+|f+a+g+g?)\b/gi;

export const FORUM_LIMITS = {
  titleMax: 200,
  bodyMax: 4000,
  commentMax: 2000,
};

export function containsExplicitLanguage(text) {
  if (!text) return false;
  EXPLICIT_PATTERN.lastIndex = 0;
  return EXPLICIT_PATTERN.test(text);
}

export function validateForumText(text, { field = "content", max = FORUM_LIMITS.bodyMax } = {}) {
  const trimmed = `${text || ""}`.trim();
  if (!trimmed) return { ok: false, message: `${field} is required` };
  if (trimmed.length > max) {
    return { ok: false, message: `${field} must be ${max} characters or fewer` };
  }
  if (containsExplicitLanguage(trimmed)) {
    return { ok: false, message: "Please remove explicit language before posting." };
  }
  return { ok: true };
}

export function validateForumPost(title, body) {
  const titleCheck = validateForumText(title, { field: "Title", max: FORUM_LIMITS.titleMax });
  if (!titleCheck.ok) return titleCheck;
  return validateForumText(body, { field: "Message", max: FORUM_LIMITS.bodyMax });
}

export function validateForumComment(body) {
  return validateForumText(body, { field: "Comment", max: FORUM_LIMITS.commentMax });
}
