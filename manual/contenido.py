# -*- coding: utf-8 -*-
"""Contenido del Manual funcional de HRU Quirófanos.

Es la ÚNICA fuente del manual: de acá salen el Word y el PDF con
`python3 manual/generar.py`. Para actualizar el manual se cambia este archivo y
se vuelve a generar; los documentos no se editan a mano.

Cada afirmación de esta edición está comprobada en la aplicación real —el
recorrido completo del 18-09-2026 contra la base en producción— o leída en el
código. Si una regla de la app cambia, este texto tiene que cambiar con ella.

Formato de los bloques:
  ('h1', texto) · ('h2', texto) · ('h3', texto) · ('p', texto)
  ('ul', [items]) · ('nota', texto) · ('tabla', [encabezados], [[filas]])
En los textos, **así** va en negrita.
"""

VERSION = '3.15.5'
FECHA = 'Septiembre de 2026'

PORTADA = {
    'institucion': 'HOSPITAL REGIONAL USHUAIA',
    'sub_institucion': 'Gdor. Ernesto M. Campos — Ministerio de Salud, Tierra del Fuego A.I.A.S.',
    'area': 'BLOQUE DE QUIRÓFANOS CENTRALES',
    'titulo': 'HRU QUIRÓFANOS',
    'subtitulo': 'Manual funcional de la plataforma de gestión quirúrgica',
    'bajada': 'Recorrido paso a paso para el médico cirujano, Admisión y Egresos, la Jefatura de Quirófanos y la Dirección Médica',
    'destinatarios': 'Documento dirigido al cuerpo médico quirúrgico del HRU',
    'temas': 'Programación · Urgencias · Consentimientos informados · Lista de Verificación · Estadísticas · Módulos · Reclamos · Incidencias',
}

PIE = [
    'Bloque de Quirófanos Centrales y Unidad de Endoscopía Digestiva — Hospital Regional Ushuaia, Gdor. Ernesto M. Campos. Ministerio de Salud, Tierra del Fuego A.I.A.S.',
    'Marco normativo de referencia: Directrices de Organización y Funcionamiento para Centros Quirúrgicos, Ministerio de Salud de la Nación (IF-2020-14236688-APN) y Libro Blanco de Quirófanos del HRU, versión 3.0.',
    'Documento de uso interno del cuerpo médico quirúrgico. Contiene la descripción funcional de la plataforma; no reemplaza al Libro Blanco de Quirófanos ni a los protocolos asistenciales vigentes.',
]

BLOQUES = [

# ─────────────────────────────────────────────────────────────── 1
('h1', '1. Qué es HRU Quirófanos y qué problema resuelve'),
('p', 'HRU Quirófanos es la plataforma única de gestión del Bloque de Quirófanos Centrales y de la Unidad de Endoscopía Digestiva del Hospital Regional Ushuaia. No es un tablero administrativo agregado sobre el trabajo asistencial: es el circuito por el que pasa un turno quirúrgico desde que el cirujano lo solicita hasta que el caso se cierra, pasando por el consentimiento informado, la autorización de Admisión y Egresos, la validación de la Jefatura, la Lista de Verificación Quirúrgica, el parte operatorio, los módulos y los indicadores del período.'),
('p', 'La aplicación reemplaza las planillas sueltas, los cuadernos de sala, los mensajes de chat y los llamados con que se coordinaba el bloque. Ese reemplazo no persigue prolijidad administrativa sino trazabilidad: en un quirófano hospitalario cada decisión —quién programó, quién autorizó, quién suspendió, qué se informó al paciente y cuándo— tiene consecuencias clínicas y responsabilidad profesional. Todo lo que la app registra queda con autor, fecha y hora.'),
('h2', '1.1. Principios de diseño'),
('ul', [
    '**Una sola fuente de verdad.** La grilla, el parte quirúrgico, las estadísticas, los indicadores, la planilla de módulos y el tablero público se derivan del mismo registro de cirugía. No pueden contradecirse porque no son planillas distintas: son lecturas distintas del mismo dato.',
    '**El dato se carga una sola vez.** Los datos del paciente, el diagnóstico, la práctica del nomenclador y el equipo se cargan al programar el turno y de ahí pasan solos al consentimiento informado, al parte, a las estadísticas y a los módulos.',
    '**Cada uno ve lo suyo.** El cirujano ve sus turnos, sus consentimientos y sus reclamos, y las estadísticas y los módulos de sus servicios. La Jefatura ve el bloque completo. La Dirección Médica ve los módulos de todo el hospital. Las incidencias las lee solo la Jefatura. Quien entra sin cuenta ve únicamente el tablero público de actividad, que no contiene ningún dato de pacientes.',
    '**Funciona sin conexión.** Instalada como aplicación en la computadora del quirófano y en el teléfono, sigue funcionando contra la copia local si se cae la red y sincroniza sola cuando el enlace vuelve.',
    '**Los plazos los controla el sistema, no la memoria.** Cierre de solicitudes, publicación del parte, informes operatorios, incidencias, reclamos, vencimientos de habilitación y el aviso de la víspera se recalculan en vivo y avisan solos.',
]),
('h2', '1.2. El bloque que administra'),
('tabla', ['Sala', 'Destino', 'Franjas programadas', 'Urgencia'], [
    ['Quirófano 1', 'Cirugía general y guardia', '08 · 10 · 12 · 14 · 16 · 18 h', 'Turno rodante de urgencia las 24 h'],
    ['Quirófano 2', 'Cirugía programada', '08 · 10 · 12 · 14 · 16 · 18 h', '—'],
    ['Quirófano 3', 'Cirugía programada', '08 · 10 · 12 · 14 · 16 · 18 h', '—'],
    ['Quirófano 4', 'Cirugía programada', '08 · 10 · 12 · 14 · 16 · 18 h', '—'],
    ['Sala de Endoscopía Digestiva', 'Endoscopía diagnóstica y terapéutica', 'De 08:00 a 17:00, cada hora (10 franjas)', 'Turno rodante de urgencia las 24 h'],
    ['Quirófano de Obstetricia', 'Cesáreas', '08 · 10 · 12 · 14 · 16 · 18 h', 'Turno rodante de urgencia las 24 h'],
]),
('p', '**El bloque programado nace cerrado.** Ninguna franja está disponible hasta que la Jefatura de Quirófanos habilita el día, la sala y el turno. La decisión es deliberada: la disponibilidad de un quirófano no depende solo del calendario sino del personal de anestesia, de instrumentación, de esterilización y de las camas de recuperación. Abrir la grilla por defecto sería prometer una capacidad que puede no existir. Lo único que está siempre disponible es el turno de urgencia de la hora en curso, en las tres salas de guardia.'),
('p', '**Ciclo de programación.** Las solicitudes de turno electivo cierran a las 13:00 h del día previo y el parte quirúrgico se publica a las 14:00 h del día previo. Un turno electivo exige 24 horas de anticipación: no se puede programar una cirugía electiva para el mismo día. Lo que llega fuera de esos plazos entra por la programación fuera de horario de la Jefatura (capítulo 5) o, si es una urgencia, por el turno rodante (capítulo 4).'),

# ─────────────────────────────────────────────────────────────── 2
('h1', '2. Perfiles de acceso y cuentas'),
('p', 'La aplicación distingue cinco modos de uso. No son niveles de jerarquía sino alcances de responsabilidad: cada perfil ve exactamente aquello sobre lo que puede actuar y responder.'),
('tabla', ['Perfil', 'Cómo ingresa', 'Qué alcanza'], [
    ['Visitante sin cuenta', 'Abre la aplicación, sin ingresar', 'El tablero público de actividad semanal y el formulario para reportar una incidencia. Ningún dato de pacientes.'],
    ['Médico cirujano', 'Correo y contraseña propios, con correo verificado y cuenta autorizada por la Jefatura', 'Sus turnos, sus consentimientos y sus reclamos; las estadísticas y los módulos de sus servicios'],
    ['Admisión y Egresos', 'Correo y contraseña de la cuenta del sector', 'El dictamen sobre cada turno: autoriza o no autoriza, con motivo y con el nombre del agente'],
    ['Jefatura de Quirófanos', 'Correo y contraseña de la cuenta de Jefatura', 'Todo el bloque: agenda, validaciones, urgencias, incidencias, reclamos, comunicados, archivo de consentimientos, indicadores y cuentas profesionales'],
    ['Dirección Médica', 'Correo y contraseña de la cuenta de Dirección', 'Los módulos quirúrgicos de todo el hospital, sus valores y la baja de un módulo'],
]),
('p', 'Todas las cuentas son personales y las verifica el servidor: no hay claves compartidas ni escritas dentro de la aplicación. El nombre y la matrícula de la cuenta del profesional son los que quedan estampados en cada turno, en cada consentimiento y en cada módulo.'),
('h2', '2.1. Registro del profesional'),
('ul', [
    'En **Acceso Profesional**, pestaña **Solicitar alta**, se cargan nombre, documento, correo y contraseña, y **los servicios en los que trabaja**.',
    '**Se puede elegir más de un servicio** —por ejemplo, Cirugía General y Endoscopía Digestiva—. El primero queda como principal. De esa lista dependen las estadísticas y los módulos que el profesional va a ver, y entre esos servicios elige al programar cada cirugía.',
    'Si el servicio no figura, se elige **Otro (no figura en la lista)** y se escribe. La aplicación lo compara con la lista antes de aceptarlo: «traumatologia» se reconoce como Traumatología y Ortopedia y «otorrino» como ORL. Si lo escrito puede ser varios servicios —«cirugía» a secas—, pide elegir cuál en lugar de agregarlo, porque un servicio mal creado partiría las estadísticas en dos. Si es de verdad nuevo, lo escribe prolijo y lo suma a la lista común, marcado para que la Jefatura lo revise.',
    'Al crear la cuenta llega un **correo de verificación**. Hay que abrir el enlace: **la Jefatura no puede autorizar una cuenta cuyo correo no está verificado**, porque es la única prueba de que quien pidió el alta es el dueño de esa casilla. El remitente es noreply@incidencias-hru.firebaseapp.com y Outlook suele desviarlo a Correo no deseado.',
    'La primera vez aparece una pantalla de bienvenida con el lema del bloque. Se ve una sola vez.',
]),
('h2', '2.2. Contraseñas'),
('tabla', ['Situación', 'Profesional', 'Jefatura, Dirección y Admisión'], [
    ['Cambiar la propia', 'Mi Perfil → Cambiar mi contraseña', 'En su ventana de acceso → Cambiar contraseña'],
    ['La olvidó', 'Acceso Profesional → ¿Olvidó su contraseña?', 'En su ventana de acceso → ¿Olvidó su contraseña?'],
    ['Blanqueo por otro', 'La Jefatura, desde Profesionales → Blanquear contraseña', 'El administrador del proyecto, desde la consola'],
]),
('p', '**Blanquear no es escribir una contraseña ajena.** La Jefatura le envía al profesional, a su propio correo, un enlace para que él elija una nueva. Nadie más la conoce. El enlace vence en una hora. Si la persona nunca se registró, no hay cuenta y el correo no sale: tiene que usar Solicitar alta.'),
('nota', '**Una persona por pantalla.** En una misma pantalla solo puede haber una identidad abierta a la vez. Si en la computadora compartida del quirófano está abierta la sesión de un cirujano y entra la Jefatura, la sesión del cirujano se cierra y tiene que volver a ingresar. Admisión y Dirección, en cambio, verifican su credencial por una vía aparte y no cierran la sesión de quien estaba trabajando.'),

# ─────────────────────────────────────────────────────────────── 3
('h1', '3. Recorrido del médico cirujano, paso a paso'),
('p', 'Esta es la secuencia completa de una cirugía programada, en el orden en que ocurre. Cada paso indica qué hace el cirujano, qué hace la aplicación por él y qué queda registrado.'),
('h3', 'Paso 1 — Acreditación de la cuenta'),
('ul', [
    'Registrarse como se describe en el capítulo 2 y verificar el correo.',
    'En **Mi Perfil**, cargar matrícula, título de especialista, seguro de responsabilidad civil, certificación de RCP y esquema de vacunación, con sus vigencias.',
    'Esperar la autorización de la Jefatura. Hasta entonces se puede completar el perfil y consultar la grilla, pero no programar.',
]),
('p', 'La cuenta necesita dos condiciones independientes para programar: que la Jefatura la haya autorizado y que la documentación habilitante esté completa y vigente. La aplicación vigila los vencimientos y avisa antes de que caduquen: una habilitación vencida detectada el día de la cirugía es un turno suspendido.'),
('h3', 'Paso 2 — Solicitud del turno'),
('ul', [
    'Abrir **Programación Diaria** y elegir el día. La grilla muestra las seis salas por franja: las habilitadas por la Jefatura, libres para tocar, y las cerradas, sin opción.',
    'Tocar una franja libre. Se abre el formulario con el nombre del cirujano ya puesto.',
    'Elegir el **servicio** entre los propios. Si el profesional pertenece a más de un servicio, esta elección es la que reparte su producción: la cirugía se cuenta en el servicio elegido acá.',
    'Cargar los datos del paciente, la cobertura, el diagnóstico y el CIE-10.',
    'Elegir la práctica en el buscador del **Nomenclador Modulado 2025**. El buscador trae las prácticas del servicio elegido. Al elegirla queda fijado el módulo A, B o C: no se escribe ni se negocia.',
    'Indicar la prioridad (P1 emergencia, P2 urgencia diferible, P3 alta complejidad o pediatría, P4 recursos escasos, P6 electiva estándar), el tipo de anestesia, la duración estimada y el equipamiento (arco en C, laparoscopio, microscopio, neuronavegación, torre de endoscopía y otros), y si prevé implantes o hemoderivados.',
    'Marcar lo que ya está cumplido: evaluación preanestésica aprobada y estudios preoperatorios completos.',
    'Confirmar. El turno queda **Pendiente** y toma la franja, pero de manera **provisional** (paso 3).',
]),
('p', 'Si el profesional va a operar con un primer ayudante, lo carga desde el mismo turno. El módulo del ayudante se asigna solo, un escalón por debajo del de la cirugía (capítulo 10).'),
('h3', 'Paso 3 — Consentimiento informado: la franja se gana guardándolo'),
('p', 'Al confirmar el turno aparece la ventana **«Su cirugía se programó correctamente»**, cuya única salida es **Continuar con el consentimiento informado**. Aunque el cirujano entre a cargar el primer ayudante desde esa ventana, al terminar la aplicación lo vuelve a llevar al consentimiento.'),
('p', 'El consentimiento se abre con los datos del turno ya volcados —paciente, documento, cobertura, diagnóstico, procedimiento, fecha, hora, sala, anestesia, nombre y matrícula del cirujano— y con el contenido clínico del procedimiento precargado. El cirujano lo revisa, lo adecua al caso y lo guarda (capítulo 8).'),
('p', '**Guardar el consentimiento confirma la franja.** Significa que se completó y se entregó al paciente, y es lo que habilita el paso por Admisión y Egresos. Si se sale sin guardarlo, la aplicación lo advierte y, si se confirma la salida, la franja vuelve al bloque: el turno queda en Borrador en «Mis Solicitudes», con todo lo cargado, para reprogramarlo. Si el navegador se cierra sin pasar por ese aviso, la franja se libera sola a los 60 minutos.'),
('p', 'Quedan exentos de esta regla las urgencias, las emergencias, los turnos de prioridad P1 y P2 y los turnos que carga la Jefatura en nombre de un profesional, que no está frente a la pantalla para guardar el documento.'),
('h3', 'Paso 4 — Admisión y Egresos'),
('p', 'Admisión y Egresos dictamina sobre el turno con la credencial de su sector. Para abrir el trámite exige tres cosas: **apto anestésico, estudios preoperatorios y consentimiento informado guardado**. Sin esas tres el turno no avanza. El dictamen es AUTORIZADO o NO AUTORIZADO —este último con motivo escrito— y siempre lleva el nombre del agente que lo firma. Puede rectificarse los días siguientes, y el cambio queda asentado. Detalle en el capítulo 7.'),
('h3', 'Paso 5 — Coordinación y validación de la Jefatura'),
('p', 'Antes de la cirugía se confirman las verificaciones de coordinación:'),
('ul', [
    '**Farmacia e Insumos** — implantes, prótesis e insumos disponibles.',
    '**Central de Esterilización** — instrumental específico y kits procesados.',
    '**Hemoterapia** — hemoderivados reservados. Solo aparece activa si el turno pidió reserva; si no, figura como «no aplica».',
    '**Anestesiología** — evaluación preanestésica aprobada, que viene marcada desde el turno.',
]),
('p', 'Con Admisión autorizada y la coordinación completa, la Jefatura toca **Validar y confirmar en el parte**: el turno pasa a **Confirmada** y entra al Parte Quirúrgico del día. Si falta la autorización de Admisión o alguna verificación, la aplicación no deja validar y dice qué falta.'),
('h3', 'Paso 6 — El día de la cirugía'),
('ul', [
    'El **Parte Quirúrgico** está publicado desde las 14:00 h de la víspera, ordenado por prioridad.',
    'La **Lista de Verificación Quirúrgica (LVQ)** no se puede abrir antes del día de la cirugía.',
    '**Entrada y pausa**: doce puntos, entre ellos identidad del paciente, sitio, procedimiento y consentimiento, sitio demarcado, control de seguridad anestésica y oxímetro funcionando. Con un solo punto sin marcar no arranca. Completa, el turno pasa a **En curso** y queda registrada la hora real de inicio.',
    '**Salida**: cinco puntos —procedimiento registrado, conteo de gasas, agujas e instrumental, rotulado de muestras, problemas de equipamiento y aspectos críticos de la recuperación— y, en la misma ventana, el **informe operatorio**, que es obligatorio. Al confirmar, el turno pasa a **Realizada** y queda registrada la hora real de fin.',
]),
('h3', 'Paso 7 — El cierre del caso: de Realizada a Finalizada'),
('p', 'Una cirugía **Realizada** está operada, pero el caso todavía puede tener trámites abiertos. Pasa a **Finalizada** —el caso cerrado— cuando reúne todo lo siguiente:'),
('ul', [
    'Lista de Verificación completa en sus tres momentos.',
    'Informe operatorio cargado.',
    'Admisión y Egresos: AUTORIZADO.',
    'Si la cirugía entró sin la validación previa de la Jefatura (urgencias), la validación regularizada.',
]),
('nota', '**Solo lo finalizado computa.** Las estadísticas, los indicadores, los módulos y el tablero público cuentan únicamente los casos Finalizados. Una cirugía Realizada con un trámite pendiente todavía no suma, y aparece en cuanto el último trámite se completa. Así la planilla de módulos no puede adelantarse a la documentación del caso.'),
('h3', 'Paso 8 — El aviso de la víspera'),
('p', 'A partir de las 20:00 h del día anterior a una cirugía, si el cirujano tiene la aplicación abierta, recibe un recordatorio y un **aviso hablado**, con voz femenina y pausada: «buenas noches, le recuerdo que mañana tiene una cirugía programada; la primera, a las 10 de la mañana». Dice cuántas cirugías y a qué hora es la primera, y **nunca pronuncia nombres de pacientes ni procedimientos**, porque la app se usa en pasillos y vestuarios. Habla una sola vez por jornada. Si el teléfono tiene el sonido bloqueado, habla al primer toque de pantalla. Se apaga junto con el sonido de los avisos.'),
('h3', 'Paso 9 — Lo que el cirujano consulta después'),
('ul', [
    '**Mis Solicitudes** — el estado de todos sus turnos y su historial.',
    '**Consentimientos Informados** — el archivo de los que emitió, en solo lectura y descargables en PDF.',
    '**Módulos Quirúrgicos** — sus módulos del período en todos sus servicios, como cirujano y como primer ayudante.',
    '**Estadísticas** — la actividad de sus servicios y su propia producción.',
    '**Reclamos** — comunicación formal y confidencial con la Jefatura.',
    '**Nueva Incidencia** — reporte de eventos adversos y fallas de proceso.',
    '**Mi Perfil** — documentación habilitante, servicios y cambio de contraseña. Para sumar o quitar un servicio hay que pedírselo a la Jefatura.',
]),
('h2', '3.1. Los estados de un turno'),
('tabla', ['Estado', 'Qué significa', 'Quién lo produce'], [
    ['Borrador', 'Turno sin franja, o cuya franja se liberó por falta de consentimiento; conserva todos los datos', 'Cirujano o sistema'],
    ['Pendiente', 'Franja tomada; espera consentimiento, Admisión y validación', 'Al programar'],
    ['Confirmada', 'Turno oficial, publicado en el parte', 'Jefatura'],
    ['En curso', 'Lista de entrada y pausa completas; procedimiento en marcha', 'Equipo en sala'],
    ['Realizada', 'Lista de salida e informe operatorio cargados', 'Equipo en sala'],
    ['Finalizada', 'Caso cerrado: además, Admisión autorizada y validación regularizada. Recién acá computa', 'Automático al completarse lo que faltaba'],
    ['Suspendida', 'No se realizó; lleva causa y genera una incidencia de categoría D', 'Jefatura o cirujano'],
    ['Resuelta por urgencia', 'El paciente se operó de urgencia antes de su turno: la franja vuelve al bloque sin contar como suspensión', 'Jefatura'],
]),

# ─────────────────────────────────────────────────────────────── 4
('h1', '4. Urgencias y emergencias'),
('p', 'La programación diaria y la guardia son dos carriles separados. El Quirófano 1, la Sala de Endoscopía y el Quirófano de Obstetricia ofrecen, además de su grilla programada, **un turno libre de urgencia en la hora que corre**, las 24 horas, todos los días, esté la sala habilitada o no. Cada sala ofrece el suyo: cirugías de urgencia en el Quirófano 1, endoscopías de urgencia en Endoscopía y cesáreas de urgencia en Obstetricia.'),
('ul', [
    'El turno de urgencia se marca solo como urgencia, con la casilla tildada y bloqueada.',
    'Al anotar una urgencia **aparece enseguida otro turno libre** en la misma hora, para la siguiente.',
    '**No nace provisional** y **no pide la autorización previa de Admisión** ni la validación previa de la Jefatura: se opera primero y los trámites se regularizan después. Un quirófano no puede condicionar una urgencia a un trámite.',
    'Sigue el mismo camino clínico: consentimiento, Lista de Verificación en sus tres momentos e informe operatorio.',
    'Después, **Admisión regulariza** su dictamen —la aplicación le explica que el turno estaba exento y que el trámite se registra con la cirugía ya hecha— y la **Jefatura regulariza la validación**. Con eso el caso pasa a Finalizado y computa.',
    'Si una urgencia se operó y nadie la cargó a tiempo, la Jefatura la registra **fuera de término** desde el propio bloque, con su credencial y el motivo.',
]),
('p', 'Plazos que controla el sistema: la emergencia (P1) tiene como meta la incisión antes de los 30 minutos desde la solicitud; la urgencia diferible (P2), la resolución dentro de las 6 horas.'),

# ─────────────────────────────────────────────────────────────── 5
('h1', '5. Recorrido de la Jefatura de Quirófanos'),
('p', 'La Jefatura usa la misma aplicación con el alcance del bloque completo. Lo que sigue es su jornada tal como la plataforma la ordena.'),
('h3', 'Paso 1 — Habilitar la agenda'),
('ul', [
    'Abrir el día y habilitar sala por sala y turno por turno, según la disponibilidad real de anestesia, instrumentación y recuperación. Abrir un turno abre el día; cerrar el día cierra todo lo que tuviera abierto.',
    'La configuración de un día puede copiarse a los siguientes —hábiles o corridos— para no rehacerla cada mañana.',
    'Lo que queda cerrado no se puede programar. La capacidad publicada es la que el bloque puede sostener.',
]),
('h3', 'Paso 2 — Validar y gobernar el ciclo del día'),
('ul', [
    'Revisar las solicitudes que entraron antes del cierre de las 13:00 h.',
    'En la ficha de cada turno, marcar las verificaciones de coordinación y tocar **Validar y confirmar en el parte**.',
    'Publicar el Parte Quirúrgico a las 14:00 h del día previo.',
    'Suspender cuando corresponda, siempre con causa: la suspensión genera sola una incidencia de categoría D.',
    '**Resuelta por urgencia**: si el paciente de un turno programado se operó antes por guardia, el turno no se suspende —no hubo falla de proceso—; se libera la franja y queda vinculado con la urgencia.',
    '**Programación fuera de horario**: la única llave para cargar un turno en una franja cerrada o pasado el cierre. Pide otra vez la credencial, el profesional se elige del padrón, lleva motivo y detalle, y el cirujano recibe un comunicado urgente para que avise si no lo autorizó.',
]),
('h3', 'Paso 3 — Regularizar las urgencias'),
('p', 'Las urgencias entran sin validación previa. La Jefatura abre la ficha y toca **Regularizar validación**. La aplicación le muestra lo que quedaba sin verificar y lo deja asentado. Si era lo último que faltaba, avisa que la cirugía queda **Finalizada y ya computa** en las estadísticas y en los módulos.'),
('h3', 'Paso 4 — Cuentas profesionales y servicios'),
('ul', [
    'Autorizar, dar de baja —con motivo— y reactivar cuentas. **La primera autorización exige el correo verificado**; la aplicación lo indica en cada profesional con «Correo verificado» o «Correo sin verificar».',
    '**Blanquear contraseña**: envía al profesional un enlace a su correo.',
    '**Servicios** de cada profesional: sumar o quitar servicios. Las cirugías ya cargadas conservan el servicio con el que se programaron.',
    '**Servicios agregados por los profesionales**: los que alguien escribió con «Otro». Por cada uno se puede confirmar que está bien escrito, **corregir el nombre** o **unirlo con uno que ya existía**. Corregir y unir reacomodan solos todo lo cargado —legajos, cirugías y consentimientos—, para que las estadísticas no queden partidas.',
]),
('h3', 'Paso 5 — Incidencias, reclamos y comunicados'),
('ul', [
    '**Incidencias confidenciales**: solo la cuenta de Jefatura puede leerlas, y eso lo garantiza el servidor, no la pantalla. Capítulo 11.',
    '**Reclamos**: hilo formal con cada profesional, con plazo de respuesta de 48 horas hábiles.',
    '**Comunicados**: avisos al cuerpo médico, por servicio o al bloque completo, con acuse de lectura.',
]),
('h3', 'Paso 6 — Archivo de consentimientos e indicadores'),
('ul', [
    'El archivo completo de consentimientos, agrupado por servicio y por profesional, y la pestaña **Turnos sin consentimiento**, con las cirugías próximas que todavía no lo tienen, coloreadas por la urgencia del plazo.',
    '**Indicadores** de gestión del bloque (capítulo 9).',
    'La Jefatura **no consulta los módulos quirúrgicos**: son de la Dirección Médica.',
]),
('h3', 'Paso 7 — Herramientas de mantenimiento'),
('ul', [
    '**Cargar datos de prueba**: cuatro profesionales y cinco cirugías marcadas [PRUEBA], para verificar el circuito sin pacientes reales. Abre los días que usan esos turnos. **Borrar datos de prueba** los quita y **vuelve a cerrar los días que había abierto**, salvo que la Jefatura los haya tocado o ya tengan turnos reales, que se respetan.',
    '**Puesta en cero de la base**: borra cirugías, incidencias, reclamos, consentimientos y comunicados. No toca las cuentas de los profesionales, la agenda ni el listado de obras sociales. Pide la credencial de Jefatura y que se escriba la palabra de confirmación completa. Como la agenda se conserva, después de ponerla en cero conviene revisar qué días quedaron habilitados.',
]),

# ─────────────────────────────────────────────────────────────── 6
('h1', '6. Recorrido de la Dirección Médica'),
('p', 'La Dirección Médica ingresa con su propia credencial y accede a los módulos quirúrgicos de todo el hospital. Su alcance está acotado a lo que le compete: no abre las incidencias confidenciales ni los reclamos individuales.'),
('ul', [
    '**Consulta de módulos** por día, semana, mes, año o rango; por servicio y por profesional; con la evolución del período y los totales A, B y C.',
    '**Baja de un módulo**, con motivo escrito: sale de todos los totales y de las planillas, pero queda listado al pie del detalle, y el cirujano y su primer ayudante reciben un aviso. Una baja invisible sería una baja irrevisable.',
    '**Valores unitarios** de cada módulo, y la decisión de mostrar u ocultar los importes a los profesionales.',
    '**Exportación** a planilla, por cirugía o agrupada por profesional con subtotales.',
]),

# ─────────────────────────────────────────────────────────────── 7
('h1', '7. Admisión y Egresos'),
('ul', [
    'Admisión dictamina desde el propio turno con la credencial de su sector. La verificación se hace por una vía aparte: **no cierra la sesión del profesional** que estaba trabajando en esa computadora.',
    'Para un turno programado, el trámite no abre sin apto anestésico, estudios preoperatorios y consentimiento guardado.',
    'Dictamen **1 — AUTORIZADO**: el turno puede confirmarse en el parte. Dictamen **2 — NO AUTORIZADO**: el turno no entra al parte, con motivo obligatorio.',
    'El **nombre del agente** que dictamina es obligatorio. Un dictamen sin responsable identificado no es defendible en una auditoría.',
    'El dictamen se puede **rectificar** los días siguientes; la aplicación avisa que ya había uno y asienta el cambio.',
    'En urgencias, emergencias y P1–P2 el trámite es **diferido**: se **regulariza** después, aunque la cirugía ya esté hecha.',
]),

# ─────────────────────────────────────────────────────────────── 8
('h1', '8. Consentimientos médicos informados'),
('p', 'El consentimiento informado no es un formulario para hacer firmar: es un proceso de información y decisión que la ley exige documentar. La plataforma acompaña ese proceso y deja constancia de él.'),
('h2', '8.1. Cómo se arma el documento'),
('ul', [
    '**El dato viene solo.** Si nace de un turno, se vuelcan los datos del paciente, la cobertura, el diagnóstico, el procedimiento, la fecha, la hora, la sala, la anestesia y la identidad y matrícula del cirujano.',
    '**El contenido clínico viene cargado.** La práctica elegida en el nomenclador se cruza con un catálogo de 113 procedimientos de 14 especialidades y precarga la descripción de la técnica, los beneficios, los riesgos, las alternativas, la preparación y los cuidados.',
    '**El cirujano lo adecua al caso.** Todo el texto es editable: es la Lex Artis Ad-Hoc, y la aplicación la facilita en lugar de sustituirla.',
    '**Riesgos personalizados.** Un apartado propio para las condiciones de ese paciente —cardiopatía, diabetes, anticoagulación, edad, cirugías previas—. Es el que la jurisprudencia exige individualizar.',
    '**Vista en vivo.** A la izquierda lo que se completa; a la derecha el documento armándose, con membrete y paginación.',
    '**Cuatro botones**: Bajar e imprimir, Imprimir / PDF, Guardar en registro y Limpiar. Guardarlo en el registro marca el consentimiento en la historia clínica del turno, confirma la franja provisional y habilita el paso por Admisión.',
]),
('h2', '8.2. El documento emitido'),
('p', 'Tiene doce apartados —datos del paciente y representante; médico responsable; diagnóstico y procedimiento; descripción; beneficios; riesgos propios y generales; riesgos personalizados; alternativas y consecuencias de no tratarse; preparación y cuidados; modificación de la técnica ante hallazgos imprevistos; declaración y firmas; revocación—. Los apartados vacíos no se imprimen y el documento se renumera solo. Al pie van el marco legal y el código de verificación.'),
('tabla', ['Norma', 'Qué aporta al documento'], [
    ['Ley 26.529 de Derechos del Paciente, arts. 5 a 11', 'Define el consentimiento informado, su contenido y su instrumentación'],
    ['Ley 26.742 (Muerte Digna)', 'Derecho a rechazar procedimientos y a revocar el consentimiento'],
    ['Decreto 1089/2012', 'Reglamenta el contenido y la forma del consentimiento y del rechazo'],
    ['Ley 17.132, arts. 19 inc. 3 y 20', 'Obligación de obtener el consentimiento; la medicina es obligación de medios'],
    ['Código Civil y Comercial, arts. 26 y 51 a 59', 'Dignidad, consentimiento para actos médicos y autonomía progresiva'],
    ['Leyes 26.061 y 26.657', 'Derechos de niñas, niños y adolescentes y capacidad para consentir'],
    ['Ley 25.326 de Protección de Datos Personales', 'Los datos de salud son dato sensible'],
    ['Ley 25.929 de Parto Humanizado', 'Derechos en el embarazo, el parto y el posparto'],
    ['Leyes 26.130 y 25.673', 'Ligadura tubaria y salud sexual y procreación responsable'],
]),
('h2', '8.3. Código de verificación y archivo'),
('ul', [
    'Cada documento lleva un código único con el formato **HRU-XXXXXXX-XXXXXXX**, calculado a partir del paciente, su documento, el procedimiento, la fecha y el profesional. No es una firma digital: es una huella de cotejo que permite comprobar, meses después, que el papel firmado es el mismo que quedó archivado.',
    '**Un consentimiento guardado no se edita.** Se lee y se descarga en PDF. Si hay que corregirlo, se emite uno nuevo y ambos quedan con su fecha.',
    'El profesional ve los consentimientos que emitió; la Jefatura, el archivo completo, y es la única que puede retirar uno, con su credencial.',
]),

# ─────────────────────────────────────────────────────────────── 9
('h1', '9. Estadísticas, indicadores y tablero público'),
('p', 'Nada de esto se carga a mano: se deriva de la actividad. Por eso no puede divergir del parte ni de la grilla. Y todo cuenta con el mismo criterio: **los casos Finalizados**.'),
('h2', '9.1. Estadísticas quirúrgicas'),
('ul', [
    'Volumen por período, por servicio, por cirujano y por tipo de cirugía; urgencias y programación fuera de horario por separado.',
    'Suspensiones y sus causas; distribución por complejidad; espera quirúrgica, con alerta sobre los turnos que superan los 90 días.',
    '**Quién ve qué.** El profesional ve el agregado de **cada uno de sus servicios** y su propia producción. El desglose nominal completo —cada cirujano, uno por uno— queda reservado a la Jefatura y a la Dirección. Un indicador sirve para mejorar el proceso, y ese uso no requiere exponer el rendimiento individual de cada colega.',
]),
('h2', '9.2. Indicadores de gestión (Jefatura)'),
('tabla', ['Indicador', 'Qué mide', 'Meta'], [
    ['Tasa de utilización del bloque', 'Horas operadas sobre horas habilitadas', '75 % o más'],
    ['Tasa de suspensiones', 'Cirugías suspendidas sobre programadas', 'Menos de 5 %'],
    ['Tiempo de recambio', 'Minutos entre la salida de un paciente y la entrada del siguiente en la misma sala', '30 minutos o menos'],
    ['Cumplimiento del informe operatorio', 'Cirugías con el informe cargado a tiempo', '95 % o más'],
]),
('p', 'Se acompañan de la actividad por servicio y de las causas de suspensión del mes. La utilización se calcula con las horas reales de inicio y fin que registra la Lista de Verificación.'),
('h2', '9.3. Tablero público de actividad'),
('p', 'Quien abre la aplicación sin ingresar encuentra la solapa **Estadísticas**: la actividad de la semana en curso, de lunes a domingo, en seis gráficos —cirugías programadas y de urgencia, endoscopías programadas y de urgencia, cesáreas programadas y de urgencia—, actualizada en vivo. Solo cuenta casos cerrados. **No contiene ningún dato de pacientes ni de profesionales**: son seis contadores. Al ingresar a una cuenta, la solapa se reemplaza por las estadísticas propias. La página está marcada para que los buscadores no la indexen.'),

# ─────────────────────────────────────────────────────────────── 10
('h1', '10. Módulos quirúrgicos'),
('p', 'Esta sección elimina una discusión histórica de cualquier bloque quirúrgico: cuánto le corresponde a quién por lo que efectivamente operó.'),
('ul', [
    'El módulo lo fija el **Nomenclador Modulado 2025** al elegir la práctica. No se escribe ni se edita después.',
    'El **cirujano** percibe ese módulo. El **primer ayudante** percibe el escalón inmediato inferior: A → B y B → C. No es editable.',
    'El módulo C es el piso: una cirugía C puede llevar ayudante, que queda registrado en el equipo, pero sin módulo. El anestesiólogo/a no percibe módulo quirúrgico.',
    '**Solo cuenta lo finalizado.** Un turno programado, confirmado, en curso o realizado con trámites pendientes no genera módulo. Se liquida lo que se operó y se documentó, no lo que se planificó.',
    'Un profesional de varios servicios ve los módulos de todos, separados por servicio según lo que eligió al programar cada cirugía.',
]),
('tabla', ['Módulo', 'Complejidad', 'Percibe el cirujano', 'Percibe el 1er ayudante'], [
    ['A', 'Alta', 'Módulo A', 'Módulo B'],
    ['B', 'Intermedia', 'Módulo B', 'Módulo C'],
    ['C', 'Baja', 'Módulo C', 'Sin módulo (piso de la escala)'],
]),

# ─────────────────────────────────────────────────────────────── 11
('h1', '11. Reclamos e incidencias'),
('h2', '11.1. Reclamos'),
('p', 'El canal formal del profesional con la Jefatura, para desacuerdos y pedidos. Cada reclamo lo ven solo su autor y la Jefatura. Tiene hilo completo, con fecha y hora de cada mensaje, y un plazo de respuesta de 48 horas hábiles. Mientras está abierto, ambas partes reciben recordatorios. Los eventos adversos no van por reclamo: van por incidencia.'),
('h2', '11.2. Incidencias'),
('p', 'Cualquier persona del bloque puede reportar una incidencia desde **Nueva Incidencia**, **con o sin cuenta**. Se rige por el **Principio de Cultura Justa**: se reportan eventos para analizar el sistema, no para buscar culpables. El reportante deja sus datos para que la respuesta le llegue a su correo institucional.'),
('tabla', ['Categoría', 'Qué comprende', 'Plazo de reporte'], [
    ['A', 'Efectos adversos clínicos graves: paciente, sitio o procedimiento equivocado, objeto retenido, muerte inesperada', 'Inmediato, menos de 2 h'],
    ['B', 'Efectos adversos clínicos moderados: infección de sitio quirúrgico, hemorragia que requirió transfusión', 'Inmediato, menos de 2 h'],
    ['C', 'Cuasi-accidentes: situaciones detectadas a tiempo que evitaron el daño', 'Inmediato, menos de 2 h'],
    ['D', 'Proceso y programación: suspensión no planificada, atraso mayor de 60 minutos, falta de insumo crítico, incumplimiento de la Lista de Verificación', 'Diferido, menos de 24 h'],
    ['E', 'Gestión y comunicación: reclamos formales entre servicios, solicitudes fuera de plazo, registros incompletos, informe fuera de término', 'Diferido, menos de 24 h'],
    ['F', 'Bioseguridad y residuos: segregación de residuos, accidente cortopunzante, reprocesamiento de endoscopios, esterilización', 'Diferido, menos de 24 h'],
]),
('p', '**Solo la cuenta de Jefatura puede leer las incidencias.** Esa restricción la aplica el servidor: ninguna otra cuenta, ni siquiera la de Dirección Médica, puede leerlas.'),

# ─────────────────────────────────────────────────────────────── 12
('h1', '12. Seguridad, confidencialidad y continuidad'),
('h2', '12.1. Barreras que la aplicación no deja saltear'),
('ul', [
    'El bloque nace cerrado; lo abre la Jefatura.',
    'La franja se gana con el consentimiento guardado; salvo urgencias y P1–P2.',
    'Sin apto anestésico, estudios y consentimiento, Admisión no dictamina.',
    'Sin Admisión y coordinación, la Jefatura no valida.',
    'La Lista de Verificación no arranca incompleta, y la salida no cierra sin informe operatorio.',
    'Solo lo finalizado computa.',
    'Un recordatorio marcado como visto vuelve al día siguiente si el problema sigue.',
    'Las acciones irreversibles —cancelar un turno, autorizar o dar de baja una cuenta, retirar un consentimiento, dar de baja un módulo, poner la base en cero— piden la credencial de quien las hace.',
    'El consentimiento archivado no se edita.',
    'Una actualización de la app o un cambio en la nube no borran un formulario a medio escribir.',
]),
('h2', '12.2. Confidencialidad'),
('ul', [
    '**Los datos de pacientes solo los lee quien tiene cuenta.** Quien abre la aplicación sin ingresar no ve la grilla, ni cirugías, ni consentimientos, ni el padrón: solo el tablero público y el formulario de incidencias. Lo garantiza el servidor, no la pantalla.',
    'Las incidencias las lee solo la Jefatura. Los reclamos, solo su autor y la Jefatura.',
    'Los consentimientos los ve el profesional que los emitió; el archivo completo, la Jefatura.',
    'El aviso hablado nunca pronuncia nombres de pacientes.',
    'Los datos de salud reciben el tratamiento de dato sensible que exige la Ley 25.326.',
]),
('h2', '12.3. Continuidad'),
('ul', [
    'Instalada como aplicación, abre desde la pantalla de inicio de la computadora y del teléfono.',
    'Sin conexión sigue funcionando contra la copia local y guarda los cambios para enviarlos cuando vuelve la red. El indicador del encabezado dice si todo está sincronizado o si queda algo sin enviar.',
    'El Libro Blanco de Quirófanos, este manual y la foto del lema quedan guardados para consultarse sin conexión.',
    'Cuando se publica una versión nueva, la app se actualiza sola si la pantalla no tiene nada escrito; si hay un formulario a medio completar, muestra un aviso y espera a que el profesional decida.',
    'Cada persona elige su apariencia —Clínico sobrio, Acero quirúrgico, Papel clínico o Guardia nocturna, esta última oscura para el turno de 24 horas—, y la elección queda en su dispositivo.',
]),

# ─────────────────────────────────────────────────────────────── 13
('h1', '13. Ventajas para el médico cirujano'),
('tabla', ['Antes', 'Con HRU Quirófanos'], [
    ['Pedir turno por teléfono y esperar confirmación verbal', 'Ver la grilla real y tomar la franja, con estado consultable en todo momento'],
    ['Escribir el consentimiento desde cero o usar un formulario genérico', 'Documento con los datos del turno ya volcados y el contenido clínico precargado, editable y con marco legal argentino'],
    ['Enterarse de que falta el implante el día de la cirugía', 'Verificación de insumos antes de la validación del turno'],
    ['Discutir a fin de mes qué módulo correspondía', 'Módulo fijado por el nomenclador al programar, sin edición posible'],
    ['Olvidar una cirugía del día siguiente', 'Aviso escrito y hablado a las 20 h de la víspera'],
    ['Buscar un consentimiento en una carpeta de papel', 'Archivo digital con código de verificación'],
    ['Reclamar por vía informal y sin registro', 'Canal formal, confidencial, con plazo de respuesta'],
    ['Estadísticas armadas a mano al cierre del período', 'Indicadores derivados de la propia actividad, sin doble carga'],
]),

# ─────────────────────────────────────────────────────────────── 14
('h1', '14. Novedades de las versiones 3.12 a 3.15'),
('h2', 'Identidad y seguridad'),
('ul', [
    '**Cada profesional tiene cuenta propia verificada por el servidor.** Los datos de pacientes quedaron cerrados para quien no tiene cuenta. Hasta la versión 3.14, cualquiera que conociera la dirección de la aplicación podía leer —y borrar— cirugías, consentimientos y el padrón.',
    '**Verificación de correo obligatoria** para que la Jefatura autorice una cuenta.',
    '**Contraseñas**: cambio propio para todos los perfiles, recuperación por correo y blanqueo por enlace desde la Jefatura.',
    '**El canal de incidencias quedó reparado.** Desde fines de agosto y hasta la versión 3.14.2, una incidencia reportada por alguien que no fuera la Jefatura quedaba guardada solo en el dispositivo y nunca llegaba. Las que quedaron trabadas se envían solas cuando ese dispositivo abre la versión nueva.',
]),
('h2', 'Programación y servicios'),
('ul', [
    '**Varios servicios por profesional**, con el servicio de cada cirugía elegido al programarla; **«Otro»** con reconocimiento del nombre escrito; y revisión de los servicios nuevos por la Jefatura.',
    'Cargar el primer ayudante ya no saca al profesional del camino obligado al consentimiento.',
    'Los datos de prueba vuelven a cerrar los días que habían abierto.',
]),
('h2', 'Avisos, estadísticas y pantalla'),
('ul', [
    '**Aviso hablado de la víspera**, a las 20 h, sin nombres de pacientes.',
    '**Tablero público de actividad semanal**, sin cuenta y sin datos personales.',
    'La campana del encabezado y la de la barra inferior muestran siempre el mismo número y el mismo color.',
    '**Cuatro apariencias** a elección de cada persona.',
    'Portada con el lema del bloque en la pantalla de ingreso, y bienvenida una sola vez al registrarse.',
    'La pantalla de ingreso ocupa todo el ancho en computadora y tablet.',
    'Correcciones: el desglose de las incidencias y los mensajes de reclamos se leían blanco sobre blanco en el tema oscuro; la hora del registro de un consentimiento podía quedar en formato de 12 horas sin «p. m.»; y el tablero público dejaba de contar una cirugía justo cuando su caso se cerraba.',
]),

# ─────────────────────────────────────────────────────────────── 15
('h1', '15. Anexo — Plazos que controla el sistema'),
('tabla', ['Plazo', 'Valor', 'A quién se le avisa'], [
    ['Cierre de solicitudes de turno', '13:00 h del día previo', 'Cirujano y Jefatura'],
    ['Publicación del parte quirúrgico', '14:00 h del día previo', 'Todo el bloque'],
    ['Anticipación mínima de un turno electivo', '24 horas', 'Cirujano'],
    ['Consentimiento de un turno provisional', '60 minutos, o la franja se libera', 'Cirujano'],
    ['Emergencia (P1): tiempo hasta la incisión', 'Menos de 30 minutos', 'Equipo de guardia'],
    ['Urgencia diferible (P2)', 'Menos de 6 horas', 'Cirujano y Jefatura'],
    ['Aviso de la víspera', 'Desde las 20:00 h del día previo', 'Cirujano del turno'],
    ['Informe operatorio', 'Obligatorio para cerrar la Lista de salida', 'Cirujano'],
    ['Incidencias A a C', 'Menos de 2 horas', 'Jefatura'],
    ['Incidencias D a F', 'Menos de 24 horas', 'Jefatura'],
    ['Respuesta a un reclamo', '48 horas hábiles', 'Jefatura y autor'],
    ['Enlace para restablecer contraseña', 'Vence en 1 hora', 'Titular de la cuenta'],
    ['Espera quirúrgica prolongada', 'Más de 90 días', 'Cirujano y Jefatura'],
    ['Vigencias de habilitación', 'Matrícula, seguro, RCP y vacunas', 'Profesional titular'],
]),
('p', 'Estos plazos se recalculan en vivo, cada minuto y cada vez que la aplicación vuelve al primer plano. No son alarmas que alguien configuró: se derivan del estado real de los datos y del reloj, y desaparecen solos cuando el problema se resuelve.'),

]
