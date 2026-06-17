# Proyecto de Notas

Aplicación de notas con backend PHP y frontend React separados.

## Funcionalidades implementadas

- CRUD completo de notas
- Notas con título, contenido y nivel de prioridad (verde-bajo, naranja-medio, rojo-urgente)
- Organizar notas en carpetas (solo para usuarios Premium)
- Eliminar y editar notas
- Registro e inicio de sesión de usuario
- Plan Gratis: máximo 10 notas
- Plan Premium: notas ilimitadas y creación/edición/eliminación de carpetas
- Simulación de pago con métodos: Mercado Pago, Stripe y PayPal

## Uso

1. Ejecuta el backend en XAMPP o servidor PHP.
2. Ejecuta el frontend con `npm install` y `npm run dev` en `frontend`.
3. Regístrate o inicia sesión.
4. Crea notas desde el panel principal.
5. Si eres usuario gratis, puedes crear hasta 10 notas.
6. Actualiza a Premium desde el botón de la barra lateral para acceder a carpetas ilimitadas.

## Requisitos y rutas

- `backend/api/auth.php` - registro e inicio de sesión
- `backend/api/notes.php` - manejar notas (GET, POST, PUT, DELETE)
- `backend/api/folders.php` - manejar carpetas Premium
- `backend/api/payments.php` - simula pago y actualiza usuario a Premium

## Detalles adicionales

- La base de datos se configura en `backend/config/db.php`.
- Las notas se guardan en una tabla `notes` con `user_id`, `folder_id`, `title`, `content`, `priority`.
- El backend verifica el límite de 10 notas para usuarios gratis.
- Las carpetas solo están disponibles si el usuario tiene `is_premium = TRUE`.

## Notas de entrega

- URL: ejecuta el frontend localmente en el puerto que use Vite.
- Manual de usuario: este archivo describe cómo usar la aplicación y las rutas clave.
