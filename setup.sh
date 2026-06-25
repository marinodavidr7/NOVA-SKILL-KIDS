#!/bin/bash

# ==============================================================================
# Script de Instalación y Arranque Automático para NOVA SKILL KIDS (Linux)
# ==============================================================================

echo "======================================================"
echo "🚀 INICIANDO INSTALACIÓN DE NOVA SKILL KIDS"
echo "======================================================"

# 1. Comprobar requisitos básicos
echo "Verificando dependencias del sistema..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js (v18 o superior) y vuelve a ejecutar este script."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instálalo y vuelve a ejecutar este script."
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo "⚠️ MySQL no parece estar instalado en la línea de comandos."
    echo "Asegúrate de tener un servidor MySQL corriendo (local o remoto)."
fi

echo "✅ Node.js y npm están instalados."

# 2. Instalar dependencias del proyecto
echo "📦 Instalando dependencias de Node.js (npm install)..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Hubo un error al instalar las dependencias."
    exit 1
fi

# 3. Configuración de Entorno (.env)
if [ ! -f .env ]; then
    echo "⚠️ No se encontró el archivo .env. Creando uno por defecto..."
    echo "DATABASE_URL=mysql://root:@127.0.0.1:3306/estancia" > .env
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env
    echo "✅ Archivo .env creado con configuración de base de datos por defecto (root sin contraseña)."
    echo "Si tu base de datos tiene contraseña, por favor edita el archivo .env y vuelve a ejecutar el script."
else
    echo "✅ Archivo .env detectado."
fi

# 4. Configurar Base de Datos
echo "🗄️ Configurando la base de datos..."
npm run db:setup
if [ $? -ne 0 ]; then
    echo "❌ Error al configurar la base de datos. Verifica tus credenciales en el archivo .env y asegúrate de que MySQL esté corriendo."
    exit 1
fi

echo "👤 Verificando usuario administrador..."
node scripts/create_admin.js
if [ $? -ne 0 ]; then
    echo "⚠️ Hubo un problema al configurar el usuario administrador."
else
    echo "✅ Usuario administrador listo."
fi

# 5. Construcción de producción
echo "🏗️ Construyendo la aplicación para producción (npm run build)..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en la construcción (build) de la aplicación."
    exit 1
fi

# 6. Iniciar la aplicación
echo "======================================================"
echo "✨ INSTALACIÓN COMPLETADA ✨"
echo "🌐 Iniciando la aplicación en modo producción..."
echo "Podrás acceder en: http://localhost:3000"
echo "======================================================"

npm start
