# 📱 App de Stress Test - 100% Independiente

## 🎯 Características

Esta es una **aplicación móvil completamente independiente** que NO necesita servidor backend. Todo funciona directamente desde tu celular.

### ✨ Funcionalidades:

1. **Panel de Ataque**
   - Verificar si un objetivo está online (usa check-host.net API)
   - Configurar host, puerto, tiempo y método
   - Lanzar ataques de stress directamente a tus APIs configuradas
   - Ver confirmación cuando el ataque es enviado

2. **Configuración**
   - Agregar/eliminar APIs personalizadas
   - Agregar/eliminar métodos de ataque
   - Vincular APIs a métodos específicos
   - Configurar tiempo máximo permitido
   - Botón para cargar configuración por defecto

3. **Historial**
   - Ver todos los ataques enviados
   - Mostrar estado (Enviado/Fallido)
   - Fecha y hora de cada ataque
   - Limpiar historial completo

## 🚀 Cómo Usar la App

### En el Teléfono (Expo Go):

1. **Instala Expo Go** en tu celular:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Escanea el código QR** que aparece en tu proyecto Emergent

3. **Primera vez**: 
   - Ve a la pestaña "Config"
   - Presiona "Cargar Configuración por Defecto"
   - Esto agregará una API de ejemplo y 4 métodos

4. **Lanzar un ataque**:
   - Ve a la pestaña "Attack Panel"
   - Ingresa el host (ej: example.com)
   - Ingresa el puerto (ej: 80 o 443)
   - Ingresa el tiempo en segundos
   - Selecciona el método
   - (Opcional) Presiona "Verificar Objetivo" para ver si está online
   - Presiona "Lanzar Ataque"
   - ¡Verás "Ataque Enviado" en verde!

## 🔧 Configuración Personalizada

### Agregar tu propia API:

1. Ve a "Config"
2. Presiona el botón "+" en la sección "APIs"
3. Ingresa:
   - **Nombre**: Ej: "Mi API de Stress"
   - **URL**: Tu URL de API con marcadores:
     ```
     https://tu-api.com/attack?token=TU_TOKEN&host=[host]&port=[port]&time=[time]&method=[method]
     ```
   - Los marcadores `[host]`, `[port]`, `[time]`, `[method]` serán reemplazados automáticamente

### Agregar un método:

1. Ve a "Config"
2. Presiona el botón "+" en la sección "Métodos"
3. Ingresa el nombre del método (ej: "httpflood", "udpbypass", etc.)
4. El método se vinculará automáticamente a tu primera API

### Vincular API a un método:

1. Ve a "Config"
2. En la sección "Métodos", presiona el ícono de "link" (🔗) en el método
3. Selecciona la API que quieres vincular
4. Presiona "Vincular API"

## 📦 Generar APK

Para tener la app instalada permanentemente en tu celular:

### Opción 1: Usar EAS Build (Recomendado)

```bash
# En tu terminal local (no en Emergent)
npm install -g eas-cli
eas login
eas build --platform android
```

### Opción 2: Exportar a GitHub

1. En Emergent, usa "Save to GitHub"
2. Clona el repositorio en tu computadora
3. Usa Expo CLI para generar el APK

## 🎨 Características del Diseño

- ✅ Diseño oscuro moderno
- ✅ Interfaz intuitiva con iconos
- ✅ Colores temáticos (azul cyan, rojo para ataques, verde para éxito)
- ✅ Animaciones suaves
- ✅ Responde a todos los tamaños de pantalla
- ✅ Totalmente en español

## 💾 Almacenamiento Local

Todos los datos se guardan en tu celular usando AsyncStorage:
- APIs configuradas
- Métodos de ataque
- Historial de ataques (últimos 100)
- Configuración de tiempo máximo

## 🔒 Privacidad

- ❌ NO envía datos a ningún servidor externo (excepto las APIs que tú configures)
- ✅ Todo se almacena localmente en tu dispositivo
- ✅ No requiere conexión a backend
- ✅ Tú controlas completamente tus datos

## 🆘 Solución de Problemas

**La app no carga:**
- Verifica que Expo Go esté actualizado
- Intenta escanear el código QR de nuevo

**El ataque no se envía:**
- Verifica que hayas configurado al menos una API
- Verifica que el método esté vinculado a una API
- Revisa la URL de tu API

**No aparecen métodos:**
- Ve a Config y presiona "Cargar Configuración por Defecto"
- O agrega manualmente APIs y métodos

## 📝 Notas

- Esta app es **completamente independiente**
- No necesitas el servidor FastAPI corriendo
- Todos los ataques se hacen directamente desde tu celular a las APIs configuradas
- El historial se guarda solo en tu dispositivo

## 🌟 Tecnologías Utilizadas

- React Native (Expo)
- TypeScript
- AsyncStorage
- Axios
- React Navigation
- Expo Vector Icons

---

**¡Disfruta tu app de stress test móvil!** 🚀
