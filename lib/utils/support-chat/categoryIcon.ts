export function getCategoryIcon(
  category: string
) {
  if (
    category.includes("Contraseña")
  ) {
    return "🔐";
  }

  if (category.includes("2FA")) {
    return "🛡️";
  }

  if (
    category.includes("Correo")
  ) {
    return "📧";
  }

  return "⚠️";
}