export function formatDate(
  dateString: string
) {
  return new Date(dateString)
    .toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
}