# Instalar Angular

## Desinstalar cliente de Angular
npm uninstall -g @angular/cli
## Instalar cliente Angular 16
npm i -g @angular/cli@16.2.12

_________________

# Gestionar aplicaciones 

## Crear nueva app (--no-standalone para que mantenga el módulo ngModule)
ng new my-app --no-standalone
## Crear modulo (ng generate module)
ng g m module-name
## Crear componente (ng generate component)
ng g c component-name
## Crear servicio (ng generate service)
ng g s service-name

## Crear directiva personalizada (ng generate directive)
ng g d directive-name

## Generar pipe (ng generate pipe)
ng g p pipe-name

## Simulación de creación
--dry-run

## Levantar proyecto
npm start

_________________

# Instalar Bootstrap
npm i bootstrap@5.3.3

## Añadirlo a angular.json
    "styles": [
      "src/styles.css",
      "node_modules/bootstrap/dist/css/bootstrap.min.css"
    ],
    "scripts": [
      "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
    ]



