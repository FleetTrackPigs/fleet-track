# Solución de enrutamiento SPA para Fleet Track

## El problema

Las aplicaciones de una sola página (SPA, Single Page Applications) como Fleet Track, construidas con React Router, funcionan perfectamente cuando se navega dentro de la aplicación utilizando enlaces internos. Sin embargo, cuando un usuario:

- Accede directamente a una URL como `https://fleet-track-web.onrender.com/admin/dashboard`
- Actualiza la página mientras está en una ruta que no es la raíz
- Guarda un marcador a una página específica y lo visita más tarde

El servidor busca un archivo físico en esa ruta (por ejemplo, buscando `/admin/dashboard/index.html`), pero este archivo no existe porque todas las rutas son manejadas por el enrutador del lado del cliente (React Router).

Esto resulta en un error 404 (Not Found) en servicios de alojamiento estático como Render.com.

## La solución

Para resolver este problema, implementamos una solución que redirige todas las solicitudes al archivo `index.html` principal, permitiendo que React Router maneje la ruta correctamente en el lado del cliente.

### Archivos clave implementados

#### 1. `public/_redirects.json`

```json
{
  "redirects": [
    {
      "source": "/*",
      "destination": "/index.html",
      "type": 200
    }
  ]
}
```

Este archivo es específico para Render.com y define reglas de redirección. La regla `"/*"` captura todas las rutas y las redirige a `/index.html` con un código de estado 200 (OK).

#### 2. `public/404.html`

Este archivo implementa una solución de redirección para cuando el servidor responde con un 404. Utiliza JavaScript para:

1. Tomar la URL actual
2. Convertir la ruta y los parámetros de búsqueda en un formato especial
3. Redirigir al usuario a la página principal con esos parámetros codificados

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <script>
      var pathSegmentsToKeep = 0
      var l = window.location
      l.replace(
        l.protocol +
          '//' +
          l.hostname +
          (l.port ? ':' + l.port : '') +
          l.pathname
            .split('/')
            .slice(0, 1 + pathSegmentsToKeep)
            .join('/') +
          '/?/' +
          l.pathname
            .slice(1)
            .split('/')
            .slice(pathSegmentsToKeep)
            .join('/')
            .replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
      )
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>
```

#### 3. Script de redirección en `index.html`

Este script en el archivo `index.html` principal detecta si la página fue cargada desde una redirección del script de 404, y si es así, reconstruye la URL original:

```html
<script type="text/javascript">
  ;(function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search
        .slice(1)
        .split('&')
        .map(function (s) {
          return s.replace(/~and~/g, '&')
        })
        .join('?')
      window.history.replaceState(
        null,
        null,
        l.pathname.slice(0, -1) + decoded + l.hash
      )
    }
  })(window.location)
</script>
```

#### 4. `render.yaml`

Este archivo de configuración de Render.com define cómo se debe servir la aplicación:

```yaml
services:
  - type: web
    name: fleet-track-web
    runtime: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

La sección `routes` especifica que cualquier ruta (`/*`) debe ser reescrita a `/index.html`, permitiendo que React Router maneje la navegación.

#### 5. `static.json`

Este archivo proporciona una configuración adicional para sistemas de alojamiento estático:

```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

## Cómo funciona el proceso completo

1. Un usuario navega directamente a una URL como `https://fleet-track-web.onrender.com/admin/dashboard`
2. El servidor Render.com recibe la solicitud y, gracias a la configuración de `render.yaml` y `_redirects.json`, sirve el archivo `index.html` en lugar de devolver un error 404
3. React se inicializa y React Router examina la URL actual
4. React Router renderiza el componente correspondiente basado en la ruta `/admin/dashboard`

En el caso improbable de que la configuración principal falle:

1. El servidor envía la página `404.html`
2. El script en `404.html` redirige al usuario a la raíz con un parámetro de consulta especial (por ejemplo, `/?/admin/dashboard`)
3. El script en `index.html` detecta este parámetro especial
4. El script reconstruye la URL original en el historial del navegador sin provocar una recarga
5. React Router detecta la ruta y muestra la página correcta

## Recomendaciones

- No elimine ninguno de estos archivos, ya que trabajan juntos para proporcionar la redirección completa
- Si se agregan nuevas rutas a la aplicación, no es necesario modificar esta configuración, ya que captura todas las rutas posibles
- Si se cambia el servicio de hosting, es posible que se necesiten ajustes específicos para ese proveedor

## Solución de problemas

Si siguen ocurriendo errores 404 después de implementar esta solución:

1. Verifique que todos los archivos descritos estén presentes en el código desplegado
2. Asegúrese de que el archivo `render.yaml` esté en la raíz del proyecto
3. Compruebe que el servicio en Render.com esté configurado como un sitio estático
4. Borre la caché del navegador o pruebe en una ventana de incógnito
5. Contacte al soporte de Render.com si el problema persiste, ya que podría ser específico de su configuración de hosting
