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
| `localStorage` | Espejo completo de todas las colecciones | En cada cambio y en cada sincronización |
| Cola de escrituras | Cambios hechos sin conexión | Se reenvían solos al reconectar |

La app abre siempre con la última copia local conocida y se sincroniza en segundo plano. El indicador de la
barra superior muestra **Sincronizado**, **Sin conexión**, **N sin enviar** o **Modo local**. Mientras todo va
bien, en el teléfono el indicador no ocupa lugar; **apenas hay algo sin enviar aparece en ámbar y late**, y al
tocarlo explica qué quedó pendiente y ofrece reintentar. Antes estaba oculto en pantallas de menos de 900 px:
un cambio hecho sin señal podía quedarse en el dispositivo sin que nadie se enterara.

### El último cambio gana, no el último envío

Cada escritura se sella con la hora del servidor de Firebase (no con el reloj del dispositivo, que puede estar
corrido). Cuando la cola descarga un cambio que estuvo esperando, lo hace dentro de una **transacción** que
primero mira la nube: si ese registro fue editado *después*, el cambio viejo se descarta y el dispositivo
adopta lo que hay en la nube. Sin esta comparación, una baja registrada sin señal podía volver horas o días
más tarde y pisar el alta que la Jefatura ya había dado desde otro equipo.

Las acciones que deciden quién puede trabajar —**autorizar** y **dar de baja** una cuenta— esperan la
confirmación de la nube antes de dar el aviso. Si el cambio quedó solo en el dispositivo, el cartel lo dice
con todas las letras en lugar de anunciar un alta que el resto del hospital todavía no ve, y la pantalla de
Profesionales muestra una advertencia roja mientras haya cambios sin enviar.

Colecciones: `cirugias` (turnos), `incidencias`, `usuarios`, `reclamos`, `agenda` (habilitación de días y salas),
`consentimientos` (consentimientos informados generados), `config` (valores unitarios de los módulos y
financiadores agregados a mano) y `comunicados` (avisos de la Jefatura, con sus acuses de lectura).

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
- **El bloque programado nace cerrado** (ver más abajo).
- El parte del día se **imprime o descarga** ordenado por prelación.

### El bloque nace cerrado

Desde la versión 2.4, **todos los días, los quirófanos 2, 3 y 4 y la Sala de Endoscopía aparecen bloqueados**,
turno de mañana y turno de tarde. Nadie puede programar ahí hasta que la **Jefatura de Quirófanos** lo abra.

Dos salas quedan fuera de la llave:

| Sala | Estado |
|---|---|
| Quirófano 1 — guardia de urgencias | Abierto siempre, 08:00 a 08:00. **No se puede cerrar** |
| Quirófano de Obstetricia — cesáreas | Abierto por defecto; la Jefatura puede cerrarlo expresamente |

**La llave es el turno, no la sala.** La Jefatura abre mañana y tarde por separado, sala por sala, desde
*Programación Diaria → Jefatura*:

- **Abrir el día completo**: mañana y tarde, solo mañana, solo tarde, o cerrar el día.
- **Sala por sala, turno por turno**: un botón por turno; en verde el que está abierto.
- **Repetir esta configuración**: copia lo abierto a los próximos 7 o 30 días (hábiles o corridos). Pide la
  clave `0112` porque alcanza a varias fechas. Sin esto habría que repetir la apertura día por día todo el año.

Abrir un turno abre el día automáticamente; cerrar el día cierra todo lo que hubiera abierto. **Los turnos ya
cargados no se pierden**: siguen visibles y editables aunque después se bloquee la franja; si corresponde, se
suspenden con causa.

El bloqueo se aplica en los tres lugares donde se podría colar un turno: la grilla no ofrece la franja, la
*Solicitud Quirúrgica* no la lista, y tanto la apertura del formulario como el guardado la rechazan —incluso
si el turno se cerró mientras el formulario estaba abierto—.

Todo se guarda en la colección `agenda` de Firebase, un documento por fecha, así que la apertura que hace la
Jefatura se ve en el momento en el resto de las computadoras:

```json
{ "id": "2026-08-20", "on": true, "salas": { "Q2": { "M": true, "T": false }, "END": { "M": true } } }
```

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
| `0112` | Jefatura de Quirófanos — **abre el bloque**: día, turno y sala |
| `2358` | Cancelar un turno / limpiar la grilla |
| `3340` | Autorización de Admisión y Egresos |
| `9876` | Dirección Médica (módulos de todos los servicios y estadísticas quirúrgicas) |

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

### Cada uno recibe lo suyo

Un aviso quirúrgico solo le llega a **quien puede actuar sobre él**: el cirujano dueño del turno
(`cirujanoEmail`) y la Jefatura, que necesita la vista global. Un cirujano no ve los retrasos, informes
pendientes ni muestras sin enviar de sus colegas. Si a todos les suena todo, el aviso deja de leerse.

Las cirugías **sin cirujano identificado** —cargadas por la Jefatura, o anteriores a que se registrara el
dato— quedan solo en manos de la Jefatura, que puede averiguar de quién son.

Los avisos que no dependen de una cirugía mantienen su alcance propio: la habilitación es de cada
profesional, las incidencias y las cuentas por autorizar son de la Jefatura, y los reclamos van al autor
y a la Jefatura.

### Visto

Marcar un recordatorio como **visto** lo silencia por la jornada: deja de contar en la campana, queda
atenuado al final de su grupo y no vuelve a saltar como notificación del dispositivo. Abrir el aviso
—tocar «Ver», «Ir» o «Abrir»— también lo da por visto.

No lo borra, y es deliberado: un recordatorio no es un mensaje, se recalcula a partir del estado real y
existe mientras exista el problema que lo origina. Si al día siguiente sigue sin resolverse, **vuelve a
contar**. Así un informe operatorio sin cargar no se puede silenciar para siempre con un clic.

La marca se guarda por dispositivo y lleva el correo de quien la puso, de modo que si dos profesionales
comparten la computadora del quirófano cada uno mantiene su propia lista.

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

Tres vistas: **por servicio**, **por cirujano** y **por tipo de cirugía** (una fila por práctica del
nomenclador). Las dos primeras comparten las mismas columnas ordenables:

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

### Por tipo de cirugía

Las dos primeras vistas miran **quién** opera; esta mira **qué** se opera. Cada fila es la
**práctica** tal como se cargó en el turno: la misma descripción del Nomenclador Modulado 2025 que
fija el módulo A, B o C en la solapa de **Módulos Quirúrgicos** («colecistectomía simple», «hernia
inguinal laparoscópica con colocación de malla unilateral», «cesárea - microcesárea»). Los turnos
declarados fuera del listado entran con el texto libre del procedimiento, igual que en Módulos.
Como una misma práctica puede repartirse entre varios equipos, el cuadro **engloba al servicio y al
cirujano** en lugar de reemplazarlos.

- **Gráfico de torta** con la distribución de las cirugías realizadas, del mismo trazo que el de
  incidencias del Panel. Entran con color propio las **diez prácticas más operadas** del período y
  el resto se suma en una porción gris, «Otras N prácticas»: con cientos de prácticas posibles, el
  detalle largo se lee en el cuadro y no en el gráfico. Al lado, las diez que más quirófano
  consumieron.
- **Cuadro** con la práctica y, debajo, su capítulo y sección del nomenclador; la letra del módulo
  con el mismo distintivo de color que en Módulos; realizadas, % del total, horas, duración media,
  suspensiones y cuántos servicios y cuántos cirujanos sostienen cada práctica.
- Tocando una práctica se abre su desglose **por servicio** y **por cirujano**.
- **Alcance** seleccionable: el profesional alterna entre *Mis cirugías* y *Mi servicio*; la Jefatura
  y la Dirección Médica ven todo el bloque.
- Exporta a CSV con capítulo, sección, módulo y el detalle de servicios y cirujanos de cada práctica
  en la misma fila.

### Quién ve qué

La regla es una sola y vale para las tres solapas, para las tarjetas de cabecera, para los dos
gráficos del pie y para el CSV:

| Quién | Alcance |
|---|---|
| **Jefe de Quirófanos** (clave `0112`) y **Dirección Médica** (clave `9876`) | Todo el bloque: todos los servicios y todos los profesionales, con nombre y apellido |
| **Cirujano con sesión iniciada** | Lo suyo y lo de **su servicio**, y nada de los demás servicios |

Del propio servicio el cirujano ve el **agregado**, no el rendimiento nominal de cada colega: en la
solapa por cirujano aparece únicamente su fila, y en el cuadro por tipo de cirugía la producción del
resto figura agrupada como «Otros profesionales del servicio» —aunque el recuento de cuántos
cirujanos hicieron esa práctica sí es real—. El rendimiento individual de un colega no es
información de acceso general.

Las cifras de cabecera y los gráficos siguen el mismo alcance: el cirujano los lee sobre su
servicio, con una única referencia institucional —el **% del bloque** que consumió su equipo—, que
es un dato del hospital y no de otro equipo.

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

### Los nombres de los servicios

El servicio de cada profesional se escribía a mano en el alta, así que en la base conviven `Cirugía General`
y `Cirugia General`. Comparándolos literalmente, un cirujano no veía sus propios módulos. Desde la versión
2.3.1 **dos servicios son el mismo si coinciden ignorando tildes, mayúsculas, puntuación, espacios de más y
palabras de enlace** (`y`, `de`, `la`): `Traumatologia`, `ORTOPEDIA` y `Traumatología y Ortopedia` son el
mismo servicio, y `Otorrinolaringología` equivale a `ORL`. Un nombre incompleto se resuelve solo si apunta a
un único servicio del listado: `cirugia`, que podría ser cuatro, se deja como está.

El alta pasó a ser un **desplegable** con el listado oficial, para que no vuelvan a aparecer variantes.

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

## Comunicados de la Jefatura

Canal de aviso urgente **de la Jefatura hacia el resto**: el camino inverso al de los reclamos. La
solapa **Comunicados** está en el menú de Jefatura, detrás de la clave `0112`.

A diferencia de los recordatorios —que se derivan del estado de los datos y se recalculan solos— un
comunicado es un registro que la Jefatura redacta y que queda guardado con su **fecha y hora de
emisión**.

### Cómo llega

Aparece como **ventana modal** apenas el destinatario entra a la app. No se cierra con Escape, ni con
el botón atrás, ni tocando el fondo: la única salida es confirmar la lectura. Si no se confirma,
vuelve a aparecer cada **10 minutos**, con un tope de insistencia según la prioridad:

| Prioridad | Insiste | Sonido |
|---|---|---|
| Urgente | Sin límite, cada 10 minutos hasta que se confirme | Tres tonos |
| Importante | Hasta 3 veces | Dos tonos |
| Informativo | Una sola vez | Un tono |

El tope existe para que un aviso menor no moleste a un cirujano en pleno quirófano. El sonido se
sintetiza con Web Audio: no hay archivo que descargar y funciona sin conexión. El navegador lo
bloquea hasta que hubo alguna interacción con la página; si lo bloquea, el modal igual aparece.

Quien tenga dudas responde con el botón **Confirmo y consulto a la Jefatura**, que registra la
lectura y abre el canal de reclamos con el asunto ya escrito. No se agregó un canal de respuesta
nuevo: se usa el que ya existía. Ese botón solo aparece para los profesionales con cuenta, que son
los únicos que pueden abrir un reclamo.

### A quién se dirige

| Destino | Alcance |
|---|---|
| Un profesional en particular | Una sola persona del padrón |
| Un servicio completo | Todos los profesionales de ese servicio |
| Todos los profesionales | El padrón entero de cuentas activas |
| Solo Dirección Médica | Quien entre con la clave de Dirección |
| Profesionales y Dirección Médica | Los dos grupos anteriores |
| Personal no registrado | Quien entra sin cuenta: enfermería, higiene, instrumentación, radiología y demás |

El selector de servicio indica cuántos profesionales tiene cada uno, y la app no deja emitir a un
servicio sin gente. Las cuentas dadas de baja nunca cuentan como destinatarias. Los servicios se
comparan sin tildes ni mayúsculas, igual que en el resto de la app.

### Quién queda registrado

Los profesionales entran con su correo, así que cada lectura guarda **nombre, servicio y hora
exacta**. La Dirección Médica entra con clave compartida y no tiene identidad individual: se registra
como un único renglón. Se sabe que Dirección lo leyó, no qué persona de Dirección.

El **personal no registrado** es un caso aparte. Al confirmar declara su área —enfermería de
quirófano, higiene, instrumentación quirúrgica, técnicos de radiología u otros— y puede dejar su
nombre si quiere; quien no lo deja figura como «Sin identificar». Para que el emergente no le insista
a quien ya confirmó se guarda un identificador del dispositivo, que no identifica a la persona: dos
personas que compartan la misma máquina comparten la clave.

De ahí se sigue una limitación que conviene tener presente: **de ese grupo no hay padrón**. Nadie
sabe cuántos enfermeros o instrumentadores existen ni quién entró hoy, así que la Jefatura ve
«7 lecturas registradas» y nunca «7 de 20». Para los demás destinos sí hay denominador, con
porcentaje y lista de faltantes.

La Jefatura puede descargar la planilla en CSV en todos los casos.

### Archivar y eliminar

**Archivar** saca el comunicado de circulación y conserva el registro; se puede reactivar cuando se
quiera. **Eliminar** lo borra definitivamente, junto con la constancia de quiénes lo leyeron, y por eso
el botón aparece solo cuando el comunicado ya cumplió su función: cuando lo confirmaron **todos** sus
destinatarios, o —si va dirigido a personal sin cuenta, donde no hay forma de saberlo— cuando está
archivado.

Pasados 30 días de la emisión deja de interrumpir, aunque siga en la lista.

### Si no hay comunicados, no hay cambio

Mientras la Jefatura no emita ninguno, los profesionales no ven la solapa, ni el modal, ni reciben
sonido alguno: la app se comporta exactamente igual que antes. El primer comunicado es lo que
enciende la función.

Las lecturas se escriben en la rama `comunicados/<id>/lecturas/<clave>` y no con el `upsert` del
documento entero: si dos profesionales confirman al mismo tiempo, el segundo borraría el acuse del
primero. Las que quedan sin red se encolan aparte y se reenvían al reconectar.

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
