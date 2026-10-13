const dateTimeFormatter = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (date: Date): string =>
  dateTimeFormatter.format(date);
