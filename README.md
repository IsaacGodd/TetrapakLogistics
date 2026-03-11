♻️ Tetrapak Logistics
Plataforma de logística inteligente para reciclaje de envases Tetrapak

Tetrapak Logistics es una plataforma web diseñada para optimizar la recolección, gestión y análisis de residuos reciclables, especialmente envases multicapa como Tetrapak.

El sistema integra visualización de datos, geolocalización y gestión logística, permitiendo mejorar la eficiencia del transporte de residuos reciclables y fomentar la participación ciudadana dentro de un modelo de economía circular.

📚 Tabla de Contenido

📌 Descripción del Proyecto

🎯 Objetivos

⚙️ Funcionalidades del Sistema

🧠 Arquitectura del Sistema

💻 Tecnologías Utilizadas

📁 Estructura del Proyecto

🚀 Instalación

🧭 Uso del Sistema

🤝 Colaboraciones y Alianzas

👨‍💻 Colaboradores

📝 Notas y Funcionalidades Adicionales

📜 Licencia

📌 Descripción del Proyecto

Tetrapak Logistics es una plataforma digital orientada a mejorar la logística de reciclaje en entornos urbanos, conectando centros de acopio, transportistas y ciudadanos mediante herramientas tecnológicas.

El sistema permite:

🔹 Monitorear centros de reciclaje

🔹 Visualizar rutas logísticas

🔹 Analizar métricas de recolección

🔹 Fomentar la participación comunitaria

🔹 Optimizar la planificación de transporte

A través de dashboards, mapas interactivos y estadísticas de reciclaje, la plataforma facilita la toma de decisiones para mejorar la gestión de residuos.

El proyecto está enfocado en fortalecer la economía circular y promover una cultura de reciclaje en Monterrey, México.

🎯 Objetivos

El sistema fue desarrollado con los siguientes objetivos:

🔹 Facilitar la localización de centros de reciclaje

🔹 Optimizar las rutas de recolección de residuos

🔹 Promover la participación ciudadana

🔹 Visualizar indicadores logísticos en tiempo real

🔹 Analizar la eficiencia del sistema de reciclaje

🔹 Apoyar iniciativas de economía circular

⚙️ Funcionalidades del Sistema
🔐 Login y Autenticación

El sistema permite el acceso mediante credenciales de usuario.

Tipos de acceso disponibles:

🔹 Administrador

🔹 Empleado

🔹 Transportista

🔹 Invitado con funcionalidades limitadas

Cada rol tiene permisos específicos dentro de la plataforma.

📊 Dashboard Logístico

El Dashboard General muestra indicadores clave del sistema.

Entre las métricas disponibles se encuentran:

🔹 Viajes logísticos realizados

🔹 Toneladas de material recolectado

🔹 Centros de acopio activos

🔹 Eficiencia de rutas logísticas

🔹 Conductores registrados

🔹 Costos operativos del sistema

Además, el sistema incluye diferentes visualizaciones para analizar el comportamiento logístico.

Entre ellas:

🔹 Recolección mensual por tipo de material

🔹 Tendencia de viajes logísticos

🔹 Evolución de la eficiencia operativa

🔹 Comparación entre ingresos y costos operativos

Estas métricas permiten evaluar el desempeño del sistema logístico y apoyar la toma de decisiones. 

Manual de Uso_TetrapakLogistic

🗺️ Mapa de Transportistas

El sistema incluye un mapa interactivo para planificación logística.

Funciones principales del mapa:

🔹 Visualización de centros de acopio

🔹 Ubicación de transportistas y vehículos

🔹 Cálculo automático de rutas óptimas

🔹 Estimación de distancia y tiempo de recorrido

Los administradores pueden seleccionar centros de acopio y transportistas para generar automáticamente la mejor ruta de recolección. 

Manual de Uso_TetrapakLogistic

🏭 Centros de Acopio

Esta sección permite localizar centros de reciclaje disponibles dentro de la ciudad.

La plataforma muestra información relevante como:

🔹 Nombre del centro de acopio

🔹 Horario de operación

🔹 Materiales aceptados

🔹 Disponibilidad para recibir Tetrapak

🔹 Ubicación geográfica en el mapa

Esto facilita que los ciudadanos puedan encontrar puntos de reciclaje cercanos y disponer correctamente sus residuos. 

Manual de Uso_TetrapakLogistic

🌎 Comunidad

La sección de comunidad busca incentivar la participación ciudadana en el reciclaje.

Incluye diferentes herramientas para reconocer y visualizar la actividad de los usuarios:

🔹 Reciclador del mes

🔹 Estadísticas de reciclaje comunitario

🔹 Tabla de honor de recicladores

🔹 Registro de actividad reciente

Estas herramientas fomentan la participación y el impacto ambiental positivo dentro de la plataforma. 

Manual de Uso_TetrapakLogistic

📥 Importación de Datos

Los administradores pueden cargar información mediante archivos externos para actualizar la base de datos del sistema.

Tipos de datos que se pueden importar:

🔹 Centros de acopio

🔹 Viajes logísticos

🔹 Usuarios registrados

Formatos de archivo compatibles:

    CSV
    XLS
    XLSX

El sistema también proporciona plantillas de importación para asegurar que los datos tengan la estructura correcta antes de ser cargados. 

Manual de Uso_TetrapakLogistic

👤 Perfil de Usuario

La sección de perfil permite gestionar la información del usuario dentro del sistema.

Entre las funciones disponibles se encuentran:

🔹 Visualización de datos del usuario

🔹 Cambio de contraseña

🔹 Gestión de transportistas

🔹 Asignación de rutas logísticas

Esta sección funciona como un punto central para la administración de cuentas dentro de la plataforma. 

Manual de Uso_TetrapakLogistic

🧠 Arquitectura del Sistema

La plataforma sigue una arquitectura moderna basada en aplicaciones web.

    Usuario
       │
    Frontend (Interfaz Web)
       │
    API / Backend
       │
    Base de Datos
       │
    Servicios de Mapas y Geolocalización

Componentes principales:

🔹 Frontend con dashboards, mapas y paneles interactivos

🔹 Backend encargado del procesamiento y gestión de datos

🔹 Base de datos para almacenar usuarios, rutas y centros de reciclaje

🔹 Servicios externos para mapas y geolocalización

💻 Tecnologías Utilizadas

Frontend

    HTML
    JavaScript
    Vite
    TailwindCSS

Backend

    Node.js
    REST API

Herramientas adicionales

🔹 Git para control de versiones

🔹 GitHub para colaboración

🔹 APIs de mapas para geolocalización

🔹 herramientas de visualización de datos

📁 Estructura del Proyecto
    TetrapakLogistics
    │
    ├── backend
    │
    ├── src
    │
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    ├── postcss.config.js
    │
    └── README.md
🚀 Instalación

Clonar el repositorio

    git clone https://github.com/usuario/TetrapakLogistics.git

Entrar al directorio del proyecto

    cd TetrapakLogistics

Instalar dependencias

    npm install

Ejecutar el servidor de desarrollo

    npm run dev
    
🧭 Uso del Sistema

Flujo general de uso del sistema:

    Login
      ↓
    Dashboard
      ↓
    Visualización de centros
      ↓
    Selección de transportistas
      ↓
    Cálculo de rutas
      ↓
    Recolección de materiales
      ↓
    Análisis logístico

Este flujo permite monitorear y optimizar las operaciones del sistema de reciclaje.

🤝 Colaboraciones y Alianzas

El proyecto considera la colaboración de diversas organizaciones involucradas en sostenibilidad y reciclaje.

🔹 Tetra Pak

Empresa internacional especializada en soluciones de envasado y reciclaje.

🔹 SEDUSO

Secretaría de Desarrollo Sustentable responsable de políticas ambientales.

🔹 Ecolana

Plataforma digital que conecta ciudadanos con centros de reciclaje. 

Manual de Uso_TetrapakLogistic

Estas organizaciones contribuyen al fortalecimiento de un ecosistema de reciclaje más eficiente.

👨‍💻 Colaboradores

Proyecto desarrollado por:

🔹 José Alejandro Zavala Manjarrez

🔹 Isaac Hernández Pérez

Monterrey, Nuevo León
2025 

Manual de Uso_TetrapakLogistic

📝 Notas y Funcionalidades Adicionales

La plataforma incluye diversas funcionalidades adicionales que mejoran la experiencia del usuario.

🔹 Modo oscuro para reducir la fatiga visual

🔹 Sistema de solicitudes de reciclaje

🔹 Visualización de estadísticas ambientales

🔹 Mapas interactivos de centros de acopio

🔹 Seguimiento de actividad dentro del sistema

Estas funciones complementan el sistema principal y fortalecen el objetivo de la plataforma: facilitar la logística del reciclaje y promover la economía circular. 

Manual de Uso_TetrapakLogistic

📜 Licencia

Este proyecto fue desarrollado con fines académicos y de investigación en sostenibilidad, logística y economía circular.
