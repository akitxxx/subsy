const getNow = () => {
  return new Date();
};

const addMilliseconds = (date: Date, milliseconds: number) => {
  const newDate = new Date(date);
  newDate.setMilliseconds(newDate.getMilliseconds() + milliseconds);
  return newDate;
};

const addSeconds = (date: Date, seconds: number) => {
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() + seconds);
  return newDate;
};

const addMinutes = (date: Date, minutes: number) => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

const addHours = (date: Date, hours: number) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const DateUtils = {
  getNow,
  addMilliseconds,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addMonths,
};
