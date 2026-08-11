# App HRU Quirófanos

Plataforma digital centralizada de la actividad quirúrgica y endoscópica del **Hospital Regional Ushuaia**.
Canal único y válido para la programación de turnos, la lista de verificación quirúrgica, el reporte de
incidencias, los módulos quirúrgicos y los indicadores de gestión del bloque.

Aplicación web instalable (PWA) sin dependencias ni proceso de compilación: un `index.html`, un manifiesto,
un service worker y tres iconos.

---

## Cómo publicarla en GitHub Pages

El repositorio puede llamarse como quieras: todas las rutas son relativas, así que la app funciona en
`usuario.github.io/<cualquier-nombre>/` sin tocar una línea de código.

1. Creá un repositorio nuevo en GitHub (por ejemplo `hru-bloque-quirurgico`), **público**.
2. Subí estos cinco archivos a la raíz del repositorio:
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
3. En el repositorio: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. A los pocos minutos queda publicada en `https://<usuario>.github.io/<nombre-del-repo>/`.

> Para que la instalación en el teléfono y el modo sin conexión funcionen hace falta **HTTPS**.
> GitHub Pages lo provee automáticamente.

Con Pages configurado así, publicar una versión nueva es `git push` y nada más: GitHub republica
el sitio en un par de minutos.

### Al publicar una versión nueva

Subí dos números y el resto se resuelve solo:

| Dónde | Constante |
|---|---|
| `sw.js` | `VERSION` (`'hru-quirofanos-v2'` → `'hru-quirofanos-v3'`) |
| `index.html` | `APP_VERSION` (se muestra al pie del menú lateral) |

Cambiar `VERSION` es lo que hace que los dispositivos descarten la copia cacheada.

**Actualización automática.** La app revisa si hay una versión nueva al abrirse, cada media hora,
cada vez que vuelve al frente y al recuperar la conexión. Cuando encuentra una:

- si la pantalla no tiene nada escrito, se actualiza y se recarga sola, sin preguntar;
- si hay un formulario a medio completar o un modal abierto, muestra una barra
  **«Hay una versión nueva · Actualizar ahora»** y espera. Nunca se pierde lo tipeado.

No hay que desinstalar ni reinstalar nada en los teléfonos.

---

## Instalación en los dispositivos

- **Android / Chrome:** menú ⋮ → *Instalar aplicación*, o el botón **Instalar** de la barra superior.
- **iPhone / iPad (Safari):** botón Compartir → *Agregar a pantalla de inicio*.
- **Escritorio (Chrome / Edge):** icono de instalación en la barra de direcciones.

Instalada, abre a pantalla completa, arranca sin conexión y muestra los recordatorios como
notificaciones del sistema.

---

## Persistencia de los datos

| Capa | Qué guarda | Cuándo |
|---|---|---|
| Firebase Realtime Database | Fuente compartida entre todos los dispositivos del hospital | Siempre que haya conexión |
| `localStorage` | Espejo completo de las seis colecciones | En cada cambio y en cada sincronización |
| Cola de escrituras | Cambios hechos sin conexión | Se reenvían solos al reconectar |

La app abre siempre con la última copia local conocida y se sincroniza en segundo plano. El indicador de la
barra superior muestra **Sincronizado**, **Sin conexión**, **N sin sincronizar** o **Modo local**.

Colecciones: `cirugias` (turnos), `incidencias`, `usuarios`, `reclamos`, `agenda` (habilitación de días y salas),
`consentimientos` (consentimientos informados generados) y `config` (valores unitarios de los módulos).

Agregando `?local=1` a la URL la app corre sin nube, con datos de demostración
(usuario `demo@hru.gob.ar`, contraseña `demo123`).

---

## Estructura de turnos

Seis salas, cada una con sus franjas horarias:

| Sala | Franjas | Observaciones |
|---|---|---|
| Quirófano 1 | **24 franjas de una hora, de 08:00 a 08:00** | Sala de **guardia**: urgencias y emergencias, todos los días del año |
| Quirófano 2, 3 y 4 | 08, 10, 12 (mañana) · 14, 16, 18 (tarde) | Solo turnos programados |
| Sala de Endoscopía Digestiva | 08:00 a 17:00, cada hora | 10 franjas |
| Quirófano de Obstetricia | 08, 10, 12 · 14, 16, 18 | Cesáreas; admite urgencias |

- **Anticipación mínima de 24 h** para turnos electivos. Las urgencias del Quirófano 1 y de Obstetricia la saltean.
- La Jefatura puede **habilitar o deshabilitar** el día completo o cada sala, y limpiar los turnos no confirmados.
  El Quirófano 1 queda fuera de esa llave: la guardia no se cierra.
- El parte del día se **imprime o descarga** ordenado por prelación.

### La guardia de 24 h del Quirófano 1

El Quirófano 1 no sigue la jornada de 08 a 20 h del resto del bloque: cubre las **24 horas corridas de 08:00 a
08:00 del día siguiente**, los siete días de la semana, sábados y domingos incluidos. La grilla lo muestra a lo
ancho, en tres bloques —Turno Mañana, Turno Tarde y **Guardia Nocturna (20:00 a 08:00)**—, y las franjas de
00:00 a 07:00 llevan la marca `+1 día` porque pertenecen a la guardia del día mostrado pero se operan en la
fecha calendario siguiente.

Por eso cada turno guarda dos fechas: `fecha` es la fecha real de la cirugía (la que se usa en el parte, los
recordatorios y los indicadores) y `diaGrilla` es el día en que la franja se dibuja. Coinciden en todo el bloque
salvo en la madrugada del Quirófano 1. Los identificadores `T1` a `T6` se conservaron en 08, 10, 12, 14, 16 y
18 h, así que los turnos cargados con la grilla anterior siguen apareciendo en su franja.

### Claves operativas

| Clave | Para qué |
|---|---|
| `0112` | Jefatura de Quirófanos |
| `2358` | Cancelar un turno / limpiar la grilla |
| `3340` | Autorización de Admisión y Egresos |
| `9876` | Dirección Médica (módulos de todos los servicios) |

> El control es del lado del cliente: sirve para separar roles en la operación diaria, no como seguridad
> real frente a alguien que inspeccione el código. Para eso hace falta autenticación en el servidor.

---

## Libro Blanco de Quirófanos

En el panel izquierdo, justo debajo del nombre de la app, hay un acceso destacado al **Libro Blanco**: el
*Manual de Organización y Funcionamiento de Quirófanos Centrales y de la Unidad de Endoscopía Digestiva*
(versión 3.0, mayo 2026, Jefatura del Departamento Quirúrgico del HRU), elaborado sobre las Directrices del
Ministerio de Salud de la Nación (IF-2020-14236688-APN).

Al tocarlo se abre el PDF en una **ventana emergente** dentro de la app, con botones para *abrir en pestaña
nueva* y *descargar*. En iPhone y iPad, donde Safari no muestra PDF dentro de un marco, la ventana ofrece
directamente el enlace a la pestaña propia del sistema.

El archivo viaja con la app (`libro-blanco-quirofanos-hru.pdf`, 1,3 MB) y el service worker lo precarga, así que
**también se consulta sin conexión**. Para reemplazarlo por una versión nueva alcanza con pisar ese archivo y
subir `VERSION` en `sw.js`.

---

## Consentimientos médicos informados

Solapa propia (`#consentimientos`) que genera el **consentimiento informado quirúrgico** del HRU con membrete
del hospital, listo para firmar.

- **86 procedimientos en 14 especialidades** con el contenido clínico precargado: descripción, complicaciones y
  consecuencias, alternativas terapéuticas y la cita del consenso en que se apoya (HerniaSurge/EHS, SAGES, WSES,
  ASCRS, ATA, NCCN, ASGE/ESGE, AAOS, ACOG/FIGO, EAU, AAO, AAO-HNS, ESVS, NASS, ABA/ISBI, entre otros).
  Todo el texto es **editable**: el documento final lo redacta el cirujano y lo adecua al caso (Lex Artis Ad-Hoc).
- El documento incluye siempre la **cláusula de modificación de la técnica intraoperatoria**, la **declaración de
  consentimiento**, un bloque de **revocación** con su firma y el pie legal de la **Ley 26.529** (y su Decreto
  Reglamentario 1089/2012).
- Firma por **representante legal** cuando el paciente es menor de edad o tiene la autonomía disminuida: el
  formulario abre los campos del representante y el documento cambia el bloque de firmas.
- Salidas: **descarga en Word (.doc)**, **impresión / PDF** y **registro guardado**, compartido con el resto del
  bloque igual que las demás colecciones.

### Del turno al consentimiento

Al **programar un turno** en la grilla, los datos filiatorios del paciente, la obra social, el diagnóstico con su
CIE-10, la cirugía, la fecha, la hora, la sala y la anestesia se **vuelcan solos** al consentimiento. La
especialidad se deduce del servicio y el procedimiento se busca por semejanza con el nombre de la cirugía
escrita, de modo que la evidencia queda cargada sin elegir nada.

Terminada la carga aparece la ventana **«Su cirugía se programó correctamente»** con el detalle del turno y el
botón para descargar el consentimiento: abre la solapa con todo completo, para leerlo, corregir lo que falte y
bajarlo. El consentimiento guardado queda **vinculado al turno** (`turnoId`), marca el ítem de consentimiento en
la HCE de esa cirugía y se anota en su historial. En la grilla, cada turno muestra el chip `CI ✓` o `SIN CI`, y
el menú lateral lleva el contador de turnos futuros sin consentimiento.

---

## Circuito del turno (código de colores)

```
Borrador → Pendiente → Validada → Confirmada → En curso → Realizada
   gris     amarillo      azul       verde      naranja   verde oscuro
                                  ↘ Suspendida (rojo, con causa obligatoria)
```

Reglas que el sistema hace cumplir:

- No se **valida** si faltan verificaciones de Farmacia, Esterilización, Hemoterapia o Anestesiología, o si la HCE
  no tiene los estudios preoperatorios y el consentimiento.
- No se **confirma** en el parte sin la autorización de Admisión y Egresos.
- No pasa a **en curso** sin la LVQ de Entrada y la Pausa Quirúrgica completas.
- No **cierra** sin la LVQ de Salida (conteo de gasas e instrumental).
- Toda **suspensión** exige causa y genera automáticamente una incidencia de categoría D.
- Pasado el cierre de las 13:00 solo ingresan emergencias y urgencias diferibles (P1–P2).

### Prioridad de prelación

P1 Emergencias (incisión < 30 min) · P2 Urgencias diferibles (< 6 h) · P3 Alta complejidad y pediatría ·
P4 Recursos escasos · P5 Espera > 90 días (automática) · P6 Electiva estándar.

---

## Recordatorios

Se recalculan cada minuto a partir de los datos y del reloj; no se guardan como registros. Aparecen en la
campana de la barra superior, en la vista **Recordatorios** y —con permiso— como notificación del sistema.

Cierre de solicitudes 13:00 · publicación del parte 14:00 · emergencias sin incisión · urgencias diferibles ·
coordinación de áreas 48–72 h antes · autorización de Admisión pendiente · retrasos de más de 60 min ·
procedimientos excedidos · informe operatorio (< 2 h) · muestras sin enviar a Anatomía Patológica ·
incidencias A–C (< 2 h) y D–F (< 24 h) · reclamos dirigidos al autor o a la Jefatura (48 h hábiles) ·
espera > 90 días · vencimiento de seguro y de RCP.

> Las notificaciones del sistema se emiten mientras la app está abierta (incluso en segundo plano o
> instalada). Para avisos con la app cerrada haría falta un servidor de push (Firebase Cloud Messaging),
> que hoy no forma parte de esta versión.

---

## Indicadores de gestión

| KPI | Meta |
|---|---|
| Tasa de utilización del bloque | ≥ 75 % |
| Tasa de suspensiones | < 5 % |
| Tiempo de recambio (turnover) | ≤ 30 min |
| Informe operatorio cargado en menos de 2 h | ≥ 95 % |

Más causas de suspensión y actividad por servicio del período.

---

## Estadísticas quirúrgicas

Solapa aparte de **Indicadores**. Mientras los indicadores miden el bloque contra las metas
institucionales, las estadísticas comparan la producción **entre equipos** sobre un período libre
(desde/hasta, con atajos: este mes, mes anterior, últimos 3 meses, año en curso, últimos 12 meses).

Dos vistas, **por servicio** y **por cirujano**, con las mismas columnas ordenables:

| Columna | Cómo se calcula |
|---|---|
| Realizadas · Suspendidas · % suspensión | Sobre las cirugías que llegaron al parte (confirmadas, en curso, realizadas y suspendidas) |
| Horas de quirófano | Tiempo real medido entre inicio y fin; si no está cargado, la duración estimada de la solicitud |
| % del bloque | Participación de cada equipo en las horas totales del período |
| Duración media | Minutos por cirugía realizada |
| Informe ≤ 2 h | Informes operatorios cargados dentro de la meta institucional |
| LVQ completa | Cirugías con las tres fases de la lista de verificación (entrada, pausa y salida) |
| Espera media | Días entre la solicitud y la cirugía |
| En espera | Foto del estado actual, no del período; marca en rojo las esperas mayores a 90 días |

Tocando un servicio se abre su desglose por cirujano. Todo el cuadro se exporta a **CSV**
(separador `;` y BOM, listo para abrir en Excel en español).

**Quién ve qué.** La Jefatura ve el plantel completo. Un profesional con sesión iniciada ve el
agregado por servicio y, en el desglose nominal, únicamente sus propios datos: el rendimiento
individual de un colega no es información de acceso general.

---

## Módulos quirúrgicos

Solapa propia, dentro del bloque **Cirujano**. No es una planilla aparte: el módulo **nace de la cirugía**.

### Del nomenclador al módulo

Al programar un turno, el campo *Cirugía / procedimiento* es un **buscador sobre el Nomenclador Modulado
2025 de los Hospitales Regionales de Tierra del Fuego** (1.329 prácticas, transcriptas del archivo oficial
del HRU). Se escriben dos o tres letras —`colecis`, `hernia ing`, `rodilla`—, se elige la práctica y con ella
queda fijado su **módulo A, B o C**. La búsqueda ignora tildes, admite palabras sueltas y ofrece primero las
prácticas del servicio del cirujano.

Si la práctica no figura en el nomenclador puede escribirse a mano, pero entonces **hay que declarar el
módulo**: sin módulo el turno no se guarda, porque no habría nada que imputar.

| Módulo | Complejidad | Prácticas en el nomenclador |
|---|---|---|
| A | Alta | 590 |
| B | Intermedia | 458 |
| C | Baja | 281 |

> Única desviación respecto del PDF oficial: *reconstrucción de cavidad orbitaria* (Cirugía Reparadora ·
> Cejas y Párpados) figura sin módulo en el original y la Dirección la asignó al **módulo A**.

### Quién percibe el módulo

El **cirujano** queda inscripto de oficio con el módulo de la práctica. Al terminar de programar, la ventana
de confirmación **recuerda cargar el cirujano ayudante** —y al anestesiólogo/a si corresponde— con el módulo
A, B o C que le corresponda a cada uno; se propone el de la cirugía y puede modificarse. El mismo formulario
está en la ficha del turno (*Equipo y módulos*) y en el detalle de la solapa.

### Cuándo se imputa

**Solo cuando la cirugía está marcada como Realizada.** Un turno programado, confirmado o en curso no figura
en la solapa: aparece recién cuando se cierra el procedimiento con la LVQ de salida. Así la planilla de
módulos y el parte quirúrgico no pueden contradecirse.

La solapa avisa de dos deudas: cirugías realizadas **sin ayudante cargado** y cirugías realizadas **sin
práctica del nomenclador** (los turnos anteriores a esta versión). Ambas se resuelven desde el mismo aviso.

### Quién ve qué

| Quien mira | Alcance |
|---|---|
| Cirujano con sesión iniciada | Únicamente los módulos de **su servicio** |
| Dirección Médica (clave `9876`) | **Todos** los servicios y profesionales, con filtro por servicio |

### Estadísticas

Período por **día, semana, mes, año** o rango libre, con navegación hacia atrás y adelante. Tres vistas:
**por profesional** (cirugías, módulos como cirujano y como ayudante, A/B/C y total), **por servicio** y
**detalle** cirugía por cirugía con el equipo completo. Más la evolución del período (por día o por mes) y
el reparto por complejidad. Todo exportable a **CSV**.

**Importes.** La Dirección Médica puede cargar los valores unitarios de A, B y C —quedan guardados en la
base compartida— y estimar la liquidación del período. Están **ocultos por defecto**: se muestran solo si la
Dirección activa la casilla, y nunca para el resto de los profesionales.

---

## Canal de reclamos

Comunicación formal Jefe a Jefe, con **hilo de conversación**: la Jefatura responde, el autor puede
replicar y cualquiera de los dos da el reclamo por cerrado (o lo reabre).

Cada reclamo indica **a quién le toca actuar** y cuántos mensajes tiene sin leer quien está mirando.
Los avisos son dirigidos —solo los reciben el autor y la Jefatura— y llegan a la campana, al contador
del menú y, con permiso, como notificación del dispositivo:

| Situación | Quién recibe el aviso |
|---|---|
| Reclamo nuevo o réplica del autor | Jefatura de Quirófanos |
| Respuesta de la Jefatura sin leer | Autor del reclamo |
| Plazo de 48 horas hábiles por vencer o vencido | Jefatura (crítico si venció) |
| Reclamo respondido y sin cerrar | Autor, como recordatorio suave |

Cerrar el reclamo silencia todos los avisos. Hay además un botón **Avisar por correo**, que abre un
borrador en el cliente de correo del dispositivo: lo envía la persona, la app no manda nada sola.

Los reclamos cargados con la versión anterior (asunto, texto y una única respuesta) se leen como un
hilo de dos mensajes, sin migrar nada.

---

## Desarrollo local

No hace falta Node ni instalar nada:

```bash
python3 -m http.server 8777
```

Después abrí `http://127.0.0.1:8777/` (o `http://127.0.0.1:8777/?local=1` para el modo de demostración).

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Toda la aplicación: estilos, vistas y lógica |
| `manifest.webmanifest` | Identidad de la PWA, iconos y accesos directos |
| `sw.js` | Service worker: apertura sin conexión y actualización automática |
| `icon-*.png` | Iconos de instalación (192, 512 y maskable) |
| `libro-blanco-quirofanos-hru.pdf` | Manual de Organización y Funcionamiento del bloque quirúrgico |
