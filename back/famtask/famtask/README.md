📌 Requisitos previos

- Java 21+
- Maven 
- MySQL
- Node + npm (solo si corre el frontend)
- IntelliJ / VSCode recomendado

✅ 1️⃣ Clonar el proyecto
git clone https://github.com/<tu-repo>/TPFinal-T10-FamTask.git
cd TPFinal-T10-FamTask/back/famtask/famtask

✅ 2️⃣ Crear archivo .env

⚠️ IMPORTANTE: El archivo .env NO se sube al repositorio.
Cada desarrollador crea el suyo, con sus credenciales.

En la carpeta:

back/famtask/famtask/.env


Crear el archivo con esta estructura:

# === Google OAuth ===
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# === WhatsApp Cloud API ===
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=


👉 Si no querés usar Google o WhatsApp, podés dejar los valores vacíos.

✅ 3️⃣ Configurar base de datos MySQL

Crear una base llamada famtaskdb:

CREATE DATABASE famtaskdb;


En el archivo application.properties ya está configurado:

spring.datasource.url=jdbc:mysql://localhost:3306/famtaskdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD


⚠️ Este archivo sí va al repositorio, pero sin secretos.

✅ 4️⃣ Instalar dependencias y ejecutar backend
mvn clean install
mvn spring-boot:run

✅ 5️⃣ Probar API – Swagger

Con la app levantada:

👉 http://localhost:8080/swagger-ui.html

o
👉 http://localhost:8080/swagger-ui/index.html

Desde ahí podés probar Auth, Familias, Eventos, Calendario, Reminder, etc.

✅ 6️⃣ Google OAuth – Cómo probar

Entrar a:

GET /api/auth/google/login


El endpoint devuelve una URL.

Iniciás sesión con Google.

Google redirige a:

http://localhost:8080/api/auth/google/callback?code=...


El backend genera un JWT propio y lo devuelve al frontend.

Si el usuario no existe → se crea automáticamente.
Si existe → se loguea.

✅ 7️⃣ WhatsApp Cloud API – Recordatorios de Eventos

📌 Funciona con WhatsApp Business Cloud API.
📌 El proyecto envía recordatorios automáticos:

1 día antes

1 hora antes

El número de destino debe estar verificado con el sandbox o tener template habilitado.

✅ 8️⃣ ¿Qué pasa si NO quiero usar Google ni WhatsApp?

Simple:

El backend funciona igual.

Solo no se podrán usar esos features.

No rompe nada.

✅ 9️⃣ ¿Dónde están los ejemplos?

El repositorio incluye:

.env.example → muestra las claves que cada dev debe completar

application.properties → sin credenciales reales

Configuración para que los secrets nunca queden expuestos en GitHub

✅ 10️⃣ Dependencias clave

pom.xml ya incluye:

✅ Spring Boot
✅ JWT
✅ JPA / MySQL
✅ WhatsApp Cloud API (RestTemplate)
✅ Google OAuth + Calendar
✅ Dotenv para manejo de variables locales
✅ Swagger

✅ 11️⃣ Frontend

Si tu proyecto también tiene front:

cd front
npm install
npm run dev


El frontend consumirá el JWT generado por:

POST /api/auth/login
GET /api/auth/google/login

✅ 12️⃣ Seguridad

✔ El proyecto usa JWT
✔ No maneja sesiones
✔ Endpoints protegidos según Roles (ADMIN / USER / MEMBER)

✅ 13️⃣ Importante para colaboradores

✅ No subir .env
✅ No subir credenciales
✅ No subir credentials.json
✅ Si GitHub detecta secrets → el push será bloqueado
✅ Siempre agregar/modificar valores en .env