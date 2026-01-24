Descripción general del proyecto

Este proyecto corresponde a una aplicación web para la gestión y visualización de autobuses, que incluye funcionalidades como:

Visualización de rutas y autobuses en un mapa

Gestión de usuarios

Seguimiento de ubicación por GPS

Paneles de administración

La aplicación está desarrollada principalmente en JavaScript, utilizando Firebase como plataforma de backend para la autenticación, base de datos y hosting.


--------Estructura general del proyecto------
📦 programa_autobuses
 ┣ 📂 autobuses3   → Frontend (cliente)
 ┣ 📂 backend      → Lógica de publicación GPS
 ┗ 📂 public       → Archivos públicos compartidos
Esta separación refleja una arquitectura por capas y por responsabilidades, donde cada módulo cumple una función 
clara dentro del sistema y se evita el acoplamiento innecesario entre componentes.

------Directorio public/-------

El directorio public/ contiene las distintas vistas del sistema, organizadas por funcionalidad y no por tecnología.

public/
 ┣ 📂 admin_trazador
 ┣ 📂 destino
 ┣ 📂 editor_usuario
 ┣ 📂 login
 ┣ 📂 imagenes
 ┣ 📂 … (otros módulos funcionales)
 ┣ 📄 index.html
 ┣ 📄 index.js


El proyecto contiene más carpetas además de las listadas, las cuales siguen el mismo criterio de organización.

Cada carpeta dentro de public/ representa un módulo funcional independiente, como por ejemplo:

Administración

Autenticación

Gestión de destinos

Cada módulo agrupa sus propios archivos HTML, CSS y JavaScript, lo que permite:

- Evitar archivos monolíticos

- Mejorar la legibilidad del código

- Facilitar el mantenimiento

- Reforzar la separación de responsabilidades


--------Arquitectura por capas dentro de los módulos----------

📂 admin_trazador
 ┣ 📄 admin_trazador.html
 ┣ 📄 admin_trazador.css
 ┣ 📄 admin_trazador_principal.js
 ┣ 📄 admin_trazador_ui.js
 ┣ 📄 admin_trazador_mapa.js
 ┣ 📄 admin_trazador_firebase.js
 ┣ 📄 admin_trazador_estado.js


-----admin_trazador.html-------

Define la estructura visual del módulo de administración del trazador. Contiene los elementos base de 
la interfaz que posteriormente son manipulados desde JavaScript.



-------admin_trazador.css-----------

Controla el estilo y diseño visual del módulo.


-----------admin_trazador_principal.js----------

Es el archivo central del módulo. Coordina el flujo general de la funcionalidad, inicializa componentes y conecta las distintas capas internas del módulo.




-------Conclusión---------

De esta manera, cada uno de los módulos del proyecto se compone siguiendo una arquitectura por capas, lo que reduce errores al momento de realizar mantenimiento, aplicar cambios o escalar el sistema.
Al estar organizado por funcionalidades, se logra identificar de forma clara la lógica distribuida en cada carpeta, mejorando la comprensión y calidad del proyecto en general.
