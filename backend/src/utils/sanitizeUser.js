export const sanitizeUser = (user) => {
  if (!user || typeof user !== "object") return null;

  // Accept either a Mongoose document or a plain object
  const u = user.toObject ? user.toObject() : user;

  const {
    _id,
    name,
    email,
    bio,
    profilePicture,
    socialLinks,
    yearOfStudy,
    branch,
    skills,
    interest,
    role,
    status,
  } = u;

  return {
    id: _id ? String(_id) : undefined,
    name: name ?? undefined,
    email: email ?? undefined,
    bio: bio ?? undefined,
    profilePicture: profilePicture ?? undefined,
    socialLinks: socialLinks ?? undefined,
    yearOfStudy: yearOfStudy ?? undefined,
    branch: branch ?? undefined,
    skills: skills ?? undefined,
    interest: interest ?? undefined,
    role: role ?? undefined,
    status: status ?? undefined,
  };
};
