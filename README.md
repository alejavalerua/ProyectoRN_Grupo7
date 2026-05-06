# <img width="7%" alt="logo" src="https://github.com/user-attachments/assets/2ea73b6a-b107-451e-90c9-b0aed4f233c3" /> PeerSync: Structured Peer Assessment App

**Versión React Native**  
Aplicación móvil desarrollada en **React Native + Expo** que permite la coevaluación estructurada entre pares en entornos académicos colaborativos.

<br>

## 👩‍💻 Equipo de Desarrollo
**Equipo #7**
* Juan Miguel Carrasquilla Escobar ([jmcarrasquilla@uninorte.edu.co](mailto:jmcarrasquilla@uninorte.edu.co))
* Elvira Elena Florez Carbonell ([elviraf@uninorte.edu.co](mailto:elviraf@uninorte.edu.co))
* Keiver De Jesus Miranda Lemus ([mkeiver@uninorte.edu.co](mailto:mkeiver@uninorte.edu.co))
* **Alejandra Valencia Rua** ([alejandrarua@uninorte.edu.co](mailto:alejandrarua@uninorte.edu.co))

<br>

## 📋 Tabla de Contenidos
1. [Descripción de la Aplicación](#-descripción-de-la-aplicación)
2. [Demos de la Aplicación](#-demos-de-la-aplicación)
3. [Instalación](#️-instalación)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
6. [¿Cómo surge PeerSync?](#-cómo-surge-peersync)

<br>

## 📌 Descripción de la Aplicación

### ✍🏼 Propósito del Proyecto
PeerSync tiene como propósito **transformar** los procesos tradicionales de evaluación en trabajos grupales, permitiendo que los estudiantes participen activamente en la valoración del desempeño de sus compañeros mediante un sistema de coevaluación estructurado.

### 🎯 Objetivos
**Objetivo General:**  
Desarrollar una aplicación móvil que permita a estudiantes y docentes realizar coevaluaciones entre pares de forma estructurada, con métricas claras y visualizaciones intuitivas.

**Objetivos Específicos:**
- Gestión de cursos y grupos
- Importación de grupos desde Brightspace (CSV)
- Creación y gestión de evaluaciones
- Coevaluación entre pares (sin autoevaluación)
- Cálculo automático de métricas
- Visualización de resultados según rol

<br>

### 👥 Roles del Sistema

**👩‍🏫 Teacher**  
- Crear y gestionar cursos  
- Importar grupos desde Brightspace  
- Crear evaluaciones  
- Visualizar métricas y reportes  

<br>

**👨‍🎓 Student**  
- Unirse a cursos  
- Ver sus grupos  
- Realizar evaluaciones a compañeros  
- Consultar resultados (si están públicos)

<br>

### 📱 Tecnologías Utilizadas
- **React Native** + **Expo** (SDK 52)
- **TypeScript**
- **Roble** (Autenticación y Storage)
- **React Navigation**
- **NativeWind** (Tailwind)
- Brightspace (Importación CSV)

<br>

## 🎥 Demos de la Aplicación

**Entrega #1:** https://youtu.be/2AGyIi9vJXM

<br>

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/PeerSyncRN.git

# Entrar al proyecto
cd PeerSyncRN

# Instalar dependencias
npm install

# Ejecutar la aplicación
npx expo start
```

### ❗ Requisitos

* ```Node.js``` ≥ 20

* Expo Go (Descargar la app desde Google Play o App Store) o emulador

<br>

## 🧱 Estructura del Proyecto
La aplicación sigue principios de arquitectura limpia y feature-first:

```bash
src/
├── core/                  # Configuración global, temas, utils, constants
├── features/
│   ├── auth/              # Autenticación con Roble
│   ├── course/            # Cursos (listado, detalle, unirse)
│   ├── group/             # Grupos dentro de un curso
│   ├── evaluation/        # Evaluaciones y coevaluación
│   ├── teacher/           # Vistas específicas para docentes
│   └── student/           # Vistas específicas para estudiantes
├── navigation/            # Stack, Tabs y Protected Routes
├── services/              # API calls a Roble
├── store/                 # Zustand stores
├── types/                 # TypeScript interfaces
├── utils/                 # Helpers y validaciones
└── components/            # Componentes compartidos
```

<br>

## 💡 ¿Cómo surge PeerSync?
En la educación universitaria, el trabajo colaborativo constituye una estrategia pedagógica clave para el desarrollo de competencias técnicas, sociales y profesionales. Sin embargo, los modelos tradicionales de evaluación en el aula suelen basarse principalmente en calificaciones asignadas exclusivamente por el docente, lo que limita la participación activa del estudiante y no siempre permite capturar de manera precisa el desempeño individual dentro de actividades grupales. Este enfoque centrado únicamente en la evaluación docente puede generar percepciones de inequidad cuando la nota final de un proyecto colaborativo no refleja el aporte real de cada integrante del equipo. Además, la concentración de la evaluación en momentos específicos del curso (como entregas finales o exámenes) incrementa la presión académica y reduce las oportunidades de retroalimentación continua.
De acuerdo con Moreno Pabón (2023), los procesos evaluativos en la educación superior deben evolucionar hacia modelos más dinámicos y participativos que fomenten la responsabilidad, la reflexión crítica y la transparencia en el aprendizaje. La autora resalta la importancia de integrar prácticas que permitan observar el progreso del estudiante y fortalecer su implicación activa en los procesos formativos.

En la misma línea, Basurto-Mendoza et al. (2021) sostienen que las prácticas de coevaluación constituyen enfoques innovadores dentro de la práctica pedagógica, ya que favorecen la identificación de vacíos de conocimiento, incrementan la motivación y promueven el desarrollo de habilidades críticas. Asimismo, estas metodologías proporcionan a los docentes información más auténtica sobre el progreso real de los estudiantes en contextos colaborativos Esta fragmentación tecnológica limita la posibilidad de implementar procesos de retroalimentación continua y análisis comparativo del desempeño.

En este contexto, se identifica la necesidad de desarrollar una solución tecnológica que permita formalizar la evaluación colaborativa mediante una aplicación móvil estructurada. De esta manera, **PeerSync** surge como respuesta a estas limitaciones, para transformar los procesos tradicionales de evaluación en entornos universitarios, integrando fundamentos pedagógicos contemporáneos con una solución tecnológica estructurada y sostenible.
