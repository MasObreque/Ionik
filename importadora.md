Modificaciones sugeridas para /etc/nginx/sites-available/importadora

Objetivo:
- Forzar redirección 301 de /index.html → / para evitar URLs duplicadas y que Google marque /index.html como "no indexada".

Pasos rápidos (en la VM):

1) Hacer backup del archivo actual:

   sudo cp /etc/nginx/sites-available/importadora /etc/nginx/sites-available/importadora.bak

2) Editar el archivo y añadir la siguiente regla dentro del bloque server { ... } (por ejemplo, justo después del bloque del favicon):

   location = /index.html {
       return 301 https://ionik.cl/;
   }

Regla alternativa (rewrite):

   rewrite ^/index\.html$ https://ionik.cl/ permanent;

3) Probar y recargar nginx:

   sudo nginx -t && sudo systemctl reload nginx

4) Verificar:

   curl -I https://ionik.cl/index.html
   # Debe devolver status 301 y cabecera Location: https://ionik.cl/

Archivo de configuración (server block completo con la inserción sugerida):

server {
    listen 443 ssl http2;
    server_name ionik.cl www.ionik.cl;

    ssl_certificate /etc/letsencrypt/live/ionik.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ionik.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend principal
    root /var/www/ionikcl;
    index index.html index.htm;

    # Logs específicos para debugging
    access_log /var/log/nginx/ionik-access.log;
    error_log /var/log/nginx/ionik-error.log;

    # IMPORTANTE: Configuración para favicon (debe ir primero para evitar loops)
    location = /favicon.ico {
        root /var/www/ionikcl;
        access_log off;
        log_not_found off;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri /images/logo.jpg =404;
    }

    # Redirección 301 para evitar duplicados: /index.html → /
    location = /index.html {
        return 301 https://ionik.cl/;
    }

    # ==========================================
    # PRIORIDAD 1: FRONTEND REACT /gestion
    # DEBE IR ANTES que cualquier bloque regex
    # ==========================================

    location ^~ /gestion/static/ {
        alias /var/www/importadora-frontend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /gestion {
        alias /var/www/importadora-frontend/;
        index index.html;
        try_files $uri $uri/ /index.html =404;

        # Headers para React SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # ==========================================
    # PRIORIDAD 2: ARCHIVOS ESTÁTICOS (después de /gestion)
    # ==========================================

    # CSS y JS del sitio principal
    location ~* \.(css|js)$ {
        root /var/www/ionikcl;
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires off;
        #add_header Cache-Control "public, max-age=31536000";
        #expires 1y;
        access_log off;
    }

    # Imágenes y videos
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|mp4|webm)$ {
        root /var/www/ionikcl;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
        try_files $uri =404;
    }

    # Configuración específica para la carpeta images/
    location /images/ {
        alias /var/www/ionikcl/images/;
        autoindex off;
        add_header Access-Control-Allow-Origin "*";
        add_header X-Content-Type-Options "nosniff";
        expires 1y;
        access_log off;
    }

    # Configuración específica para la carpeta videos/
    location /videos/ {
        alias /var/www/ionikcl/videos/;
        autoindex off;
        add_header Access-Control-Allow-Origin "*";
        expires 1y;
        access_log off;
    }

    # Backend FastAPI proxy
    location ^~ /api/ {
        if ($request_method = OPTIONS ) {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            return 204;
        }

        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts para el API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend principal (debe ir al final)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Compresión GZIP
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
}

server {
    listen 80;
    server_name ionik.cl www.ionik.cl;

    # Redirige todo el tráfico HTTP a HTTPS
    return 301 https://$host$request_uri;
}

Notas:
- La regla "location = /index.html" es exacta y segura: solo matchea esa ruta y devuelve 301 a la raíz.
- Si se quiere además forzar www → non-www, se puede ajustar el server block de listen 80 o crear un server separado que haga 301 a https://ionik.cl$uri.
- Después de recargar, purgar cualquier CDN/cache y solicitar inspección en Search Console si quieres acelerar la corrección.
