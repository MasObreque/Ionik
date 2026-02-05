#!/bin/bash

echo "=========================================="
echo "DIAGNÓSTICO DE IMÁGENES EN IONIK.CL"
echo "=========================================="
echo ""

# 1. Verificar directorio web
echo "1. Verificando directorio web principal..."
if [ -d "/var/www/ionikcl" ]; then
    echo "✓ Directorio /var/www/ionikcl existe"
    ls -la /var/www/ionikcl/ | head -15
else
    echo "✗ ERROR: Directorio /var/www/ionikcl NO existe"
fi
echo ""

# 2. Verificar carpeta images
echo "2. Verificando carpeta de imágenes..."
if [ -d "/var/www/ionikcl/images" ]; then
    echo "✓ Directorio /var/www/ionikcl/images existe"
    echo "Archivos en images/:"
    ls -lh /var/www/ionikcl/images/ | head -20
    echo ""
    echo "Total de archivos:"
    ls -1 /var/www/ionikcl/images/ | wc -l
else
    echo "✗ ERROR: Directorio /var/www/ionikcl/images NO existe"
fi
echo ""

# 3. Verificar permisos
echo "3. Verificando permisos..."
echo "Permisos del directorio principal:"
ls -ld /var/www/ionikcl
echo ""
echo "Permisos de la carpeta images:"
ls -ld /var/www/ionikcl/images 2>/dev/null || echo "No existe"
echo ""
echo "Permisos de algunas imágenes:"
ls -l /var/www/ionikcl/images/*.png 2>/dev/null | head -5 || echo "No hay imágenes PNG"
echo ""

# 4. Verificar propietario
echo "4. Verificando propietario de archivos..."
stat -c "Propietario: %U:%G - Permisos: %a" /var/www/ionikcl 2>/dev/null
stat -c "Propietario: %U:%G - Permisos: %a" /var/www/ionikcl/images 2>/dev/null || echo "Carpeta images no existe"
echo ""

# 5. Verificar nginx
echo "5. Verificando configuración de Nginx..."
if [ -f "/etc/nginx/sites-enabled/ionik.conf" ]; then
    echo "✓ Configuración de Nginx encontrada"
    grep -A 5 "location /images" /etc/nginx/sites-enabled/ionik.conf 2>/dev/null || echo "No se encuentra configuración de /images"
elif [ -f "/etc/nginx/conf.d/ionik.conf" ]; then
    echo "✓ Configuración de Nginx encontrada en conf.d"
    grep -A 5 "location /images" /etc/nginx/conf.d/ionik.conf 2>/dev/null || echo "No se encuentra configuración de /images"
else
    echo "✗ No se encuentra archivo de configuración de Nginx"
fi
echo ""

# 6. Verificar logs de nginx
echo "6. Últimos errores en Nginx (relacionados con imágenes)..."
tail -20 /var/log/nginx/ionik-error.log 2>/dev/null | grep -i "image\|png\|jpg\|jpeg" || echo "No hay errores recientes relacionados con imágenes"
echo ""

# 7. Test de acceso a archivo
echo "7. Test de lectura de imagen..."
if [ -f "/var/www/ionikcl/images/logo.jpg" ]; then
    echo "✓ logo.jpg existe"
    file /var/www/ionikcl/images/logo.jpg
    ls -lh /var/www/ionikcl/images/logo.jpg
else
    echo "✗ logo.jpg NO existe"
fi
echo ""

# 8. Verificar SELinux (Oracle Linux)
echo "8. Verificando SELinux..."
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    echo "Estado de SELinux: $SELINUX_STATUS"
    if [ "$SELINUX_STATUS" != "Disabled" ]; then
        echo "⚠ SELinux está activo. Verificando contextos..."
        ls -Z /var/www/ionikcl/images/ 2>/dev/null | head -5 || echo "No se puede verificar contexto SELinux"
    fi
else
    echo "SELinux no disponible"
fi
echo ""

# 9. Test de curl local
echo "9. Test de acceso HTTP local..."
echo "Probando acceso a una imagen vía curl..."
curl -I http://localhost/images/logo.jpg 2>/dev/null || echo "No se pudo hacer curl local"
echo ""

echo "=========================================="
echo "COMANDOS SUGERIDOS PARA CORREGIR:"
echo "=========================================="
echo "# Si los permisos están mal:"
echo "sudo chown -R www-data:www-data /var/www/ionikcl"
echo "sudo chmod -R 755 /var/www/ionikcl"
echo "sudo chmod -R 644 /var/www/ionikcl/images/*"
echo ""
echo "# Si es problema de SELinux:"
echo "sudo chcon -R -t httpd_sys_content_t /var/www/ionikcl"
echo "sudo setsebool -P httpd_can_network_connect 1"
echo ""
echo "# Reiniciar nginx:"
echo "sudo systemctl restart nginx"
echo ""
