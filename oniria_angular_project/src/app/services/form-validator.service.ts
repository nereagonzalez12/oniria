import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {

  constructor() { }


  // Validación de email //
  static customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si el campo está vacío, no hay error de validación
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(control.value)) {
        return { 'invalidEmail': true };
      }
      return null;
    };
  }


  // Validación de contraseña segura //
  static strongPasswordValidator(minLength: number = 8, minUppercase: number = 1, minLowercase: number = 1, minNumbers: number = 1, minSpecialChars: number = 1): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (!control.value) {
        return null; // Si el campo está vacío, no hay error de contraseña fuerte
      }

      const password: string = control.value;

      // Verifica la longitud mínima
      if (password.length < minLength) {
        return { 'minLength': { minLength: minLength } };
      }

      // Verifica el número mínimo de letras mayúsculas
      const uppercaseRegex = /[A-Z]/g;
      if ((password.match(uppercaseRegex) || []).length < minUppercase) {
        return { 'minUppercase': { minUppercase: minUppercase } };
      }

      // Verifica el número mínimo de letras minúsculas
      const lowercaseRegex = /[a-z]/g;
      if ((password.match(lowercaseRegex) || []).length < minLowercase) {
        return { 'minLowercase': { minLowercase: minLowercase } };
      }

      // Verifica el número mínimo de dígitos
      const numbersRegex = /[0-9]/g;
      if ((password.match(numbersRegex) || []).length < minNumbers) {
        return { 'minNumbers': { minNumbers: minNumbers } };
      }

      // Verifica el número mínimo de caracteres especiales
      const specialCharsRegex = /[^A-Za-z0-9]/g;
      if ((password.match(specialCharsRegex) || []).length < minSpecialChars) {

        return { 'minSpecialChars': { minSpecialChars: minSpecialChars } };
      }
      // En caso de que haya errores los devuelve, si no devuelve nulo y la contraseña es aceptada
      return null;
    };
  }



  // Validación para el checkbox obligatorio
  static requiredCheckboxValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const checked = control.value;
      return checked ? null : { 'requiredCheckbox': true };
    };
  }

}
