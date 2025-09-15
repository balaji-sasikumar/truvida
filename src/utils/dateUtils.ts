export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return `Good Morning, ${name}`;
  } else if (hour < 17) {
    return `Good Afternoon, ${name}`;
  } else {
    return `Good Evening, ${name}`;
  }
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
