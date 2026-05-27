export function getClosedTimeRemaining(
  closedAt?: string | null
) {

  if (!closedAt) {
    return null;
  }

  const closedDate = new Date(
    closedAt
  );

  const expiryDate = new Date(
    closedDate.getTime() +
      2 * 24 * 60 * 60 * 1000
  );

  const now = new Date();

  const remainingMs =
    expiryDate.getTime() -
    now.getTime();

  const remainingHours =
    Math.max(
      0,
      Math.floor(
        remainingMs /
          (1000 * 60 * 60)
      )
    );

  if (remainingHours > 24) {

    const days = Math.floor(
      remainingHours / 24
    );

    return `${days} día${
      days > 1 ? "s" : ""
    }`;
  }

  return `${remainingHours} hora${
    remainingHours !== 1
      ? "s"
      : ""
  }`;
}