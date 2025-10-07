
export const getInitials = (name: string, lastName?: string): string => {
  const firstParts = name.trim().split(' ').filter(Boolean);

  if (lastName && lastName.trim() !== '') {
    return `${firstParts[0][0]}${lastName.trim()[0]}`.toUpperCase();
  }

  if (firstParts.length > 1) {
    return `${firstParts[0][0]}${firstParts[1][0]}`.toUpperCase();
  }

  return firstParts[0][0].toUpperCase();
};

export const parseDDMMYYYY = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-based
};
