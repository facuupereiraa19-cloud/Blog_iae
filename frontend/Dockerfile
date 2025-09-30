FROM node:20-slim AS build
WORKDIR /app

# Instalar dependencias (sin ejecutar scripts aún, para evitar 'quasar prepare' antes de tener el proyecto copiado)
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# Copiar el proyecto completo
COPY . .

# Ejecutar prepare + build ahora que el proyecto está presente
RUN npx quasar prepare && npx quasar build

FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/spa ./
# Nginx config con proxy a backend en /api
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
