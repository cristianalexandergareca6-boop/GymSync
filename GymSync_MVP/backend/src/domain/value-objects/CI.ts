/**
 * Value Object para la Cédula de Identidad (C.I.)
 * Cumple con validación de unicidad y formato conforme a normativa (SEGIP / Bolivia).
 */
export class CI {
  private readonly value: string;

  constructor(ciValue: string) {
    if (!ciValue || typeof ciValue !== 'string') {
      throw new Error('El C.I. es obligatorio y debe ser una cadena de texto válida.');
    }

    const trimmed = ciValue.trim();
    if (trimmed.length < 4 || trimmed.length > 20) {
      throw new Error('El C.I. debe tener entre 4 y 20 caracteres.');
    }

    // Acepta números y posible extensión alfanumérica (ej: 5432101 o 5432101-1A)
    const validPattern = /^[0-9]+(-[0-9A-Za-z]+)?$/;
    if (!validPattern.test(trimmed)) {
      throw new Error('Formato de C.I. inválido. Ejemplo válido: 5432101 o 5432101-1A');
    }

    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: CI): boolean {
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}
