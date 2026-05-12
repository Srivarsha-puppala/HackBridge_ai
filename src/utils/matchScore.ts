export const calculateMatchScore = (userSkills: string[], requiredSkills: string[]): number => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

  const matches = requiredSkillsLower.filter(skill => 
    userSkillsLower.includes(skill)
  );

  const score = (matches.length / requiredSkillsLower.length) * 100;
  return Math.round(score);
};